# AGENTS.md

This document provides comprehensive guidance for AI agents and developers working with the Flakiness Detective TypeScript monorepo.

## Project Overview

**Flakiness Detective** is an AI-powered test flakiness detection and analysis tool that uses semantic embeddings and density-based clustering to identify patterns in test failures. The project is production-ready with support for Playwright, Firestore, and multiple embedding providers.

**Tech Stack:**

- Package manager: pnpm 8.15.4
- Build system: Turborepo
- Linter/Formatter: Biome
- Testing: Vitest (run from root with centralized config)
- CI/CD: GitHub Actions (separate CI and Release workflows)
- Versioning: Changesets
- Node.js: >= 22 (LTS)
- AI Embeddings: Google Generative AI (`text-embedding-004`)
- Clustering: DBSCAN with cosine/euclidean distance

## Repository Structure

```
flakiness-detective-ts/
├── packages/
│   ├── core/              # Core algorithms and detection engine
│   │   ├── src/
│   │   │   ├── flakiness-detective.ts      # Main orchestrator
│   │   │   ├── types.ts                    # Core type definitions
│   │   │   ├── clustering/
│   │   │   │   └── dbscan.ts              # DBSCAN implementation
│   │   │   └── utils/
│   │   │       ├── pattern-extraction.ts   # Playwright error parsing
│   │   │       └── validation.ts          # Input validation
│   │   ├── README.md                      # Comprehensive package docs
│   │   └── tests: 39 passing tests
│   │
│   ├── adapters/          # Data storage and AI provider adapters
│   │   ├── src/
│   │   │   ├── data-adapters/
│   │   │   │   ├── base-adapter.ts
│   │   │   │   ├── in-memory-adapter.ts
│   │   │   │   ├── filesystem-adapter.ts
│   │   │   │   ├── firestore-adapter.ts          # Production Firestore
│   │   │   │   └── playwright-reporter-adapter.ts # Playwright JSON
│   │   │   ├── embedding-providers/
│   │   │   │   ├── base-provider.ts
│   │   │   │   ├── google-genai-provider.ts      # Production embeddings
│   │   │   │   └── mock-provider.ts              # Testing
│   │   │   └── index.ts                          # Factory functions
│   │   └── tests: 7 passing tests
│   │
│   ├── cli/               # Command-line interface
│   │   └── Comprehensive CLI with detect/report commands
│   │
│   ├── utils/             # Shared utilities (Logger, etc.)
│   ├── analyzer/          # Future: Advanced analysis features
│   └── visualization/     # Future: Web dashboards and charts
│
├── .github/workflows/     # CI/CD pipelines
├── biome.json            # Linting and formatting config
├── vitest.config.ts      # Centralized test configuration
├── turbo.json            # Turborepo build orchestration
└── README.md             # Main project documentation
```

All packages are currently marked as `"private": true` by default.

## Setup Commands

```bash
# Install dependencies (required first step)
pnpm install

# Build all packages (required before typecheck)
pnpm build

# Lint all packages
pnpm lint

# Type check all packages (must run AFTER build)
pnpm typecheck

# Run all tests (46 passing tests)
pnpm test

# Watch mode for tests
pnpm test:watch

# Clean all build outputs
pnpm clean
```

## Development Workflow

### Working on a specific package

```bash
# Build a specific package
pnpm -F "@flakiness-detective/core" build

# Watch mode for development
pnpm -F "@flakiness-detective/core" dev

# Run tests for a specific package
cd packages/core && pnpm test:watch
```

### Important: Build Order

Packages with dependencies must be built in order. Turborepo handles this automatically:

1. `@flakiness-detective/utils` - No dependencies (builds first)
2. `@flakiness-detective/core` - Depends on `utils`
3. `@flakiness-detective/adapters` - Depends on `core` and `utils`
4. `@flakiness-detective/cli` - Depends on `core`, `adapters`, and `utils`

**Critical:** Always run `pnpm build` before `pnpm typecheck` because TypeScript needs the built `.d.ts` files from dependencies.

## Package Details

### Core Package (`@flakiness-detective/core`)

**Purpose**: Main detection engine with clustering algorithms

**Key Features**:
- DBSCAN clustering with configurable distance metrics (cosine/euclidean)
- Rich Playwright error parsing (locators, matchers, assertions, timeouts)
- Pattern extraction with 50% frequency threshold
- Deterministic cluster IDs for tracking over time
- Input validation and comprehensive error handling
- Support for GitHub Actions run ID extraction

**Key Files**:
- `flakiness-detective.ts` - Main `FlakinessDetective` class
- `clustering/dbscan.ts` - Clustering implementation
- `utils/pattern-extraction.ts` - Playwright error parsing
- `utils/validation.ts` - Config and input validation
- `types.ts` - Core type definitions

