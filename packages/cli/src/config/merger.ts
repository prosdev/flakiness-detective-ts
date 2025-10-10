/**
 * Config merging utilities
 * CLI arguments take precedence over config file
 */

import type { CliConfig } from '../index.js';
import type { FlakinessDetectiveConfigFile } from './types.js';

/**
 * Merges config file with CLI arguments
 * CLI arguments override config file values
 */
export function mergeConfigWithCliArgs(
  fileConfig: FlakinessDetectiveConfigFile | null,
  cliArgs: Partial<CliConfig>
): Partial<CliConfig> {
  if (!fileConfig) {
    return cliArgs;
  }

  // Start with file config, then override with CLI args
  const merged: Partial<CliConfig> = {};

  // Time window
  if (fileConfig.timeWindow?.days !== undefined) {
    merged.timeWindow = fileConfig.timeWindow.days;
  }
  if (cliArgs.timeWindow !== undefined) {
    merged.timeWindow = cliArgs.timeWindow;
  }

  // Adapter
  if (fileConfig.adapter !== undefined) {
    merged.adapter = fileConfig.adapter;
  }
  if (cliArgs.adapter !== undefined) {
    // Merge adapter fields (CLI args can override specific fields)
    merged.adapter = {
      ...merged.adapter,
      ...cliArgs.adapter,
    };
  }

  // Embedding
  if (fileConfig.embedding !== undefined) {
    merged.embedding = fileConfig.embedding;
  }
  if (cliArgs.embedding !== undefined) {
    // Merge embedding fields
    merged.embedding = {
      ...merged.embedding,
      ...cliArgs.embedding,
    };
  }

  // Clustering options
  if (fileConfig.clustering?.epsilon !== undefined) {
    merged.epsilon = fileConfig.clustering.epsilon;
  }
  if (cliArgs.epsilon !== undefined) {
    merged.epsilon = cliArgs.epsilon;
  }

  if (fileConfig.clustering?.minPoints !== undefined) {
    merged.minPoints = fileConfig.clustering.minPoints;
  }
  if (cliArgs.minPoints !== undefined) {
    merged.minPoints = cliArgs.minPoints;
  }

  if (fileConfig.clustering?.minClusterSize !== undefined) {
    merged.minClusterSize = fileConfig.clustering.minClusterSize;
  }
  if (cliArgs.minClusterSize !== undefined) {
    merged.minClusterSize = cliArgs.minClusterSize;
  }

  if (fileConfig.clustering?.distance !== undefined) {
    merged.distance = fileConfig.clustering.distance;
  }
  if (cliArgs.distance !== undefined) {
    merged.distance = cliArgs.distance;
  }

  if (fileConfig.clustering?.maxClusters !== undefined) {
    merged.maxClusters = fileConfig.clustering.maxClusters;
  }
  if (cliArgs.maxClusters !== undefined) {
    merged.maxClusters = cliArgs.maxClusters;
  }

  // Output options
  if (fileConfig.output?.format !== undefined) {
    merged.outputFormat = fileConfig.output.format;
  }
  if (cliArgs.outputFormat !== undefined) {
    merged.outputFormat = cliArgs.outputFormat;
  }

  if (fileConfig.output?.path !== undefined) {
    merged.outputPath = fileConfig.output.path;
  }
  if (cliArgs.outputPath !== undefined) {
    merged.outputPath = cliArgs.outputPath;
  }

  // Verbose
  if (fileConfig.verbose !== undefined) {
    merged.verbose = fileConfig.verbose;
  }
  if (cliArgs.verbose !== undefined) {
    merged.verbose = cliArgs.verbose;
  }

  // Command always comes from CLI
  if (cliArgs.command !== undefined) {
    merged.command = cliArgs.command;
  }

  return merged;
}
