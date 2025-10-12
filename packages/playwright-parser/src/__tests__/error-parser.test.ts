/**
 * Tests for Playwright error parsing
 */

import { describe, expect, it } from 'vitest';
import { parsePlaywrightError } from '../error-parser';

describe('parsePlaywrightError', () => {
  it('should return null for null error', () => {
    const result = parsePlaywrightError(null);
    expect(result).toBeNull();
  });

  it('should return null for undefined error', () => {
    const result = parsePlaywrightError(undefined);
    expect(result).toBeNull();
  });

  it('should parse toBeVisible assertion error', () => {
    const error = {
      message: `
\x1B[31mExpect "element" to be visible\x1B[0m

Expected: visible
Received: hidden

Locator: button[name="Submit"]
      `.trim(),
      location: {
        file: '/path/to/test.spec.ts',
        line: 42,
        column: 10,
      },
      snippet: '  await expect(page.locator(\'button[name="Submit"]\')).toBeVisible();\n',
    };

    const result = parsePlaywrightError(error);

    expect(result).toEqual({
      matcher: 'element',
      expected: 'visible',
      actual: 'hidden',
      locator: 'button[name="Submit"]',
      location: {
        file: '/path/to/test.spec.ts',
        line: 42,
        column: 10,
      },
      message: 'Expect "element" to be visible',
      snippet: ['  await expect(page.locator(\'button[name="Submit"]\')).toBeVisible();'],
    });
  });

  it('should parse toContainText assertion error', () => {
    const error = {
      message: `
Error: Expect "text" to contain text

Expected: "Welcome"
Received: "Login"

Locator: role=heading[name="Page Title"]
      `.trim(),
      location: {
        file: '/path/to/test.spec.ts',
        line: 55,
        column: 5,
      },
      snippet:
        "  await expect(page.locator('role=heading[name=\"Page Title\"]')).toContainText('Welcome');\n",
    };

    const result = parsePlaywrightError(error);

    expect(result).toMatchObject({
      matcher: 'text',
      expected: '"Welcome"',
      actual: '"Login"',
      locator: 'role=heading[name="Page Title"]',
      location: {
        file: '/path/to/test.spec.ts',
        line: 55,
        column: 5,
      },
    });
    expect(result?.message).toContain('Expect "text" to contain text');
    expect(result?.snippet).toHaveLength(1);
  });

  it('should parse waitFor timeout error', () => {
    const error = {
      message: `
Timeout 30000ms exceeded.
waiting for button[name="Continue"] to be visible

Locator: button[name="Continue"]
      `.trim(),
      location: {
        file: '/path/to/test.spec.ts',
        line: 100,
        column: 8,
      },
      snippet: "  await page.waitForSelector('button[name=\"Continue\"]', { state: 'visible' });\n",
    };

    const result = parsePlaywrightError(error);

    expect(result).toMatchObject({
      matcher: 'waitFor',
      expected: 'visible',
      actual: 'timeout',
      locator: 'button[name="Continue"]',
      location: {
        file: '/path/to/test.spec.ts',
        line: 100,
        column: 8,
      },
    });
  });

  it('should handle error without ANSI codes', () => {
    const error = {
      message:
        'Expect "element" to be visible\n\nExpected: visible\nReceived: hidden\n\nLocator: .submit-button',
      location: {
        file: '/test.ts',
        line: 10,
        column: 2,
      },
    };

    const result = parsePlaywrightError(error);

    expect(result?.matcher).toBe('element');
    expect(result?.expected).toBe('visible');
    expect(result?.actual).toBe('hidden');
    expect(result?.locator).toBe('.submit-button');
  });

  it('should handle error with missing location', () => {
    const error = {
      message: 'Test failed\n\nExpected: true\nReceived: false',
    };

    const result = parsePlaywrightError(error);

    expect(result?.location).toEqual({
      file: '',
      line: 0,
      column: 0,
    });
  });

  it('should handle error with missing snippet', () => {
    const error = {
      message: 'Test failed\n\nLocator: button',
      location: {
        file: '/test.ts',
        line: 5,
        column: 0,
      },
    };

    const result = parsePlaywrightError(error);

    expect(result?.snippet).toEqual([]);
  });

  it('should extract clean message without Error: prefix', () => {
    const error = {
      message: 'Error: Something went wrong\n\nExpected: success\nReceived: failure',
      location: { file: '/test.ts', line: 1, column: 0 },
    };

    const result = parsePlaywrightError(error);

    expect(result?.message).toBe('Something went wrong');
  });

  it('should handle complex multiline error messages', () => {
    const error = {
      message: `
\x1B[31mError: Test failed with assertion\x1B[0m

Expected: "user@example.com"
Received: "admin@example.com"

Locator: input[name="email"]

Call log:
  - page.locator('input[name="email"]') at test.ts:10
  - expect.toBe() at test.ts:11
      `.trim(),
      location: {
        file: '/path/to/test.ts',
        line: 11,
        column: 15,
      },
      snippet:
        "  await expect(page.locator('input[name=\"email\"]')).toBe('user@example.com');\n  ^",
    };

    const result = parsePlaywrightError(error);

    expect(result?.expected).toBe('"user@example.com"');
    expect(result?.actual).toBe('"admin@example.com"');
    expect(result?.locator).toBe('input[name="email"]');
    expect(result?.message).toContain('Test failed with assertion');
    expect(result?.snippet.length).toBeGreaterThan(0);
  });

  it('should handle error without Expected/Received sections', () => {
    const error = {
      message: 'Navigation timeout exceeded\n\nLocator: page.goto("https://example.com")',
      location: {
        file: '/test.ts',
        line: 20,
        column: 5,
      },
    };

    const result = parsePlaywrightError(error);

    expect(result?.expected).toBe('');
    expect(result?.actual).toBe('');
    expect(result?.locator).toBe('page.goto("https://example.com")');
    expect(result?.matcher).toBe('unknown');
  });

  it('should clean ANSI codes from all fields', () => {
    const error = {
      message:
        '\x1B[31mError\x1B[0m: \x1B[33mTest failed\x1B[0m\n\nExpected: \x1B[32mtrue\x1B[0m\nReceived: \x1B[31mfalse\x1B[0m',
      location: { file: '/test.ts', line: 1, column: 0 },
      snippet: '\x1B[90m  expect(value).toBe(true);\x1B[0m',
    };

    const result = parsePlaywrightError(error);

    expect(result?.message).not.toContain('\x1B');
    expect(result?.snippet.join('')).not.toContain('\x1B');
  });
});
