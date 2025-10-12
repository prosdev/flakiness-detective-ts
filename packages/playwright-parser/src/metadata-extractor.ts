/**
 * Utilities for extracting metadata from Playwright test annotations
 *
 * Supports extraction of standard annotations (testCaseId, journeyId, testSuiteName)
 * as well as custom user-defined annotations.
 */

import type { TestCase } from '@playwright/test/reporter';
import { generateTestCaseId } from './id-generator';
import type { ParserOptions, TestMetadata } from './types';

/**
 * Extract a specific annotation value from a test
 *
 * @param test - Playwright test case
 * @param type - Annotation type to extract
 * @returns Annotation value or undefined if not found
 *
 * @example
 * ```typescript
 * const testCaseId = extractAnnotation(test, 'testCaseId');
 * // Result: 'TC-AUTH-001' or undefined
 * ```
 */
export function extractAnnotation(test: TestCase, type: string): string | undefined {
  const annotation = test.annotations.find((a) => a.type === type);
  return annotation?.description;
}

/**
 * Extract custom annotations beyond the standard ones
 *
 * @param test - Playwright test case
 * @param customTypes - Array of custom annotation types to extract
 * @returns Object mapping annotation types to their values
 *
 * @example
 * ```typescript
 * const custom = extractCustomAnnotations(test, ['priority', 'owner']);
 * // Result: { priority: 'high', owner: 'team-auth' }
 * ```
 */
export function extractCustomAnnotations(
  test: TestCase,
  customTypes: string[] = []
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const type of customTypes) {
    const value = extractAnnotation(test, type);
    if (value) {
      result[type] = value;
    }
  }

  return result;
}

/**
 * Extract complete test metadata including standard and custom annotations
 *
 * Implements the hybrid approach:
 * - If testCaseId annotation exists, use it
 * - If not, auto-generate based on strategy (with optional warning)
 * - Extract journeyId and testSuiteName if present (null otherwise)
 * - Extract any custom annotations specified in options
 *
 * @param test - Playwright test case
 * @param options - Parser options controlling behavior
 * @returns Complete test metadata
 *
 * @example
 * ```typescript
 * // With annotations
 * const metadata = extractTestMetadata(test, { strict: false });
 * // Result: { testCaseId: 'TC-001', testCaseIdSource: 'annotation', ... }
 *
 * // Without annotations
 * const metadata = extractTestMetadata(test, { strict: false });
 * // Result: { testCaseId: 'auto-a3f7b9c4', testCaseIdSource: 'auto-generated', ... }
 * ```
 */
export function extractTestMetadata(test: TestCase, options: ParserOptions = {}): TestMetadata {
  const opts = {
    strict: false,
    warnOnMissingAnnotations: true,
    autoIdStrategy: 'hash' as const,
    customAnnotationTypes: [],
    ...options,
  };

  // ============================================================================
  // Extract testCaseId (required)
  // ============================================================================
  const testCaseIdAnnotation = extractAnnotation(test, 'testCaseId');

  let testCaseId: string;
  let testCaseIdSource: 'annotation' | 'auto-generated';

  if (testCaseIdAnnotation) {
    // Use explicit annotation
    testCaseId = testCaseIdAnnotation;
    testCaseIdSource = 'annotation';
  } else {
    // Handle missing annotation based on options
    if (opts.strict) {
      throw new Error(
        `Test "${test.title}" missing required 'testCaseId' annotation.\nAdd: test.info().annotations.push({ type: 'testCaseId', description: 'TC-001' })`
      );
    }

    if (opts.autoIdStrategy === 'none') {
      throw new Error(`Test "${test.title}" missing testCaseId and autoIdStrategy is 'none'`);
    }

    // Auto-generate ID
    testCaseId = generateTestCaseId(test, opts.autoIdStrategy);
    testCaseIdSource = 'auto-generated';

    // Warn user about missing annotation
    if (opts.warnOnMissingAnnotations) {
      console.warn(
        `⚠️  Test "${test.title}" missing testCaseId annotation.\n   Auto-generated: ${testCaseId}\n   Add explicit ID for better tracking across test renames:\n   test.info().annotations.push({ type: 'testCaseId', description: 'TC-001' })\n   Learn more: https://flakiness-detective-ts.vercel.app/docs/annotations\n`
      );
    }
  }

  // ============================================================================
  // Extract optional annotations
  // ============================================================================
  const journeyId = extractAnnotation(test, 'journeyId') || null;
  const testSuiteName = extractAnnotation(test, 'testSuiteName') || null;

  // ============================================================================
  // Extract custom annotations
  // ============================================================================
  const customAnnotations = extractCustomAnnotations(test, opts.customAnnotationTypes);

  return {
    testCaseId,
    testCaseIdSource,
    journeyId,
    testSuiteName,
    customAnnotations,
  };
}
