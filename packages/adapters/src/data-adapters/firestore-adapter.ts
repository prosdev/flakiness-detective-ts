import { FailureCluster, TestFailure, TestFailureMetadata } from '@flakiness-detective/core';
import { Logger } from '@flakiness-detective/utils';
import type { Firestore, Timestamp } from '@google-cloud/firestore';
import { BaseDataAdapter } from './base-adapter';

/**
 * Firestore document data types (as stored in Firestore)
 */
interface FirestoreTestFailure {
  id: string;
  testTitle: string;
  testFilePath: string;
  errorMessage: string;
  errorStack?: string;
  timestamp: Timestamp;
  metadata?: TestFailureMetadata;
}

interface FirestoreFailureCluster {
  id: string;
  failures: FirestoreTestFailure[];
  commonPatterns: {
    filePaths: string[];
    lineNumbers: number[];
    codeSnippets: string[];
    locators: string[];
    matchers: string[];
    timeouts: number[];
  };
  metadata: {
    failureCount: number;
    firstSeen: Timestamp;
    lastSeen: Timestamp;
    averageTimeBetweenFailures?: number;
    failureIds: string[];
    runIds: string[];
    failureTimestamps: Timestamp[];
    errorMessages: string[];
  };
  failurePattern?: string;
  assertionPattern?: string;
}

/**
 * Custom schema for Firestore documents (e.g., from existing Playwright reporters)
 */
export interface CustomFirestoreSchema {
  /**
   * Field mapping from custom schema to TestFailure format
   * Example for a custom reporter schema:
   * {
   *   id: 'testCaseId',
   *   testTitle: 'title',
   *   errorMessage: 'errorMessage.message',
   *   timestamp: 'runTimestamp',
   *   metadata: {
   *     runId: 'buildId',
   *     reportLink: 'reportLink'
   *   }
   * }
   */
  fieldMapping: {
    id: string;
    testTitle: string;
    testFile?: string;
    errorMessage: string;
    errorStack?: string;
    timestamp: string;
    metadata?: {
      projectName?: string;
      runId?: string;
      reportLink?: string;
      duration?: string;
      [key: string]: string | undefined;
    };
  };

  /**
   * Custom filter to only include failures (e.g., status === 'failed')
   */
  failureFilter?: {
    field: string;
    operator: FirebaseFirestore.WhereFilterOp;
    value: string | number | boolean | string[] | number[];
  };
}

/**
 * Configuration for FirestoreAdapter
 */
export interface FirestoreAdapterConfig {
  /** Firestore database instance */
  db: Firestore;
  /** Collection name for test failures */
  failuresCollection?: string;
  /** Collection name for failure clusters */
  clustersCollection?: string;
  /**
   * Custom schema configuration for reading from existing Firestore collections
   * Use this when integrating with existing Playwright reporters or other test systems
   */
  customSchema?: CustomFirestoreSchema;
}

/**
 * Firestore implementation of the DataAdapter interface
 * Stores data in Google Cloud Firestore
 */
export class FirestoreAdapter extends BaseDataAdapter {
  private db: Firestore;
  private logger: Logger;
  private config: Required<FirestoreAdapterConfig>;

  constructor(config: FirestoreAdapterConfig, logger: Logger) {
    super();
    this.db = config.db;
    this.logger = logger;
    this.config = {
      db: config.db,
      failuresCollection: config.failuresCollection || 'test_failures',
      clustersCollection: config.clustersCollection || 'flaky_clusters',
      customSchema: config.customSchema,
    };

    this.logger.log(
      `Initialized Firestore adapter with collections: ${this.config.failuresCollection}, ${this.config.clustersCollection}`
    );
  }

