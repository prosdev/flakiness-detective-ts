import { CoreService } from '@flakiness-detective/core';
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
}
export declare class Logger {
  private level;
  private coreService;
  constructor(coreService: CoreService, config: LoggerConfig);
  log(message: string): void;
  getServiceInfo(): string;
}
export declare function createLogger(coreService: CoreService, config: LoggerConfig): Logger;
//# sourceMappingURL=index.d.ts.map