**Configuration**:
```typescript
{
  timeWindow: { days: 7 },
  clustering: {
    epsilon: 0.15,          // Distance threshold (for cosine)
    minPoints: 2,           // DBSCAN minimum points
    minClusterSize: 2,      // Minimum failures per cluster
    distance: 'cosine',     // Distance metric
    maxClusters: 5          // Top N clusters to return
  }
}
```

### Adapters Package (`@flakiness-detective/adapters`)

**Purpose**: Pluggable storage backends and AI providers

**Data Adapters**:
- `InMemoryAdapter` - Fast, ephemeral (testing/development)
- `FilesystemAdapter` - JSON-based persistence with Date serialization
- `FirestoreAdapter` - Production Google Cloud Firestore with batch operations
- `PlaywrightReporterAdapter` - Direct Playwright JSON report integration

**Embedding Providers**:
- `GoogleGenAIProvider` - Production embeddings using `text-embedding-004`
- `MockEmbeddingProvider` - Deterministic embeddings for testing

**Factory Functions**:
- `createDataAdapter(config, logger)` - Creates appropriate adapter
- `createEmbeddingProvider(config, logger)` - Creates appropriate provider

### CLI Package (`@flakiness-detective/cli`)

**Purpose**: Command-line interface for CI/CD integration

**Commands**:
- `detect` - Run flakiness detection
- `report` - Generate reports from saved clusters
- `help` - Show usage information

**Supported Options**:
- Time window configuration
- All clustering options (epsilon, distance, maxClusters, etc.)
- Multiple adapter types (filesystem, firestore, playwright)
- Output formats (console, json)
- Verbose logging

### Utils Package (`@flakiness-detective/utils`)

**Purpose**: Shared utilities across packages

**Exports**:
- `Logger` interface and `createLogger()` factory
- Common utility functions

## Testing Instructions

Tests use Vitest with a centralized configuration at the root (`vitest.config.ts`).

**Test Statistics**:
- Total: 46 passing tests across 4 test suites
- Core package: 39 tests (pattern extraction, clustering, E2E)
- Adapters package: 7 tests (embedding providers)

**Test Locations**:
- `packages/core/src/index.test.ts` - E2E tests
- `packages/core/src/clustering/dbscan.test.ts` - Clustering tests
- `packages/core/src/utils/pattern-extraction.test.ts` - Pattern extraction tests
- `packages/adapters/src/embedding-providers/google-genai-provider.test.ts` - Provider tests

**Running Tests**:
```bash
# Run all tests from root
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
cd packages/core && pnpm test:watch
```

**Test Patterns**:
- Test files: `**/*.test.ts` or `**/*.spec.ts` in `packages/*/src/`
- Tests import directly from source files: `import { fn } from './module'`
- Mock adapters and providers used for E2E tests

## Code Style

- TypeScript strict mode enabled (all packages)
- Biome handles linting and formatting (config in `biome.json`)
- Run `pnpm lint` to check, `pnpm format` to auto-fix
- Conventional Commits enforced via Commitlint
- Husky hooks run typecheck on pre-commit

**Commit Message Format**:

```
type(scope): description

# Examples:
feat(core): add cosine distance support to DBSCAN
fix(adapters): handle Date serialization in Firestore
docs(core): update README with new clustering options
test(core): add E2E tests for Playwright error parsing
chore: update dependencies
```

**Common Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`

## CI/CD Workflows

### CI Workflow (`.github/workflows/ci.yml`)

- **Triggers**: Push to main OR Pull Request to main
- **Node version**: 22.x (LTS)
- **Steps**: Install → Lint → Build → Typecheck → Test
- **Important**: Build runs BEFORE typecheck (required for `.d.ts` files)
- **Status**: All checks passing ✅

### Release Workflow (`.github/workflows/release.yml`)

- **Triggers**: After CI succeeds on main branch (workflow_run)
- **Uses**: Changesets for version management and publishing
- **Status**: Currently inactive (all packages private)
- **To Enable**: Set `"private": false` and add `NPM_TOKEN` secret

## Key Design Patterns

### 1. Adapter Pattern

All storage backends implement the `DataAdapter` interface:

```typescript
interface DataAdapter {
  fetchFailures(days: number): Promise<TestFailure[]>;
  saveClusters(clusters: FailureCluster[]): Promise<void>;
  fetchClusters(limit?: number): Promise<FailureCluster[]>;
}
```

**Benefits**: Easy to swap storage backends, testable with in-memory adapter

### 2. Factory Pattern

Factory functions create adapters and providers based on configuration:

```typescript
const adapter = createDataAdapter({ type: 'firestore', ... }, logger);
const provider = createEmbeddingProvider({ type: 'google', ... }, logger);
```

**Benefits**: Centralized configuration, type-safe creation

### 3. Rich Context Pattern

Pattern extraction creates comprehensive context for embeddings:

```typescript
const context = createRichEmbeddingContext(failure);
// Includes: testTitle, filePath, errorMessage, locator, matcher,
// actualValue, expectedValue, timeout, errorSnippet, etc.
```

**Benefits**: Better semantic clustering, captures Playwright-specific details

### 4. Frequency Threshold Pattern

Cluster analysis uses 50% threshold for identifying common patterns:

```typescript
const threshold = Math.ceil(failures.length * 0.5);
if (locatorCount >= threshold) {
  // This locator appears in >50% of failures
}
```

**Benefits**: Filters noise, identifies truly common patterns

## Production Considerations

### Performance
- Batch operations for Firestore writes
- Configurable `maxClusters` limit (default: 5)
- Efficient DBSCAN implementation
- Embedding generation batching

### Reliability
- Comprehensive input validation
- Graceful error handling and logging
- Date serialization for storage
- Deterministic cluster IDs for tracking

### Scalability
- Time-window filtering reduces dataset size
- Top N cluster limiting prevents overwhelming output
- Configurable clustering sensitivity (epsilon, minPoints)
- Firestore indexing for efficient queries

### Security
- API keys via environment variables (never hardcoded)
- Firestore security rules (implementation-dependent)
- Private packages by default
- Regular dependency audits: `pnpm audit`

## Common Patterns

### Running commands in all packages

```bash
pnpm -r <command>  # Run in all packages
turbo <command>    # Run via Turborepo with caching
```

### Filtering specific packages

```bash
pnpm -F "@flakiness-detective/core" build
pnpm --filter "@flakiness-detective/*" test
```

### Adding dependencies

```bash
# Add to specific package
cd packages/core
pnpm add package-name

