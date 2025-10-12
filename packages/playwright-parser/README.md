# @flakiness-detective/playwright-parser

> Production-grade Playwright test failure parser with optional metadata tracking

[![npm version](https://img.shields.io/npm/v/@flakiness-detective/playwright-parser.svg)](https://www.npmjs.com/package/@flakiness-detective/playwright-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests: 79 passing](https://img.shields.io/badge/tests-79%20passing-brightgreen.svg)]()

Parse Playwright test failures with rich error details and optional metadata tracking through annotations. Built from production-tested code and designed for AI-powered flakiness detection systems.

## Features

- ✅ **Zero Config** - Works immediately without any setup
- 🎯 **Rich Error Parsing** - Extracts matcher, locator, expected/actual values, location, and code snippets
- 🔄 **Hybrid Approach** - Auto-generates deterministic test IDs when annotations are missing
- 📊 **Optional Metadata** - Add annotations for enhanced tracking (testCaseId, journeyId, testSuiteName)
- 🏭 **Production Tested** - Battle-tested parsing logic from real-world Playwright usage
- 📦 **TypeScript First** - Fully typed with comprehensive type definitions
- 🧪 **Well Tested** - 79 passing tests covering real Playwright error scenarios

## Installation

```bash
# npm
npm install @flakiness-detective/playwright-parser

# pnpm
pnpm add @flakiness-detective/playwright-parser

# yarn
yarn add @flakiness-detective/playwright-parser
```

## Quick Start

```typescript
import { parsePlaywrightTest } from "@flakiness-detective/playwright-parser";
import type { TestCase, TestResult } from "@playwright/test/reporter";

// In your custom reporter or analysis tool
const parsed = parsePlaywrightTest(test, result);

console.log(parsed.error.matcher); // 'toBeVisible'
console.log(parsed.error.locator); // 'button[name="Submit"]'
console.log(parsed.error.expected); // 'visible'
console.log(parsed.error.actual); // 'hidden'
console.log(parsed.metadata.testCaseId); // 'auto-a3f7b9c4' (auto-generated)
```

## Level Up: Add Annotations

For better tracking across test renames and historical analysis:

```typescript
test("user can login", async ({ page }) => {
  // Add testCaseId for stable tracking
  test.info().annotations.push({
    type: "testCaseId",
    description: "TC-AUTH-001",
  });

  // Optional: group by user journey
  test.info().annotations.push({
    type: "journeyId",
    description: "authentication",
  });

  // Optional: organize into test suites
  test.info().annotations.push({
    type: "testSuiteName",
    description: "Login Tests",
  });

  // Your test code...
});
```

### Why Add Annotations?

**Without annotations (still works!):**

- ✅ Pattern detection across similar errors
- ✅ Clustering by locator, matcher, etc.
- ✅ Basic flakiness detection
- ⚠️ Test renames break history

**With annotations (10x better!):**

- ✅ All the above PLUS:
- ✅ Track test history across renames
- ✅ Temporal pattern detection
- ✅ Journey-level insights
- ✅ Long-term stability trends
- ✅ Integration with test management systems

## Complete Example

```typescript
import { parsePlaywrightTest } from "@flakiness-detective/playwright-parser";
import type { TestCase, TestResult, Reporter } from "@playwright/test/reporter";

class FlakinessReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== "failed" && result.status !== "timedOut") {
      return; // Only process failures
    }

    const parsed = parsePlaywrightTest(test, result, {
      // Optional: enable strict mode (require annotations)
      strict: false,

      // Optional: customize auto-ID strategy
      autoIdStrategy: "hash", // 'hash' | 'uuid' | 'none'

      // Optional: warn users about missing annotations
      warnOnMissingAnnotations: true,

      // Optional: extract custom annotations
      customAnnotationTypes: ["priority", "owner", "tags"],
    });

    // Send to your flakiness detection system
    this.sendToAnalytics({
      testId: parsed.metadata.testCaseId,
      journey: parsed.metadata.journeyId,
      suite: parsed.metadata.testSuiteName,
      file: parsed.test.file,
      title: parsed.test.title,
      project: parsed.test.project,
      error: {
        matcher: parsed.error.matcher,
        locator: parsed.error.locator,
        expected: parsed.error.expected,
        actual: parsed.error.actual,
        message: parsed.error.message,
        location: parsed.error.location,
        snippet: parsed.error.snippet,
      },
      result: {
        status: parsed.result.status,
        duration: parsed.result.duration,
        retry: parsed.result.retry,
      },
      timestamp: new Date(),
    });
  }
}

export default FlakinessReporter;
```

## API Reference

### `parsePlaywrightTest(test, result, options?)`

Parses a Playwright test failure into structured data.

**Parameters:**

- `test: TestCase` - The Playwright test case
- `result: TestResult` - The test result (must be 'failed' or 'timedOut')
- `options?: ParserOptions` - Optional configuration

**Returns:** `ParsedTestFailure`

**Throws:**

- `Error` if test status is not 'failed' or 'timedOut'
- `Error` if no errors array or malformed error object
- `Error` if strict mode is enabled and required annotations are missing

**Example:**

```typescript
const parsed = parsePlaywrightTest(test, result, {
  strict: false, // Don't throw on missing annotations
  warnOnMissingAnnotations: true, // Educate users (default)
  autoIdStrategy: "hash", // Generate deterministic IDs
  customAnnotationTypes: ["priority", "owner"],
});
```

### `ParserOptions`

Configuration options for the parser.

```typescript
interface ParserOptions {
  // Strict mode: throw error if required annotations missing
  strict?: boolean; // Default: false

  // Warn when annotations are missing (educates users)
  warnOnMissingAnnotations?: boolean; // Default: true

  // Strategy for auto-generating testCaseId
  autoIdStrategy?: "hash" | "uuid" | "none"; // Default: 'hash'

  // Custom annotation types to extract
  customAnnotationTypes?: string[];
}
```

### `ParsedTestFailure`

The complete parsed test failure object.

```typescript
interface ParsedTestFailure {
  // Structured error details
  error: PlaywrightErrorDetails;

  // Test metadata (annotations + auto-generated)
  metadata: TestMetadata;

  // Test information
  test: TestInfo;

  // Execution result
  result: TestResultInfo;
}
```

### `PlaywrightErrorDetails`

Structured error information extracted from Playwright errors.

```typescript
interface PlaywrightErrorDetails {
  matcher: string; // e.g., 'toBeVisible', 'toContainText', 'waitFor'
  expected: string; // Expected value in assertion
  actual: string; // Actual value received
  locator: string; // Playwright locator string
  location: {
    file: string; // File path
    line: number; // Line number
    column: number; // Column number
  };
  message: string; // Clean error message (no ANSI codes)
  snippet: string[]; // Code snippet lines
}
```

### `TestMetadata`

Test metadata from annotations and auto-generation.

```typescript
interface TestMetadata {
  testCaseId: string; // Unique test identifier
  testCaseIdSource: "annotation" | "auto-generated";
  journeyId: string | null; // User journey identifier
  testSuiteName: string | null; // Test suite name
  customAnnotations: Record<string, string>; // Custom annotations
}
```

### `TestInfo`

Core test information.

```typescript
interface TestInfo {
  title: string; // Test title
  file: string; // Test file path
  line: number | null; // Test definition line
  column: number | null; // Test definition column
  project: string; // Playwright project name
}
```

### `TestResultInfo`

Test execution result information.

```typescript
interface TestResultInfo {
  status: "failed" | "timedOut";
  duration: number; // Execution time in milliseconds
  retry: number; // Retry attempt number (0 for first run)
}
```

### Utility Functions

#### `parsePlaywrightError(error)`

Parse raw Playwright error object into structured details.

```typescript
import { parsePlaywrightError } from "@flakiness-detective/playwright-parser";

const errorDetails = parsePlaywrightError(result.errors[0]);
console.log(errorDetails.matcher); // 'toBeVisible'
```

#### `extractTestMetadata(test, options)`

Extract metadata from test annotations with auto-ID generation.

```typescript
import { extractTestMetadata } from "@flakiness-detective/playwright-parser";

const metadata = extractTestMetadata(test, {
  autoIdStrategy: "hash",
  warnOnMissingAnnotations: false,
});
```

#### `removeAnsiCodes(text)`

Remove ANSI escape codes from strings.

```typescript
import { removeAnsiCodes } from "@flakiness-detective/playwright-parser";

const clean = removeAnsiCodes("\x1B[31mError\x1B[0m: test failed");
// Result: 'Error: test failed'
```

## Annotation Guide

### Standard Annotations

#### `testCaseId` (Recommended)

**Purpose**: Unique, stable identifier for a test case.

**Why use it**: Auto-generated IDs change when test titles change. Explicit IDs enable tracking across refactors.

```typescript
test("user can login", async ({ page }) => {
  test.info().annotations.push({
    type: "testCaseId",
    description: "TC-AUTH-001", // Your format: TC-*, JIRA-*, etc.
  });
  // ...
});
```

#### `journeyId` (Optional)

**Purpose**: Group tests by user journey or flow.

**Why use it**: Analyze flakiness patterns by user journey (auth, checkout, profile, etc.)

```typescript
test.info().annotations.push({
  type: "journeyId",
  description: "authentication", // or 'checkout', 'onboarding', etc.
});
```

#### `testSuiteName` (Optional)

**Purpose**: Organize tests into logical suites.

**Why use it**: Higher-level grouping than journeys (e.g., "Smoke Tests", "Critical Path")

```typescript
test.info().annotations.push({
  type: "testSuiteName",
  description: "Smoke Tests",
});
```

### Custom Annotations

Add your own annotations for team-specific needs:

```typescript
// In your test
test.info().annotations.push({ type: "priority", description: "high" });
test.info().annotations.push({ type: "owner", description: "team-auth" });
test.info().annotations.push({ type: "tags", description: "smoke,critical" });

// In your reporter
const parsed = parsePlaywrightTest(test, result, {
  customAnnotationTypes: ["priority", "owner", "tags"],
});

console.log(parsed.metadata.customAnnotations);
// { priority: 'high', owner: 'team-auth', tags: 'smoke,critical' }
```

## Use Cases

### 1. Flakiness Detection System

Collect structured failure data for AI-powered flakiness analysis:

```typescript
const parsed = parsePlaywrightTest(test, result);

await sendToFlakinessDetector({
  testId: parsed.metadata.testCaseId,
  journey: parsed.metadata.journeyId,
  errorSignature: {
    matcher: parsed.error.matcher,
    locator: parsed.error.locator,
    message: parsed.error.message,
  },
  timestamp: new Date(),
});
```

### 2. Firestore/Database Storage

Store structured failure data for analysis:

```typescript
await db.collection("test_failures").add({
  testCaseId: parsed.metadata.testCaseId,
  testTitle: parsed.test.title,
  testFile: parsed.test.file,
  errorMessage: parsed.error.message,
  locator: parsed.error.locator,
  matcher: parsed.error.matcher,
  expected: parsed.error.expected,
  actual: parsed.error.actual,
  location: parsed.error.location,
  snippet: parsed.error.snippet,
  status: parsed.result.status,
  duration: parsed.result.duration,
  retry: parsed.result.retry,
  timestamp: new Date(),
});
```

### 3. CI/CD Integration

Generate failure reports in CI:

```typescript
const failures = [];

class CIReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === "failed") {
      const parsed = parsePlaywrightTest(test, result);
      failures.push(parsed);
    }
  }

  onEnd() {
    // Generate report
    console.log(`\n📊 Failure Report (${failures.length} failures)`);

    for (const failure of failures) {
      console.log(`\n❌ ${failure.test.title}`);
      console.log(`   ID: ${failure.metadata.testCaseId}`);
      console.log(`   Matcher: ${failure.error.matcher}`);
      console.log(`   Locator: ${failure.error.locator}`);
      console.log(`   Error: ${failure.error.message}`);
    }
  }
}
```

## Advanced Configuration

### Strict Mode

Enforce annotations for production systems:

```typescript
const parsed = parsePlaywrightTest(test, result, {
  strict: true, // Throws error if testCaseId annotation is missing
  autoIdStrategy: "none", // Disable auto-generation
});
```

### Custom ID Strategy

Choose your ID generation strategy:

```typescript
// Deterministic hash (recommended for tracking across runs)
parsePlaywrightTest(test, result, { autoIdStrategy: "hash" });

// Random UUID (for one-off analysis)
parsePlaywrightTest(test, result, { autoIdStrategy: "uuid" });

// No auto-generation (annotations required)
parsePlaywrightTest(test, result, { autoIdStrategy: "none" });
```

### Disable Warnings

For production environments where annotations are optional:

```typescript
parsePlaywrightTest(test, result, {
  warnOnMissingAnnotations: false,
});
```

## Integration with Flakiness Detective

This parser is designed to work seamlessly with the [@flakiness-detective/core](../core) package:

```typescript
import { FlakinessDetective } from "@flakiness-detective/core";
import {
  createDataAdapter,
  createEmbeddingProvider,
} from "@flakiness-detective/adapters";
import { parsePlaywrightTest } from "@flakiness-detective/playwright-parser";

// Parse failures in your reporter
class MyReporter implements Reporter {
  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === "failed") {
      const parsed = parsePlaywrightTest(test, result);

      // Store in database for flakiness analysis
      await adapter.saveFailure(parsed);
    }
  }
}

// Later: Run flakiness detection
const detective = new FlakinessDetective(adapter, embeddingProvider);
const clusters = await detective.detect();
```

## Related Packages

- [@flakiness-detective/core](../core) - Core flakiness detection engine
- [@flakiness-detective/adapters](../adapters) - Data adapters and AI providers
- [@flakiness-detective/cli](../cli) - Command-line interface
- [@flakiness-detective/utils](../utils) - Shared utilities

## Testing

This package has comprehensive test coverage (79 tests):

```bash
pnpm test
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT © [Flakiness Detective](https://github.com/prosdev/flakiness-detective-ts)

## Links

- [Documentation](https://flakiness-detective-ts.vercel.app/)
- [GitHub](https://github.com/prosdev/flakiness-detective-ts)
- [Issues](https://github.com/prosdev/flakiness-detective-ts/issues)
- [npm](https://www.npmjs.com/package/@flakiness-detective/playwright-parser)
