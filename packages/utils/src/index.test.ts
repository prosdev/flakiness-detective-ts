import { describe, expect, it, vi } from 'vitest';
import { Logger, createLogger } from './index';

describe('Logger', () => {
  describe('log levels', () => {
    it('should log debug messages when level is debug', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = createLogger({ level: 'debug' });
      logger.debug('test debug message');

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] test debug message');
      consoleSpy.mockRestore();
    });

    it('should not log debug messages when level is info', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = createLogger({ level: 'info' });
      logger.debug('test debug message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log info messages when level is info', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = createLogger({ level: 'info' });
      logger.info('test info message');

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] test info message');
      consoleSpy.mockRestore();
    });

    it('should log warn messages', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const logger = createLogger({ level: 'warn' });
      logger.warn('test warn message');

      expect(warnSpy).toHaveBeenCalledWith('[WARN] test warn message');
      warnSpy.mockRestore();
    });

    it('should log error messages', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger({ level: 'error' });
      logger.error('test error message');

      expect(errorSpy).toHaveBeenCalledWith('[ERROR] test error message');
      errorSpy.mockRestore();
    });

    it('should not log anything when level is silent', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger({ level: 'silent' });
      logger.debug('test');
      logger.info('test');
      logger.warn('test');
      logger.error('test');

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('timestamps', () => {
    it('should include timestamps when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = createLogger({ level: 'info', timestamps: true });
      logger.info('test message');

      const call = consoleSpy.mock.calls[0][0];
      // Check that output includes ISO timestamp format
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] test message/);

      consoleSpy.mockRestore();
    });

    it('should not include timestamps when disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = createLogger({ level: 'info', timestamps: false });
      logger.info('test message');

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] test message');
      consoleSpy.mockRestore();
    });

    it('should default to no timestamps', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = createLogger({ level: 'info' });
      logger.info('test message');

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] test message');
      consoleSpy.mockRestore();
    });
  });

  describe('log() method', () => {
    it('should be an alias for info()', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = createLogger({ level: 'info' });
      logger.log('test message');

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] test message');
      consoleSpy.mockRestore();
    });
  });

  describe('Logger class', () => {
    it('should create logger via class constructor', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const logger = new Logger({ level: 'debug', timestamps: false });
      logger.debug('test');

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] test');
      consoleSpy.mockRestore();
    });
  });
});
