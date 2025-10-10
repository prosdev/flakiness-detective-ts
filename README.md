# Flakiness Detective

[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8.15.4-orange.svg)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An AI-powered test flakiness detection and analysis tool that helps identify and resolve flaky tests in your CI/CD pipeline using semantic embeddings and density-based clustering.

## ✨ Key Features

### 🔍 Advanced Flakiness Detection
- **AI-Powered Analysis**: Uses semantic embeddings to understand test failure patterns beyond simple text matching
- **DBSCAN Clustering**: Groups similar failures using density-based clustering with configurable distance metrics (cosine/euclidean)
- **Rich Pattern Extraction**: Automatically extracts patterns from Playwright error messages including:
  - Locators and matchers
  - Actual vs expected values
  - Timeouts and line numbers
  - GitHub Actions run IDs
  - Error snippets and stack traces
- **Frequency Analysis**: Identifies common patterns across test failures with 50% threshold for cluster identification
- **Deterministic Cluster IDs**: Stable, reproducible cluster identifiers for tracking over time

### 🔌 Flexible Adapters

#### Data Adapters
- **In-Memory**: Fast, ephemeral storage for development
- **Filesystem**: JSON-based persistence with automatic Date serialization
- **Firestore**: Production-ready Google Cloud Firestore integration
- **Playwright Reporter**: Direct integration with Playwright JSON reports

#### Embedding Providers
- **Google Generative AI**: Production-ready embeddings using `text-embedding-004`
- **Mock Provider**: Fast, deterministic embeddings for testing

### 📊 Configuration Options

#### Clustering Configuration
- `epsilon`: DBSCAN distance threshold (default: 0.15 for cosine)
- `minPoints`: Minimum neighbors for core points (default: 2)
- `minClusterSize`: Minimum failures per cluster (default: 2)
- `distance`: Distance metric - `cosine` (default) or `euclidean`
- `maxClusters`: Maximum clusters to return (default: 5)

#### Time Window
- `days`: Number of days to look back for failures (default: 7)

### 🎯 Production-Ready

- **Input Validation**: Comprehensive validation for configs and data
- **Type Safety**: Full TypeScript support with strict mode
- **Error Handling**: Graceful degradation and detailed error messages
- **Testing**: Extensive unit and E2E test coverage
- **Documentation**: Complete API documentation and examples

## 📦 Project Structure

```
flakiness-detective-ts/
├── packages/
│   ├── core/            # Core algorithms and interfaces
│   │   ├── src/
│   │   │   ├── flakiness-detective.ts    # Main detection orchestrator
│   │   │   ├── types.ts                  # Core type definitions
│   │   │   ├── clustering/
│   │   │   │   └── dbscan.ts            # DBSCAN implementation
│   │   │   └── utils/
│   │   │       ├── pattern-extraction.ts # Playwright error parsing
│   │   │       └── validation.ts        # Input validation
│   │   └── README.md                    # Core package documentation
│   ├── adapters/        # Data storage and AI provider adapters
│   │   ├── src/
│   │   │   ├── data-adapters/
│   │   │   │   ├── filesystem-adapter.ts
│   │   │   │   ├── firestore-adapter.ts
│   │   │   │   ├── in-memory-adapter.ts
│   │   │   │   └── playwright-reporter-adapter.ts
│   │   │   └── embedding-providers/
│   │   │       ├── google-genai-provider.ts
│   │   │       └── mock-provider.ts
│   ├── cli/             # Command-line interface
│   ├── utils/           # Shared utilities
│   ├── analyzer/        # Test analysis (future)
│   └── visualization/   # Visualization tools (future)
├── .github/             # GitHub Actions CI/CD
├── biome.json           # Linting and formatting config
└── vitest.config.ts     # Test configuration
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v22 LTS or higher
- [PNPM](https://pnpm.io/) v8 or higher
- Google Generative AI API key (for production embeddings)

### Installation

```bash
# Clone the repository
git clone https://github.com/prosdev/flakiness-detective-ts.git
cd flakiness-detective-ts

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Basic Usage

#### Using the Core Package

```typescript
import { FlakinessDetective } from '@flakiness-detective/core';
import {
  createDataAdapter,
  createEmbeddingProvider,
} from '@flakiness-detective/adapters';
import { createLogger } from '@flakiness-detective/utils';

// Create logger
const logger = createLogger({ level: 'info' });

// Create data adapter (Firestore example)
const dataAdapter = createDataAdapter(
  {
    type: 'firestore',
    firestoreDb: admin.firestore(), // Your Firestore instance
  },
  logger
);

// Create embedding provider
const embeddingProvider = createEmbeddingProvider(
  {
    type: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
  logger
);

// Create and run detective
const detective = new FlakinessDetective(
  dataAdapter,
  embeddingProvider,
  {
    timeWindow: { days: 7 },
    clustering: {
      epsilon: 0.15,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
      maxClusters: 5,
    },
  },
  'info'
);

const clusters = await detective.detect();
console.log(`Found ${clusters.length} flaky test clusters`);
```

