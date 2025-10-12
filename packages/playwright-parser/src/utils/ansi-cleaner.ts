/**
 * Utilities for cleaning ANSI escape codes and formatting text
 */

/**
 * Regular expression to match ANSI escape codes
 * Matches sequences like \x1B[0m, \x1B[31m, etc.
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes require control characters
const ANSI_REGEX = /\x1B\[[0-9;]*[a-zA-Z]/g;

/**
 * Remove ANSI escape codes from a string
 *
 * Playwright error messages often contain ANSI codes for terminal coloring.
 * This function strips them out for clean storage and display.
 *
 * @param text - Text that may contain ANSI codes
 * @returns Clean text without ANSI codes
 *
 * @example
 * ```typescript
 * const colored = '\x1B[31mError\x1B[0m: test failed';
 * const clean = removeAnsiCodes(colored);
 * // Result: 'Error: test failed'
 * ```
 */
export function removeAnsiCodes(text: string): string {
  return text.replace(ANSI_REGEX, '');
}

/**
 * Clean an error message by removing ANSI codes and normalizing whitespace
 *
 * @param message - Raw error message
 * @returns Cleaned message
 *
 * @example
 * ```typescript
 * const raw = '\x1B[31m  Error: test failed  \x1B[0m';
 * const clean = cleanMessage(raw);
 * // Result: 'Error: test failed'
 * ```
 */
export function cleanMessage(message: string): string {
  // Remove ANSI codes
  let cleaned = removeAnsiCodes(message);

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  // Remove "Error: " prefix if present
  cleaned = cleaned.replace(/^Error:\s*/, '');

  return cleaned;
}

/**
 * Extract and clean code snippet lines from an error
 *
 * Filters out empty lines and removes ANSI codes from each line.
 *
 * @param snippet - Raw snippet string (may be multiline)
 * @returns Array of cleaned snippet lines
 */
export function cleanSnippet(snippet: string): string[] {
  if (!snippet) {
    return [];
  }

  return snippet
    .split('\n')
    .filter((line) => line.trim().length > 0) // Remove empty lines
    .map((line) => removeAnsiCodes(line)); // Clean each line
}
