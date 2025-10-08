import * as path from 'path';
import { FailureCluster, TestFailure, TestFailureMetadata } from '@flakiness-detective/core';
import { Logger } from '@flakiness-detective/utils';
import * as fs from 'fs/promises';
import { BaseDataAdapter } from './base-adapter';

interface SerializedTestFailure {
  id: string;
  testTitle: string;
  testFilePath: string;
  errorMessage: string;
  errorStack?: string;
  timestamp: string; // ISO string instead of Date
  metadata?: TestFailureMetadata;
}

interface SerializedFailureCluster {
  id: string;
  failures: SerializedTestFailure[];
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
    firstSeen: string; // ISO string instead of Date
    lastSeen: string; // ISO string instead of Date
    averageTimeBetweenFailures?: number;
  };
}

/**
 * Configuration for FilesystemAdapter
 */
export interface FilesystemAdapterConfig {
  /** Directory to store failure and cluster data */
  dataDir: string;
  /** File name for failures data */
  failuresFile?: string;
  /** File name for clusters data */
  clustersFile?: string;
}

/**
 * Filesystem implementation of the DataAdapter interface
 * Stores data as JSON files
 */
export class FilesystemAdapter extends BaseDataAdapter {
  private config: FilesystemAdapterConfig;
  private logger: Logger;

  /**
   * Creates a new FilesystemAdapter
   * @param config Adapter configuration
   * @param logger Logger instance
   */
  constructor(config: FilesystemAdapterConfig, logger: Logger) {
    super();
    this.config = {
      failuresFile: 'failures.json',
      clustersFile: 'clusters.json',
      ...config,
    };
    this.logger = logger;
  }

  /**
   * Initializes the adapter by ensuring the data directory exists
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.config.dataDir, { recursive: true });
      this.logger.log(`Initialized filesystem adapter at ${this.config.dataDir}`);
    } catch (error) {
      this.logger.log(`Error initializing filesystem adapter: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Fetches failures from the specified time window
   * @param days Number of days to look back
   */
  async fetchFailures(days: number): Promise<TestFailure[]> {
    const failuresPath = path.join(
      this.config.dataDir,
      this.config.failuresFile || 'failures.json'
    );

    try {
      const data = await fs.readFile(failuresPath, 'utf-8');
      const allFailures = this.deserializeFailures(JSON.parse(data));

      const cutoffDate = this.createTimeFilter(days);
      const filteredFailures = allFailures.filter((failure) => failure.timestamp >= cutoffDate);

      this.logger.log(`Fetched ${filteredFailures.length} failures from the last ${days} days`);
      return filteredFailures;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.log('No failures file found, returning empty array');
        return [];
      }
      this.logger.log(`Error fetching failures: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Saves clusters to storage
   * @param clusters Failure clusters to save
   */
  async saveClusters(clusters: FailureCluster[]): Promise<void> {
    const clustersPath = path.join(
      this.config.dataDir,
      this.config.clustersFile || 'clusters.json'
    );

    try {
      await fs.writeFile(clustersPath, JSON.stringify(this.serializeClusters(clusters), null, 2));
      this.logger.log(`Saved ${clusters.length} clusters to ${clustersPath}`);
    } catch (error) {
      this.logger.log(`Error saving clusters: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Fetches clusters from storage
   * @param limit Maximum number of clusters to fetch
   */
  async fetchClusters(limit?: number): Promise<FailureCluster[]> {
    const clustersPath = path.join(
      this.config.dataDir,
      this.config.clustersFile || 'clusters.json'
    );

    try {
      const data = await fs.readFile(clustersPath, 'utf-8');
      const allClusters = this.deserializeClusters(JSON.parse(data));

      const result = limit ? allClusters.slice(0, limit) : allClusters;
      this.logger.log(`Fetched ${result.length} clusters from ${clustersPath}`);
      return result;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.log('No clusters file found, returning empty array');
        return [];
      }
      this.logger.log(`Error fetching clusters: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Saves failures to storage
   * @param failures Test failures to save
   */
  async saveFailures(failures: TestFailure[]): Promise<void> {
    const failuresPath = path.join(
      this.config.dataDir,
      this.config.failuresFile || 'failures.json'
    );

    try {
      await fs.writeFile(failuresPath, JSON.stringify(this.serializeFailures(failures), null, 2));
      this.logger.log(`Saved ${failures.length} failures to ${failuresPath}`);
    } catch (error) {
      this.logger.log(`Error saving failures: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Adds new failures to storage
   * @param newFailures Test failures to add
   */
  async addFailures(newFailures: TestFailure[]): Promise<void> {
    try {
      // First fetch existing failures
      const existingFailures = await this.fetchFailures(9999); // Get all failures

      // Add new failures
      const allFailures = [...existingFailures, ...newFailures];

      // Save all failures
      await this.saveFailures(allFailures);
      this.logger.log(`Added ${newFailures.length} new failures`);
    } catch (error) {
      this.logger.log(`Error adding failures: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Serializes failures for storage
   * Handles conversion of Date objects to strings
   */
  private serializeFailures(failures: TestFailure[]): SerializedTestFailure[] {
    return failures.map((failure) => ({
      ...failure,
      timestamp: failure.timestamp.toISOString(),
    }));
  }

  /**
   * Deserializes failures from storage
   * Handles conversion of date strings to Date objects
   */
  private deserializeFailures(data: SerializedTestFailure[]): TestFailure[] {
    return data.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  }

  /**
   * Serializes clusters for storage
   * Handles conversion of Date objects to strings
   */
  private serializeClusters(clusters: FailureCluster[]): SerializedFailureCluster[] {
    return clusters.map((cluster) => ({
      ...cluster,
      failures: this.serializeFailures(cluster.failures),
      metadata: {
        ...cluster.metadata,
        firstSeen: cluster.metadata.firstSeen.toISOString(),
        lastSeen: cluster.metadata.lastSeen.toISOString(),
      },
    }));
  }

  /**
   * Deserializes clusters from storage
   * Handles conversion of date strings to Date objects
   */
  private deserializeClusters(data: SerializedFailureCluster[]): FailureCluster[] {
    return data.map((item) => ({
      ...item,
      failures: this.deserializeFailures(item.failures),
      metadata: {
        ...item.metadata,
        firstSeen: new Date(item.metadata.firstSeen),
        lastSeen: new Date(item.metadata.lastSeen),
      },
    }));
  }
}
