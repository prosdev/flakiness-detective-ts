# @flakiness-detective/adapters

Pluggable adapters for data storage and AI embedding providers for Flakiness Detective.

## Overview

This package provides the adapter layer for Flakiness Detective, allowing you to:

- Store and retrieve test failures and cluster data from multiple backends
- Generate embeddings using different AI providers
- Easily switch between adapters without changing core logic

## Data Adapters

### In-Memory Adapter

Fast, ephemeral storage for testing and development.

```typescript
import { InMemoryAdapter } from "@flakiness-detective/adapters";

const adapter = new InMemoryAdapter();
```

**Use cases**: Unit tests, development, temporary analysis

### Filesystem Adapter

JSON-based persistence with automatic Date serialization.

```typescript
import { FilesystemAdapter } from "@flakiness-detective/adapters";
import { createLogger } from "@flakiness-detective/utils";

const adapter = new FilesystemAdapter(
  { basePath: "./flakiness-data" },
  createLogger({ level: "info" })
);
```

**Use cases**: Simple persistence, local development, CI artifacts

### Firestore Adapter

Production-ready Google Cloud Firestore integration.

```typescript
import { FirestoreAdapter } from "@flakiness-detective/adapters";
import { createLogger } from "@flakiness-detective/utils";
import * as admin from "firebase-admin";

admin.initializeApp();

const adapter = new FirestoreAdapter(
  {
    firestoreDb: admin.firestore(),
    failuresCollection: "test_failures",
    clustersCollection: "flaky_clusters",
  },
  createLogger({ level: "info" })
);
```

**Use cases**: Production deployments, shared team data, historical tracking

### Playwright Reporter Adapter

Direct integration with Playwright JSON reports.

```typescript
import { PlaywrightReporterAdapter } from "@flakiness-detective/adapters";
import { createLogger } from "@flakiness-detective/utils";

const adapter = new PlaywrightReporterAdapter(
  {
    reportPath: "./test-results/report.json",
    runId: process.env.GITHUB_RUN_ID,
    reportLink: process.env.GITHUB_RUN_URL,
  },
  createLogger({ level: "info" })
);
```

**Use cases**: CI/CD integration, Playwright-specific analysis

## Embedding Providers

### Google Generative AI Provider

Production-ready embeddings using Google's `text-embedding-004` model.

```typescript
import { GoogleGenAIProvider } from "@flakiness-detective/adapters";
import { createLogger } from "@flakiness-detective/utils";

const provider = new GoogleGenAIProvider(
  {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: "text-embedding-004",
  },
  createLogger({ level: "info" })
);
```

**Features**:

- 768-dimensional embeddings
- Batch processing support
- Rate limiting and error handling

### Mock Embedding Provider

Deterministic embeddings for testing.

```typescript
import { MockEmbeddingProvider } from "@flakiness-detective/adapters";

const provider = new MockEmbeddingProvider();
```

**Use cases**: Unit tests, E2E tests, development without API keys

## Factory Functions

Convenient factory functions for creating adapters dynamically:

```typescript
import {
  createDataAdapter,
  createEmbeddingProvider,
} from "@flakiness-detective/adapters";
import { createLogger } from "@flakiness-detective/utils";

const logger = createLogger({ level: "info" });

// Create data adapter
const dataAdapter = createDataAdapter(
  {
    type: "firestore",
    firestoreDb: admin.firestore(),
  },
  logger
);

// Create embedding provider
const embeddingProvider = createEmbeddingProvider(
  {
    type: "google",
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
  logger
);
```

## Creating Custom Adapters

### Custom Data Adapter

Extend `BaseDataAdapter` to create your own storage backend:

```typescript
import { BaseDataAdapter } from "@flakiness-detective/adapters";
import type { TestFailure, FailureCluster } from "@flakiness-detective/core";
import type { Logger } from "@flakiness-detective/utils";

export class MyCustomAdapter extends BaseDataAdapter {
  constructor(config: MyConfig, logger: Logger) {
    super();
    // Initialize your adapter
  }

  async fetchFailures(days: number): Promise<TestFailure[]> {
    // Fetch from your backend
  }

  async saveClusters(clusters: FailureCluster[]): Promise<void> {
    // Save to your backend
  }

  async fetchClusters(limit?: number): Promise<FailureCluster[]> {
    // Retrieve from your backend
  }
}
```

### Custom Embedding Provider

Implement the `EmbeddingProvider` interface:

```typescript
import type { EmbeddingProvider } from "@flakiness-detective/adapters";

export class MyCustomProvider implements EmbeddingProvider {
  async generateEmbeddings(contexts: string[]): Promise<number[][]> {
    // Generate embeddings using your service
    return contexts.map((context) => {
      // Return embedding vector for each context
      return new Array(768).fill(0); // Replace with actual embeddings
    });
  }
}
```

## API Reference

### DataAdapter Interface

```typescript
interface DataAdapter {
  fetchFailures(days: number): Promise<TestFailure[]>;
  saveClusters(clusters: FailureCluster[]): Promise<void>;
  fetchClusters(limit?: number): Promise<FailureCluster[]>;
}
```

### EmbeddingProvider Interface

```typescript
interface EmbeddingProvider {
  generateEmbeddings(contexts: string[]): Promise<number[][]>;
}
```

## Environment Variables

