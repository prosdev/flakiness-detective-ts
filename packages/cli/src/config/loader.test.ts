import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverAndLoadConfig, discoverConfigFile, loadConfigFile } from './loader.js';
import { ConfigValidationError } from './types.js';

// Use temp directory to avoid conflicts with project's package.json
const TEST_DIR = path.join(os.tmpdir(), `flakiness-test-${Date.now()}`);

describe('Config Loader', () => {
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('discoverConfigFile', () => {
    it('should discover .flakinessrc.json file', () => {
      const configPath = path.join(TEST_DIR, '.flakinessrc.json');
      fs.writeFileSync(configPath, JSON.stringify({ timeWindow: { days: 7 } }));

      const result = discoverConfigFile(TEST_DIR);
      expect(result).not.toBeNull();
      expect(result?.filePath).toBe(configPath);
      expect(result?.type).toBe('json');
      expect(result?.exists).toBe(true);
    });

    it('should discover package.json with flakinessDetective field', () => {
      const configPath = path.join(TEST_DIR, 'package.json');
      fs.writeFileSync(
        configPath,
        JSON.stringify({
          name: 'test',
          flakinessDetective: { timeWindow: { days: 7 } },
        })
      );

      const result = discoverConfigFile(TEST_DIR);
      expect(result).not.toBeNull();
      expect(result?.filePath).toBe(configPath);
      expect(result?.type).toBe('package.json');
    });

    it('should prioritize .flakinessrc.json over package.json', () => {
      fs.writeFileSync(
        path.join(TEST_DIR, '.flakinessrc.json'),
        JSON.stringify({ timeWindow: { days: 7 } })
      );
      fs.writeFileSync(
        path.join(TEST_DIR, 'package.json'),
        JSON.stringify({ flakinessDetective: { timeWindow: { days: 14 } } })
      );

      const result = discoverConfigFile(TEST_DIR);
      expect(result?.filePath).toContain('.flakinessrc.json');
    });

    it('should return null if no config file found', () => {
      const result = discoverConfigFile(TEST_DIR);
      expect(result).toBeNull();
    });

    it('should search parent directories', () => {
      const subDir = path.join(TEST_DIR, 'sub', 'nested');
      fs.mkdirSync(subDir, { recursive: true });

      const configPath = path.join(TEST_DIR, '.flakinessrc.json');
      fs.writeFileSync(configPath, JSON.stringify({ timeWindow: { days: 7 } }));

      const result = discoverConfigFile(subDir);
      expect(result).not.toBeNull();
      expect(result?.filePath).toBe(configPath);
    });
  });

  describe('loadConfigFile', () => {
    it('should load valid JSON config', async () => {
      const configPath = path.join(TEST_DIR, '.flakinessrc.json');
      const configData = {
        timeWindow: { days: 7 },
        clustering: { epsilon: 0.15 },
      };
      fs.writeFileSync(configPath, JSON.stringify(configData));

      const config = await loadConfigFile({
        filePath: configPath,
        type: 'json',
        exists: true,
      });

      expect(config).toEqual(configData);
    });

    it('should load config from package.json', async () => {
      const configPath = path.join(TEST_DIR, 'package.json');
      const configData = {
        name: 'test',
        flakinessDetective: {
          timeWindow: { days: 7 },
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(configData));

      const config = await loadConfigFile({
        filePath: configPath,
        type: 'package.json',
        exists: true,
      });

      expect(config).toEqual(configData.flakinessDetective);
    });

    it('should throw error for invalid JSON', async () => {
      const configPath = path.join(TEST_DIR, '.flakinessrc.json');
      fs.writeFileSync(configPath, 'invalid json{');

      await expect(
        loadConfigFile({
          filePath: configPath,
          type: 'json',
          exists: true,
        })
      ).rejects.toThrow(ConfigValidationError);
    });

    it('should throw error if package.json missing flakinessDetective field', async () => {
      const configPath = path.join(TEST_DIR, 'package.json');
      fs.writeFileSync(configPath, JSON.stringify({ name: 'test' }));

      await expect(
        loadConfigFile({
          filePath: configPath,
          type: 'package.json',
          exists: true,
        })
      ).rejects.toThrow(ConfigValidationError);
    });

    it('should throw error if file does not exist', async () => {
      await expect(
        loadConfigFile({
          filePath: path.join(TEST_DIR, 'nonexistent.json'),
          type: 'json',
          exists: false,
        })
      ).rejects.toThrow(ConfigValidationError);
    });
  });

  describe('discoverAndLoadConfig', () => {
    it('should discover and load config in one call', async () => {
      const configPath = path.join(TEST_DIR, '.flakinessrc.json');
      const configData = {
        timeWindow: { days: 7 },
        clustering: { epsilon: 0.15 },
      };
      fs.writeFileSync(configPath, JSON.stringify(configData));

      const config = await discoverAndLoadConfig(TEST_DIR);
      expect(config).toEqual(configData);
    });

    it('should return null if no config found', async () => {
      const config = await discoverAndLoadConfig(TEST_DIR);
      expect(config).toBeNull();
    });
  });
});