#### Reading Playwright JSON Reports

```typescript
import { PlaywrightReporterAdapter } from '@flakiness-detective/adapters';
import { createLogger } from '@flakiness-detective/utils';

const logger = createLogger({ level: 'info' });

// Create adapter pointing to Playwright JSON report
const adapter = new PlaywrightReporterAdapter(
  {
    reportPath: './test-results/results.json',
    runId: process.env.GITHUB_RUN_ID,
    reportLink: `https://github.com/org/repo/actions/runs/${process.env.GITHUB_RUN_ID}`,
  },
  logger
);

// Fetch failures from the last 7 days
const failures = await adapter.fetchFailures(7);
console.log(`Found ${failures.length} test failures`);
```

#### Using CLI

```bash
# Detect flakiness from Playwright reports
flakiness-detective detect \
  --adapter playwright \
  --adapter-path ./test-results/results.json \
  --embedding google \
  --api-key YOUR_API_KEY \
  --max-clusters 10

# Generate report from saved clusters
flakiness-detective report \
  --adapter firestore \
  --output-format json \
  --output-path ./flakiness-report.json

# Enable debug mode for detailed logging and performance metrics
flakiness-detective detect \
  --adapter playwright \
  --adapter-path ./test-results/results.json \
  --embedding google \
  --api-key YOUR_API_KEY \
  --verbose
```

> **💡 Tip:** Use `--verbose` to enable debug mode with timestamps, execution times, API usage stats, and cluster quality metrics.

### Configuration Files

Flakiness Detective supports configuration files to simplify setup and avoid repetitive CLI arguments. Config files are discovered automatically in the current directory or parent directories.

#### Supported Config Files (in priority order)

1. **`.flakinessrc.json`** - JSON configuration (recommended)
2. **`.flakinessrc.js`** - JavaScript configuration
3. **`flakiness-detective.config.js`** - Alternative JS config
4. **`.flakinessrc.ts`** - TypeScript configuration
5. **`flakiness-detective.config.ts`** - Alternative TS config
6. **`package.json`** - Inline config in `flakinessDetective` field

#### Example: `.flakinessrc.json`

```json
{
  "timeWindow": {
    "days": 7
  },
  "adapter": {
    "type": "playwright",
    "reportPath": "./test-results/results.json"
  },
  "embedding": {
    "type": "google",
    "apiKey": "${GOOGLE_AI_API_KEY}"
  },
  "clustering": {
    "epsilon": 0.15,
    "minPoints": 2,
    "minClusterSize": 2,
    "distance": "cosine",
    "maxClusters": 5
  },
  "output": {
    "format": "console"
  },
  "verbose": false
}
```

#### Example: `flakiness-detective.config.ts`

```typescript
import type { FlakinessDetectiveConfigFile } from '@flakiness-detective/cli';

