# @flakiness-detective/playwright-parser

## 0.1.0

### Minor Changes

- c392524: Initial release of @flakiness-detective/playwright-parser - production-grade Playwright test failure parser with optional metadata tracking.

  ## Features

  - **Zero-config parsing**: Works immediately without any setup or configuration
  - **Rich error extraction**: Parses matcher, locator, expected/actual values, location, and code snippets
  - **Hybrid annotation support**: Auto-generates deterministic test IDs when annotations are missing
  - **Optional metadata tracking**: Supports testCaseId, journeyId, testSuiteName, and custom annotations
  - **Multiple ID strategies**: Hash-based (deterministic), UUID (random), or none (strict mode)
  - **ANSI code cleaning**: Removes terminal escape codes for clean storage
  - **Production-tested logic**: Ported from battle-tested internal reporter
  - **Comprehensive tests**: 79 passing tests with real Playwright error samples
  - **Full TypeScript support**: Complete type definitions for all interfaces

  ## Usage

  ```typescript
  import { parsePlaywrightTest } from "@flakiness-detective/playwright-parser";

  // Works immediately - no configuration needed
  const parsed = parsePlaywrightTest(test, result);

  // Access structured error details
  console.log(parsed.error.matcher); // 'toBeVisible'
  console.log(parsed.error.locator); // 'button[name="Submit"]'
  console.log(parsed.metadata.testCaseId); // 'auto-a3f7b9c4' (auto-generated)
  ```

  ## Progressive Enhancement

  The parser implements a "progressive enhancement" strategy:

  1. **Tier 1 (Zero Config)**: Works immediately with auto-generated IDs
  2. **Tier 2 (Enhanced Tracking)**: Add optional annotations for better insights
  3. **Tier 3 (Strict Mode)**: Enforce annotations in CI/CD for consistent data

  This approach ensures users get value in 30 seconds, not 30 hours.

  ## Documentation

  - Full README with API reference and examples
  - Website documentation at /docs/playwright-parser
  - 79 comprehensive tests demonstrating usage patterns
  - Integration examples with @flakiness-detective/core

  ## Related

  Closes #2

## 0.1.0 (Unreleased)

### Features

- Initial release of Playwright parser package
- Production-grade error parsing with matcher, locator, expected/actual extraction
- Hybrid annotation support (optional testCaseId, journeyId, testSuiteName)
- Auto-generated test IDs when annotations are missing
- Strict mode for enforcing annotations
- ANSI code cleaning and snippet extraction
- Comprehensive type definitions
- Full TypeScript support

### Documentation

- README with quick start and API reference
- Examples for basic and advanced usage
- Best practices guide for annotations
