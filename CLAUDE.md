# CLAUDE.md

This file provides configuration and guidance for Claude (and other AI assistants) when working with the Flakiness Detective TypeScript monorepo.

## Project Overview

**Flakiness Detective** is a production-ready, AI-powered test flakiness detection tool that uses semantic embeddings and density-based clustering (DBSCAN) to identify patterns in test failures. It was originally developed internally at Lytics for Playwright test analysis and has been open-sourced with enhanced features.

**Current Status**: ✅ Production-ready with 46 passing tests

## Architecture Overview

### Core Components

1. **Detection Engine** (`@flakiness-detective/core`)
   - DBSCAN clustering with cosine/euclidean distance
   - Rich Playwright error parsing and pattern extraction
   - Deterministic cluster IDs and frequency analysis
   - Comprehensive input validation

2. **Adapters** (`@flakiness-detective/adapters`)
   - **Data Adapters**: In-Memory, Filesystem, Firestore, Playwright Reporter
   - **Embedding Providers**: Google Generative AI, Mock Provider
   - Factory functions for easy instantiation

3. **CLI** (`@flakiness-detective/cli`)
   - Commands: `detect`, `report`, `help`
   - Support for all configuration options
   - Multiple output formats (console, JSON)

4. **Utilities** (`@flakiness-detective/utils`)
   - Logger with configurable levels
   - Shared helper functions

## Package Structure and Dependencies

```
@flakiness-detective/utils (no dependencies)
    ↓
@flakiness-detective/core (depends on utils)
    ↓
@flakiness-detective/adapters (depends on core, utils)
    ↓
@flakiness-detective/cli (depends on core, adapters, utils)
```

**Important**: Always build packages in dependency order. Run `pnpm build` before `pnpm typecheck`.

## Project Commands

### Essential Commands

```bash
# Install dependencies (first step always)
pnpm install

# Build all packages (REQUIRED before typecheck)
pnpm build

# Type check (must run AFTER build)
pnpm typecheck

# Lint and format
pnpm lint
pnpm format

# Run tests (46 passing tests)
pnpm test

# Watch mode for development
pnpm test:watch

# Clean build artifacts
pnpm clean
```

### Package-Specific Commands

```bash
# Build specific package
pnpm -F "@flakiness-detective/core" build

# Watch mode for development
pnpm -F "@flakiness-detective/core" dev

# Run tests for specific package
cd packages/core && pnpm test:watch
```

## Key Technical Details

### Clustering Configuration

The core package uses DBSCAN with these defaults (tuned for Playwright error clustering):

```typescript
{
  epsilon: 0.15,          // Distance threshold (optimized for cosine)
  minPoints: 2,           // DBSCAN minimum neighbors
  minClusterSize: 2,      // Minimum failures to form cluster
  distance: 'cosine',     // Distance metric (better for embeddings)
  maxClusters: 5          // Top N clusters by size
}
```

**Why cosine distance?**
- Better for semantic embeddings (normalized vectors)
- Captures angle similarity, not magnitude
- Original implementation implicitly used cosine via dot product

**Why epsilon 0.15?**
- Adjusted from original 0.3 for explicit cosine distance
- Tighter threshold for more precise clusters
- Validated through testing with real Playwright errors

### Pattern Extraction

The core package extracts rich context from Playwright errors:

**Structured Fields**:
- `locator` - Playwright locator string (e.g., `role=button[name='Submit']`)
- `matcher` - Assertion matcher (e.g., `toBeVisible`, `toContainText`)
- `actualValue` - Actual value from assertion failure
- `expectedValue` - Expected value from assertion
- `timeout` - Timeout value from assertion
- `lineNumber` - Source line number
- `errorSnippet` - Code snippet showing failure

**Derived Fields**:
- `runId` - GitHub Actions run ID (extracted from report link)
- `failurePattern` - Summary of common failure patterns (e.g., "Locator(button) (75%)")
- `assertionPattern` - Summary of common assertions (e.g., "toBeVisible on button (80%)")

**Frequency Threshold**: 50% - A pattern must appear in >50% of cluster members to be considered "common"

### Data Adapters

#### FirestoreAdapter
- **Use**: Production persistence
- **Features**: Batch operations, Date/Timestamp serialization, cleanup utilities
- **Collections**: `test_failures`, `flaky_clusters` (configurable)

