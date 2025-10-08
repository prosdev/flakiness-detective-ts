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
  framework?: string;
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
  };
}
/**
 * Options for DBSCAN clustering algorithm
 */
export interface ClusteringOptions {
  epsilon: number;
  minPoints: number;
  minClusterSize: number;
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
export declare const DEFAULT_CONFIG: FlakinessDetectiveConfig;
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
//# sourceMappingURL=types.d.ts.map
