import { CoreService } from '@flakiness-detective/core';
import { createLogger } from '@flakiness-detective/utils';
import type { Logger } from '@flakiness-detective/utils';

export interface CliConfig {
  command: 'analyze' | 'report' | 'help';
  dataAdapter: {
    type: 'filesystem' | 'memory' | 'firestore';
    path?: string;
  };
  embeddingProvider: {
    type: 'google' | 'custom';
    apiKey: string;
  };
  outputFormat: 'html' | 'json' | 'console';
  timeWindow: number;
}

export class FlakinessDetectiveCli {
  private config: CliConfig;
  private coreService: CoreService;
  private logger: Logger;

  constructor(config: CliConfig, coreService: CoreService) {
    this.config = config;
    this.coreService = coreService;
    this.logger = createLogger(coreService, { level: 'info' });
  }

  async run(): Promise<void> {
    this.logger.log(`Running CLI command: ${this.config.command}`);

    // Placeholder for actual CLI logic
    switch (this.config.command) {
      case 'analyze':
        this.logger.log('Analyzing test failures');
        break;
      case 'report':
        this.logger.log('Generating report');
        break;
      default: // includes 'help'
        this.logger.log('Showing help information');
        break;
    }
  }
}

export function createCli(config: CliConfig, coreService: CoreService): FlakinessDetectiveCli {
  return new FlakinessDetectiveCli(config, coreService);
}
