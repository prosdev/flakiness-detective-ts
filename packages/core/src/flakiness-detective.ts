import { Logger, createLogger } from '@flakiness-detective/utils';
import { clusterFailures } from './clustering/dbscan';
import {
  DEFAULT_CONFIG,
  DataAdapter,
  EmbeddedFailure,
  EmbeddingProvider,
  FailureCluster,
  FlakinessDetectiveConfig,
  TestFailure,
} from './types';
import { createRichEmbeddingContext, extractPatterns } from './utils/pattern-extraction';

/**
 * Main class for detecting flaky tests
 */
export class FlakinessDetective {
  private dataAdapter: DataAdapter;
  private embeddingProvider: EmbeddingProvider;
  private config: FlakinessDetectiveConfig;
  private logger: Logger;

  /**
   * Creates a new FlakinessDetective instance
   */
  constructor(
    dataAdapter: DataAdapter,
    embeddingProvider: EmbeddingProvider,
    config: Partial<FlakinessDetectiveConfig> = {},
    logLevel: 'info' | 'debug' | 'warn' | 'error' = 'info'
  ) {
    this.dataAdapter = dataAdapter;
    this.embeddingProvider = embeddingProvider;
    this.logger = createLogger({ level: logLevel });
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      clustering: {
        ...DEFAULT_CONFIG.clustering,
        ...config.clustering,
      },
      timeWindow: {
        ...DEFAULT_CONFIG.timeWindow,
        ...config.timeWindow,
      },
    };
  }

  /**
   * Detects flaky tests from recent failures
   */
  async detect(): Promise<FailureCluster[]> {
    // 1. Fetch failures from the specified time window
    const failures = await this.dataAdapter.fetchFailures(this.config.timeWindow.days);

    if (failures.length === 0) {
      this.logger.log('No failures found in the specified time window.');
      return [];
    }

    // 2. Extract patterns from failures
    const enhancedFailures = failures.map((failure) => extractPatterns(failure));

    // 3. Generate embeddings for failures
    const embeddedFailures = await this.embedFailures(enhancedFailures);

    // 4. Cluster failures based on embeddings
    const clusters = clusterFailures(embeddedFailures, this.config.clustering);

    // 5. Save clusters to storage
    await this.dataAdapter.saveClusters(clusters);

    return clusters;
  }

  /**
   * Retrieves previously detected clusters
   */
  async getClusters(limit?: number): Promise<FailureCluster[]> {
    return this.dataAdapter.fetchClusters(limit);
  }

  /**
   * Generates embeddings for test failures
   */
  private async embedFailures(failures: TestFailure[]): Promise<EmbeddedFailure[]> {
    const contexts = failures.map((failure) => createRichEmbeddingContext(failure));

    const embeddings = await this.embeddingProvider.generateEmbeddings(contexts);

    return failures.map((failure, index) => ({
      ...failure,
      embedding: embeddings[index],
    }));
  }
}
