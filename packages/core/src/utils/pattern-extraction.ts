import { TestFailure } from '../types';

/**
 * Represents a structured Playwright error message
 */
interface PlaywrightErrorMap {
  message?: string;
  actual?: string;
  expected?: string;
  locator?: string;
  matcher?: string;
  timeout?: number;
  location?: {
    file?: string;
    line?: number;
  };
  snippet?: string | string[];
}

/**
 * Extracts GitHub run ID from a report link
 */
export function extractRunId(reportLink: string): string | undefined {
  if (!reportLink) return undefined;
  const match = reportLink.match(/\/runs\/(\d+)/);
  return match?.[1];
}

/**
 * Parses a structured Playwright error message object
 */
function parseStructuredError(errorMessage: unknown): Partial<PlaywrightErrorMap> | undefined {
  if (typeof errorMessage !== 'object' || errorMessage === null || Array.isArray(errorMessage)) {
    return undefined;
  }

  const errorMap = errorMessage as Record<string, unknown>;
  const result: Partial<PlaywrightErrorMap> = {};

  if (errorMap.message !== undefined) result.message = String(errorMap.message);
  if (errorMap.actual !== undefined) result.actual = String(errorMap.actual);
  if (errorMap.expected !== undefined) result.expected = String(errorMap.expected);
  if (errorMap.locator !== undefined) result.locator = String(errorMap.locator);
  if (errorMap.matcher !== undefined) result.matcher = String(errorMap.matcher);

  // Handle timeout field
  if (typeof errorMap.timeout === 'number') {
    result.timeout = errorMap.timeout;
  } else if (errorMap.message && typeof errorMap.message === 'string') {
    // Extract timeout from message if present
    const timeoutMatch = errorMap.message.match(/Timed out (\d+)ms/);
    if (timeoutMatch) {
      result.timeout = Number.parseInt(timeoutMatch[1], 10);
    }
  }

  // Handle location object
  if (errorMap.location && typeof errorMap.location === 'object') {
    const location = errorMap.location as Record<string, unknown>;
    result.location = {};
    if (location.file !== undefined) result.location.file = String(location.file);
    if (location.line !== undefined) result.location.line = Number(location.line);
  }

  // Handle snippet field
  if (errorMap.snippet !== undefined) {
    if (typeof errorMap.snippet === 'string') {
      result.snippet = errorMap.snippet;
    } else if (Array.isArray(errorMap.snippet)) {
      result.snippet = errorMap.snippet.map((s) => String(s));
    }
  }

  return result;
}

/**
 * Extracts assertion pattern from code snippets
 */
