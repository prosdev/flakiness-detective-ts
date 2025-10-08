import DBSCAN from 'density-clustering';
import { ClusteringOptions, EmbeddedFailure, FailureCluster } from '../types';

/**
 * Helper function to safely extract defined values
 */
function extractDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('Expected value to be defined');
  }
  return value;
}

/**
 * Creates a failure cluster from a set of failures
 */
function createFailureCluster(failures: EmbeddedFailure[]): FailureCluster {
  // Extract common patterns from failures
  const filePaths = [...new Set(failures.map((f) => f.testFilePath))];
  const lineNumbers = failures
    .filter((f) => f.metadata?.lineNumber !== undefined)
    .map((f) => extractDefined(f.metadata?.lineNumber))
    .filter((n, i, arr) => arr.indexOf(n) === i);

  const codeSnippets = failures
    .filter((f) => f.metadata?.errorSnippet !== undefined)
    .map((f) => extractDefined(f.metadata?.errorSnippet))
    .filter((s, i, arr) => arr.indexOf(s) === i);

  const locators = failures
    .filter((f) => f.metadata?.locator !== undefined)
    .map((f) => extractDefined(f.metadata?.locator))
    .filter((l, i, arr) => arr.indexOf(l) === i);

  const matchers = failures
    .filter((f) => f.metadata?.matcher !== undefined)
    .map((f) => extractDefined(f.metadata?.matcher))
    .filter((m, i, arr) => arr.indexOf(m) === i);

  const timeouts = failures
    .filter((f) => f.metadata?.timeout !== undefined)
    .map((f) => extractDefined(f.metadata?.timeout))
    .filter((t, i, arr) => arr.indexOf(t) === i);

  // Sort failures by timestamp
  const sortedFailures = [...failures].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const firstSeen = sortedFailures[0].timestamp;
  const lastSeen = sortedFailures[sortedFailures.length - 1].timestamp;

  // Calculate average time between failures
  let averageTimeBetweenFailures: number | undefined;
  if (failures.length > 1) {
    let totalTime = 0;
    for (let i = 1; i < sortedFailures.length; i++) {
      totalTime +=
        sortedFailures[i].timestamp.getTime() - sortedFailures[i - 1].timestamp.getTime();
    }
    averageTimeBetweenFailures = totalTime / (sortedFailures.length - 1);
  }

  return {
    id: `cluster-${Math.random().toString(36).substring(2, 9)}`,
    failures: failures,
    commonPatterns: {
      filePaths,
      lineNumbers,
      codeSnippets,
      locators,
      matchers,
      timeouts,
    },
    metadata: {
      failureCount: failures.length,
      firstSeen,
      lastSeen,
      averageTimeBetweenFailures,
    },
  };
}

/**
 * Clusters test failures using DBSCAN algorithm
 */
export function clusterFailures(
  embeddedFailures: EmbeddedFailure[],
  options: ClusteringOptions
): FailureCluster[] {
  if (embeddedFailures.length === 0) {
    return [];
  }

  const embeddings = embeddedFailures.map((f) => f.embedding);

  const dbscan = new DBSCAN();
  const clusters = dbscan.run(embeddings, options.epsilon, options.minPoints);

  return clusters
    .filter((cluster) => cluster.length >= options.minClusterSize)
    .map((clusterIndices) => {
      const clusterFailures = clusterIndices.map((i) => embeddedFailures[i]);
      return createFailureCluster(clusterFailures);
    })
    .sort((a, b) => b.failures.length - a.failures.length);
}
