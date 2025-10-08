import { DataAdapter, FailureCluster, TestFailure } from '@flakiness-detective/core';

/**
 * Base implementation of the DataAdapter interface
 */
export abstract class BaseDataAdapter implements DataAdapter {
  /**
   * Fetches failures from the specified time window
   * @param days Number of days to look back
   */
  abstract fetchFailures(days: number): Promise<TestFailure[]>;

  /**
   * Saves clusters to storage
   * @param clusters Failure clusters to save
   */
  abstract saveClusters(clusters: FailureCluster[]): Promise<void>;

  /**
   * Fetches clusters from storage
   * @param limit Maximum number of clusters to fetch
   */
  abstract fetchClusters(limit?: number): Promise<FailureCluster[]>;

  /**
   * Creates a time filter for filtering failures by date
   * @param days Number of days to look back
   */
  protected createTimeFilter(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
}
