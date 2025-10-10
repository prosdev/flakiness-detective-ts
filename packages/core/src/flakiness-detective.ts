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
import { validateConfig, validateEmbeddings, validateFailures } from './utils/validation';

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
    logLevel: 'info' | 'debug' | 'warn' | 'error' | 'silent' = 'info'
  ) {
    this.dataAdapter = dataAdapter;
    this.embeddingProvider = embeddingProvider;
    this.logger = createLogger({
      level: logLevel,
      timestamps: logLevel === 'debug',
    });

    // Merge config with defaults
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

    // Validate the merged configuration
    validateConfig(this.config);

    this.logger.debug(
      `FlakinessDetective initialized with config: ${JSON.stringify(this.config, null, 2)}`
    );
  }

  /**
   * Detects flaky tests from recent failures
   */
  async detect(): Promise<FailureCluster[]> {
    const pipelineStart = Date.now();

    // 1. Fetch failures from the specified time window
    this.logger.debug(`Fetching failures from the last ${this.config.timeWindow.days} days...`);
    const fetchStart = Date.now();
    const failures = await this.dataAdapter.fetchFailures(this.config.timeWindow.days);
    const fetchDuration = ((Date.now() - fetchStart) / 1000).toFixed(2);
    this.logger.debug(`Fetched ${failures.length} failures in ${fetchDuration}s`);

    if (failures.length === 0) {
      this.logger.info('No failures found in the specified time window.');
      return [];
    }

    // Validate failures
    this.logger.debug('Validating failures...');
    validateFailures(failures);

    // 2. Extract patterns from failures
    this.logger.debug('Extracting patterns from failures...');
    const patternStart = Date.now();
    const enhancedFailures = failures.map((failure) => extractPatterns(failure));
    const patternDuration = ((Date.now() - patternStart) / 1000).toFixed(2);
    this.logger.debug(`Pattern extraction completed in ${patternDuration}s`);

    // 3. Generate embeddings for failures
    this.logger.debug('Generating embeddings...');
    const embedStart = Date.now();
    const embeddedFailures = await this.embedFailures(enhancedFailures);
    const embedDuration = ((Date.now() - embedStart) / 1000).toFixed(2);
    this.logger.debug(`Generated ${embeddedFailures.length} embeddings in ${embedDuration}s`);

    // 4. Cluster failures based on embeddings
    this.logger.debug(
      `Clustering with epsilon=${this.config.clustering.epsilon}, ` +
        `distance=${this.config.clustering.distance}, ` +
        `minPoints=${this.config.clustering.minPoints}...`
    );
    const clusterStart = Date.now();
    const clusters = clusterFailures(embeddedFailures, this.config.clustering);
    const clusterDuration = ((Date.now() - clusterStart) / 1000).toFixed(2);
    this.logger.debug(`Clustering completed in ${clusterDuration}s`);

    const pipelineDuration = ((Date.now() - pipelineStart) / 1000).toFixed(2);
    this.logger.info(
      `Found ${clusters.length} flaky test clusters from ${failures.length} failures`
    );
    this.logger.debug(`Total pipeline execution time: ${pipelineDuration}s`);

    // 5. Save clusters to storage
    this.logger.debug('Saving clusters to storage...');
    const saveStart = Date.now();
    await this.dataAdapter.saveClusters(clusters);
    const saveDuration = ((Date.now() - saveStart) / 1000).toFixed(2);
    this.logger.debug(`Saved ${clusters.length} clusters in ${saveDuration}s`);

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
    this.logger.debug(`Creating rich contexts for ${failures.length} failures...`);
    const contexts = failures.map((failure) => createRichEmbeddingContext(failure));

    // Log sample context in debug mode
    if (contexts.length > 0) {
      this.logger.debug(`Sample context (first failure): ${contexts[0].substring(0, 200)}...`);
    }

    this.logger.debug(`Calling embedding provider for ${contexts.length} contexts...`);
    const embeddings = await this.embeddingProvider.generateEmbeddings(contexts);
    this.logger.debug(
      `Received ${embeddings.length} embeddings, dimensions: ${embeddings[0]?.length || 0}`
    );

    // Validate embeddings
    this.logger.debug('Validating embeddings...');
    validateEmbeddings(embeddings);

    return failures.map((failure, index) => ({
      ...failure,
      embedding: embeddings[index],
    }));
  }
}
