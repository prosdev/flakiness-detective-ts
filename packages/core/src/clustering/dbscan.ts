import { DBSCAN } from 'density-clustering';
import { ClusteringOptions, EmbeddedFailure, FailureCluster } from '../types';

/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Calculates cosine distance between two vectors (1 - cosine similarity)
 */
function cosineDistance(a: number[], b: number[]): number {
  return 1 - cosineSimilarity(a, b);
}

/**
 * Generates a deterministic cluster ID
 */
function generateClusterId(baseKey: string, index: number): string {
  return `${baseKey}-${index}`;
}

/**
 * Creates a failure cluster from a set of failures with enhanced metadata
 */
function createFailureCluster(failures: EmbeddedFailure[], clusterId: string): FailureCluster {
  const clusterSize = failures.length;
  const frequencyThreshold = Math.ceil(clusterSize * 0.5); // 50% threshold

  // Extract all patterns from failures
  const filePathCounts: Record<string, number> = {};
  const lineNumberCounts: Record<number, number> = {};
  const codeSnippetCounts: Record<string, number> = {};
  const locatorCounts: Record<string, number> = {};
  const matcherCounts: Record<string, number> = {};
  const timeoutCounts: Record<number, number> = {};

  // Collect failure details for analysis
  const failureIds: string[] = [];
  const runIds: string[] = [];
  const failureTimestamps: Date[] = [];
  const errorMessages: string[] = [];

  for (const failure of failures) {
    // Count patterns
    filePathCounts[failure.testFilePath] = (filePathCounts[failure.testFilePath] || 0) + 1;

    if (failure.metadata?.lineNumber !== undefined) {
      lineNumberCounts[failure.metadata.lineNumber] =
        (lineNumberCounts[failure.metadata.lineNumber] || 0) + 1;
    }

    if (failure.metadata?.errorSnippet) {
      codeSnippetCounts[failure.metadata.errorSnippet] =
        (codeSnippetCounts[failure.metadata.errorSnippet] || 0) + 1;
    }

    if (failure.metadata?.locator) {
      locatorCounts[failure.metadata.locator] = (locatorCounts[failure.metadata.locator] || 0) + 1;
    }

    if (failure.metadata?.matcher) {
      matcherCounts[failure.metadata.matcher] = (matcherCounts[failure.metadata.matcher] || 0) + 1;
    }

    if (failure.metadata?.timeout !== undefined) {
      timeoutCounts[failure.metadata.timeout] = (timeoutCounts[failure.metadata.timeout] || 0) + 1;
    }

    // Collect failure details
    failureIds.push(failure.id);
    if (failure.metadata?.runId) {
      runIds.push(failure.metadata.runId);
    }
    failureTimestamps.push(failure.timestamp);
    // Truncate error messages to 200 chars
    errorMessages.push(failure.errorMessage.substring(0, 200));
  }

  // Find common patterns (appearing in at least 50% of cluster)
  const commonFilePaths = Object.entries(filePathCounts)
    .filter(([, count]) => count >= frequencyThreshold)
    .map(([path]) => path);

  const commonLineNumbers = Object.entries(lineNumberCounts)
    .filter(([, count]) => count >= frequencyThreshold)
    .map(([line]) => Number(line));

  const commonCodeSnippets = Object.entries(codeSnippetCounts)
    .filter(([, count]) => count >= frequencyThreshold)
    .map(([snippet]) => snippet);

  const commonLocators = Object.entries(locatorCounts)
    .filter(([, count]) => count >= frequencyThreshold)
    .map(([locator]) => locator);

  const commonMatchers = Object.entries(matcherCounts)
    .filter(([, count]) => count >= frequencyThreshold)
    .map(([matcher]) => matcher);

  const commonTimeouts = Object.entries(timeoutCounts)
    .filter(([, count]) => count >= frequencyThreshold)
    .map(([timeout]) => Number(timeout));

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

  // Determine failure pattern
  let failurePattern = '';
  if (commonFilePaths.length > 0 && commonLineNumbers.length > 0) {
    failurePattern = `Common failure at ${commonFilePaths[0]}:${commonLineNumbers[0]}`;
  } else if (commonCodeSnippets.length > 0) {
    const snippet = commonCodeSnippets[0];
    failurePattern = `Common code pattern: ${snippet.substring(0, 100)}${
      snippet.length > 100 ? '...' : ''
    }`;
  } else {
    failurePattern = 'Similar test failures';
  }

  // Determine assertion pattern
  let assertionPattern: string | undefined;
  if (commonLocators.length > 0 && commonMatchers.length > 0) {
    assertionPattern = `${commonMatchers[0]} on ${commonLocators[0]}`;
    if (commonTimeouts.length > 0) {
      assertionPattern += ` (${commonTimeouts[0]}ms timeout)`;
    }
  } else if (commonLocators.length > 0) {
    assertionPattern = `Common locator: ${commonLocators[0]}`;
  } else if (commonMatchers.length > 0) {
    assertionPattern = `Common matcher: ${commonMatchers[0]}`;
  }

  return {
    id: clusterId,
    failures: failures,
    commonPatterns: {
      filePaths: commonFilePaths,
      lineNumbers: commonLineNumbers,
      codeSnippets: commonCodeSnippets,
      locators: commonLocators,
      matchers: commonMatchers,
      timeouts: commonTimeouts,
    },
    metadata: {
      failureCount: failures.length,
      firstSeen,
      lastSeen,
      averageTimeBetweenFailures,
      failureIds,
      runIds,
      failureTimestamps,
      errorMessages,
    },
    failurePattern,
    assertionPattern,
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

  // Select distance function based on config
  const distanceFunc = options.distance === 'cosine' ? cosineDistance : undefined;

  const dbscan = new DBSCAN();
  const clusters = dbscan.run(embeddings, options.epsilon, options.minPoints, distanceFunc);

  // Generate deterministic cluster IDs based on week
  const weekKey = new Date().toISOString().slice(0, 10);

  // Filter, sort, and limit clusters
  const allClusters = clusters
    .filter((cluster) => cluster.length >= options.minClusterSize)
    .map((clusterIndices, index) => {
      const clusterFailures = clusterIndices.map((i) => embeddedFailures[i]);
      const clusterId = generateClusterId(weekKey, index);
      return createFailureCluster(clusterFailures, clusterId);
    })
    .sort((a, b) => b.failures.length - a.failures.length);

  // Apply maxClusters limit
  const maxClusters = options.maxClusters ?? 5;
  return allClusters.slice(0, maxClusters);
}