const config: FlakinessDetectiveConfigFile = {
  timeWindow: { days: 14 },
  adapter: {
    type: 'firestore',
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    failuresCollection: 'test_failures',
    clustersCollection: 'flaky_clusters',
  },
  embedding: {
    type: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
  clustering: {
    epsilon: 0.15,
    distance: 'cosine',
    maxClusters: 10,
  },
  output: {
    format: 'json',
    path: './flakiness-report.json',
  },
  verbose: true,
};

export default config;
```

#### Example: `package.json` inline config

```json
{
  "name": "my-project",
  "flakinessDetective": {
    "timeWindow": { "days": 7 },
    "adapter": {
      "type": "playwright",
      "reportPath": "./test-results/results.json"
    },
    "embedding": {
      "type": "google",
      "apiKey": "${GOOGLE_AI_API_KEY}"
    },
    "clustering": {
      "epsilon": 0.15,
      "maxClusters": 5
    }
  }
}
```

#### CLI Arguments Override Config Files

When both a config file and CLI arguments are provided, CLI arguments take precedence:

```bash
# Uses config file but overrides epsilon and maxClusters
flakiness-detective detect \
  --epsilon 0.2 \
  --max-clusters 10
```

#### Config Validation

Config files are validated automatically with helpful error messages:

```
Config validation error in .flakinessrc.json:
  Invalid clustering.epsilon: must be a positive number
  Details: Got: -0.1
```

## 📘 Documentation

### Package Documentation

- **[Core Package README](packages/core/README.md)**: Complete guide to the core package, including:
  - Detailed configuration options
  - Playwright-specific examples
  - Pattern extraction details
  - API reference
  - Migration guide from internal implementation
- **[CLI Package README](packages/cli/README.md)**: Command-line interface guide, including:
  - CLI commands and options
  - Configuration file formats and examples
  - CI/CD integration examples
  - Programmatic usage
  - Troubleshooting guide

### Project Documentation

- **[ROADMAP.md](ROADMAP.md)**: Future development plans and features
- **[AGENTS.md](AGENTS.md)**: Repository structure and monorepo guidelines
- **[CLAUDE.md](CLAUDE.md)**: AI assistant configuration and project context
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: How to contribute to this project

## 🔧 Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a specific package
cd packages/core && pnpm test
```

### Linting and Formatting

```bash
# Lint all packages
pnpm lint

# Format all packages
pnpm format

# Type check
pnpm typecheck
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm -F "@flakiness-detective/core" build

# Clean build outputs
pnpm clean
```

### Package Development

```bash
# Watch mode for a package
pnpm -F "@flakiness-detective/core" dev

# Add a dependency to a package
cd packages/core
pnpm add package-name
```

## 🏗️ Architecture

### Detection Pipeline

1. **Fetch Failures**: Data adapter retrieves test failures from the last N days
2. **Extract Patterns**: Parse error messages, stack traces, and metadata
3. **Generate Embeddings**: Convert rich context into vector representations
4. **Cluster Failures**: Group similar failures using DBSCAN
5. **Analyze Clusters**: Calculate frequency thresholds and identify patterns
6. **Persist Results**: Save clusters with deterministic IDs for tracking

### Key Components

#### FlakinessDetective
Main orchestrator that runs the detection pipeline end-to-end.

#### Data Adapters
Pluggable storage backends implementing the `DataAdapter` interface:
- `fetchFailures(days)`: Retrieve test failures
- `saveClusters(clusters)`: Persist cluster results
- `fetchClusters(limit)`: Retrieve saved clusters

#### Embedding Providers
AI services implementing the `EmbeddingProvider` interface:
- `generateEmbeddings(contexts)`: Convert text to vector embeddings

#### Pattern Extraction
Parses Playwright error messages to extract:
- Structured error maps (actual, expected, locator, matcher, timeout)
- Assertion details from code snippets
- GitHub Actions run IDs from report links
- Line numbers, error snippets, and stack traces

## 🧪 Testing

This project has comprehensive test coverage:

- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: Data adapters and embedding providers
- **E2E Tests**: Full detection pipeline with mock data

Test files follow the pattern `*.test.ts` and are located next to source files.

## 📊 Example Output

### Cluster Structure

```typescript
{
  id: "2024-W42-0",
  failureCount: 15,
  failurePattern: "Locator(role=button[name='Submit']) (75%)",
  assertionPattern: "toBeVisible on role=button[name='Submit'] (5000ms timeout) (80%)",
  metadata: {
    failureCount: 15,
    firstSeen: "2024-10-14T08:30:00Z",
    lastSeen: "2024-10-20T14:22:00Z",
    failureIds: ["test-1", "test-2", ...],
    runIds: ["123456", "123457", ...],
    failureTimestamps: [...],
    errorMessages: [
      "Locator(role=button[name='Submit']) failed: locator.click: Timeout 5000ms exceeded...",
      ...
    ]
  },
  commonPatterns: {
    filePaths: ["tests/checkout.spec.ts"],
    lineNumbers: [45, 46],
    locators: ["role=button[name='Submit']"],
    matchers: ["toBeVisible"],
    timeouts: [5000]
  }
}
```

## 🔄 CI/CD

### GitHub Actions Workflows

- **CI Workflow**: Runs on every push and PR
  - Installs dependencies
  - Lints code (Biome)
  - Builds packages (TypeScript)
  - Type checks
  - Runs tests (Vitest)

- **Release Workflow**: Runs after CI succeeds on main
  - Uses Changesets for version management
  - Publishes to npm (when packages are not private)

## 📝 Making Changes

1. Create a feature branch
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes following [Conventional Commits](https://www.conventionalcommits.org/)
   ```bash
   git commit -m "feat(core): add new clustering algorithm"
   ```

3. Add a changeset
   ```bash
   pnpm changeset
   ```

4. Push and create a PR
   ```bash
   git push origin feature/my-feature
   ```

## 🚀 Publishing to npm

By default, all packages are `"private": true`. To publish:

1. Set `"private": false` in package.json
2. Add `"publishConfig": { "access": "public" }`
3. Add `NPM_TOKEN` secret in GitHub
4. Merge changeset PR to publish

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgments

This project is based on an internal implementation developed at Lytics for detecting flaky Playwright tests in CI/CD pipelines. It has been open-sourced and enhanced with:

- Pluggable adapter architecture
- Multiple distance metrics
- Enhanced pattern extraction
- Comprehensive testing
- Full TypeScript support

## 📧 Support

- 📚 Documentation: See [packages/core/README.md](packages/core/README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/prosdev/flakiness-detective-ts/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/prosdev/flakiness-detective-ts/discussions)
