export interface CoreConfig {
  apiKey: string;
  debug: boolean;
  timeWindow: number;
  clusteringParams: {
    epsilon: number;
    minPoints: number;
  };
}

export interface TestFailure {
  id: string;
  name: string;
  message: string;
  stack?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface EmbeddedFailure extends TestFailure {
  embedding: number[];
}

export interface FailureCluster {
  id: string;
  failures: EmbeddedFailure[];
  centroid: number[];
  radius: number;
  pattern?: string;
}

export class CoreService {
  private config: CoreConfig;

  constructor(config: CoreConfig) {
    this.config = config;
  }

  initialize(): void {
    if (this.config.debug) {
      console.log('CoreService initialized with config:', this.config);
    }
  }

  getApiKey(): string {
    return this.config.apiKey;
  }

  async clusterFailures(failures: EmbeddedFailure[]): Promise<FailureCluster[]> {
    // Placeholder for DBSCAN clustering algorithm
    // This would implement the actual clustering logic
    return [
      {
        id: '1',
        failures: failures,
        centroid: [0, 0, 0],
        radius: 0.5,
        pattern: 'Example pattern',
      },
    ];
  }

  async detectPatterns(_cluster: FailureCluster): Promise<string> {
    // Placeholder for pattern detection
    return 'Example pattern detected';
  }
}

export function createCoreService(config: CoreConfig): CoreService {
  return new CoreService(config);
}
