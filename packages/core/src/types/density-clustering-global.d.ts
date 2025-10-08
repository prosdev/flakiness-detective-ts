// Type definitions for density-clustering
declare module 'density-clustering' {
  export default class DBSCAN {
    constructor();
    run(
      dataset: number[][],
      epsilon: number,
      minPoints: number,
      distanceFunction?: (a: number[], b: number[]) => number
    ): number[][];
    euclideanDistance(a: number[], b: number[]): number;
    manhattanDistance(a: number[], b: number[]): number;
  }

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
