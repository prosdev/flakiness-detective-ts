// Export all types and interfaces
export * from './types';
import { TestFailure } from './types';

// Export FlakinessDetective class
export { FlakinessDetective } from './flakiness-detective';

// Export clustering functionality
export { clusterFailures } from './clustering/dbscan';

// Export utility functions
export { extractPatterns, createRichEmbeddingContext } from './utils/pattern-extraction';

// Legacy types (for backward compatibility)
export interface CoreConfig {
  apiKey: string;
  debug: boolean;
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

  async clusterFailures(failures: TestFailure[]): Promise<TestFailure[]> {
    // Placeholder for DBSCAN clustering algorithm
    // This would implement the actual clustering logic
    return failures;
  }

  async detectPatterns(_cluster: TestFailure[]): Promise<string> {
    // Placeholder for pattern detection
    return 'Example pattern detected';
  }
}

export function createCoreService(config: CoreConfig): CoreService {
  return new CoreService(config);
}
