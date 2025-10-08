Object.defineProperty(exports, '__esModule', { value: true });
exports.extractPatterns = extractPatterns;
exports.createRichEmbeddingContext = createRichEmbeddingContext;
/**
 * Extracts patterns from a test failure
 */
function extractPatterns(failure) {
  const metadata = failure.metadata || {};
  // If we already have metadata with patterns, return as is
  if (metadata.errorSnippet || metadata.lineNumber || metadata.locator || metadata.matcher) {
    return failure;
  }
  // Extract line number if available in stack trace
  const lineNumber = extractLineNumber(failure.errorStack || '');
  // Extract code snippet if available in stack trace
  const errorSnippet = extractErrorSnippet(failure.errorStack || '', failure.errorMessage);
  // Extract locator if available (e.g., CSS selector, XPath)
  const locator = extractLocator(failure.errorMessage);
  // Extract matcher (e.g., toBeVisible, toHaveText)
  const matcher = extractMatcher(failure.errorMessage);
  // Extract timeout if it's a timeout error
  const timeout = extractTimeout(failure.errorMessage);
  return {
    ...failure,
    metadata: {
      ...metadata,
      errorSnippet: errorSnippet || metadata.errorSnippet,
      lineNumber: lineNumber || metadata.lineNumber,
      locator: locator || metadata.locator,
      matcher: matcher || metadata.matcher,
      timeout: timeout || metadata.timeout,
    },
  };
}
/**
 * Creates a rich context for embedding generation
 */
function createRichEmbeddingContext(failure) {
  const parts = [
    `Test: ${failure.testTitle}`,
    `File: ${failure.testFilePath}`,
    `Error: ${failure.errorMessage}`,
  ];
  if (failure.metadata?.errorSnippet) {
    parts.push(`Code: ${failure.metadata.errorSnippet}`);
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
  if (failure.metadata?.suiteName) {
    parts.push(`Suite: ${failure.metadata.suiteName}`);
  }
  return parts.join('\n');
}
// Helper functions for pattern extraction
function extractLineNumber(stack) {
  const lineMatch = stack.match(/at .*:(\d+):\d+/);
  if (lineMatch && lineMatch[1]) {
    return parseInt(lineMatch[1], 10);
  }
  return undefined;
}
function extractErrorSnippet(stack, errorMessage) {
  // Try to extract code snippet from stack trace or error message
  // This is a simplified version - real implementation would be more robust
  const codeMatch = errorMessage.match(/`([^`]+)`/);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim();
  }
  return undefined;
}
function extractLocator(errorMessage) {
  // Look for common locator patterns in error message
  // For example: selector("div.class"), getByText("text"), xpath("//div")
  const locatorMatch = errorMessage.match(
    /(getBy\w+|queryBy\w+|findBy\w+|selector|locator|xpath|css)\s*\(\s*["']([^"']+)["']\s*\)/
  );
  if (locatorMatch && locatorMatch[2]) {
    return locatorMatch[2];
  }
  return undefined;
}
function extractMatcher(errorMessage) {
  // Look for common matcher patterns in error message
  // For example: expect(...).toBeVisible(), expect(...).toHaveText("text")
  const matcherMatch = errorMessage.match(/expect.*\.(to\w+)/);
  if (matcherMatch && matcherMatch[1]) {
    return matcherMatch[1];
  }
  return undefined;
}
function extractTimeout(errorMessage) {
  // Look for timeout values in error message
  // For example: "Timeout 30000ms exceeded" or "timeout of 5s exceeded"
  const timeoutMatch = errorMessage.match(/timeout\s+(?:of\s+)?(\d+)\s*(ms|s)?/i);
  if (timeoutMatch && timeoutMatch[1]) {
    const value = parseInt(timeoutMatch[1], 10);
    const unit = timeoutMatch[2];
    if (unit === 's') {
      return value * 1000; // Convert seconds to milliseconds
    }
    return value;
  }
  return undefined;
}
//# sourceMappingURL=pattern-extraction.js.map
