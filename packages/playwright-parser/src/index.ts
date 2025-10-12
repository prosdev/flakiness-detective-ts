/**
 * @flakiness-detective/playwright-parser
 *
 * Production-grade Playwright test failure parser with optional metadata tracking.
 *
 * @packageDocumentation
 */

// Export all types
export type {
  PlaywrightErrorDetails,
  TestMetadata,
  TestInfo,
  TestResultInfo,
  ParsedTestFailure,
  ParserOptions,
  TestCase,
  TestResult,
} from './types';

// Export main parsing function (to be implemented)
export { parsePlaywrightTest } from './parser';

// Export utility functions (to be implemented)
export { parsePlaywrightError } from './error-parser';
export {
  extractTestMetadata,
  extractAnnotation,
  extractCustomAnnotations,
} from './metadata-extractor';
export { generateTestCaseId, hashTestPath } from './id-generator';
export { removeAnsiCodes, cleanMessage } from './utils/ansi-cleaner';
