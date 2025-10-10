# @flakiness-detective/core

Core functionality for detecting flaky tests using AI-powered clustering and pattern analysis.

## Features

- **AI-Powered Clustering**: Uses embedding vectors and DBSCAN algorithm to group similar test failures
- **Pattern Extraction**: Automatically extracts patterns from error messages, stack traces, and test metadata
- **Playwright Support**: Enhanced extraction of Playwright-specific patterns (locators, matchers, assertions)
- **Flexible Configuration**: Configurable distance metrics, clustering parameters, and time windows
- **Type-Safe**: Written in TypeScript with comprehensive type definitions

## Installation

```bash
pnpm add @flakiness-detective/core
```

## Quick Start

```typescript
import { FlakinessDetective } from "@flakiness-detective/core";
import { InMemoryAdapter } from "@flakiness-detective/adapters";
import { MockEmbeddingProvider } from "@flakiness-detective/adapters";

// Create adapters
const dataAdapter = new InMemoryAdapter();
const embeddingProvider = new MockEmbeddingProvider();

// Create detective instance
const detective = new FlakinessDetective(dataAdapter, embeddingProvider, {
  clustering: {
    epsilon: 0.15, // Distance threshold for cosine similarity
    minPoints: 2, // Minimum points to form a dense region
    minClusterSize: 2, // Minimum failures in a cluster
    distance: "cosine", // 'cosine' or 'euclidean'
    maxClusters: 5, // Maximum clusters to return
  },
  timeWindow: {
    days: 7, // Look back 7 days
  },
});

// Detect flaky patterns
const clusters = await detective.detect();

// Each cluster contains:
clusters.forEach((cluster) => {
  console.log(`Cluster: ${cluster.id}`);
  console.log(`Failures: ${cluster.failures.length}`);
  console.log(`Pattern: ${cluster.failurePattern}`);
  console.log(`Assertion: ${cluster.assertionPattern}`);
  console.log(`Common locators: ${cluster.commonPatterns.locators}`);
});
```

## Configuration

### Clustering Options

The clustering algorithm supports two distance metrics:

#### Cosine Distance (Recommended for Embeddings)

```typescript
{
  clustering: {
    epsilon: 0.15,          // Lower values = stricter clustering
    minPoints: 2,           // Minimum points for dense region
    minClusterSize: 2,      // Minimum failures to form a cluster
    distance: 'cosine',     // Standard for semantic similarity
    maxClusters: 5,         // Top N clusters by size
  }
}
```

**Recommended epsilon values for cosine:**

- `0.1`: Very strict (high similarity required)
- `0.15`: Balanced (default)
- `0.2`: Relaxed (finds more diverse patterns)

#### Euclidean Distance

```typescript
{
  clustering: {
    epsilon: 0.5,           // Higher values needed for Euclidean
    minPoints: 2,
    minClusterSize: 2,
    distance: 'euclidean',
    maxClusters: 5,
  }
}
```

**Recommended epsilon values for Euclidean:**

- `0.3`: Very strict
- `0.5`: Balanced
- `0.7`: Relaxed

### Time Window

Control how far back to look for failures:

```typescript
{
  timeWindow: {
    days: 7,  // Look back 7 days (default)
  }
}
```

## Working with Playwright Tests

The core package has enhanced support for Playwright error patterns:

### Example: Playwright Test Failures

```typescript
import type { TestFailure } from "@flakiness-detective/core";

const playwrightFailures: TestFailure[] = [
  {
    id: "failure-1",
    testTitle: "Login button should be visible",
    testFilePath: "tests/auth/login.spec.ts",
    errorMessage: "Error: expect(locator).toBeVisible() failed",
    errorStack: "at tests/auth/login.spec.ts:42:10",
    timestamp: new Date("2024-01-01T10:00:00Z"),
    metadata: {
      locator: "button.login",
      matcher: "toBeVisible",
      timeout: 5000,
      actualValue: "hidden",
      expectedValue: "visible",
      reportLink: "https://github.com/org/repo/actions/runs/123",
      projectName: "E2E Tests",
      suiteName: "Authentication",
    },
  },
];
```

### Extracted Patterns

The detective automatically extracts:

- **Locators**: CSS selectors, XPath, Playwright locators (`getByRole`, `getByText`)
- **Matchers**: Assertion types (`toBeVisible`, `toHaveText`, `toContainText`)
- **Values**: Actual vs. expected values from failed assertions
- **Timeouts**: Timeout durations from error messages
- **Code Snippets**: Relevant code lines from stack traces
- **Run IDs**: GitHub Actions run IDs from report links

### Cluster Output

```typescript
const cluster = {
  id: '2024-01-15-0',
  failures: [...],  // Array of TestFailure objects
  commonPatterns: {
    filePaths: ['tests/auth/login.spec.ts'],
    lineNumbers: [42],
    locators: ['button.login'],
    matchers: ['toBeVisible'],
    timeouts: [5000],
    codeSnippets: ['await expect(page.locator("button.login")).toBeVisible()'],
  },
  metadata: {
    failureCount: 5,
    firstSeen: Date('2024-01-01T10:00:00Z'),
    lastSeen: Date('2024-01-05T15:30:00Z'),
    averageTimeBetweenFailures: 86400000,  // milliseconds
    failureIds: ['failure-1', 'failure-2', ...],
    runIds: ['123', '124', ...],
    failureTimestamps: [Date(...), Date(...), ...],
    errorMessages: ['Error: expect(locator)...', ...],  // Truncated to 200 chars
  },
  failurePattern: 'Common failure at tests/auth/login.spec.ts:42',
  assertionPattern: 'toBeVisible on button.login (5000ms timeout)',
};
```