#### PlaywrightReporterAdapter  
- **Use**: Direct Playwright JSON report integration
- **Features**: Reads single files or directories, extracts GitHub run IDs
- **Note**: Read-only (doesn't support saveClusters/fetchClusters)

#### FilesystemAdapter
- **Use**: Development, simple persistence
- **Features**: JSON files with proper Date serialization

#### InMemoryAdapter
- **Use**: Testing, ephemeral storage
- **Features**: Fast, no I/O, perfect for unit tests

### Embedding Providers

#### GoogleGenAIProvider
- **Model**: `text-embedding-004` (768 dimensions)
- **Features**: Batching, rate limiting, configurable task types
- **Config**: Requires `GOOGLE_AI_API_KEY` env var or explicit API key

#### MockEmbeddingProvider
- **Use**: Testing, deterministic results
- **Features**: Hash-based embeddings, no API calls, fast

## Development Workflows

### Adding a New Feature

1. **Determine package**: Core for algorithms, adapters for integrations, CLI for commands
2. **Create types** in `types.ts` if needed
3. **Implement functionality** with proper TypeScript types
4. **Add tests** in adjacent `.test.ts` file
5. **Update documentation** in package README
6. **Run full validation**:
   ```bash
   pnpm build && pnpm typecheck && pnpm lint && pnpm test
   ```

### Working on Pattern Extraction

**File**: `packages/core/src/utils/pattern-extraction.ts`

**Key Functions**:
- `extractPatterns(failure)` - Extracts all patterns from a failure
- `parseStructuredError(errorMessage)` - Parses Playwright error objects
- `extractAssertionFromSnippet(snippet)` - Parses code snippets
- `extractRunId(reportLink)` - Extracts GitHub run IDs
- `createRichEmbeddingContext(failure)` - Creates context for embedding

**Testing**: See `packages/core/src/utils/pattern-extraction.test.ts`

### Working on Clustering

**File**: `packages/core/src/clustering/dbscan.ts`

**Key Functions**:
- `clusterFailures(failures, options)` - Main clustering function
- `createFailureCluster(failures, id)` - Creates cluster with metadata
- `cosineSimilarity(a, b)` / `cosineDistance(a, b)` - Distance metrics
- `generateClusterId(base, index)` - Deterministic ID generation

**Testing**: See `packages/core/src/clustering/dbscan.test.ts`

### Working on Adapters

**Data Adapter Interface**:
```typescript
interface DataAdapter {
  fetchFailures(days: number): Promise<TestFailure[]>;
  saveClusters(clusters: FailureCluster[]): Promise<void>;
  fetchClusters(limit?: number): Promise<FailureCluster[]>;
}
```

**New Adapter Checklist**:
1. Extend `BaseDataAdapter`
2. Implement all three methods
3. Handle Date serialization if needed
4. Add to factory in `packages/adapters/src/index.ts`
5. Add configuration to `DataAdapterConfig` type
6. Write tests

**Embedding Provider Interface**:
```typescript
interface EmbeddingProvider {
  generateEmbeddings(contexts: string[]): Promise<number[][]>;
}
```

## Testing Strategy

### Test Coverage (46 tests)

**Core Package** (39 tests):
- `index.test.ts` - 7 E2E tests with full pipeline
- `clustering/dbscan.test.ts` - 11 clustering tests
- `utils/pattern-extraction.test.ts` - 21 pattern extraction tests

**Adapters Package** (7 tests):
- `embedding-providers/google-genai-provider.test.ts` - Provider tests

### Testing Best Practices

1. **Use mock adapters** for E2E tests (InMemoryAdapter, MockEmbeddingProvider)
2. **Test with realistic data** - Use actual Playwright error formats
3. **Test edge cases** - Empty arrays, malformed data, missing fields
4. **Test validation** - Ensure invalid configs throw descriptive errors
5. **Test determinism** - Cluster IDs should be stable

### Running Tests

```bash
# All tests
pnpm test

# Specific test file
pnpm test pattern-extraction.test.ts

# Watch mode
pnpm test:watch

# With coverage
pnpm test -- --coverage
```

## Code Style and Standards

### TypeScript
- **Strict mode**: Enabled in all packages
- **No any**: Use proper types or `unknown`
- **Explicit return types**: For public functions
- **Optional chaining**: Use `?.` for potentially undefined values

### Biome Configuration
- **Import sorting**: Automatic
- **Quote style**: Double quotes
- **Semicolons**: Required
- **Line length**: 80-100 characters (guideline)

### Conventional Commits

Format: `type(scope): description`

**Types**:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Tooling, dependencies

**Scopes**: `core`, `adapters`, `cli`, `utils`

**Examples**:
```
feat(core): add cosine distance support to DBSCAN
fix(adapters): handle Date serialization in Firestore
docs(core): update README with clustering options
test(core): add E2E tests for Playwright errors
```

## Common Pitfalls and Solutions

### 1. TypeScript Errors After Changes

**Problem**: "Cannot find module" or "Type X is not assignable"

**Solution**:
```bash
pnpm clean
pnpm install
pnpm build
pnpm typecheck
```

### 2. Tests Failing After Refactoring

**Problem**: Mock data doesn't match new types

**Solution**: Update test fixtures in `*.test.ts` files to match new type signatures

### 3. Firestore Date Serialization

**Problem**: "Cannot convert object to primitive value"

**Solution**: Use `Timestamp.fromDate()` and `timestamp.toDate()` in adapters

### 4. Clustering Returns No Results

**Problem**: Epsilon too small or failures too different

**Solution**: 
- Increase `epsilon` (try 0.2 for cosine)
- Lower `minClusterSize` to 2
- Check that embeddings are being generated correctly

### 5. Pattern Extraction Returns Incomplete Data

**Problem**: Some Playwright errors have different formats

**Solution**: Add fallback logic in `extractPatterns()` and test with real error samples

## Integration Examples

### Using in a CI/CD Pipeline

```typescript
import { FlakinessDetective } from '@flakiness-detective/core';
import { createDataAdapter, createEmbeddingProvider } from '@flakiness-detective/adapters';
import { createLogger } from '@flakiness-detective/utils';

const logger = createLogger({ level: 'info' });

// Read Playwright report
const dataAdapter = createDataAdapter({
  type: 'playwright',
  reportPath: process.env.PLAYWRIGHT_REPORT_PATH,
  runId: process.env.GITHUB_RUN_ID,
  reportLink: process.env.GITHUB_RUN_URL,
}, logger);

// Use Google AI for embeddings
const embeddingProvider = createEmbeddingProvider({
  type: 'google',
  apiKey: process.env.GOOGLE_AI_API_KEY,
}, logger);

// Run detection
const detective = new FlakinessDetective(
  dataAdapter,
  embeddingProvider,
  {
    timeWindow: { days: 7 },
    clustering: {
      epsilon: 0.15,
      distance: 'cosine',
      maxClusters: 5,
    },
  },
  'info'
);

const clusters = await detective.detect();

if (clusters.length > 0) {
  console.error(`Found ${clusters.length} flaky test patterns!`);
  process.exit(1); // Fail the build
}
```

### Storing Results in Firestore

```typescript
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const dataAdapter = createDataAdapter({
  type: 'firestore',
  firestoreDb: admin.firestore(),
  failuresCollection: 'test_failures',
  clustersCollection: 'flaky_clusters',
}, logger);

// Clusters are automatically saved to Firestore
const clusters = await detective.detect();
```

## Performance Considerations

### Embedding Generation
- **Batching**: Google AI provider batches requests (configurable)
- **Rate Limiting**: Respects API quotas
- **Caching**: Consider caching embeddings by error hash

### Clustering
- **Time Complexity**: O(n²) for DBSCAN in worst case
- **Optimization**: Use `maxClusters` to limit output
- **Memory**: Each embedding is ~768 floats (6KB)

### Storage
- **Firestore**: Use batch operations (100 writes/batch)
- **Filesystem**: JSON files can grow large, consider rotation
- **Cleanup**: Use `deleteOldFailures()` regularly

## Documentation Resources

- **[Root README](README.md)** - Project overview and quick start
- **[Core README](packages/core/README.md)** - Detailed core package docs with examples
- **[ROADMAP](ROADMAP.md)** - Future features and development plans
- **[AGENTS.md](AGENTS.md)** - Comprehensive agent/developer guide
- **[CONTRIBUTING](CONTRIBUTING.md)** - Contribution guidelines

## AI Assistant Guidance

When working on this codebase:

1. **Always build before typecheck**: `pnpm build && pnpm typecheck`
2. **Test changes thoroughly**: Run full test suite before committing
3. **Maintain backward compatibility**: Don't break existing APIs
4. **Document new features**: Update appropriate README files
5. **Use existing patterns**: Follow adapter/factory patterns
6. **Validate inputs**: Add validation for new configuration options
7. **Handle errors gracefully**: Provide descriptive error messages
8. **Test with real data**: Use actual Playwright error formats in tests

### When Adding Features

- Place algorithm changes in `core` package
- Place integration code in `adapters` package  
- Place user-facing commands in `cli` package
- Share utilities in `utils` package

### When Fixing Bugs

- Add a failing test first
- Fix the bug
- Verify the test passes
- Check for similar issues elsewhere

### When Refactoring

- Maintain public API compatibility
- Update all tests
- Update documentation
- Run full validation suite

## Contact and Support

For questions or issues:
- 📚 Check documentation first (READMEs)
- 🐛 File issues on GitHub
- 💬 Start discussions for design questions
- 🔒 Use Security Advisories for security issues
