import { describe, expect, it } from 'vitest';
import type { CliConfig } from '../index.js';
import { mergeConfigWithCliArgs } from './merger.js';
import type { FlakinessDetectiveConfigFile } from './types.js';

describe('Config Merger', () => {
  it('should return CLI args if no file config', () => {
    const cliArgs: Partial<CliConfig> = {
      command: 'detect',
      timeWindow: 7,
      verbose: true,
    };

    const result = mergeConfigWithCliArgs(null, cliArgs);
    expect(result).toEqual(cliArgs);
  });

  it('should use file config if no CLI args', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      timeWindow: { days: 14 },
      clustering: { epsilon: 0.2 },
      verbose: true,
    };

    const result = mergeConfigWithCliArgs(fileConfig, {});
    expect(result.timeWindow).toBe(14);
    expect(result.epsilon).toBe(0.2);
    expect(result.verbose).toBe(true);
  });

  it('should override file config with CLI args', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      timeWindow: { days: 14 },
      clustering: { epsilon: 0.2 },
      verbose: false,
    };

    const cliArgs: Partial<CliConfig> = {
      timeWindow: 7,
      epsilon: 0.15,
      verbose: true,
    };

    const result = mergeConfigWithCliArgs(fileConfig, cliArgs);
    expect(result.timeWindow).toBe(7);
    expect(result.epsilon).toBe(0.15);
    expect(result.verbose).toBe(true);
  });

  it('should merge adapter configs', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      adapter: {
        type: 'filesystem',
        basePath: './data',
      },
    };

    const cliArgs: Partial<CliConfig> = {
      adapter: {
        type: 'filesystem',
        basePath: './custom-data',
      },
    };

    const result = mergeConfigWithCliArgs(fileConfig, cliArgs);
    expect(result.adapter?.type).toBe('filesystem');
    expect(result.adapter?.basePath).toBe('./custom-data');
  });

  it('should merge embedding configs', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      embedding: {
        type: 'google',
        apiKey: 'file-key',
      },
    };

    const cliArgs: Partial<CliConfig> = {
      embedding: {
        type: 'google',
        apiKey: 'cli-key',
      },
    };

    const result = mergeConfigWithCliArgs(fileConfig, cliArgs);
    expect(result.embedding?.apiKey).toBe('cli-key');
  });

  it('should handle all clustering options', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      clustering: {
        epsilon: 0.15,
        minPoints: 2,
        minClusterSize: 2,
        distance: 'cosine',
        maxClusters: 5,
      },
    };

    const cliArgs: Partial<CliConfig> = {
      epsilon: 0.2,
      maxClusters: 10,
    };

    const result = mergeConfigWithCliArgs(fileConfig, cliArgs);
    expect(result.epsilon).toBe(0.2);
    expect(result.minPoints).toBe(2);
    expect(result.minClusterSize).toBe(2);
    expect(result.distance).toBe('cosine');
    expect(result.maxClusters).toBe(10);
  });

  it('should handle output options', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      output: {
        format: 'json',
        path: './file-output.json',
      },
    };

    const cliArgs: Partial<CliConfig> = {
      outputFormat: 'console',
    };

    const result = mergeConfigWithCliArgs(fileConfig, cliArgs);
    expect(result.outputFormat).toBe('console');
    expect(result.outputPath).toBe('./file-output.json');
  });

  it('should always use CLI command', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      timeWindow: { days: 7 },
    };

    const cliArgs: Partial<CliConfig> = {
      command: 'detect',
    };

    const result = mergeConfigWithCliArgs(fileConfig, cliArgs);
    expect(result.command).toBe('detect');
  });

  it('should handle complex merge scenario', () => {
    const fileConfig: FlakinessDetectiveConfigFile = {
      timeWindow: { days: 14 },
      adapter: {
        type: 'filesystem',
        basePath: './data',
      },
      embedding: {
        type: 'google',
        apiKey: 'file-key',
      },
      clustering: {
        epsilon: 0.15,
        distance: 'cosine',
      },
      output: {
        format: 'json',
      },
      verbose: false,
    };

    const cliArgs: Partial<CliConfig> = {
      command: 'detect',
      timeWindow: 7,
      epsilon: 0.2,
      outputPath: './cli-output.json',
      verbose: true,
    };

    const result = mergeConfigWithCliArgs(fileConfig, cliArgs);
    expect(result.command).toBe('detect');
    expect(result.timeWindow).toBe(7);
    expect(result.adapter?.type).toBe('filesystem');
    expect(result.adapter?.basePath).toBe('./data');
    expect(result.embedding?.apiKey).toBe('file-key');
    expect(result.epsilon).toBe(0.2);
    expect(result.distance).toBe('cosine');
    expect(result.outputFormat).toBe('json');
    expect(result.outputPath).toBe('./cli-output.json');
    expect(result.verbose).toBe(true);
  });
});