# Add to root (for dev dependencies)
pnpm add -w -D package-name
```

## Troubleshooting

**TypeScript errors about missing types:**
- Run `pnpm build` first to generate `.d.ts` files
- Check that dependencies are listed in package.json
- Verify workspace links: `pnpm install`

**Tests not found:**
- Tests must match `packages/**/*.{test,spec}.ts` pattern
- Run from root: `pnpm test` (NOT from package with turbo)

**Build failures:**
- Check dependency order
- Clear cache: `pnpm clean` then `pnpm build`
- Remove node_modules: `pnpm clean && pnpm install`

**Firestore "Timestamp is not a constructor":**
- Use `require("@google-cloud/firestore").Timestamp` in serialization
- Ensure `@google-cloud/firestore` is installed

**Embedding generation fails:**
- Verify `GOOGLE_AI_API_KEY` is set
- Check API quota and rate limits
- Use `MockEmbeddingProvider` for testing

## Migration from Internal Implementation

For teams migrating from the original Lytics internal script:

**Configuration Mapping**:
- `EPSILON: 0.3` → `epsilon: 0.15` (adjusted for cosine distance)
- `MIN_POINTS: 2` → `minPoints: 2` (same)
- `DBSCAN_MIN_CLUSTER_SIZE: 2` → `minClusterSize: 2` (same)
- New: `distance: 'cosine'` (explicit configuration)
- New: `maxClusters: 5` (configurable limit)

**API Changes**:
- Replace direct Firestore queries with `FirestoreAdapter`
- Replace direct `GoogleGenerativeAI` usage with `createEmbeddingProvider()`
- Update cluster field access for new metadata structure

**Benefits**:
- Pluggable architecture for testing
- Better type safety and validation
- More flexible configuration
- CLI tool for ad-hoc analysis
- Comprehensive documentation

## Versioning Strategy

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

**Repository Level** (Git tags):
- **MAJOR** (`v1.0.0` → `v2.0.0`): Breaking changes to APIs or core functionality
- **MINOR** (`v1.0.0` → `v1.1.0`): New features, backward compatible
- **PATCH** (`v1.0.0` → `v1.0.1`): Bug fixes, documentation updates

**Package Level**:
- Individual packages start at `0.1.0`
- Version using Changesets: `pnpm changeset`
- Merge changesets PR to publish (when packages are public)

## Publishing to npm

All packages are `"private": true` by default.

**To publish a package**:

1. In `packages/your-package/package.json`:
   - Change `"private": true` to `"private": false`
   - Add `"publishConfig": { "access": "public" }`
2. Ensure unique package name (e.g., `@your-org/flakiness-detective-core`)
3. Add `NPM_TOKEN` secret in GitHub repo settings
4. Release workflow will publish on next version bump

## Documentation Resources

- **[README.md](README.md)** - Project overview and quick start
- **[packages/core/README.md](packages/core/README.md)** - Detailed core package documentation
- **[ROADMAP.md](ROADMAP.md)** - Future features and development plans
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CLAUDE.md](CLAUDE.md)** - AI assistant configuration

## Support and Community

- 📚 Documentation: See package READMEs
- 🐛 Issues: [GitHub Issues](https://github.com/prosdev/flakiness-detective-ts/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/prosdev/flakiness-detective-ts/discussions)
- 🔒 Security: Report via GitHub Security Advisories
