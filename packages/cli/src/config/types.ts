/**
 * Configuration file types and interfaces
 */

import type { DataAdapterConfig, EmbeddingProviderConfig } from '@flakiness-detective/adapters';

/**
 * Configuration file structure
 * Supports both CLI-style and nested object-style configs
 */
export interface FlakinessDetectiveConfigFile {
  /**
   * Time window for fetching failures
   */
  timeWindow?: {
    days: number;
  };

  /**
   * Data adapter configuration
   */
  adapter?: DataAdapterConfig;

  /**
   * Embedding provider configuration
   */
  embedding?: EmbeddingProviderConfig;

  /**
   * Clustering configuration
   */
  clustering?: {
    epsilon?: number;
    minPoints?: number;
    minClusterSize?: number;
    distance?: 'euclidean' | 'cosine';
    maxClusters?: number;
  };

  /**
   * Output configuration
   */
  output?: {
    format?: 'json' | 'console';
    path?: string;
  };

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

/**
 * Result of config file discovery
 */
export interface ConfigFileDiscoveryResult {
  /**
   * Full path to config file
   */
  filePath: string;

  /**
   * Config file type
   */
  type: 'json' | 'js' | 'ts' | 'package.json';

  /**
   * Whether file exists
   */
  exists: boolean;
}

/**
 * Supported config file names (in priority order)
 */
export const CONFIG_FILE_NAMES = [
  '.flakinessrc.json',
  '.flakinessrc.js',
  'flakiness-detective.config.js',
  '.flakinessrc.ts',
  'flakiness-detective.config.ts',
  'package.json',
] as const;

/**
 * Config file validation error
 */
export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public filePath: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}
