// Independent logger without circular dependencies

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LoggerConfig {
  level: LogLevel;
  timestamps?: boolean; // Add timestamps to log messages (default: false)
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export class Logger {
  private level: LogLevel;
  private levelValue: number;
  private timestamps: boolean;

  constructor(config: LoggerConfig) {
    this.level = config.level;
    this.levelValue = LOG_LEVELS[config.level];
    this.timestamps = config.timestamps ?? false;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = this.timestamps ? `[${new Date().toISOString()}] ` : '';
    return `${timestamp}[${level}] ${message}`;
  }

  debug(message: string): void {
    if (this.levelValue <= LOG_LEVELS.debug) {
      console.log(this.formatMessage('DEBUG', message));
    }
  }

  log(message: string): void {
    this.info(message);
  }

  info(message: string): void {
    if (this.levelValue <= LOG_LEVELS.info) {
      console.log(this.formatMessage('INFO', message));
    }
  }

  warn(message: string): void {
    if (this.levelValue <= LOG_LEVELS.warn) {
      console.warn(this.formatMessage('WARN', message));
    }
  }

  error(message: string): void {
    if (this.levelValue <= LOG_LEVELS.error) {
      console.error(this.formatMessage('ERROR', message));
    }
  }
}

export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}
