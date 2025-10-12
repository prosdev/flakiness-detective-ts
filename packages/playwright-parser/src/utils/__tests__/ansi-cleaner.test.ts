/**
 * Tests for ANSI code cleaning utilities
 */

import { describe, expect, it } from 'vitest';
import { cleanMessage, cleanSnippet, removeAnsiCodes } from '../ansi-cleaner';

describe('removeAnsiCodes', () => {
  it('should remove ANSI escape codes', () => {
    const text = '\x1B[31mError\x1B[0m: \x1B[33mSomething went wrong\x1B[0m';

    const result = removeAnsiCodes(text);

    expect(result).toBe('Error: Something went wrong');
    expect(result).not.toContain('\x1B');
  });

  it('should handle text without ANSI codes', () => {
    const text = 'Plain text without codes';

    const result = removeAnsiCodes(text);

    expect(result).toBe('Plain text without codes');
  });

  it('should handle empty string', () => {
    const result = removeAnsiCodes('');

    expect(result).toBe('');
  });

  it('should remove complex ANSI sequences', () => {
    const text =
      '\x1B[1;31;40mBold Red on Black\x1B[0m normal \x1B[2;3;4mDim Italic Underline\x1B[0m';

    const result = removeAnsiCodes(text);

    expect(result).toBe('Bold Red on Black normal Dim Italic Underline');
  });

  it('should handle multiple ANSI codes in sequence', () => {
    const text = '\x1B[31m\x1B[1m\x1B[4mRed Bold Underline\x1B[0m\x1B[0m\x1B[0m';

    const result = removeAnsiCodes(text);

    expect(result).toBe('Red Bold Underline');
  });
});

describe('cleanMessage', () => {
  it('should remove ANSI codes and trim whitespace', () => {
    const message = '  \x1B[31mError\x1B[0m: Test failed  ';

    const result = cleanMessage(message);

    expect(result).toBe('Test failed');
  });

  it('should remove "Error: " prefix', () => {
    const message = 'Error: Something went wrong';

    const result = cleanMessage(message);

    expect(result).toBe('Something went wrong');
  });

  it('should handle message without Error prefix', () => {
    const message = 'Assertion failed';

    const result = cleanMessage(message);

    expect(result).toBe('Assertion failed');
  });

  it('should handle message with multiple Error: occurrences', () => {
    const message = 'Error: Test Error: Inner error';

    const result = cleanMessage(message);

    expect(result).toBe('Test Error: Inner error');
  });

  it('should handle empty message', () => {
    const result = cleanMessage('');

    expect(result).toBe('');
  });

  it('should handle message with only whitespace', () => {
    const message = '   \t\n  ';

    const result = cleanMessage(message);

    expect(result).toBe('');
  });

  it('should combine ANSI removal, trimming, and Error prefix removal', () => {
    const message = '  \x1B[31mError:\x1B[0m \x1B[33mTest failed with assertion\x1B[0m  ';

    const result = cleanMessage(message);

    expect(result).toBe('Test failed with assertion');
  });
});

describe('cleanSnippet', () => {
  it('should split by newlines and clean ANSI codes', () => {
    const snippet = '\x1B[90m  line 1\x1B[0m\n\x1B[90m  line 2\x1B[0m\n\x1B[90m  line 3\x1B[0m';

    const result = cleanSnippet(snippet);

    expect(result).toEqual(['  line 1', '  line 2', '  line 3']);
  });

  it('should filter out empty lines', () => {
    const snippet = 'line 1\n\nline 2\n  \n  \nline 3';

    const result = cleanSnippet(snippet);

    expect(result).toEqual(['line 1', 'line 2', 'line 3']);
  });

  it('should handle snippet with only whitespace lines', () => {
    const snippet = '   \n  \t  \n    ';

    const result = cleanSnippet(snippet);

    expect(result).toEqual([]);
  });

  it('should handle empty snippet', () => {
    const result = cleanSnippet('');

    expect(result).toEqual([]);
  });

  it('should handle null/undefined snippet', () => {
    // @ts-expect-error Testing runtime behavior
    expect(cleanSnippet(null)).toEqual([]);
    // @ts-expect-error Testing runtime behavior
    expect(cleanSnippet(undefined)).toEqual([]);
  });

  it('should preserve indentation', () => {
    const snippet = '  line 1\n    line 2\n      line 3';

    const result = cleanSnippet(snippet);

    expect(result).toEqual(['  line 1', '    line 2', '      line 3']);
  });

  it('should handle single line snippet', () => {
    const snippet = 'single line with code';

    const result = cleanSnippet(snippet);

    expect(result).toEqual(['single line with code']);
  });

  it('should clean ANSI codes from each line', () => {
    const snippet =
      '\x1B[31mred line\x1B[0m\n\x1B[32mgreen line\x1B[0m\n\x1B[33myellow line\x1B[0m';

    const result = cleanSnippet(snippet);

    expect(result).toEqual(['red line', 'green line', 'yellow line']);
    for (const line of result) {
      expect(line).not.toContain('\x1B');
    }
  });
});
