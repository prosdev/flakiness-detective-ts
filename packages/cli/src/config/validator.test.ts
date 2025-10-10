import { describe, expect, it } from 'vitest';
import { ConfigValidationError } from './types.js';
import type { FlakinessDetectiveConfigFile } from './types.js';
import { validateAndGetConfig, validateConfig } from './validator.js';

describe('Config Validator', () => {
  const validConfig: FlakinessDetectiveConfigFile = {
    timeWindow: { days: 7 },
    adapter: {
      type: 'filesystem',
      basePath: './data',
    },
    embedding: {
      type: 'google',
      apiKey: 'test-key',
    },
    clustering: {
      epsilon: 0.15,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
      maxClusters: 5,
    },
    output: {
      format: 'json',
      path: './output.json',
    },
    verbose: true,
  };

  describe('validateConfig', () => {
    it('should validate a valid config without errors', () => {
      expect(() => validateConfig(validConfig, 'test.json')).not.toThrow();
    });

    it('should allow empty config', () => {
      expect(() => validateConfig({}, 'test.json')).not.toThrow();
    });

    describe('timeWindow validation', () => {
      it('should reject invalid timeWindow type', () => {
        const config = { timeWindow: 'invalid' as any };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should reject negative days', () => {
        const config = { timeWindow: { days: -1 } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should reject zero days', () => {
        const config = { timeWindow: { days: 0 } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });
    });

    describe('adapter validation', () => {
      it('should reject missing adapter type', () => {
        const config = { adapter: { basePath: './data' } as any };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should reject invalid adapter type', () => {
        const config = { adapter: { type: 'invalid' } as any };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should accept valid adapter types', () => {
        const types = ['filesystem', 'memory', 'firestore', 'playwright'];
        for (const type of types) {
          const config = { adapter: { type } as any };
          expect(() => validateConfig(config, 'test.json')).not.toThrow();
        }
      });
    });

    describe('embedding validation', () => {
      it('should reject missing embedding type', () => {
        const config = { embedding: { apiKey: 'test' } as any };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should reject invalid embedding type', () => {
        const config = { embedding: { type: 'invalid' } as any };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should accept valid embedding types', () => {
        const types = ['google', 'mock'];
        for (const type of types) {
          const config = { embedding: { type } as any };
          expect(() => validateConfig(config, 'test.json')).not.toThrow();
        }
      });
    });

    describe('clustering validation', () => {
      it('should reject negative epsilon', () => {
        const config = { clustering: { epsilon: -0.1 } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should reject non-integer minPoints', () => {
        const config = { clustering: { minPoints: 2.5 } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should reject negative minClusterSize', () => {
        const config = { clustering: { minClusterSize: -1 } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should reject invalid distance metric', () => {
        const config = { clustering: { distance: 'invalid' as any } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should accept valid distance metrics', () => {
        const metrics = ['euclidean', 'cosine'];
        for (const distance of metrics) {
          const config = { clustering: { distance } as any };
          expect(() => validateConfig(config, 'test.json')).not.toThrow();
        }
      });

      it('should reject non-integer maxClusters', () => {
        const config = { clustering: { maxClusters: 5.5 } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });
    });

    describe('output validation', () => {
      it('should reject invalid output format', () => {
        const config = { output: { format: 'invalid' as any } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should accept valid output formats', () => {
        const formats = ['json', 'console'];
        for (const format of formats) {
          const config = { output: { format } as any };
          expect(() => validateConfig(config, 'test.json')).not.toThrow();
        }
      });

      it('should reject non-string output path', () => {
        const config = { output: { path: 123 as any } };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });
    });

    describe('verbose validation', () => {
      it('should reject non-boolean verbose', () => {
        const config = { verbose: 'true' as any };
        expect(() => validateConfig(config, 'test.json')).toThrow(ConfigValidationError);
      });

      it('should accept boolean verbose values', () => {
        expect(() => validateConfig({ verbose: true }, 'test.json')).not.toThrow();
        expect(() => validateConfig({ verbose: false }, 'test.json')).not.toThrow();
      });
    });
  });

  describe('validateAndGetConfig', () => {
    it('should return config if valid', () => {
      const result = validateAndGetConfig(validConfig, 'test.json');
      expect(result).toEqual(validConfig);
    });

    it('should throw if invalid', () => {
      const invalidConfig = { timeWindow: { days: -1 } };
      expect(() => validateAndGetConfig(invalidConfig, 'test.json')).toThrow(ConfigValidationError);
    });
  });
});
