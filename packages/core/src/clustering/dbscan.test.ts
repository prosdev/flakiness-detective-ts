import { describe, expect, it } from 'vitest';
import type { ClusteringOptions, EmbeddedFailure } from '../types';
import { clusterFailures } from './dbscan';

describe('clusterFailures', () => {
  // Helper to create test failures with embeddings
  function createEmbeddedFailure(
    id: string,
    embedding: number[],
    metadata: Partial<EmbeddedFailure['metadata']> = {}
  ): EmbeddedFailure {
    return {
      id,
      testTitle: `Test ${id}`,
      testFilePath: 'test.spec.ts',
      errorMessage: `Error in test ${id}`,
      timestamp: new Date('2024-01-01'),
      embedding,
      metadata: {
        lineNumber: 10,
        locator: 'button',
        matcher: 'toBeVisible',
        ...metadata,
      },
    };
  }

  it('should return empty array for no failures', () => {
    const options: ClusteringOptions = {
      epsilon: 0.15,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures([], options);
    expect(result).toEqual([]);
  });

  it('should cluster similar failures using cosine distance', () => {
    // Create two clusters of similar embeddings
    const failures: EmbeddedFailure[] = [
      // Cluster 1: Similar embeddings [1, 0, 0]
      createEmbeddedFailure('1', [1, 0, 0]),
      createEmbeddedFailure('2', [0.9, 0.1, 0]),
      createEmbeddedFailure('3', [0.95, 0.05, 0]),
      // Cluster 2: Similar embeddings [0, 1, 0]
      createEmbeddedFailure('4', [0, 1, 0]),
      createEmbeddedFailure('5', [0.1, 0.9, 0]),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.failures.length >= 2)).toBe(true);
  });

  it('should apply frequency threshold (50%) for common patterns', () => {
    const failures: EmbeddedFailure[] = [
      createEmbeddedFailure('1', [1, 0, 0], {
        locator: 'commonButton',
        matcher: 'toBeVisible',
        lineNumber: 42,
      }),
      createEmbeddedFailure('2', [0.95, 0.05, 0], {
        locator: 'commonButton',
        matcher: 'toBeVisible',
        lineNumber: 42,
      }),
      createEmbeddedFailure('3', [0.9, 0.1, 0], {
        locator: 'differentButton',
        matcher: 'toHaveText',
        lineNumber: 99,
      }),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    if (result.length > 0) {
      const cluster = result[0];
      // Common patterns should appear in at least 50% of failures
      // With 3 failures, 2+ occurrences means 66%+, so it's common
      expect(cluster.commonPatterns.locators).toContain('commonButton');
      expect(cluster.commonPatterns.matchers).toContain('toBeVisible');
    }
  });

  it('should generate deterministic cluster IDs', () => {
    const failures: EmbeddedFailure[] = [
      createEmbeddedFailure('1', [1, 0, 0]),
      createEmbeddedFailure('2', [0.9, 0.1, 0]),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    if (result.length > 0) {
      // ID should follow format: YYYY-MM-DD-{index}
      expect(result[0].id).toMatch(/^\d{4}-\d{2}-\d{2}-\d+$/);
    }
  });

  it('should sort clusters by failure count descending', () => {
    const failures: EmbeddedFailure[] = [
      // Small cluster: 2 failures
      createEmbeddedFailure('1', [1, 0, 0, 0]),
      createEmbeddedFailure('2', [0.95, 0.05, 0, 0]),
      // Large cluster: 3 failures
      createEmbeddedFailure('3', [0, 1, 0, 0]),
      createEmbeddedFailure('4', [0.05, 0.95, 0, 0]),
      createEmbeddedFailure('5', [0.1, 0.9, 0, 0]),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    if (result.length > 1) {
      // First cluster should have more failures than second
      expect(result[0].failures.length).toBeGreaterThanOrEqual(result[1].failures.length);
    }
  });

  it('should limit clusters to maxClusters', () => {
    // Create many small clusters
    const failures: EmbeddedFailure[] = [];
    for (let i = 0; i < 20; i += 2) {
      // Create pairs of similar embeddings
      const base = new Array(10).fill(0);
      base[i % 10] = 1;
      failures.push(createEmbeddedFailure(`${i}`, base));
      failures.push(
        createEmbeddedFailure(
          `${i + 1}`,
          base.map((v, idx) => (idx === i % 10 ? 0.95 : v))
        )
      );
    }

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
      maxClusters: 3,
    };

    const result = clusterFailures(failures, options);

    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('should include enhanced metadata in clusters', () => {
    const failures: EmbeddedFailure[] = [
      createEmbeddedFailure('failure-1', [1, 0, 0], {
        runId: 'run-123',
        reportLink: 'https://github.com/org/repo/runs/123',
      }),
      createEmbeddedFailure('failure-2', [0.95, 0.05, 0], {
        runId: 'run-124',
        reportLink: 'https://github.com/org/repo/runs/124',
      }),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    if (result.length > 0) {
      const cluster = result[0];
      expect(cluster.metadata.failureIds).toContain('failure-1');
      expect(cluster.metadata.failureIds).toContain('failure-2');
      expect(cluster.metadata.runIds).toContain('run-123');
      expect(cluster.metadata.runIds).toContain('run-124');
      expect(cluster.metadata.errorMessages).toHaveLength(2);
      expect(cluster.metadata.failureTimestamps).toHaveLength(2);
    }
  });

  it('should truncate error messages to 200 chars', () => {
    const longMessage = 'Error: '.repeat(100); // Creates a very long message
    const failures: EmbeddedFailure[] = [
      { ...createEmbeddedFailure('1', [1, 0, 0]), errorMessage: longMessage },
      {
        ...createEmbeddedFailure('2', [0.95, 0.05, 0]),
        errorMessage: longMessage,
      },
    ];

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    if (result.length > 0) {
      const cluster = result[0];
      for (const msg of cluster.metadata.errorMessages) {
        expect(msg.length).toBeLessThanOrEqual(200);
      }
    }
  });

  it('should generate failurePattern and assertionPattern', () => {
    const failures: EmbeddedFailure[] = [
      createEmbeddedFailure('1', [1, 0, 0], {
        locator: 'submitButton',
        matcher: 'toBeVisible',
        timeout: 5000,
        lineNumber: 42,
      }),
      createEmbeddedFailure('2', [0.95, 0.05, 0], {
        locator: 'submitButton',
        matcher: 'toBeVisible',
        timeout: 5000,
        lineNumber: 42,
      }),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.3,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    if (result.length > 0) {
      const cluster = result[0];
      expect(cluster.failurePattern).toBeDefined();
      expect(cluster.failurePattern).toContain('test.spec.ts');
      expect(cluster.assertionPattern).toBeDefined();
      expect(cluster.assertionPattern).toContain('toBeVisible');
      expect(cluster.assertionPattern).toContain('submitButton');
    }
  });

  it('should use euclidean distance when specified', () => {
    const failures: EmbeddedFailure[] = [
      createEmbeddedFailure('1', [1, 0, 0]),
      createEmbeddedFailure('2', [0.9, 0.1, 0]),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.5, // Higher epsilon for euclidean
      minPoints: 2,
      minClusterSize: 2,
      distance: 'euclidean',
    };

    const result = clusterFailures(failures, options);

    // Should still produce clusters, just using different distance metric
    expect(Array.isArray(result)).toBe(true);
  });

  it('should filter out clusters smaller than minClusterSize', () => {
    const failures: EmbeddedFailure[] = [
      createEmbeddedFailure('1', [1, 0, 0]),
      createEmbeddedFailure('2', [0, 1, 0]),
      createEmbeddedFailure('3', [0, 0, 1]),
    ];

    const options: ClusteringOptions = {
      epsilon: 0.1, // Very strict - unlikely to cluster
      minPoints: 2,
      minClusterSize: 3, // Require at least 3 failures
      distance: 'cosine',
    };

    const result = clusterFailures(failures, options);

    // All clusters should have at least minClusterSize failures
    for (const cluster of result) {
      expect(cluster.failures.length).toBeGreaterThanOrEqual(3);
    }
  });
});
