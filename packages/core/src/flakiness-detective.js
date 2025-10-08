Object.defineProperty(exports, '__esModule', { value: true });
exports.FlakinessDetective = void 0;
const types_1 = require('./types');
const dbscan_1 = require('./clustering/dbscan');
const pattern_extraction_1 = require('./utils/pattern-extraction');
/**
 * Main class for detecting flaky tests
 */
class FlakinessDetective {
  dataAdapter;
  embeddingProvider;
  config;
  /**
   * Creates a new FlakinessDetective instance
   */
  constructor(dataAdapter, embeddingProvider, config = {}) {
    this.dataAdapter = dataAdapter;
    this.embeddingProvider = embeddingProvider;
    this.config = {
      ...types_1.DEFAULT_CONFIG,
      ...config,
      clustering: {
        ...types_1.DEFAULT_CONFIG.clustering,
        ...config.clustering,
      },
      timeWindow: {
        ...types_1.DEFAULT_CONFIG.timeWindow,
        ...config.timeWindow,
      },
    };
  }
  /**
   * Detects flaky tests from recent failures
   */
  async detect() {
    // 1. Fetch failures from the specified time window
    const failures = await this.dataAdapter.fetchFailures(this.config.timeWindow.days);
    if (failures.length === 0) {
      console.log('No failures found in the specified time window.');
      return [];
    }
    // 2. Extract patterns from failures
    const enhancedFailures = failures.map((failure) =>
      (0, pattern_extraction_1.extractPatterns)(failure)
    );
    // 3. Generate embeddings for failures
    const embeddedFailures = await this.embedFailures(enhancedFailures);
    // 4. Cluster failures based on embeddings
    const clusters = (0, dbscan_1.clusterFailures)(embeddedFailures, this.config.clustering);
    // 5. Save clusters to storage
    await this.dataAdapter.saveClusters(clusters);
    return clusters;
  }
  /**
   * Retrieves previously detected clusters
   */
  async getClusters(limit) {
    return this.dataAdapter.fetchClusters(limit);
  }
  /**
   * Generates embeddings for test failures
   */
  async embedFailures(failures) {
    const contexts = failures.map((failure) =>
      (0, pattern_extraction_1.createRichEmbeddingContext)(failure)
    );
    const embeddings = await this.embeddingProvider.generateEmbeddings(contexts);
    return failures.map((failure, index) => ({
      ...failure,
      embedding: embeddings[index],
    }));
  }
}
exports.FlakinessDetective = FlakinessDetective;
//# sourceMappingURL=flakiness-detective.js.map
