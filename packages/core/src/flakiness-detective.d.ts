import { DataAdapter, EmbeddingProvider, FailureCluster, FlakinessDetectiveConfig } from './types';
/**
 * Main class for detecting flaky tests
 */
export declare class FlakinessDetective {
  private dataAdapter;
  private embeddingProvider;
  private config;
  /**
   * Creates a new FlakinessDetective instance
   */
  constructor(
    dataAdapter: DataAdapter,
    embeddingProvider: EmbeddingProvider,
    config?: Partial<FlakinessDetectiveConfig>
  );
  /**
   * Detects flaky tests from recent failures
   */
  detect(): Promise<FailureCluster[]>;
  /**
   * Retrieves previously detected clusters
   */
  getClusters(limit?: number): Promise<FailureCluster[]>;
  /**
   * Generates embeddings for test failures
   */
  private embedFailures;
}
//# sourceMappingURL=flakiness-detective.d.ts.map
