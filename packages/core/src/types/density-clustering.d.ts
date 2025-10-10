declare module 'density-clustering' {
  /**
   * DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
   * Finds clusters of points in a multi-dimensional space
   */
  export class DBSCAN {
    /**
     * Constructor for DBSCAN clustering algorithm
     */
    constructor();

    /**
     * Runs the DBSCAN clustering algorithm
     * @param dataset Array of points, where each point is an array of coordinates
     * @param epsilon Maximum distance between two points to be considered neighbors
     * @param minPoints Minimum number of points to form a dense region
     * @param distanceFunction Optional custom distance function
     * @returns Array of clusters, where each cluster is an array of indices into the original dataset
     */
    run(
      dataset: number[][],
      epsilon: number,
      minPoints: number,
      distanceFunction?: (a: number[], b: number[]) => number
    ): number[][];

    /**
     * Calculates the Euclidean distance between two points
     * @param a First point
     * @param b Second point
     * @returns Euclidean distance
     */
    euclideanDistance(a: number[], b: number[]): number;

    /**
     * Calculates the Manhattan distance between two points
     * @param a First point
     * @param b Second point
     * @returns Manhattan distance
     */
    manhattanDistance(a: number[], b: number[]): number;

    /**
     * Finds all points within a given distance of a point
     * @param pointIndex Index of the point in the dataset
     * @param epsilon Maximum distance
     * @param dataset Array of points
     * @param distanceFunction Custom distance function
     * @returns Array of indices of points within the distance
     */
    regionQuery(
      pointIndex: number,
      epsilon: number,
      dataset: number[][],
      distanceFunction: (a: number[], b: number[]) => number
    ): number[];

    /**
     * Expands a cluster by adding all density-connected points
     * @param dataset Array of points
     * @param point Index of the point to expand from
     * @param neighbors Indices of neighbors of the point
     * @param cluster Current cluster
     * @param epsilon Maximum distance
     * @param minPoints Minimum number of points to form a dense region
     * @param visited Set of visited point indices
     * @param distanceFunction Custom distance function
     */
    expandCluster(
      dataset: number[][],
      point: number,
      neighbors: number[],
      cluster: number[],
      epsilon: number,
      minPoints: number,
      visited: Set<number>,
      distanceFunction: (a: number[], b: number[]) => number
    ): void;
  }

  /**
   * OPTICS (Ordering Points To Identify the Clustering Structure)
   * Finds clusters of varying density
   */
  export class OPTICS {
    constructor();

    run(
      dataset: number[][],
      epsilon: number,
      minPoints: number,
      distanceFunction?: (a: number[], b: number[]) => number
    ): {
      clusters: number[][];
      reachabilityDistance: number[];
      processingOrder: number[];
    };
  }

  /**
   * K-Means clustering algorithm
   */
  export class KMEANS {
    constructor();

    run(
      dataset: number[][],
      k: number,
      distanceFunction?: (a: number[], b: number[]) => number,
      maxIterations?: number
    ): {
      clusters: number[][];
      centroids: number[][];
    };
  }
}
