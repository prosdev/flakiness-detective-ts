export * from './types';
import { TestFailure } from './types';
export { FlakinessDetective } from './flakiness-detective';
export { clusterFailures } from './clustering/dbscan';
export { extractPatterns, createRichEmbeddingContext } from './utils/pattern-extraction';
export interface CoreConfig {
  apiKey: string;
  debug: boolean;
}
export declare class CoreService {
  private config;
  constructor(config: CoreConfig);
  initialize(): void;
  getApiKey(): string;
  clusterFailures(failures: TestFailure[]): Promise<TestFailure[]>;
  detectPatterns(_cluster: TestFailure[]): Promise<string>;
}
export declare function createCoreService(config: CoreConfig): CoreService;
//# sourceMappingURL=index.d.ts.map
