/**
 * Represents a test failure with metadata
 */
export interface TestFailure {
  id: string;
  testTitle: string;
  testFilePath: string;
  errorMessage: string;
  errorStack?: string;
  timestamp: Date;
  metadata?: TestFailureMetadata;
}

/**
 * Additional metadata for a test failure
 */
export interface TestFailureMetadata {
  errorSnippet?: string;
  lineNumber?: number;
  projectName?: string;
  suiteName?: string;
  locator?: string;
  matcher?: string;
  timeout?: number;
  duration?: number; // Test duration in milliseconds
  framework?: string;
  // Playwright assertion details
  actualValue?: string;
  expectedValue?: string;
  // Run tracking
  runId?: string; // Extracted from reportLink (e.g., GitHub Actions run ID)
  reportLink?: string;
}

/**
 * A test failure with an embedding vector
 */
export interface EmbeddedFailure extends TestFailure {
  embedding: number[];
}

/**
 * A cluster of related test failures
 */
export interface FailureCluster {
  id: string;
  failures: TestFailure[];
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
    firstSeen: Date;
    lastSeen: Date;
    averageTimeBetweenFailures?: number;
    // Enhanced tracking for detailed lookup
    failureIds: string[]; // Document IDs for detailed lookup
    runIds: string[]; // GitHub run IDs (more persistent than URLs)
    failureTimestamps: Date[]; // When each failure occurred
    errorMessages: string[]; // Truncated error messages for analysis
  };
  // Pattern summaries
  failurePattern?: string; // Human-readable failure pattern description
  assertionPattern?: string; // Playwright assertion pattern (e.g., "toContainText on locator")
}

/**
 * Options for DBSCAN clustering algorithm
 */
export interface ClusteringOptions {
  epsilon: number;
  minPoints: number;
  minClusterSize: number;
  distance?: 'euclidean' | 'cosine'; // Distance metric for clustering
  maxClusters?: number; // Maximum number of clusters to return (default: 5)
}

/**
 * Configuration for FlakinessDetective
 */
export interface FlakinessDetectiveConfig {
  clustering: ClusteringOptions;
  timeWindow: {
    days: number;
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: FlakinessDetectiveConfig = {
  clustering: {
    epsilon: 0.15, // Lower epsilon for cosine distance (0.3 was for Euclidean)
    minPoints: 2,
    minClusterSize: 2, // Lower threshold to match original sensitivity
    distance: 'cosine', // Cosine distance is standard for embeddings
    maxClusters: 5, // Return top 5 clusters by default
  },
  timeWindow: {
    days: 7,
  },
};

/**
 * Interface for adapters that store and retrieve test failures
 */
export interface DataAdapter {
  fetchFailures(days: number): Promise<TestFailure[]>;
  saveClusters(clusters: FailureCluster[]): Promise<void>;
  fetchClusters(limit?: number): Promise<FailureCluster[]>;
}

/**
 * Interface for providers that generate embeddings
 */
export interface EmbeddingProvider {
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}
