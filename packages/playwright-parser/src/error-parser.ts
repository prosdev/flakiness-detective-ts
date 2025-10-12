/**
 * Core error parsing logic for Playwright test failures
 *
 * This module contains production-tested logic for parsing Playwright error messages
 * and extracting structured information including matchers, locators, expected/actual
 * values, and location information.
 */

import type { PlaywrightErrorDetails } from './types';
import { cleanSnippet, removeAnsiCodes } from './utils/ansi-cleaner';

/**
 * Parse a Playwright error into structured details
 *
 * Extracts matcher, locator, expected/actual values, location, message, and snippet
 * from Playwright test failure errors. Handles multiple error formats including
 * assertions, waitFor operations, and timeouts.
 *
 * @param error - Playwright error object from TestResult.errors
 * @returns Structured error details or null if error is invalid
 *
 * @example
 * ```typescript
 * const error = result.errors[0];
 * const details = parsePlaywrightError(error);
 * console.log(details.matcher);  // 'toBeVisible'
 * console.log(details.locator);  // 'button[name="Submit"]'
 * ```
 */
export function parsePlaywrightError(
  // biome-ignore lint/suspicious/noExplicitAny: Playwright error structure is dynamic
  error: any
): PlaywrightErrorDetails | null {
  if (!error) {
    return null;
  }

  // Remove ANSI codes from message for clean storage
  const cleanErrorMessage = error.message ? removeAnsiCodes(error.message) : '';

  // Initialize extracted values
  let expected = '';
  let actual = '';
  let matcher = 'unknown';
  let locator = '';

  // ============================================================================
  // Extract Expected and Actual Values
  // ============================================================================
  // Playwright error messages typically include "Expected:" and "Received:" sections
  if (cleanErrorMessage.includes('Expected:') && cleanErrorMessage.includes('Received:')) {
    const expectedMatch = cleanErrorMessage.match(/Expected:\s*(.+?)(?:\n|$)/);
    const receivedMatch = cleanErrorMessage.match(/Received:\s*(.+?)(?:\n|$)/);

    if (expectedMatch) {
      expected = expectedMatch[1].trim();
    }
    if (receivedMatch) {
      actual = receivedMatch[1].trim();
    }
  }

  // ============================================================================
  // Extract Matcher Name
  // ============================================================================
  // Look for "Expect <matcher>" pattern in error message
  if (cleanErrorMessage.includes('Expect')) {
    const expectMatch = cleanErrorMessage.match(/Expect "([^"]+)"/);
    if (expectMatch) {
      [, matcher] = expectMatch;
    }
  }

  // ============================================================================
  // Handle waitFor Operations
  // ============================================================================
  // waitFor errors have a specific format: "waiting for <locator> to be <state>"
  // This includes messages like: "Timeout exceeded.\nwaiting for X to be Y"
  if (cleanErrorMessage.includes('waiting for') && cleanErrorMessage.includes('to be')) {
    matcher = 'waitFor';
    const waitForMatch = cleanErrorMessage.match(/waiting for (.+?) to be (.+?)(?:\n|$)/i);
    if (waitForMatch) {
      locator = waitForMatch[1].trim();
      expected = waitForMatch[2].trim();
      actual = 'timeout';
    }
  }

  // ============================================================================
  // Extract Locator
  // ============================================================================
  // Playwright includes "Locator:" in most error messages
  if (cleanErrorMessage.includes('Locator:')) {
    const locatorMatch = cleanErrorMessage.match(/Locator:\s*(.+?)(?:\n|$)/);
    if (locatorMatch) {
      locator = locatorMatch[1].trim();
    }
  }

  // ============================================================================
  // Extract Clean Message (First Line Only)
  // ============================================================================
  // Take the first line and remove "Error: " prefix
  const firstLine = cleanErrorMessage.split('\n\n')[0].replace('Error: ', '');

  // ============================================================================
  // Extract Code Snippet
  // ============================================================================
  // Parse snippet from error, filtering and cleaning lines
  const snippet = error.snippet ? cleanSnippet(error.snippet) : [];

  // ============================================================================
  // Extract Location Information
  // ============================================================================
  const location = {
    file: error.location?.file || '',
    line: error.location?.line || 0,
    column: error.location?.column || 0,
  };

  return {
    matcher,
    expected,
    actual,
    locator,
    location,
    message: firstLine,
    snippet,
  };
}