  /**
   * Fetches test failures from Firestore within the specified time window
   * @param days Number of days to look back
   */
  async fetchFailures(days: number): Promise<TestFailure[]> {
    const cutoffDate = this.createTimeFilter(days);

    try {
      // Check if using custom schema
      if (this.config.customSchema) {
        return await this.fetchFailuresWithCustomSchema(days, cutoffDate);
      }

      // Standard schema
      const snapshot = await this.db
        .collection(this.config.failuresCollection)
        .where('timestamp', '>=', cutoffDate)
        .get();

      const failures = snapshot.docs.map((doc) =>
        this.deserializeFailure(doc.data() as FirestoreTestFailure)
      );

      this.logger.log(`Fetched ${failures.length} failures from the last ${days} days`);
      return failures;
    } catch (error) {
      this.logger.log(`Error fetching failures from Firestore: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Fetches failures using custom schema mapping
   */
  private async fetchFailuresWithCustomSchema(
    days: number,
    cutoffDate: Date
  ): Promise<TestFailure[]> {
    const schema = this.config.customSchema;
    if (!schema) {
      throw new Error('Custom schema is required but not provided');
    }

    const timestampField = schema.fieldMapping.timestamp;

    // biome-ignore lint/suspicious/noExplicitAny: Firestore Query type is too complex
    let query: any = this.db
      .collection(this.config.failuresCollection)
      .where(timestampField, '>=', cutoffDate);

    // Add custom failure filter if provided (e.g., status === 'failed')
    if (schema.failureFilter) {
      query = query.where(
        schema.failureFilter.field,
        schema.failureFilter.operator,
        schema.failureFilter.value
      );
    }

    const snapshot = await query.get();

    const failures = snapshot.docs
      .map((doc) => this.mapCustomSchemaToTestFailure(doc.data(), doc.id))
      .filter((f): f is TestFailure => f !== null);

    this.logger.log(
      `Fetched ${failures.length} failures from the last ${days} days (custom schema)`
    );
    return failures;
  }

  /**
   * Maps a custom Firestore document to TestFailure format
   */
  private mapCustomSchemaToTestFailure(
    // biome-ignore lint/suspicious/noExplicitAny: Firestore documents have dynamic structure
    data: any,
    docId: string
  ): TestFailure | null {
    const schema = this.config.customSchema;
    if (!schema) {
      throw new Error('Custom schema is required but not provided');
    }

    const mapping = schema.fieldMapping;

    try {
      // Helper to get nested field value
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic nested field access requires any
      const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
      };

      // Extract timestamp
      const timestampValue = getNestedValue(data, mapping.timestamp);
      let timestamp: Date;

      if (timestampValue?.toDate) {
        // Firestore Timestamp
        timestamp = timestampValue.toDate();
      } else if (timestampValue instanceof Date) {
        timestamp = timestampValue;
      } else if (typeof timestampValue === 'string') {
        timestamp = new Date(timestampValue);
      } else {
        this.logger.warn(`Invalid timestamp for document ${docId}`);
        return null;
      }

      // Extract error message - handle nested objects
      const errorValue = getNestedValue(data, mapping.errorMessage);
      let errorMessage: string;
      let errorStack: string | undefined;

      if (typeof errorValue === 'object' && errorValue !== null) {
        // Handle structured error object (like your reporter's errorMessage)
        errorMessage = errorValue.message || JSON.stringify(errorValue);

        // Build rich error message from structured data
        const parts: string[] = [];
        if (errorValue.matcher) parts.push(`Matcher: ${errorValue.matcher}`);
        if (errorValue.expected) parts.push(`Expected: ${errorValue.expected}`);
        if (errorValue.actual) parts.push(`Actual: ${errorValue.actual}`);
        if (errorValue.locator) parts.push(`Locator: ${errorValue.locator}`);

        if (parts.length > 0) {
          errorMessage = `${errorValue.message}\n${parts.join('\n')}`;
        }

        // Extract stack from snippet if available
        if (errorValue.snippet && Array.isArray(errorValue.snippet)) {
          errorStack = errorValue.snippet.join('\n');
        }
      } else {
        errorMessage = String(errorValue || 'Unknown error');
      }

      // Build TestFailure object
      const testFilePath = mapping.testFile ? getNestedValue(data, mapping.testFile) : undefined;

      const failure: TestFailure = {
        id: getNestedValue(data, mapping.id) || docId,
        testTitle: getNestedValue(data, mapping.testTitle) || 'Unknown test',
        testFilePath: testFilePath || 'unknown', // Required field, use 'unknown' as fallback
        errorMessage,
        errorStack: mapping.errorStack ? getNestedValue(data, mapping.errorStack) : errorStack,
        timestamp,
        metadata: {},
      };

      // Map metadata fields
      if (mapping.metadata && failure.metadata) {
        for (const [key, path] of Object.entries(mapping.metadata)) {
          if (path) {
            const value = getNestedValue(data, path);
            if (value !== undefined) {
              failure.metadata[key] = value;
            }
          }
        }
      }

      return failure;
    } catch (error) {
      this.logger.warn(`Failed to map document ${docId}: ${String(error)}`);
      return null;
    }
  }

  /**
   * Saves failure clusters to Firestore
   * @param clusters Failure clusters to save
   */
  async saveClusters(clusters: FailureCluster[]): Promise<void> {
    if (clusters.length === 0) {
      this.logger.log('No clusters to save');
      return;
    }

    try {
      const batch = this.db.batch();

      for (const cluster of clusters) {
        const docRef = this.db.collection(this.config.clustersCollection).doc(cluster.id);
        const firestoreCluster = this.serializeCluster(cluster);
        batch.set(docRef, firestoreCluster);
      }

      await batch.commit();
      this.logger.log(
        `Saved ${clusters.length} clusters to Firestore collection: ${this.config.clustersCollection}`
      );
    } catch (error) {
      this.logger.log(`Error saving clusters to Firestore: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Fetches clusters from Firestore
   * @param limit Maximum number of clusters to fetch
   */
  async fetchClusters(limit?: number): Promise<FailureCluster[]> {
    try {
      let query = this.db
        .collection(this.config.clustersCollection)
        .orderBy('metadata.failureCount', 'desc');

      if (limit !== undefined) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      const clusters = snapshot.docs.map((doc) =>
        this.deserializeCluster(doc.data() as FirestoreFailureCluster)
      );

      this.logger.log(`Fetched ${clusters.length} clusters from Firestore`);
      return clusters;
    } catch (error) {
      this.logger.log(`Error fetching clusters from Firestore: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Adds test failures to Firestore
   * Useful for ingesting failure data into the system
   * @param failures Test failures to add
   */
  async addFailures(failures: TestFailure[]): Promise<void> {
    if (failures.length === 0) {
      this.logger.log('No failures to add');
      return;
    }

    try {
      const batch = this.db.batch();

      for (const failure of failures) {
        const docRef = this.db.collection(this.config.failuresCollection).doc(failure.id);
        const firestoreFailure = this.serializeFailure(failure);
        batch.set(docRef, firestoreFailure);
      }

      await batch.commit();
      this.logger.log(
        `Added ${failures.length} failures to Firestore collection: ${this.config.failuresCollection}`
      );
    } catch (error) {
      this.logger.log(`Error adding failures to Firestore: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Deletes old failures from Firestore
   * Useful for cleanup and maintaining database size
   * @param days Delete failures older than this many days
   */
  async deleteOldFailures(days: number): Promise<number> {
    const cutoffDate = this.createTimeFilter(days);

    try {
      const snapshot = await this.db
        .collection(this.config.failuresCollection)
        .where('timestamp', '<', cutoffDate)
        .get();

      if (snapshot.empty) {
        this.logger.log('No old failures to delete');
        return 0;
      }

      const batch = this.db.batch();
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
      }

      await batch.commit();
      this.logger.log(`Deleted ${snapshot.size} failures older than ${days} days`);
      return snapshot.size;
    } catch (error) {
      this.logger.log(`Error deleting old failures from Firestore: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Serializes a test failure for Firestore storage
   */
  private serializeFailure(failure: TestFailure): FirestoreTestFailure {
    // Import Timestamp from @google-cloud/firestore
    const { Timestamp } = require('@google-cloud/firestore');

    return {
      ...failure,
      timestamp: Timestamp.fromDate(failure.timestamp),
    };
  }

  /**
   * Deserializes a test failure from Firestore
   */
  private deserializeFailure(data: FirestoreTestFailure): TestFailure {
    return {
      ...data,
      timestamp: data.timestamp.toDate(),
    };
  }

  /**
   * Serializes a cluster for Firestore storage
   */
  private serializeCluster(cluster: FailureCluster): FirestoreFailureCluster {
    const { Timestamp } = require('@google-cloud/firestore');

    return {
      ...cluster,
      failures: cluster.failures.map((f) => this.serializeFailure(f)),
      metadata: {
        ...cluster.metadata,
        firstSeen: Timestamp.fromDate(cluster.metadata.firstSeen),
        lastSeen: Timestamp.fromDate(cluster.metadata.lastSeen),
        failureTimestamps: cluster.metadata.failureTimestamps.map((t) => Timestamp.fromDate(t)),
      },
    };
  }

  /**
   * Deserializes a cluster from Firestore
   */
  private deserializeCluster(data: FirestoreFailureCluster): FailureCluster {
    return {
      ...data,
      failures: data.failures.map((f) => this.deserializeFailure(f)),
      metadata: {
        ...data.metadata,
        firstSeen: data.metadata.firstSeen.toDate(),
        lastSeen: data.metadata.lastSeen.toDate(),
        failureTimestamps: data.metadata.failureTimestamps.map((t) => t.toDate()),
      },
    };
  }
}

/**
 * Factory function to create a Firestore adapter
 * @param config Firestore adapter configuration
 * @param logger Logger instance
 */
export function createFirestoreAdapter(
  config: FirestoreAdapterConfig,
  logger: Logger
): FirestoreAdapter {
  return new FirestoreAdapter(config, logger);
}