```bash
# Google Generative AI
GOOGLE_AI_API_KEY=your_api_key_here

# Firestore (if using service account)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## Custom Schema Integration

If you have an existing test reporter writing to Firestore with a custom schema, you can integrate it with Flakiness Detective using custom field mapping.

### Use Case

You already have a Playwright reporter (or other test framework) that writes test results to Firestore. Instead of changing your reporter, you can configure Flakiness Detective to read from your existing collection.

### Configuration

```typescript
import { createDataAdapter } from '@flakiness-detective/adapters';
import * as admin from 'firebase-admin';

admin.initializeApp({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const adapter = createDataAdapter({
  type: 'firestore',
  firestoreDb: admin.firestore(),
  failuresCollection: 'your_test_failures',  // Your existing collection
  clustersCollection: 'flaky_clusters',      // Where to write results
  customSchema: {
    fieldMapping: {
      // Map your fields to Flakiness Detective format
      id: 'yourIdField',
      testTitle: 'yourTitleField',
      testFile: 'yourFileField',          // Optional, uses dot notation for nested
      errorMessage: 'yourErrorField',      // Can be nested: 'error.message'
      errorStack: 'yourStackField',        // Optional
      timestamp: 'yourTimestampField',
      metadata: {
        // Additional metadata fields to track
        runId: 'yourRunIdField',
        reportLink: 'yourLinkField',
        duration: 'yourDurationField',
        // ... any other custom fields
      },
    },
    // Optional: Filter to only analyze failures
    failureFilter: {
      field: 'status',
      operator: '==',
      value: 'failed',
    },
  },
}, logger);
```

### Nested Field Mapping

Use dot notation to access nested fields:

```json
{
  "testId": "TC001",
  "info": {
    "title": "should display profile",
    "file": "tests/profile.spec.ts"
  },
  "error": {
    "message": "Element not found",
    "details": {
      "locator": "button[name='Profile']"
    }
  }
}
```

Map it like:
```typescript
fieldMapping: {
  id: 'testId',
  testTitle: 'info.title',
  testFile: 'info.file',
  errorMessage: 'error',  // Will extract structured error
  timestamp: 'runTime',
}
```

### Structured Error Objects

If your error field is an object (common in Playwright reporters):

```json
{
  "errorMessage": {
    "message": "Element not found",
    "matcher": "toBeVisible",
    "expected": "visible",
    "actual": "hidden",
    "locator": "role=button",
    "snippet": ["line 1", "line 2"]
  }
}
```

The adapter will automatically:
- Extract `message`, `matcher`, `expected`, `actual`, `locator`
- Build a rich error message with all details
- Use `snippet` array as the error stack

### Filter Operators

Supported operators for `failureFilter`:

- `'=='` - Equal to
- `'!='` - Not equal to
- `'<'`, `'<='`, `'>'`, `'>='` - Comparison
- `'in'` - Value in array: `{ field: 'status', operator: 'in', value: ['failed', 'timedOut'] }`
- `'not-in'` - Value not in array
- `'array-contains'` - Array contains value

### Complete Example

```typescript
// detect-flakiness.ts
import { FlakinessDetective } from '@flakiness-detective/core';
import { createDataAdapter, createEmbeddingProvider } from '@flakiness-detective/adapters';
import { createLogger } from '@flakiness-detective/utils';
import * as admin from 'firebase-admin';

admin.initializeApp();
const logger = createLogger({ level: 'info' });

const dataAdapter = createDataAdapter({
  type: 'firestore',
  firestoreDb: admin.firestore(),
  failuresCollection: 'individual_test_runs',
  customSchema: {
    fieldMapping: {
      id: 'testCaseId',
      testTitle: 'title',
      testFile: 'errorMessage.location.file',
      errorMessage: 'errorMessage',
      timestamp: 'runTimestamp',
      metadata: {
        projectName: 'projectName',
        runId: 'buildId',
        reportLink: 'reportLink',
        duration: 'durationMs',
      },
    },
    failureFilter: {
      field: 'status',
      operator: 'in',
      value: ['failed', 'timedOut'],
    },
  },
}, logger);

const embeddingProvider = createEmbeddingProvider({
  type: 'google',
  apiKey: process.env.GOOGLE_AI_API_KEY,
}, logger);

const detective = new FlakinessDetective(
  dataAdapter,
  embeddingProvider,
  { timeWindow: { days: 7 } },
  'info'
);

const clusters = await detective.detect();
console.log(`Found ${clusters.length} flaky patterns`);
```

### Using with CLI

Create `.flakinessrc.json`:

```json
{
  "adapter": {
    "type": "firestore",
    "failuresCollection": "your_collection",
    "customSchema": {
      "fieldMapping": {
        "id": "yourIdField",
        "testTitle": "yourTitleField",
        "errorMessage": "yourErrorField",
        "timestamp": "yourTimestampField"
      },
      "failureFilter": {
        "field": "status",
        "operator": "==",
        "value": "failed"
      }
    }
  },
  "embedding": {
    "type": "google"
  }
}
```

Run: `npx flakiness-detective detect --time-window 7`

## Related Packages

- **@flakiness-detective/core** - Core detection engine ([docs](../core/README.md))
- **@flakiness-detective/cli** - Command-line interface ([docs](../cli/README.md))
- **@flakiness-detective/utils** - Shared utilities

## License

MIT
