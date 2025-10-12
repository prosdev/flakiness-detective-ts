/**
 * Main parser function for Playwright test failures
 *
 * This is the primary entry point for the package, combining error parsing,
 * metadata extraction, and test information into a complete ParsedTestFailure object.
 */

import type { TestCase, TestResult } from '@playwright/test/reporter';
import { parsePlaywrightError } from './error-parser';
import { extractTestMetadata } from './metadata-extractor';
import type { ParsedTestFailure, ParserOptions, TestInfo, TestResultInfo } from './types';

/**
 * Parse a Playwright test failure into structured data
 *
 * This is the main function of the package. It combines:
 * - Error parsing (matcher, locator, expected/actual, location, snippet)
 * - Metadata extraction (testCaseId, journeyId, testSuiteName, custom annotations)
 * - Test information (title, file, project)
 * - Result information (status, duration, retry)
 *
 * @param test - Playwright TestCase from reporter
 * @param result - Playwright TestResult from reporter (must be failed or timedOut)
 * @param options - Parser options controlling behavior
 * @returns Complete parsed test failure
 * @throws Error if test is not failed/timedOut or if strict mode violations occur
 *
 * @example
 * ```typescript
 * // In a custom Playwright reporter
 * class MyReporter implements Reporter {
 *   async onTestEnd(test: TestCase, result: TestResult) {
 *     if (result.status === 'failed' || result.status === 'timedOut') {
 *       const parsed = parsePlaywrightTest(test, result);
 *       console.log(`Test ${parsed.metadata.testCaseId} failed`);
 *       console.log(`Matcher: ${parsed.error.matcher}`);
 *       console.log(`Locator: ${parsed.error.locator}`);
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With strict mode (enforces annotations)
 * const parsed = parsePlaywrightTest(test, result, {
 *   strict: true,
 *   warnOnMissingAnnotations: false,
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With custom annotations
 * const parsed = parsePlaywrightTest(test, result, {
 *   customAnnotationTypes: ['priority', 'owner', 'tags'],
 * });
 * console.log(parsed.metadata.customAnnotations.priority); // 'high'
 * ```
 */
export function parsePlaywrightTest(
  test: TestCase,
  result: TestResult,
  options: ParserOptions = {}
): ParsedTestFailure {
  // ============================================================================
  // Validate Input
  // ============================================================================
  if (result.status !== 'failed' && result.status !== 'timedOut') {
    throw new Error(
      `Cannot parse test with status "${result.status}". Only 'failed' and 'timedOut' tests can be parsed.`
    );
  }

  if (!result.errors || result.errors.length === 0) {
    throw new Error(`Test "${test.title}" has no errors despite failed/timedOut status.`);
  }

  // ============================================================================
  // Parse Error Details
  // ============================================================================
  const errorDetails = parsePlaywrightError(result.errors[0]);

  if (!errorDetails) {
    throw new Error(
      `Failed to parse error details for test "${test.title}". Error object may be malformed.`
    );
  }

  // ============================================================================
  // Extract Metadata
  // ============================================================================
  const metadata = extractTestMetadata(test, options);

  // ============================================================================
  // Extract Test Information
  // ============================================================================
  const testInfo: TestInfo = {
    title: test.title,
    file: test.location.file,
    line: test.location.line || null,
    column: test.location.column || null,
    project: test.parent?.project()?.name || 'unknown',
  };

  // ============================================================================
  // Extract Result Information
  // ============================================================================
  const resultInfo: TestResultInfo = {
    status: result.status as 'failed' | 'timedOut',
    duration: result.duration,
    retry: result.retry,
  };

  // ============================================================================
  // Return Complete Parsed Failure
  // ============================================================================
  return {
    error: errorDetails,
    metadata,
    test: testInfo,
    result: resultInfo,
  };
}
