/**
 * Integration tests for the main parser function
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TestCase, TestResult } from '@playwright/test/reporter';
import { parsePlaywrightTest } from '../parser';

function createMockTest(annotations: Array<{ type: string; description: string }> = []): TestCase {
  return {
    title: 'user can login',
    location: {
      file: '/tests/auth.spec.ts',
      line: 42,
      column: 10,
    },
    annotations,
    parent: {
      project: () => ({ name: 'chromium' }),
    },
  } as unknown as TestCase;
}

function createMockResult(status: 'failed' | 'timedOut' | 'passed'): TestResult {
  const result: Partial<TestResult> = {
    status,
    duration: 1500,
    retry: 0,
  };

  if (status === 'failed' || status === 'timedOut') {
    result.errors = [
      {
        message: `
Error: Expect "element" to be visible

Expected: visible
Received: hidden

Locator: button[name="Submit"]
        `.trim(),
        location: {
          file: '/tests/auth.spec.ts',
          line: 42,
          column: 10,
        },
        snippet: '  await expect(page.locator(\'button[name="Submit"]\')).toBeVisible();',
      },
    ];
  }

  return result as TestResult;
}

describe('parsePlaywrightTest', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('basic parsing', () => {
    it('should parse complete test failure with annotations', () => {
      const test = createMockTest([
        { type: 'testCaseId', description: 'TC-AUTH-001' },
        { type: 'journeyId', description: 'authentication' },
        { type: 'testSuiteName', description: 'Login Tests' },
      ]);
      const result = createMockResult('failed');

      const parsed = parsePlaywrightTest(test, result);

      expect(parsed).toMatchObject({
        error: {
          matcher: 'element',
          expected: 'visible',
          actual: 'hidden',
          locator: 'button[name="Submit"]',
          location: {
            file: '/tests/auth.spec.ts',
            line: 42,
            column: 10,
          },
          message: expect.stringContaining('Expect "element" to be visible'),
        },
        metadata: {
          testCaseId: 'TC-AUTH-001',
          testCaseIdSource: 'annotation',
          journeyId: 'authentication',
          testSuiteName: 'Login Tests',
          customAnnotations: {},
        },
        test: {
          title: 'user can login',
          file: '/tests/auth.spec.ts',
          line: 42,
          column: 10,
          project: 'chromium',
        },
        result: {
          status: 'failed',
          duration: 1500,
          retry: 0,
        },
      });
    });

    it('should parse test failure without annotations (auto-ID)', () => {
      const test = createMockTest([]);
      const result = createMockResult('failed');

      const parsed = parsePlaywrightTest(test, result, {
        warnOnMissingAnnotations: false,
      });

      expect(parsed.metadata.testCaseId).toMatch(/^auto-[a-f0-9-]{12}$/);
      expect(parsed.metadata.testCaseIdSource).toBe('auto-generated');
      expect(parsed.metadata.journeyId).toBeNull();
      expect(parsed.metadata.testSuiteName).toBeNull();
    });

    it('should parse timedOut status', () => {
      const test = createMockTest([{ type: 'testCaseId', description: 'TC-001' }]);
      const result = createMockResult('timedOut');

      const parsed = parsePlaywrightTest(test, result);

      expect(parsed.result.status).toBe('timedOut');
    });
  });

  describe('validation', () => {
    it('should throw error for passed test', () => {
      const test = createMockTest([]);
      const result = createMockResult('passed');

      expect(() => {
        parsePlaywrightTest(test, result);
      }).toThrow('Cannot parse test with status "passed"');
    });

    it('should throw error when no errors array', () => {
      const test = createMockTest([]);
      const result = { ...createMockResult('failed'), errors: [] };

      expect(() => {
        parsePlaywrightTest(test, result);
      }).toThrow('has no errors despite failed/timedOut status');
    });

    it('should throw error for malformed error object', () => {
      const test = createMockTest([]);
      const result = createMockResult('failed');
      result.errors = [null as any];

      expect(() => {
        parsePlaywrightTest(test, result);
      }).toThrow('Failed to parse error details');
    });
  });

  describe('options', () => {
    it('should respect strict mode', () => {
      const test = createMockTest([]);
      const result = createMockResult('failed');

      expect(() => {
        parsePlaywrightTest(test, result, { strict: true });
      }).toThrow("missing required 'testCaseId' annotation");
    });

    it('should use custom auto-ID strategy', () => {
      const test = createMockTest([]);
      const result = createMockResult('failed');

      const parsed = parsePlaywrightTest(test, result, {
        autoIdStrategy: 'uuid',
        warnOnMissingAnnotations: false,
      });

      expect(parsed.metadata.testCaseId).toMatch(/^auto-[a-f0-9-]{12}$/);
    });

    it('should extract custom annotations', () => {
      const test = createMockTest([
        { type: 'testCaseId', description: 'TC-001' },
        { type: 'priority', description: 'high' },
        { type: 'owner', description: 'team-auth' },
      ]);
      const result = createMockResult('failed');

      const parsed = parsePlaywrightTest(test, result, {
        customAnnotationTypes: ['priority', 'owner'],
      });

      expect(parsed.metadata.customAnnotations).toEqual({
        priority: 'high',
        owner: 'team-auth',
      });
    });

    it('should suppress warnings when warnOnMissingAnnotations is false', () => {
      const test = createMockTest([]);
      const result = createMockResult('failed');

      parsePlaywrightTest(test, result, { warnOnMissingAnnotations: false });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle test without parent project', () => {
      const test = {
        ...createMockTest([{ type: 'testCaseId', description: 'TC-001' }]),
        parent: undefined,
      } as unknown as TestCase;
      const result = createMockResult('failed');

      const parsed = parsePlaywrightTest(test, result);

      expect(parsed.test.project).toBe('unknown');
    });

    it('should handle test with partial location', () => {
      const test = {
        ...createMockTest([{ type: 'testCaseId', description: 'TC-001' }]),
        location: {
          file: '/test.ts',
          line: undefined,
          column: undefined,
        },
      } as unknown as TestCase;
      const result = createMockResult('failed');

      const parsed = parsePlaywrightTest(test, result);

      expect(parsed.test.line).toBeNull();
      expect(parsed.test.column).toBeNull();
    });

    it('should handle test with retry count', () => {
      const test = createMockTest([{ type: 'testCaseId', description: 'TC-001' }]);
      const result = { ...createMockResult('failed'), retry: 2 };

      const parsed = parsePlaywrightTest(test, result);

      expect(parsed.result.retry).toBe(2);
    });
  });

  describe('real-world scenarios', () => {
    it('should parse typical Playwright toBeVisible error', () => {
      const test = createMockTest([{ type: 'testCaseId', description: 'TC-001' }]);
      const result: TestResult = {
        status: 'failed',
        duration: 5000,
        retry: 0,
        errors: [
          {
            message: `
Timeout 30000ms exceeded.
Call log:
  - expect.toBeVisible with timeout 30000ms
  - waiting for locator('button[name="Submit"]')

Locator: button[name="Submit"]
            `.trim(),
            location: {
              file: '/tests/auth.spec.ts',
              line: 50,
              column: 5,
            },
          },
        ],
      } as TestResult;

      const parsed = parsePlaywrightTest(test, result);

      expect(parsed.error.locator).toBe('button[name="Submit"]');
      expect(parsed.test.title).toBe('user can login');
      expect(parsed.result.duration).toBe(5000);
    });

    it('should parse assertion error with actual vs expected', () => {
      const test = createMockTest([
        { type: 'testCaseId', description: 'TC-002' },
        { type: 'journeyId', description: 'checkout' },
      ]);
      const result: TestResult = {
        status: 'failed',
        duration: 1200,
        retry: 1,
        errors: [
          {
            message: `
Error: Expect "text" to contain text

Expected: "Cart (3 items)"
Received: "Cart (0 items)"

Locator: .cart-summary
            `.trim(),
            location: {
              file: '/tests/checkout.spec.ts',
              line: 100,
              column: 10,
            },
          },
        ],
      } as TestResult;

      const parsed = parsePlaywrightTest(test, result);

      expect(parsed.error.expected).toBe('"Cart (3 items)"');
      expect(parsed.error.actual).toBe('"Cart (0 items)"');
      expect(parsed.metadata.journeyId).toBe('checkout');
      expect(parsed.result.retry).toBe(1);
    });
  });
});
