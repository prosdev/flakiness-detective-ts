import { describe, expect, it } from 'vitest';
import type { TestFailure } from '../types';
import { createRichEmbeddingContext, extractPatterns, extractRunId } from './pattern-extraction';

describe('extractRunId', () => {
  it('should extract run ID from GitHub Actions URL', () => {
    const url = 'https://github.com/org/repo/actions/runs/12345678';
    expect(extractRunId(url)).toBe('12345678');
  });

  it('should extract run ID from full GitHub Actions URL', () => {
    const url = 'https://github.com/org/repo/actions/runs/98765432/attempts/1';
    expect(extractRunId(url)).toBe('98765432');
  });

  it('should return undefined for URLs without run ID', () => {
    const url = 'https://github.com/org/repo';
    expect(extractRunId(url)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(extractRunId('')).toBeUndefined();
  });
});

describe('extractPatterns', () => {
  it('should extract line number from stack trace', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error',
      errorStack: 'at test.spec.ts:42:10\n  at run ()',
      timestamp: new Date(),
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.lineNumber).toBe(42);
  });

  it('should extract locator from error message', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error: locator("button.submit") not found',
      timestamp: new Date(),
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.locator).toBe('button.submit');
  });

  it('should extract matcher from error message', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error: expect(element).toBeVisible() failed',
      timestamp: new Date(),
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.matcher).toBe('toBeVisible');
  });

  it('should extract timeout from error message', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error: Timeout 5000ms exceeded',
      timestamp: new Date(),
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.timeout).toBe(5000);
  });

  it('should extract actual and expected values', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Expected: "Hello" but received: "Goodbye"',
      timestamp: new Date(),
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.expectedValue).toBe('Hello');
    expect(result.metadata?.actualValue).toBe('Goodbye');
  });

  it('should extract run ID from report link in metadata', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error',
      timestamp: new Date(),
      metadata: {
        reportLink: 'https://github.com/org/repo/actions/runs/123456',
      },
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.runId).toBe('123456');
  });

  it('should preserve existing metadata', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error',
      timestamp: new Date(),
      metadata: {
        projectName: 'MyProject',
        suiteName: 'MySuite',
        locator: 'existingLocator',
      },
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.projectName).toBe('MyProject');
    expect(result.metadata?.suiteName).toBe('MySuite');
    expect(result.metadata?.locator).toBe('existingLocator');
  });

  it('should not override existing metadata with extracted values', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'locator("newButton")',
      timestamp: new Date(),
      metadata: {
        locator: 'existingButton',
      },
    };

    const result = extractPatterns(failure);
    // Should keep existing metadata
    expect(result.metadata?.locator).toBe('existingButton');
  });

  it('should handle failures without metadata', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error',
      timestamp: new Date(),
    };

    const result = extractPatterns(failure);
    expect(result.metadata).toBeDefined();
  });

  it('should extract Playwright locators with various patterns', () => {
    const testCases = [
      {
        message: 'getByRole("button") not found',
        expected: 'button',
      },
      {
        message: 'getByText("Submit") failed',
        expected: 'Submit',
      },
      {
        message: 'selector("#submit-btn") timed out',
        expected: '#submit-btn',
      },
    ];

    for (const testCase of testCases) {
      const failure: TestFailure = {
        id: '1',
        testTitle: 'Test',
        testFilePath: 'test.spec.ts',
        errorMessage: testCase.message,
        timestamp: new Date(),
      };

      const result = extractPatterns(failure);
      expect(result.metadata?.locator).toBe(testCase.expected);
    }
  });

  it('should convert timeout from seconds to milliseconds', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'timeout of 30s exceeded',
      timestamp: new Date(),
    };

    const result = extractPatterns(failure);
    expect(result.metadata?.timeout).toBe(30000);
  });
});

describe('createRichEmbeddingContext', () => {
  it('should create context with basic information', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Login test',
      testFilePath: 'auth/login.spec.ts',
      errorMessage: 'Login button not found',
      timestamp: new Date(),
    };

    const context = createRichEmbeddingContext(failure);

    expect(context).toContain('Test: Login test');
    expect(context).toContain('File: auth/login.spec.ts');
    expect(context).toContain('Error: Login button not found');
  });

  it('should include project and suite information', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Login test',
      testFilePath: 'auth/login.spec.ts',
      errorMessage: 'Error',
      timestamp: new Date(),
      metadata: {
        projectName: 'E2E Tests',
        suiteName: 'Authentication',
      },
    };

    const context = createRichEmbeddingContext(failure);

    expect(context).toContain('Project: E2E Tests');
    expect(context).toContain('Suite: Authentication');
  });

  it('should include Playwright-specific fields', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error',
      timestamp: new Date(),
      metadata: {
        locator: 'button.submit',
        matcher: 'toBeVisible',
        actualValue: 'hidden',
        expectedValue: 'visible',
        timeout: 5000,
      },
    };

    const context = createRichEmbeddingContext(failure);

    expect(context).toContain('Locator: button.submit');
    expect(context).toContain('Matcher: toBeVisible');
    expect(context).toContain('Actual: "hidden"');
    expect(context).toContain('Expected: "visible"');
    expect(context).toContain('Timeout: 5000ms');
  });

  it('should include line number and code snippet', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error',
      timestamp: new Date(),
      metadata: {
        lineNumber: 42,
        errorSnippet: 'await expect(page.locator("button")).toBeVisible()',
      },
    };

    const context = createRichEmbeddingContext(failure);

    expect(context).toContain('Line: 42');
    expect(context).toContain('Code: await expect(page.locator("button")).toBeVisible()');
  });

  it('should order fields logically', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error message',
      timestamp: new Date(),
      metadata: {
        projectName: 'Project',
        suiteName: 'Suite',
        lineNumber: 10,
        locator: 'button',
        matcher: 'toBeVisible',
        errorSnippet: 'code',
      },
    };

    const context = createRichEmbeddingContext(failure);

    // Check that fields appear in a logical order
    const testIndex = context.indexOf('Test:');
    const fileIndex = context.indexOf('File:');
    const errorIndex = context.indexOf('Error:');

    expect(testIndex).toBeLessThan(fileIndex);
    expect(fileIndex).toBeLessThan(errorIndex);
    // Error should be last
    expect(errorIndex).toBeGreaterThan(context.indexOf('Locator:'));
  });

  it('should handle missing optional fields gracefully', () => {
    const failure: TestFailure = {
      id: '1',
      testTitle: 'Test',
      testFilePath: 'test.spec.ts',
      errorMessage: 'Error',
      timestamp: new Date(),
      metadata: {
        // Only some fields present
        locator: 'button',
      },
    };

    const context = createRichEmbeddingContext(failure);

    expect(context).toContain('Test: Test');
    expect(context).toContain('Locator: button');
    expect(context).not.toContain('Matcher:');
    expect(context).not.toContain('Expected:');
  });
});
