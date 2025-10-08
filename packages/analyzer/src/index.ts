import { CoreService, CoreConfig } from '@flakiness-detective/core';
import { Logger, createLogger } from '@flakiness-detective/utils';

export interface AnalyzerConfig extends CoreConfig {
  analyzerName: string;
}

export class AnalyzerService {
  private coreService: CoreService;
  private logger: Logger;
  private name: string;

  constructor(config: AnalyzerConfig) {
    this.coreService = new CoreService(config);
    this.logger = createLogger(this.coreService, { level: 'info' });
    this.name = config.analyzerName;
  }

  start(): void {
    this.coreService.initialize();
    this.logger.log(`Analyzer ${this.name} started`);
    this.logger.log(this.logger.getServiceInfo());
  }
}

export function createAnalyzer(config: AnalyzerConfig): AnalyzerService {
  return new AnalyzerService(config);
}