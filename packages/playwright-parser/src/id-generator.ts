/**
 * Utilities for generating test case IDs
 *
 * Provides deterministic hash-based ID generation for tests without explicit annotations.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { TestCase } from '@playwright/test/reporter';

/**
 * Create a deterministic hash of test file path + title
 *
 * This creates a stable identifier that will be the same across runs
 * for the same test, even if the test moves in the file or is renamed
 * at the code level (though title changes will create a new ID).
 *
 * @param test - Playwright test case
 * @returns Deterministic hash string
 *
 * @example
 * ```typescript
 * const hash = hashTestPath(test);
 * // Result: 'a3f7b9c4e2d1f5a8'
 * ```
 */
export function hashTestPath(test: TestCase): string {
  // Combine file path and title for unique identifier
  const identifier = `${test.location.file}::${test.title}`;

  // Create SHA-256 hash and take first 12 characters
  return createHash('sha256').update(identifier).digest('hex').slice(0, 12);
}

/**
 * Generate a test case ID based on the specified strategy
 *
 * Supports three strategies:
 * - 'hash': Deterministic hash (recommended, stable across runs)
 * - 'uuid': Random UUID (not stable, use for one-off tracking)
 * - 'none': Returns empty string (caller must handle)
 *
 * @param test - Playwright test case
 * @param strategy - ID generation strategy
 * @returns Generated test case ID with 'auto-' prefix
 *
 * @example
 * ```typescript
 * const id = generateTestCaseId(test, 'hash');
 * // Result: 'auto-a3f7b9c4e2d1'
 * ```
 */
export function generateTestCaseId(
  test: TestCase,
  strategy: 'hash' | 'uuid' | 'none' = 'hash'
): string {
  switch (strategy) {
    case 'hash': {
      const hash = hashTestPath(test);
      return `auto-${hash}`;
    }

    case 'uuid': {
      const uuid = randomUUID();
      // Take first 12 characters for consistency with hash strategy
      return `auto-${uuid.slice(0, 12)}`;
    }

    case 'none':
      return '';

    default:
      throw new Error(`Unknown ID generation strategy: ${strategy}`);
  }
}