## Pattern Extraction

### Automatic Pattern Detection

The `extractPatterns` function automatically extracts metadata from error messages and stack traces:

```typescript
import { extractPatterns } from "@flakiness-detective/core";

const failure: TestFailure = {
  id: "1",
  testTitle: "Test",
  testFilePath: "test.spec.ts",
  errorMessage: 'Expected: "Hello" but received: "Goodbye"',
  errorStack: "at test.spec.ts:50:5",
  timestamp: new Date(),
  metadata: {
    reportLink: "https://github.com/org/repo/actions/runs/999",
  },
};

const enhanced = extractPatterns(failure);

console.log(enhanced.metadata);
// {
//   lineNumber: 50,
//   expectedValue: 'Hello',
//   actualValue: 'Goodbye',
//   runId: '999',
//   reportLink: '...',
// }
```

### Rich Embedding Context

The `createRichEmbeddingContext` function generates comprehensive text representations for embedding:

```typescript
import { createRichEmbeddingContext } from "@flakiness-detective/core";

const context = createRichEmbeddingContext(failure);

console.log(context);
// Test: Login button should be visible
// File: tests/auth/login.spec.ts
// Project: E2E Tests
// Suite: Authentication
// Line: 42
// Locator: button.login
// Matcher: toBeVisible
// Actual: "hidden"
// Expected: "visible"
// Timeout: 5000ms
// Code: await expect(page.locator("button.login")).toBeVisible()
// Error: expect(locator).toBeVisible() failed
```

## Validation

The core package validates configuration and inputs:

```typescript
// Invalid configuration throws errors
try {
  new FlakinessDetective(adapter, provider, {
    clustering: {
      epsilon: -0.1, // ❌ Must be > 0
      minPoints: 0, // ❌ Must be >= 1
      minClusterSize: 0, // ❌ Must be >= 1
    },
  });
} catch (error) {
  console.error(error.message);
  // "clustering.epsilon must be greater than 0"
}
```

## API Reference

### `FlakinessDetective`

Main class for detecting flaky tests.

#### Constructor

```typescript
constructor(
  dataAdapter: DataAdapter,
  embeddingProvider: EmbeddingProvider,
  config?: Partial<FlakinessDetectiveConfig>,
  logLevel?: 'info' | 'debug' | 'warn' | 'error'
)
```

#### Methods

- `detect(): Promise<FailureCluster[]>` - Detect flaky test patterns
- `getClusters(limit?: number): Promise<FailureCluster[]>` - Retrieve saved clusters

### Functions

- `extractPatterns(failure: TestFailure): TestFailure` - Extract patterns from error messages
- `createRichEmbeddingContext(failure: TestFailure): string` - Create rich text for embeddings
- `extractRunId(reportLink: string): string | undefined` - Extract GitHub run ID from URL
- `clusterFailures(failures: EmbeddedFailure[], options: ClusteringOptions): FailureCluster[]` - Cluster failures using DBSCAN

## Migration from Original Implementation

If you're migrating from the original Lytics implementation:

### Configuration Changes

| Original            | New                  | Notes                     |
| ------------------- | -------------------- | ------------------------- |
| `epsilon: 0.3`      | `epsilon: 0.15`      | Lower for cosine distance |
| N/A                 | `distance: 'cosine'` | Now configurable          |
| `minClusterSize: 3` | `minClusterSize: 2`  | More sensitive            |
| Top 5 hardcoded     | `maxClusters: 5`     | Now configurable          |

### Data Structure Changes

The `FailureCluster` interface now includes:

- `metadata.failureIds`: Array of failure document IDs
- `metadata.runIds`: Array of GitHub run IDs
- `metadata.failureTimestamps`: Array of failure timestamps
- `metadata.errorMessages`: Array of truncated error messages (200 chars)
- `failurePattern`: Human-readable pattern description
- `assertionPattern`: Playwright assertion pattern description

### Backward Compatibility

Existing cluster data is backward compatible. New fields will be empty arrays or undefined for old clusters.

## TypeScript Types

```typescript
interface TestFailure {
  id: string;
  testTitle: string;
  testFilePath: string;
  errorMessage: string;
  errorStack?: string;
  timestamp: Date;
  metadata?: TestFailureMetadata;
}

interface TestFailureMetadata {
  errorSnippet?: string;
  lineNumber?: number;
  projectName?: string;
  suiteName?: string;
  locator?: string;
  matcher?: string;
  timeout?: number;
  framework?: string;
  actualValue?: string;
  expectedValue?: string;
  runId?: string;
  reportLink?: string;
}

interface FailureCluster {
  id: string;
  failures: TestFailure[];
  commonPatterns: {
    filePaths: string[];
    lineNumbers: number[];
    codeSnippets: string[];
    locators: string[];
    matchers: string[];
    timeouts: number[];
  };
  metadata: {
    failureCount: number;
    firstSeen: Date;
    lastSeen: Date;
    averageTimeBetweenFailures?: number;
    failureIds: string[];
    runIds: string[];
    failureTimestamps: Date[];
    errorMessages: string[];
  };
  failurePattern?: string;
  assertionPattern?: string;
}
```

## License

MIT
