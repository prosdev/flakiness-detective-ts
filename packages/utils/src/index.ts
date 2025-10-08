// Independent logger without circular dependencies

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
}

export class Logger {
  private level: string;

  constructor(config: LoggerConfig) {
    this.level = config.level;
  }

  log(message: string): void {
    console.log(`[${this.level.toUpperCase()}] ${message}`);
  }
}

export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}
