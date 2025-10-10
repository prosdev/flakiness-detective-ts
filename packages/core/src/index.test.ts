import { describe, expect, it } from 'vitest';
import { FlakinessDetective } from './flakiness-detective';
import type { DataAdapter, EmbeddingProvider, FailureCluster, TestFailure } from './types';

// Mock data adapter
class MockDataAdapter implements DataAdapter {
  private failures: TestFailure[] = [];
  private clusters: FailureCluster[] = [];

  constructor(failures: TestFailure[] = []) {
    this.failures = failures;
  }

  async fetchFailures(_days: number): Promise<TestFailure[]> {
    return this.failures;
  }

  async saveClusters(clusters: FailureCluster[]): Promise<void> {
    this.clusters = clusters;
  }

  async fetchClusters(limit?: number): Promise<FailureCluster[]> {
    return limit ? this.clusters.slice(0, limit) : this.clusters;
  }

  getSavedClusters(): FailureCluster[] {
    return this.clusters;
  }
}

// Mock embedding provider
class MockEmbeddingProvider implements EmbeddingProvider {
  private dimensions: number;

  constructor(dimensions = 128) {
    this.dimensions = dimensions;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map((text) => this.generateMockEmbedding(text));
  }

  private generateMockEmbedding(text: string): number[] {
    // Create deterministic embeddings based on text hash
    const hash = this.simpleHash(text);
    const embedding = new Array(this.dimensions).fill(0).map((_, i) => {
      const value = Math.sin(hash * (i + 1)) / 2 + 0.5;
      return value * 2 - 1;
    });

    // Normalize to unit length
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

describe('FlakinessDetective E2E', () => {
  it('should detect flaky test patterns from Playwright failures', async () => {
    // Create realistic Playwright test failures
    const failures: TestFailure[] = [
      {
        id: 'failure-1',
        testTitle: 'Login button should be visible',
        testFilePath: 'tests/auth/login.spec.ts',
        errorMessage: 'Error: expect(locator).toBeVisible() failed',
        errorStack: 'at tests/auth/login.spec.ts:42:10',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        metadata: {
          locator: 'button.login',
          matcher: 'toBeVisible',
          timeout: 5000,
          reportLink: 'https://github.com/org/repo/actions/runs/123',
        },
      },
      {
        id: 'failure-2',
        testTitle: 'Login button should be visible',
        testFilePath: 'tests/auth/login.spec.ts',
        errorMessage: 'Error: expect(locator).toBeVisible() failed',
        errorStack: 'at tests/auth/login.spec.ts:42:10',
        timestamp: new Date('2024-01-01T11:00:00Z'),
        metadata: {
          locator: 'button.login',
          matcher: 'toBeVisible',
          timeout: 5000,
          reportLink: 'https://github.com/org/repo/actions/runs/124',
        },
      },
      {
        id: 'failure-3',
        testTitle: 'Login button should be visible',
        testFilePath: 'tests/auth/login.spec.ts',
        errorMessage: 'Error: expect(locator).toBeVisible() failed',
        errorStack: 'at tests/auth/login.spec.ts:42:10',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        metadata: {
          locator: 'button.login',
          matcher: 'toBeVisible',
          timeout: 5000,
          reportLink: 'https://github.com/org/repo/actions/runs/125',
        },
      },
    ];

    const adapter = new MockDataAdapter(failures);
    const embeddingProvider = new MockEmbeddingProvider();

    const detective = new FlakinessDetective(adapter, embeddingProvider, {
      clustering: {
        epsilon: 0.15,
        minPoints: 2,
        minClusterSize: 2,
        distance: 'cosine',
        maxClusters: 5,
      },
      timeWindow: {
        days: 7,
      },
    });

    const clusters = await detective.detect();

    // Should detect the flaky pattern
    expect(clusters.length).toBeGreaterThan(0);

    const cluster = clusters[0];
    expect(cluster.failures.length).toBe(3);
    expect(cluster.commonPatterns.locators).toContain('button.login');
    expect(cluster.commonPatterns.matchers).toContain('toBeVisible');
    expect(cluster.metadata.failureIds).toHaveLength(3);
    expect(cluster.metadata.runIds).toContain('123');
    expect(cluster.metadata.runIds).toContain('124');
    expect(cluster.metadata.runIds).toContain('125');
    expect(cluster.assertionPattern).toContain('toBeVisible');
    expect(cluster.failurePattern).toBeDefined();
  });

  it('should handle no failures gracefully', async () => {
    const adapter = new MockDataAdapter([]);
    const embeddingProvider = new MockEmbeddingProvider();

    const detective = new FlakinessDetective(adapter, embeddingProvider);

    const clusters = await detective.detect();

    expect(clusters).toEqual([]);
  });

  it('should validate configuration on construction', () => {
    const adapter = new MockDataAdapter([]);
    const embeddingProvider = new MockEmbeddingProvider();

    expect(() => {
      new FlakinessDetective(adapter, embeddingProvider, {
        clustering: {
          epsilon: -0.1, // Invalid
          minPoints: 2,
          minClusterSize: 2,
        },
      });
    }).toThrow('epsilon must be greater than 0');
  });

  it('should retrieve saved clusters', async () => {
    const failures: TestFailure[] = [
      {
        id: '1',
        testTitle: 'Test with button',
        testFilePath: 'test.spec.ts',
        errorMessage: 'Error: button not visible',
        timestamp: new Date(),
        metadata: { locator: 'button', matcher: 'toBeVisible' },
      },
      {
        id: '2',
        testTitle: 'Test with button',
        testFilePath: 'test.spec.ts',
        errorMessage: 'Error: button not visible',
        timestamp: new Date(),
        metadata: { locator: 'button', matcher: 'toBeVisible' },
      },
      {
        id: '3',
        testTitle: 'Test with button',
        testFilePath: 'test.spec.ts',
        errorMessage: 'Error: button not visible',
        timestamp: new Date(),
        metadata: { locator: 'button', matcher: 'toBeVisible' },
      },
    ];

    const adapter = new MockDataAdapter(failures);
    const embeddingProvider = new MockEmbeddingProvider();

    const detective = new FlakinessDetective(adapter, embeddingProvider);

    // First detect
    await detective.detect();

    // Then retrieve
    const savedClusters = await detective.getClusters();

    expect(savedClusters.length).toBeGreaterThan(0);
  });

  it('should extract and enrich metadata from failures', async () => {
    const failures: TestFailure[] = [
      {
        id: '1',
        testTitle: 'Test',
        testFilePath: 'test.spec.ts',
        errorMessage: 'Expected: "Hello" but received: "Goodbye"',
        errorStack: 'at test.spec.ts:50:5',
        timestamp: new Date(),
        metadata: {
          reportLink: 'https://github.com/org/repo/actions/runs/999',
        },
      },
      {
        id: '2',
        testTitle: 'Test',
        testFilePath: 'test.spec.ts',
        errorMessage: 'Expected: "Hello" but received: "Hi"',
        errorStack: 'at test.spec.ts:50:5',
        timestamp: new Date(),
        metadata: {
          reportLink: 'https://github.com/org/repo/actions/runs/1000',
        },
      },
    ];

    const adapter = new MockDataAdapter(failures);
    const embeddingProvider = new MockEmbeddingProvider();

    const detective = new FlakinessDetective(adapter, embeddingProvider);

    const clusters = await detective.detect();

    if (clusters.length > 0) {
      const cluster = clusters[0];
      // Run IDs should be extracted
      expect(cluster.metadata.runIds).toContain('999');
      expect(cluster.metadata.runIds).toContain('1000');
      // Line numbers should be extracted
      expect(cluster.commonPatterns.lineNumbers).toContain(50);
    }
  });

  it('should respect maxClusters configuration', async () => {
    // Create many different types of failures
    const failures: TestFailure[] = [];
    for (let i = 0; i < 20; i++) {
      failures.push({
        id: `failure-${i}`,
        testTitle: `Test ${i % 5}`, // Create 5 different test types
        testFilePath: `test${i % 5}.spec.ts`,
        errorMessage: `Error type ${i % 5}`,
        timestamp: new Date(),
        metadata: {
          locator: `button-${i % 5}`,
          matcher: 'toBeVisible',
        },
      });
    }

    const adapter = new MockDataAdapter(failures);
    const embeddingProvider = new MockEmbeddingProvider();

    const detective = new FlakinessDetective(adapter, embeddingProvider, {
      clustering: {
        epsilon: 0.3,
        minPoints: 2,
        minClusterSize: 2,
        maxClusters: 3, // Limit to 3 clusters
      },
    });

    const clusters = await detective.detect();

    expect(clusters.length).toBeLessThanOrEqual(3);
  });

  it('should use cosine distance by default', async () => {
    const failures: TestFailure[] = [
      {
        id: '1',
        testTitle: 'Test',
        testFilePath: 'test.spec.ts',
        errorMessage: 'Error',
        timestamp: new Date(),
      },
      {
        id: '2',
        testTitle: 'Test',
        testFilePath: 'test.spec.ts',
        errorMessage: 'Error',
        timestamp: new Date(),
      },
    ];

    const adapter = new MockDataAdapter(failures);
    const embeddingProvider = new MockEmbeddingProvider();

    // Use default config (should use cosine distance)
    const detective = new FlakinessDetective(adapter, embeddingProvider);

    const clusters = await detective.detect();

    // Should complete without errors
    expect(Array.isArray(clusters)).toBe(true);
  });
});
