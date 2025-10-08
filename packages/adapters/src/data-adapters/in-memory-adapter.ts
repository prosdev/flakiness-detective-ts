import { FailureCluster, TestFailure } from '@flakiness-detective/core';
import { Logger } from '@flakiness-detective/utils';
import { BaseDataAdapter } from './base-adapter';

/**
 * In-memory implementation of the DataAdapter interface
 * Useful for testing and development
 */
export class InMemoryAdapter extends BaseDataAdapter {
  private failures: TestFailure[] = [];
  private clusters: FailureCluster[] = [];
  private logger: Logger;

  /**
   * Creates a new InMemoryAdapter
   * @param logger Logger instance
   */
  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  /**
   * Sets the initial test failures
   * @param failures Initial test failures
   */
  setFailures(failures: TestFailure[]): void {
    this.failures = [...failures];
    this.logger.log(`Set ${failures.length} failures in memory adapter`);
  }

  /**
   * Adds a new test failure
   * @param failure Test failure to add
   */
  addFailure(failure: TestFailure): void {
    this.failures.push(failure);
    this.logger.log(`Added new failure to memory adapter: ${failure.id}`);
  }

  /**
   * Fetches failures from the specified time window
   * @param days Number of days to look back
   */
  async fetchFailures(days: number): Promise<TestFailure[]> {
    const cutoffDate = this.createTimeFilter(days);
    const filteredFailures = this.failures.filter((failure) => failure.timestamp >= cutoffDate);

    this.logger.log(`Fetched ${filteredFailures.length} failures from the last ${days} days`);
    return filteredFailures;
  }

  /**
   * Saves clusters to storage
   * @param clusters Failure clusters to save
   */
  async saveClusters(clusters: FailureCluster[]): Promise<void> {
    this.clusters = [...clusters];
    this.logger.log(`Saved ${clusters.length} clusters to memory adapter`);
  }

  /**
   * Fetches clusters from storage
   * @param limit Maximum number of clusters to fetch
   */
  async fetchClusters(limit?: number): Promise<FailureCluster[]> {
    const result = limit ? this.clusters.slice(0, limit) : this.clusters;
    this.logger.log(`Fetched ${result.length} clusters from memory adapter`);
    return result;
  }

  /**
   * Clears all data
   */
  clear(): void {
    this.failures = [];
    this.clusters = [];
    this.logger.log('Cleared all data from memory adapter');
  }
}
