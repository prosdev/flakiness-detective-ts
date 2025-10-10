/**
 * Configuration file loader
 * Discovers and loads config files from multiple formats
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ConfigFileDiscoveryResult, FlakinessDetectiveConfigFile } from './types.js';
import { CONFIG_FILE_NAMES, ConfigValidationError } from './types.js';

/**
 * Discovers config file in current directory or parent directories
 */
export function discoverConfigFile(
  startDir: string = process.cwd()
): ConfigFileDiscoveryResult | null {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  // Search from current directory up to root
  while (currentDir !== root) {
    for (const fileName of CONFIG_FILE_NAMES) {
      const filePath = path.join(currentDir, fileName);

      if (fs.existsSync(filePath)) {
        // Determine type
        let type: ConfigFileDiscoveryResult['type'];
        if (fileName === 'package.json') {
          type = 'package.json';
        } else if (fileName.endsWith('.json')) {
          type = 'json';
        } else if (fileName.endsWith('.ts')) {
          type = 'ts';
        } else {
          type = 'js';
        }

        return {
          filePath,
          type,
          exists: true,
        };
      }
    }

    // Move up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Reached root
    currentDir = parentDir;
  }

  return null;
}

/**
 * Loads config from JSON file
 */
function loadJsonConfig(filePath: string): FlakinessDetectiveConfigFile {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);

    // Handle package.json
    if (path.basename(filePath) === 'package.json') {
      if (!parsed.flakinessDetective) {
        throw new ConfigValidationError(
          'No "flakinessDetective" field found in package.json',
          filePath
        );
      }
      return parsed.flakinessDetective;
    }

    return parsed;
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      throw error;
    }
    throw new ConfigValidationError(
      `Failed to parse JSON config file: ${String(error)}`,
      filePath,
      error instanceof Error ? error.message : undefined
    );
  }
}

/**
 * Loads config from JavaScript/TypeScript file
 */
async function loadJsConfig(filePath: string): Promise<FlakinessDetectiveConfigFile> {
  try {
    // Convert to file URL for dynamic import
    const fileUrl = pathToFileURL(filePath).href;

    // Dynamic import (works for both .js and .ts with tsx/ts-node)
    const module = await import(fileUrl);

    // Support both default and named exports
    const config = module.default || module.config || module;

    if (typeof config === 'function') {
      // Support config factory functions
      return config();
    }

    return config;
  } catch (error) {
    throw new ConfigValidationError(
      `Failed to load JS/TS config file: ${String(error)}`,
      filePath,
      error instanceof Error ? error.message : undefined
    );
  }
}

/**
 * Loads config from discovered file
 */
export async function loadConfigFile(
  result: ConfigFileDiscoveryResult
): Promise<FlakinessDetectiveConfigFile> {
  if (!result.exists) {
    throw new ConfigValidationError('Config file does not exist', result.filePath);
  }

  switch (result.type) {
    case 'json':
    case 'package.json':
      return loadJsonConfig(result.filePath);

    case 'js':
    case 'ts':
      return loadJsConfig(result.filePath);

    default:
      throw new ConfigValidationError(
        `Unsupported config file type: ${result.type}`,
        result.filePath
      );
  }
}

/**
 * Discovers and loads config file
 */
export async function discoverAndLoadConfig(
  startDir?: string
): Promise<FlakinessDetectiveConfigFile | null> {
  const result = discoverConfigFile(startDir);

  if (!result) {
    return null;
  }

  return loadConfigFile(result);
}
