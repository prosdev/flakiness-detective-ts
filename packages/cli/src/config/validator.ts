/**
 * Configuration validation
 */

import type { FlakinessDetectiveConfigFile } from './types.js';
import { ConfigValidationError } from './types.js';

/**
 * Validates config file structure
 */
export function validateConfig(config: FlakinessDetectiveConfigFile, filePath: string): void {
  // Validate timeWindow
  if (config.timeWindow !== undefined) {
    if (typeof config.timeWindow !== 'object' || config.timeWindow === null) {
      throw new ConfigValidationError(
        'Invalid timeWindow: must be an object',
        filePath,
        'Expected: { days: number }'
      );
    }

    if (typeof config.timeWindow.days !== 'number' || config.timeWindow.days <= 0) {
      throw new ConfigValidationError(
        'Invalid timeWindow.days: must be a positive number',
        filePath,
        `Got: ${config.timeWindow.days}`
      );
    }
  }

  // Validate adapter
  if (config.adapter !== undefined) {
    if (typeof config.adapter !== 'object' || config.adapter === null) {
      throw new ConfigValidationError(
        'Invalid adapter: must be an object',
        filePath,
        'Expected: { type: string, ... }'
      );
    }

    if (!config.adapter.type) {
      throw new ConfigValidationError(
        'Invalid adapter: missing "type" field',
        filePath,
        'Expected one of: filesystem, memory, firestore, playwright'
      );
    }

    const validAdapterTypes = ['filesystem', 'memory', 'firestore', 'playwright'];
    if (!validAdapterTypes.includes(config.adapter.type)) {
      throw new ConfigValidationError(
        `Invalid adapter.type: "${config.adapter.type}"`,
        filePath,
        `Expected one of: ${validAdapterTypes.join(', ')}`
      );
    }
  }

  // Validate embedding
  if (config.embedding !== undefined) {
    if (typeof config.embedding !== 'object' || config.embedding === null) {
      throw new ConfigValidationError(
        'Invalid embedding: must be an object',
        filePath,
        'Expected: { type: string, ... }'
      );
    }

    if (!config.embedding.type) {
      throw new ConfigValidationError(
        'Invalid embedding: missing "type" field',
        filePath,
        'Expected one of: google, mock'
      );
    }

    const validEmbeddingTypes = ['google', 'mock'];
    if (!validEmbeddingTypes.includes(config.embedding.type)) {
      throw new ConfigValidationError(
        `Invalid embedding.type: "${config.embedding.type}"`,
        filePath,
        `Expected one of: ${validEmbeddingTypes.join(', ')}`
      );
    }
  }

  // Validate clustering
  if (config.clustering !== undefined) {
    if (typeof config.clustering !== 'object' || config.clustering === null) {
      throw new ConfigValidationError(
        'Invalid clustering: must be an object',
        filePath,
        'Expected: { epsilon?: number, ... }'
      );
    }

    if (config.clustering.epsilon !== undefined) {
      if (typeof config.clustering.epsilon !== 'number' || config.clustering.epsilon <= 0) {
        throw new ConfigValidationError(
          'Invalid clustering.epsilon: must be a positive number',
          filePath,
          `Got: ${config.clustering.epsilon}`
        );
      }
    }

    if (config.clustering.minPoints !== undefined) {
      if (
        typeof config.clustering.minPoints !== 'number' ||
        config.clustering.minPoints <= 0 ||
        !Number.isInteger(config.clustering.minPoints)
      ) {
        throw new ConfigValidationError(
          'Invalid clustering.minPoints: must be a positive integer',
          filePath,
          `Got: ${config.clustering.minPoints}`
        );
      }
    }

    if (config.clustering.minClusterSize !== undefined) {
      if (
        typeof config.clustering.minClusterSize !== 'number' ||
        config.clustering.minClusterSize <= 0 ||
        !Number.isInteger(config.clustering.minClusterSize)
      ) {
        throw new ConfigValidationError(
          'Invalid clustering.minClusterSize: must be a positive integer',
          filePath,
          `Got: ${config.clustering.minClusterSize}`
        );
      }
    }

    if (config.clustering.distance !== undefined) {
      const validDistances = ['euclidean', 'cosine'];
      if (!validDistances.includes(config.clustering.distance)) {
        throw new ConfigValidationError(
          `Invalid clustering.distance: "${config.clustering.distance}"`,
          filePath,
          `Expected one of: ${validDistances.join(', ')}`
        );
      }
    }

    if (config.clustering.maxClusters !== undefined) {
      if (
        typeof config.clustering.maxClusters !== 'number' ||
        config.clustering.maxClusters <= 0 ||
        !Number.isInteger(config.clustering.maxClusters)
      ) {
        throw new ConfigValidationError(
          'Invalid clustering.maxClusters: must be a positive integer',
          filePath,
          `Got: ${config.clustering.maxClusters}`
        );
      }
    }
  }

  // Validate output
  if (config.output !== undefined) {
    if (typeof config.output !== 'object' || config.output === null) {
      throw new ConfigValidationError(
        'Invalid output: must be an object',
        filePath,
        'Expected: { format?: string, path?: string }'
      );
    }

    if (config.output.format !== undefined) {
      const validFormats = ['json', 'console'];
      if (!validFormats.includes(config.output.format)) {
        throw new ConfigValidationError(
          `Invalid output.format: "${config.output.format}"`,
          filePath,
          `Expected one of: ${validFormats.join(', ')}`
        );
      }
    }

    if (config.output.path !== undefined && typeof config.output.path !== 'string') {
      throw new ConfigValidationError(
        'Invalid output.path: must be a string',
        filePath,
        `Got: ${typeof config.output.path}`
      );
    }
  }

  // Validate verbose
  if (config.verbose !== undefined && typeof config.verbose !== 'boolean') {
    throw new ConfigValidationError(
      'Invalid verbose: must be a boolean',
      filePath,
      `Got: ${typeof config.verbose}`
    );
  }
}

/**
 * Validates and returns config with helpful error messages
 */
export function validateAndGetConfig(
  config: FlakinessDetectiveConfigFile,
  filePath: string
): FlakinessDetectiveConfigFile {
  validateConfig(config, filePath);
  return config;
}
