import { FlakinessDetectiveConfig, TestFailure } from '../types';

/**
 * Validates the FlakinessDetective configuration
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: FlakinessDetectiveConfig): void {
  // Validate clustering options
  if (config.clustering.epsilon <= 0) {
    throw new Error('clustering.epsilon must be greater than 0');
  }

  if (config.clustering.minPoints < 1) {
    throw new Error('clustering.minPoints must be at least 1');
  }

  if (config.clustering.minClusterSize < 1) {
    throw new Error('clustering.minClusterSize must be at least 1');
  }

  if (config.clustering.maxClusters !== undefined && config.clustering.maxClusters < 1) {
    throw new Error('clustering.maxClusters must be at least 1 if specified');
  }

  if (
    config.clustering.distance !== undefined &&
    config.clustering.distance !== 'euclidean' &&
    config.clustering.distance !== 'cosine'
  ) {
    throw new Error("clustering.distance must be 'euclidean' or 'cosine'");
  }

  // Validate time window
  if (config.timeWindow.days <= 0 || !Number.isInteger(config.timeWindow.days)) {
    throw new Error('timeWindow.days must be a positive integer');
  }
}

/**
 * Validates an array of test failures
 * @throws Error if failures array is invalid
 */
export function validateFailures(failures: TestFailure[]): void {
  if (!Array.isArray(failures)) {
    throw new Error('failures must be an array');
  }

  for (let i = 0; i < failures.length; i++) {
    const failure = failures[i];

    if (!failure.id) {
      throw new Error(`failure at index ${i} is missing required field: id`);
    }

    if (!failure.testTitle) {
      throw new Error(`failure at index ${i} is missing required field: testTitle`);
    }

    if (!failure.testFilePath) {
      throw new Error(`failure at index ${i} is missing required field: testFilePath`);
    }

    if (!failure.errorMessage) {
      throw new Error(`failure at index ${i} is missing required field: errorMessage`);
    }

    if (!(failure.timestamp instanceof Date)) {
      throw new Error(`failure at index ${i} has invalid timestamp (must be a Date object)`);
    }

    if (Number.isNaN(failure.timestamp.getTime())) {
      throw new Error(`failure at index ${i} has invalid timestamp (Invalid Date)`);
    }
  }
}

/**
 * Validates embeddings for clustering
 * @throws Error if embeddings are invalid
 */
export function validateEmbeddings(embeddings: number[][]): void {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('embeddings must be a non-empty array');
  }

  const firstLength = embeddings[0]?.length;
  if (firstLength === undefined || firstLength === 0) {
    throw new Error('embeddings must contain non-empty arrays');
  }

  for (let i = 0; i < embeddings.length; i++) {
    if (!Array.isArray(embeddings[i])) {
      throw new Error(`embedding at index ${i} is not an array`);
    }

    if (embeddings[i].length !== firstLength) {
      throw new Error(
        `embedding at index ${i} has length ${embeddings[i].length}, expected ${firstLength}`
      );
    }

    for (let j = 0; j < embeddings[i].length; j++) {
      if (typeof embeddings[i][j] !== 'number' || Number.isNaN(embeddings[i][j])) {
        throw new Error(`embedding at index ${i}, dimension ${j} is not a valid number`);
      }
    }
  }
}
