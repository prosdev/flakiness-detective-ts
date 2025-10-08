import { ClusteringOptions, EmbeddedFailure, FailureCluster } from '../types';
/**
 * Clusters test failures using DBSCAN algorithm
 */
export declare function clusterFailures(
  embeddedFailures: EmbeddedFailure[],
  options: ClusteringOptions
): FailureCluster[];
//# sourceMappingURL=dbscan.d.ts.map