function extractAssertionFromSnippet(snippet: string): {
  locator?: string;
  matcher?: string;
  expectedValue?: string;
  timeout?: number;
} {
  const result: {
    locator?: string;
    matcher?: string;
    expectedValue?: string;
    timeout?: number;
  } = {};

  // Look for Playwright assertions: expect(locator).matcher(expected)
  const locatorMatch = snippet.match(/expect\((?:this\.)?(\w+)\)/);
  if (locatorMatch) {
    result.locator = locatorMatch[1];
  }

  // Extract matcher (toContainText, toBeVisible, etc.)
  const matcherMatch = snippet.match(/\.(\w+)\(/);
  if (matcherMatch) {
    result.matcher = matcherMatch[1];
  }

  // Extract expected value from matcher arguments
  const expectedMatch = snippet.match(/\.\w+\(["']([^"']+)["']\)/);
  if (expectedMatch) {
    result.expectedValue = expectedMatch[1];
  }

  // Extract timeout from options
  const timeoutMatch = snippet.match(/timeout:\s*(\d+)/);
  if (timeoutMatch) {
    result.timeout = Number.parseInt(timeoutMatch[1], 10);
  }

  return result;
}

/**
 * Extracts patterns from a test failure
 */
export function extractPatterns(failure: TestFailure): TestFailure {
  const metadata = failure.metadata || {};

  // Try to parse structured error message first
  let structuredError: Partial<PlaywrightErrorMap> | undefined;
  try {
    // Check if errorMessage could be a structured object
    // In reality, errorMessage is a string, but we'll check metadata or errorStack
    // for structured data that might have been serialized
    structuredError = parseStructuredError(
      typeof failure.errorMessage === 'object' ? failure.errorMessage : undefined
    );
  } catch {
    // Ignore parsing errors
  }

  // Start with existing metadata
  let lineNumber = metadata.lineNumber;
  let errorSnippet = metadata.errorSnippet;
  let locator = metadata.locator;
  let matcher = metadata.matcher;
  let timeout = metadata.timeout;
  let actualValue = metadata.actualValue;
  let expectedValue = metadata.expectedValue;
  let runId = metadata.runId;
  const reportLink = metadata.reportLink;

  // Apply structured error data if available
  if (structuredError) {
    // Note: structuredError.location.file could be used to extract file path
    // but we already have testFilePath in the main failure object
    if (structuredError.location?.line) {
      lineNumber = structuredError.location.line;
    }
    if (structuredError.actual) actualValue = structuredError.actual;
    if (structuredError.expected) expectedValue = structuredError.expected;
    if (structuredError.locator) locator = structuredError.locator;
    if (structuredError.matcher) matcher = structuredError.matcher;
    if (structuredError.timeout) timeout = structuredError.timeout;

    // Handle snippet
    if (structuredError.snippet) {
      const snippets = Array.isArray(structuredError.snippet)
        ? structuredError.snippet
        : [structuredError.snippet];
      errorSnippet = snippets[0];

      // Extract assertion patterns from snippets
      for (const snippet of snippets) {
        const assertionData = extractAssertionFromSnippet(snippet);
        if (assertionData.locator && !locator) locator = assertionData.locator;
        if (assertionData.matcher && !matcher) matcher = assertionData.matcher;
        if (assertionData.expectedValue && !expectedValue)
          expectedValue = assertionData.expectedValue;
        if (assertionData.timeout && !timeout) timeout = assertionData.timeout;
      }
    }
  }

  // Fallback to extracting from errorMessage and errorStack
  if (!lineNumber) {
    lineNumber = extractLineNumber(failure.errorStack || '');
  }

  if (!errorSnippet) {
    errorSnippet = extractErrorSnippet(failure.errorStack || '', failure.errorMessage);
  }

  if (!locator) {
    locator = extractLocator(failure.errorMessage);
  }

  if (!matcher) {
    matcher = extractMatcher(failure.errorMessage);
  }

  if (!timeout) {
    timeout = extractTimeout(failure.errorMessage);
  }

  if (!actualValue) {
    actualValue = extractActualValue(failure.errorMessage);
  }

  if (!expectedValue) {
    expectedValue = extractExpectedValue(failure.errorMessage);
  }

  // Extract run ID from report link if available
  if (metadata.reportLink && !runId) {
    runId = extractRunId(metadata.reportLink);
  }

  return {
    ...failure,
    metadata: {
      ...metadata,
      errorSnippet: errorSnippet || metadata.errorSnippet,
      lineNumber: lineNumber || metadata.lineNumber,
      locator: locator || metadata.locator,
      matcher: matcher || metadata.matcher,
      timeout: timeout || metadata.timeout,
      actualValue: actualValue || metadata.actualValue,
      expectedValue: expectedValue || metadata.expectedValue,
      runId: runId || metadata.runId,
      reportLink: reportLink || metadata.reportLink,
    },
  };
}

/**
 * Creates a rich context for embedding generation
 */
export function createRichEmbeddingContext(failure: TestFailure): string {
  const parts = [`Test: ${failure.testTitle}`, `File: ${failure.testFilePath}`];

  if (failure.metadata?.projectName) {
    parts.push(`Project: ${failure.metadata.projectName}`);
  }

  if (failure.metadata?.suiteName) {
    parts.push(`Suite: ${failure.metadata.suiteName}`);
  }

  if (failure.metadata?.lineNumber) {
    parts.push(`Line: ${failure.metadata.lineNumber}`);
  }

  if (failure.metadata?.locator) {
    parts.push(`Locator: ${failure.metadata.locator}`);
  }

  if (failure.metadata?.matcher) {
    parts.push(`Matcher: ${failure.metadata.matcher}`);
  }

  if (failure.metadata?.actualValue) {
    parts.push(`Actual: "${failure.metadata.actualValue}"`);
  }

  if (failure.metadata?.expectedValue) {
    parts.push(`Expected: "${failure.metadata.expectedValue}"`);
  }

  if (failure.metadata?.timeout) {
    parts.push(`Timeout: ${failure.metadata.timeout}ms`);
  }

  if (failure.metadata?.errorSnippet) {
    parts.push(`Code: ${failure.metadata.errorSnippet}`);
  }

  parts.push(`Error: ${failure.errorMessage}`);

  return parts.join('\n');
}

// Helper functions for pattern extraction

function extractLineNumber(stack: string): number | undefined {
  const lineMatch = stack.match(/at .*:(\d+):\d+/);
  if (lineMatch?.[1]) {
    return parseInt(lineMatch[1], 10);
  }
  return undefined;
}

function extractErrorSnippet(_stack: string, errorMessage: string): string | undefined {
  // Try to extract code snippet from stack trace or error message
  // This is a simplified version - real implementation would be more robust
  const codeMatch = errorMessage.match(/`([^`]+)`/);
  if (codeMatch?.[1]) {
    return codeMatch[1].trim();
  }
  return undefined;
}

function extractLocator(errorMessage: string): string | undefined {
  // Look for common locator patterns in error message
  // For example: selector("div.class"), getByText("text"), xpath("//div")
  const locatorMatch = errorMessage.match(
    /(getBy\w+|queryBy\w+|findBy\w+|selector|locator|xpath|css)\s*\(\s*["']([^"']+)["']\s*\)/
  );

  if (locatorMatch?.[2]) {
    return locatorMatch[2];
  }
  return undefined;
}

function extractMatcher(errorMessage: string): string | undefined {
  // Look for common matcher patterns in error message
  // For example: expect(...).toBeVisible(), expect(...).toHaveText("text")
  const matcherMatch = errorMessage.match(/expect.*\.(to\w+)/);
  if (matcherMatch?.[1]) {
    return matcherMatch[1];
  }
  return undefined;
}

function extractTimeout(errorMessage: string): number | undefined {
  // Look for timeout values in error message
  // For example: "Timeout 30000ms exceeded" or "timeout of 5s exceeded"
  const timeoutMatch = errorMessage.match(/timeout\s+(?:of\s+)?(\d+)\s*(ms|s)?/i);
  if (timeoutMatch?.[1]) {
    const value = Number.parseInt(timeoutMatch[1], 10);
    const unit = timeoutMatch[2];

    if (unit === 's') {
      return value * 1000; // Convert seconds to milliseconds
    }
    return value;
  }
  return undefined;
}

function extractActualValue(errorMessage: string): string | undefined {
  // Look for actual value patterns in error messages
  // For example: "Expected ... but received 'actual'"
  const actualMatch = errorMessage.match(/(?:received|actual|got):\s*["']([^"']+)["']/i);
  if (actualMatch?.[1]) {
    return actualMatch[1];
  }
  // Alternative pattern: "Actual: value"
  const altMatch = errorMessage.match(/Actual:\s*(.+?)(?:\n|$)/i);
  if (altMatch?.[1]) {
    return altMatch[1].trim();
  }
  return undefined;
}

function extractExpectedValue(errorMessage: string): string | undefined {
  // Look for expected value patterns in error messages
  // For example: "Expected 'expected' but received"
  const expectedMatch = errorMessage.match(/(?:expected|should):\s*["']([^"']+)["']/i);
  if (expectedMatch?.[1]) {
    return expectedMatch[1];
  }
  // Alternative pattern: "Expected: value"
  const altMatch = errorMessage.match(/Expected:\s*(.+?)(?:\n|$)/i);
  if (altMatch?.[1]) {
    return altMatch[1].trim();
  }
  return undefined;
}
