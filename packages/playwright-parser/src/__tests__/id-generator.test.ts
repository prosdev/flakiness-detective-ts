/**
 * Tests for ID generation
 */

import { describe, expect, it } from 'vitest';
import type { TestCase } from '@playwright/test/reporter';
import { generateTestCaseId, hashTestPath } from '../id-generator';

function createMockTestCase(file: string, title: string): TestCase {
  return {
    title,
    location: {
      file,
      line: 10,
      column: 5,
    },
  } as unknown as TestCase;
}

describe('hashTestPath', () => {
  it('should generate consistent hash for same test', () => {
    const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

    const hash1 = hashTestPath(test);
    const hash2 = hashTestPath(test);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(12);
    expect(hash1).toMatch(/^[a-f0-9]{12}$/);
  });

  it('should generate different hash for different files', () => {
    const test1 = createMockTestCase('/tests/auth.spec.ts', 'user can login');
    const test2 = createMockTestCase('/tests/user.spec.ts', 'user can login');

    const hash1 = hashTestPath(test1);
    const hash2 = hashTestPath(test2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hash for different titles', () => {
    const test1 = createMockTestCase('/tests/auth.spec.ts', 'user can login');
    const test2 = createMockTestCase('/tests/auth.spec.ts', 'user can logout');

    const hash1 = hashTestPath(test1);
    const hash2 = hashTestPath(test2);

    expect(hash1).not.toBe(hash2);
  });

  it('should be deterministic across multiple runs', () => {
    const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

    const hashes = Array.from({ length: 10 }, () => hashTestPath(test));

    expect(new Set(hashes).size).toBe(1);
  });
});

describe('generateTestCaseId', () => {
  describe('hash strategy', () => {
    it('should generate ID with auto- prefix', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      const id = generateTestCaseId(test, 'hash');

      expect(id).toMatch(/^auto-[a-f0-9-]{12}$/);
    });

    it('should be deterministic', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      const id1 = generateTestCaseId(test, 'hash');
      const id2 = generateTestCaseId(test, 'hash');

      expect(id1).toBe(id2);
    });

    it('should use hash strategy by default', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      const id = generateTestCaseId(test);

      expect(id).toMatch(/^auto-[a-f0-9-]{12}$/);
    });
  });

  describe('uuid strategy', () => {
    it('should generate UUID-based ID', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      const id = generateTestCaseId(test, 'uuid');

      expect(id).toMatch(/^auto-[a-f0-9-]{12}$/);
    });

    it('should generate different IDs each time', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      const id1 = generateTestCaseId(test, 'uuid');
      const id2 = generateTestCaseId(test, 'uuid');

      expect(id1).not.toBe(id2);
    });

    it('should have correct length', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      const id = generateTestCaseId(test, 'uuid');

      expect(id).toHaveLength(17); // 'auto-' + 12 characters
    });
  });

  describe('none strategy', () => {
    it('should return empty string', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      const id = generateTestCaseId(test, 'none');

      expect(id).toBe('');
    });
  });

  describe('invalid strategy', () => {
    it('should throw error for unknown strategy', () => {
      const test = createMockTestCase('/tests/auth.spec.ts', 'user can login');

      expect(() => {
        // @ts-expect-error Testing invalid input
        generateTestCaseId(test, 'invalid');
      }).toThrow('Unknown ID generation strategy');
    });
  });
});
