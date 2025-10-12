/**
 * Tests for metadata extraction
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TestCase } from '@playwright/test/reporter';
import {
  extractAnnotation,
  extractCustomAnnotations,
  extractTestMetadata,
} from '../metadata-extractor';

// Mock test case factory
function createMockTestCase(annotations: Array<{ type: string; description: string }>): TestCase {
  return {
    title: 'test login flow',
    location: {
      file: '/tests/auth.spec.ts',
      line: 10,
      column: 5,
    },
    annotations,
    parent: {
      project: () => ({ name: 'chromium' }),
    },
  } as unknown as TestCase;
}

describe('extractAnnotation', () => {
  it('should extract existing annotation', () => {
    const test = createMockTestCase([{ type: 'testCaseId', description: 'TC-001' }]);

    const result = extractAnnotation(test, 'testCaseId');

    expect(result).toBe('TC-001');
  });

  it('should return undefined for missing annotation', () => {
    const test = createMockTestCase([]);

    const result = extractAnnotation(test, 'testCaseId');

    expect(result).toBeUndefined();
  });

  it('should extract correct annotation when multiple exist', () => {
    const test = createMockTestCase([
      { type: 'testCaseId', description: 'TC-001' },
      { type: 'journeyId', description: 'auth' },
      { type: 'priority', description: 'high' },
    ]);

    expect(extractAnnotation(test, 'testCaseId')).toBe('TC-001');
    expect(extractAnnotation(test, 'journeyId')).toBe('auth');
    expect(extractAnnotation(test, 'priority')).toBe('high');
  });
});

describe('extractCustomAnnotations', () => {
  it('should extract custom annotations', () => {
    const test = createMockTestCase([
      { type: 'priority', description: 'high' },
      { type: 'owner', description: 'team-auth' },
      { type: 'tags', description: 'smoke,critical' },
    ]);

    const result = extractCustomAnnotations(test, ['priority', 'owner', 'tags']);

    expect(result).toEqual({
      priority: 'high',
      owner: 'team-auth',
      tags: 'smoke,critical',
    });
  });

  it('should return empty object when no custom types specified', () => {
    const test = createMockTestCase([{ type: 'priority', description: 'high' }]);

    const result = extractCustomAnnotations(test, []);

    expect(result).toEqual({});
  });

  it('should only include annotations that exist', () => {
    const test = createMockTestCase([{ type: 'priority', description: 'high' }]);

    const result = extractCustomAnnotations(test, ['priority', 'owner', 'tags']);

    expect(result).toEqual({
      priority: 'high',
    });
  });
});

describe('extractTestMetadata', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('with testCaseId annotation', () => {
    it('should use annotation value', () => {
      const test = createMockTestCase([{ type: 'testCaseId', description: 'TC-AUTH-001' }]);

      const result = extractTestMetadata(test);

      expect(result.testCaseId).toBe('TC-AUTH-001');
      expect(result.testCaseIdSource).toBe('annotation');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should extract all standard annotations', () => {
      const test = createMockTestCase([
        { type: 'testCaseId', description: 'TC-001' },
        { type: 'journeyId', description: 'authentication' },
        { type: 'testSuiteName', description: 'Login Tests' },
      ]);

      const result = extractTestMetadata(test);

      expect(result).toEqual({
        testCaseId: 'TC-001',
        testCaseIdSource: 'annotation',
        journeyId: 'authentication',
        testSuiteName: 'Login Tests',
        customAnnotations: {},
      });
    });
  });

  describe('without testCaseId annotation (auto-generation)', () => {
    it('should auto-generate with hash strategy by default', () => {
      const test = createMockTestCase([]);

      const result = extractTestMetadata(test);

      expect(result.testCaseId).toMatch(/^auto-[a-f0-9-]{12}$/);
      expect(result.testCaseIdSource).toBe('auto-generated');
      expect(result.journeyId).toBeNull();
      expect(result.testSuiteName).toBeNull();
    });

    it('should warn about missing annotation by default', () => {
      const test = createMockTestCase([]);

      extractTestMetadata(test);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing testCaseId annotation')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Auto-generated: auto-'));
    });

    it('should generate deterministic hash for same test', () => {
      const test1 = createMockTestCase([]);
      const test2 = createMockTestCase([]);

      const result1 = extractTestMetadata(test1, {
        warnOnMissingAnnotations: false,
      });
      const result2 = extractTestMetadata(test2, {
        warnOnMissingAnnotations: false,
      });

      expect(result1.testCaseId).toBe(result2.testCaseId);
    });

    it('should not warn when warnOnMissingAnnotations is false', () => {
      const test = createMockTestCase([]);

      extractTestMetadata(test, { warnOnMissingAnnotations: false });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should support uuid strategy', () => {
      const test = createMockTestCase([]);

      const result = extractTestMetadata(test, {
        autoIdStrategy: 'uuid',
        warnOnMissingAnnotations: false,
      });

      expect(result.testCaseId).toMatch(/^auto-[a-f0-9-]{12}$/);
      expect(result.testCaseIdSource).toBe('auto-generated');
    });

    it('should throw error with none strategy', () => {
      const test = createMockTestCase([]);

      expect(() => {
        extractTestMetadata(test, { autoIdStrategy: 'none' });
      }).toThrow('missing testCaseId');
    });
  });

  describe('strict mode', () => {
    it('should throw error when testCaseId is missing', () => {
      const test = createMockTestCase([]);

      expect(() => {
        extractTestMetadata(test, { strict: true });
      }).toThrow("missing required 'testCaseId' annotation");
    });

    it('should not throw when testCaseId is present', () => {
      const test = createMockTestCase([{ type: 'testCaseId', description: 'TC-001' }]);

      expect(() => {
        extractTestMetadata(test, { strict: true });
      }).not.toThrow();
    });
  });

  describe('custom annotations', () => {
    it('should extract specified custom annotations', () => {
      const test = createMockTestCase([
        { type: 'testCaseId', description: 'TC-001' },
        { type: 'priority', description: 'high' },
        { type: 'owner', description: 'team-auth' },
        { type: 'tags', description: 'smoke' },
      ]);

      const result = extractTestMetadata(test, {
        customAnnotationTypes: ['priority', 'owner', 'tags'],
      });

      expect(result.customAnnotations).toEqual({
        priority: 'high',
        owner: 'team-auth',
        tags: 'smoke',
      });
    });

    it('should handle missing custom annotations gracefully', () => {
      const test = createMockTestCase([{ type: 'testCaseId', description: 'TC-001' }]);

      const result = extractTestMetadata(test, {
        customAnnotationTypes: ['priority', 'owner'],
      });

      expect(result.customAnnotations).toEqual({});
    });
  });

  describe('optional standard annotations', () => {
    it('should set journeyId to null when missing', () => {
      const test = createMockTestCase([{ type: 'testCaseId', description: 'TC-001' }]);

      const result = extractTestMetadata(test);

      expect(result.journeyId).toBeNull();
    });

    it('should set testSuiteName to null when missing', () => {
      const test = createMockTestCase([{ type: 'testCaseId', description: 'TC-001' }]);

      const result = extractTestMetadata(test);

      expect(result.testSuiteName).toBeNull();
    });
  });
});
