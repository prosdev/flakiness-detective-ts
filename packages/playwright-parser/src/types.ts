/**
 * @fileoverview Type definitions for the Playwright parser package
 *
 * This module defines all TypeScript interfaces and types used throughout
 * the playwright-parser package. These types provide a structured way to
 * work with Playwright test failures, including error details, metadata,
 * and parsing configuration.
 */

// Import types for re-export convenience
// biome-ignore lint/correctness/noUnusedVariables: Types are re-exported at end of file
import type { TestCase, TestResult } from '@playwright/test/reporter';

/**
 * Detailed information extracted from a Playwright error
 *
 * This interface represents the structured error information parsed from
 * Playwright test failures, including assertion details, locators, and
 * location information.
 */
export interface PlaywrightErrorDetails {
  /**
   * The assertion matcher that failed
   * @example 'toBeVisible', 'toContainText', 'toHaveCount', 'waitFor'
   */
  matcher: string;

  /**
   * Expected value from the assertion
   * @example 'visible', 'Submit', '5'
   */
  expected: string;

  /**
   * Actual value that was received
   * @example 'hidden', 'Login', '3'
   */
  actual: string;

  /**
   * Playwright locator that was used
   * @example 'button[name="Submit"]', 'role=button[name="Login"]'
   */
  locator: string;

  /**
   * Source code location where the error occurred
   */
  location: {
    /** File path (relative or absolute) */
    file: string;
    /** Line number in the file */
    line: number;
    /** Column number in the file */
    column: number;
  };

  /**
   * Clean error message (first line, ANSI codes removed)
   * @example 'Expect "element" to be visible'
   */
  message: string;

  /**
   * Code snippet lines from the error stack trace
   * ANSI codes removed, empty lines filtered
   */
  snippet: string[];
}

/**
 * Test metadata extracted from Playwright annotations
 *
 * Supports both explicit annotations and auto-generated values for
 * flexible usage patterns (hybrid approach).
 */
export interface TestMetadata {
  /**
   * Unique test case identifier
   * - If annotated: uses the annotation value
   * - If not annotated: auto-generated deterministic hash
   * @example 'TC-AUTH-001' (annotated) or 'auto-a3f7b9c4e2d1' (generated)
   */
  testCaseId: string;

  /**
   * Source of the testCaseId
   * Helps users understand if they need to add explicit annotations
   */
  testCaseIdSource: 'annotation' | 'auto-generated';

  /**
   * Optional user journey identifier for grouping related tests
   * null if not annotated
   * @example 'authentication', 'checkout', 'user-profile'
   */
  journeyId: string | null;

  /**
   * Optional test suite name for organization
   * null if not annotated
   * @example 'Login Tests', 'E2E Smoke Tests'
   */
  testSuiteName: string | null;

  /**
   * Custom annotations extracted from the test
   * Key-value pairs of any additional annotation types
   */
  customAnnotations: Record<string, string>;
}

/**
 * Test information from Playwright TestCase
 */
export interface TestInfo {
  /** Test title */
  title: string;

  /** Test file path */
  file: string;

  /** Line number in test file (if available) */
  line: number | null;

  /** Column number in test file (if available) */
  column: number | null;

  /** Playwright project name */
  project: string;
}

/**
 * Test result information from Playwright TestResult
 */
export interface TestResultInfo {
  /** Test status - only failed or timedOut are parsed */
  status: 'failed' | 'timedOut';

  /** Test duration in milliseconds */
  duration: number;

  /** Retry attempt number (0 for first attempt) */
  retry: number;
}

/**
 * Complete parsed test failure with all extracted information
 *
 * This is the main output type of the parser, combining error details,
 * metadata, test information, and result information.
 */
export interface ParsedTestFailure {
  /** Structured error details */
  error: PlaywrightErrorDetails;

  /** Test metadata (annotations + auto-generated) */
  metadata: TestMetadata;

  /** Test information from TestCase */
  test: TestInfo;

  /** Test result information */
  result: TestResultInfo;
}

/**
 * Configuration options for the parser
 *
 * Controls parser behavior including strictness, warnings, and
 * ID generation strategy.
 */
export interface ParserOptions {
  /**
   * Strict mode: throw error if required annotations are missing
   *
   * When true, missing testCaseId or journeyId annotations will throw an error.
   * When false (default), the parser will auto-generate IDs and warn users.
   *
   * @default false
   * @example
   * ```typescript
   * // For production CI: enforce annotations
   * const parsed = parsePlaywrightTest(test, result, { strict: true });
   *
   * // For development: graceful with warnings
   * const parsed = parsePlaywrightTest(test, result, { strict: false });
   * ```
   */
  strict?: boolean;

  /**
   * Warn when annotations are missing (educates users)
   *
   * When true (default), logs helpful warning messages explaining the
   * benefits of adding explicit annotations. Set to false to suppress warnings.
   *
   * @default true
   */
  warnOnMissingAnnotations?: boolean;

  /**
   * Strategy for auto-generating testCaseId when annotation is missing
   *
   * - 'hash': Deterministic SHA-256 hash of file path + title (recommended)
   * - 'uuid': Random UUID v4 (not stable across runs)
   * - 'none': Don't auto-generate, throw error if missing
   *
   * @default 'hash'
   */
  autoIdStrategy?: 'hash' | 'uuid' | 'none';

  /**
   * Custom annotation types to extract beyond the standard ones
   *
   * Allows extraction of project-specific annotations into customAnnotations.
   * Standard annotations (testCaseId, journeyId, testSuiteName) are always extracted.
   *
   * @example ['priority', 'owner', 'tags']
   */
  customAnnotationTypes?: string[];
}

/**
 * Re-export Playwright types for convenience
 * This allows users to import all types from a single package
 */
export type { TestCase, TestResult } from '@playwright/test/reporter';
