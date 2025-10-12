# @flakiness-detective/playwright-parser

> Production-grade Playwright test failure parser with optional metadata tracking

[![npm version](https://img.shields.io/npm/v/@flakiness-detective/playwright-parser.svg)](https://www.npmjs.com/package/@flakiness-detective/playwright-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Parse Playwright test failures with rich error details and optional metadata tracking through annotations.

## Features

- ✅ **Zero Config** - Works immediately without any setup
- 🎯 **Rich Error Parsing** - Extracts matcher, locator, expected/actual values, location, and code snippets
- 🔄 **Hybrid Approach** - Auto-generates test IDs when annotations are missing
- 📊 **Optional Metadata** - Add annotations for enhanced tracking (testCaseId, journeyId)
- 🏭 **Production Tested** - Battle-tested parsing logic from real-world usage
- 📦 **TypeScript First** - Fully typed with comprehensive type definitions
- 🧪 **Well Tested** - Comprehensive test coverage with real Playwright errors

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

## API Reference

### `parsePlaywrightTest(test, result, options?)`

Parses a Playwright test failure into structured data.

**Parameters:**

- `test: TestCase` - The Playwright test case
- `result: TestResult` - The test result (must be 'failed' or 'timedOut')
- `options?: ParserOptions` - Optional configuration

**Returns:** `ParsedTestFailure`

**Example:**

```typescript
const parsed = parsePlaywrightTest(test, result, {
  strict: false, // Don't throw on missing annotations
  warnOnMissingAnnotations: true, // Educate users (default)
  autoIdStrategy: "hash", // Generate deterministic IDs
});
```

### Types

See [full type definitions](./src/types.ts) for complete API documentation.

## Configuration Options

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

## Examples

See [examples directory](./examples) for more usage patterns.

## Related Packages

- [@flakiness-detective/core](../core) - Core flakiness detection engine
- [@flakiness-detective/adapters](../adapters) - Data adapters and AI providers
- [@flakiness-detective/cli](../cli) - Command-line interface

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT © [Flakiness Detective](https://github.com/prosdev/flakiness-detective-ts)

## Links

- [Documentation](https://flakiness-detective-ts.vercel.app/)
- [GitHub](https://github.com/prosdev/flakiness-detective-ts)
- [Issues](https://github.com/prosdev/flakiness-detective-ts/issues)
- [npm](https://www.npmjs.com/package/@flakiness-detective/playwright-parser)
