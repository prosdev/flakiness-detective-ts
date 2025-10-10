# @flakiness-detective/cli

Command-line interface for Flakiness Detective - An AI-powered test flakiness detection tool.

## Installation

```bash
# Install from the monorepo root
pnpm install
pnpm build
```

## Quick Start

### Using CLI Arguments

```bash
# Detect flakiness from Playwright reports
flakiness-detective detect \
  --adapter playwright \
  --adapter-path ./test-results/results.json \
  --embedding google \
  --api-key $GOOGLE_AI_API_KEY \
  --max-clusters 10

# Generate report from saved clusters
flakiness-detective report \
  --adapter firestore \
  --firestore-project my-project \
  --output-format json \
  --output-path ./report.json
```

### Using Configuration Files

Create a `.flakinessrc.json` in your project root:

```json
{
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
```

Then simply run:

```bash
flakiness-detective detect
```

## Commands

### `detect`

Analyze test failures and detect flaky test patterns.

```bash
flakiness-detective detect [options]
```

### `report`

Generate a report from previously saved clusters.

```bash
flakiness-detective report [options]
```

### `help`

Show help information.

```bash
flakiness-detective help
```

## Configuration Files

The CLI automatically discovers and loads configuration files from your project directory.

### Supported Files (in priority order)

1. **`.flakinessrc.json`** - JSON configuration (recommended)
2. **`.flakinessrc.js`** - JavaScript configuration
3. **`flakiness-detective.config.js`** - Alternative JS config
4. **`.flakinessrc.ts`** - TypeScript configuration
5. **`flakiness-detective.config.ts`** - Alternative TS config
6. **`package.json`** - Inline config in `flakinessDetective` field

### Configuration Discovery

Config files are discovered by searching:

1. Current working directory
2. Parent directories up to the project root

### JSON Configuration Example

```json
{
  "timeWindow": {
    "days": 7
  },
  "adapter": {
    "type": "filesystem",
    "basePath": "./flakiness-data"
  },
  "embedding": {
    "type": "google",
    "apiKey": "${GOOGLE_AI_API_KEY}",
    "model": "text-embedding-004"
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

### TypeScript Configuration Example

```typescript
import type { FlakinessDetectiveConfigFile } from "@flakiness-detective/cli";

const config: FlakinessDetectiveConfigFile = {
  timeWindow: { days: 14 },
  adapter: {
    type: "firestore",
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    failuresCollection: "test_failures",
    clustersCollection: "flaky_clusters",
  },
  embedding: {
    type: "google",
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
  clustering: {
    epsilon: 0.15,
    distance: "cosine",
    maxClusters: 10,
  },
  output: {
    format: "json",
    path: "./flakiness-report.json",
  },
  verbose: true,
};

export default config;
```

### JavaScript Configuration Example

```javascript
module.exports = {
  timeWindow: { days: 7 },
  adapter: {
    type: "playwright",
    reportPath:
      process.env.PLAYWRIGHT_REPORT_PATH || "./test-results/results.json",
  },
  embedding: {
    type: "google",
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
  clustering: {
    epsilon: 0.15,
    maxClusters: 5,
  },
};
```

### Package.json Configuration Example

```json
{
  "name": "my-project",
  "scripts": {
    "test:flakiness": "flakiness-detective detect"
  },
  "flakinessDetective": {
    "timeWindow": { "days": 7 },
    "adapter": {
      "type": "playwright",
      "reportPath": "./test-results/results.json"
    },
    "embedding": {
      "type": "google",
      "apiKey": "${GOOGLE_AI_API_KEY}"
    }
  }
}
```

## CLI Options

### Detection Options

| Option                        | Description                              | Default  |
| ----------------------------- | ---------------------------------------- | -------- |
| `--time-window <days>`        | Number of days to look back              | `7`      |
| `--epsilon <number>`          | DBSCAN epsilon parameter                 | `0.15`   |
| `--min-points <number>`       | DBSCAN minimum points                    | `2`      |
| `--min-cluster-size <number>` | Minimum cluster size                     | `2`      |
| `--distance <type>`           | Distance metric: `euclidean` \| `cosine` | `cosine` |
| `--max-clusters <number>`     | Maximum clusters to return               | `5`      |

### Data Adapter Options

| Option                     | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `--adapter <type>`         | Adapter type: `filesystem` \| `memory` \| `firestore` \| `playwright` |
| `--adapter-path <path>`    | Path for filesystem adapter or Playwright report                      |
| `--firestore-project <id>` | Firestore project ID                                                  |
| `--run-id <id>`            | GitHub Actions run ID (for Playwright adapter)                        |
| `--report-link <url>`      | Report link URL (for Playwright adapter)                              |

### Embedding Provider Options

| Option                  | Description                             |
| ----------------------- | --------------------------------------- |
| `--embedding <type>`    | Provider type: `google` \| `mock`       |
| `--api-key <key>`       | API key for embedding provider          |
| `--dimensions <number>` | Embedding dimensions                    |
| `--model <name>`        | Model name (e.g., `text-embedding-004`) |

### Output Options

| Option                     | Description                        | Default   |
| -------------------------- | ---------------------------------- | --------- |
| `--output-format <format>` | Output format: `json` \| `console` | `console` |
| `--output-path <path>`     | Output file path (for json format) | -         |
| `--verbose`                | Enable verbose logging             | `false`   |

## Usage Examples

### Example 1: Analyze Playwright Reports

```bash
flakiness-detective detect \
  --adapter playwright \
  --adapter-path ./test-results/report.json \
  --embedding google \
  --api-key $GOOGLE_AI_API_KEY \
  --time-window 7 \
  --epsilon 0.15 \
  --max-clusters 5
```

### Example 2: Use Firestore for Storage

```bash
flakiness-detective detect \
  --adapter firestore \
  --firestore-project my-gcp-project \
  --embedding google \
  --api-key $GOOGLE_AI_API_KEY \
  --max-clusters 10
```

### Example 3: Generate JSON Report

```bash
flakiness-detective report \
  --adapter filesystem \
  --adapter-path ./data \
  --output-format json \
  --output-path ./flakiness-report.json \
  --max-clusters 10
```

### Example 4: Custom Clustering Parameters

```bash
flakiness-detective detect \
  --adapter playwright \
  --adapter-path ./test-results/report.json \
  --embedding google \
  --api-key $GOOGLE_AI_API_KEY \
  --epsilon 0.2 \
  --distance cosine \
  --min-points 3 \
  --min-cluster-size 3 \
  --max-clusters 15
```

### Example 5: With Config File and Overrides

Create `.flakinessrc.json`:

```json
{
  "adapter": {
    "type": "playwright",
    "reportPath": "./test-results/report.json"
  },
  "embedding": { "type": "google", "apiKey": "${GOOGLE_AI_API_KEY}" },
  "clustering": { "epsilon": 0.15, "maxClusters": 5 }
}
```

Override specific options:

```bash
# Uses config but overrides epsilon and maxClusters
flakiness-detective detect --epsilon 0.2 --max-clusters 10
```

### Example 6: Debug Mode with Detailed Logging

Enable verbose/debug mode to see detailed execution information:

```bash
flakiness-detective detect \
  --adapter playwright \
  --adapter-path ./test-results/report.json \
  --embedding google \
  --api-key $GOOGLE_AI_API_KEY \
  --verbose
```

**Debug mode output includes:**
- Timestamped log messages
- Execution time for each pipeline stage (fetch, pattern extraction, embedding, clustering, save)
- API usage statistics (embedding generation counts)
- Cluster quality metrics (sizes, common patterns)
- Sample embedding contexts
- Detailed batch processing information

**Sample debug output:**
```
[2024-10-10T21:55:17.123Z] [DEBUG] Configuration: {...}
[2024-10-10T21:55:17.125Z] [DEBUG] Creating data adapter and embedding provider...
[2024-10-10T21:55:17.130Z] [DEBUG] Fetching failures from the last 7 days...
[2024-10-10T21:55:17.250Z] [DEBUG] Fetched 15 failures in 0.12s
[2024-10-10T21:55:17.251Z] [DEBUG] Extracting patterns from failures...
[2024-10-10T21:55:17.265Z] [DEBUG] Pattern extraction completed in 0.01s
[2024-10-10T21:55:17.266Z] [DEBUG] Generating embeddings...
[2024-10-10T21:55:17.268Z] [DEBUG] Creating rich contexts for 15 failures...
[2024-10-10T21:55:17.270Z] [DEBUG] Sample context (first failure): Test: should display user profile...
[2024-10-10T21:55:17.271Z] [DEBUG] Split into 3 batches (max size: 5)
[2024-10-10T21:55:17.272Z] [DEBUG] Processing batch 1/3 (5 texts)...
[2024-10-10T21:55:18.450Z] [DEBUG] Batch 1 completed in 1.18s
[2024-10-10T21:55:18.552Z] [DEBUG] Waiting 100ms before next batch...
[2024-10-10T21:55:18.654Z] [DEBUG] Processing batch 2/3 (5 texts)...
[2024-10-10T21:55:19.832Z] [DEBUG] Batch 2 completed in 1.18s
[2024-10-10T21:55:19.934Z] [DEBUG] Waiting 100ms before next batch...
[2024-10-10T21:55:20.036Z] [DEBUG] Processing batch 3/3 (5 texts)...
[2024-10-10T21:55:21.214Z] [DEBUG] Batch 3 completed in 1.18s
[2024-10-10T21:55:21.215Z] [DEBUG] All embeddings generated in 3.95s
[2024-10-10T21:55:21.216Z] [DEBUG] API Usage Stats: 15 calls, 15 texts processed
[2024-10-10T21:55:21.217Z] [DEBUG] Generated 15 embeddings in 3.95s
[2024-10-10T21:55:21.218Z] [DEBUG] Clustering with epsilon=0.15, distance=cosine, minPoints=2...
[2024-10-10T21:55:21.225Z] [DEBUG] Clustering completed in 0.01s
[2024-10-10T21:55:21.226Z] [INFO] Found 2 flaky test clusters from 15 failures
[2024-10-10T21:55:21.227Z] [DEBUG] Total pipeline execution time: 4.10s
[2024-10-10T21:55:21.228Z] [DEBUG] Saving clusters to storage...
[2024-10-10T21:55:21.235Z] [DEBUG] Saved 2 clusters in 0.01s
[2024-10-10T21:55:21.236Z] [INFO] Detection complete. Found 2 flaky test cluster(s).
[2024-10-10T21:55:21.237Z] [DEBUG] Total execution time: 4.11s
[2024-10-10T21:55:21.238Z] [DEBUG] Cluster Statistics:
[2024-10-10T21:55:21.239Z] [DEBUG]   Cluster 1: 8 failures, 2 common locators, 1 common matchers
[2024-10-10T21:55:21.240Z] [DEBUG]   Cluster 2: 7 failures, 1 common locators, 2 common matchers
```

**When to use debug mode:**
- Troubleshooting detection issues
- Understanding performance bottlenecks
- Monitoring API usage and costs
- Tuning clustering parameters
- Debugging configuration issues

## Integration with CI/CD

### GitHub Actions

```yaml
name: Flakiness Detection

on:
  schedule:
    - cron: "0 0 * * *" # Daily
  workflow_dispatch:

jobs:
  detect-flakiness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "22"

      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install

      - name: Run Playwright tests
        run: pnpm test:e2e
        continue-on-error: true

      - name: Detect flakiness
        run: |
          flakiness-detective detect \
            --adapter playwright \
            --adapter-path ./test-results/report.json \
            --embedding google \
            --api-key ${{ secrets.GOOGLE_AI_API_KEY }} \
            --run-id ${{ github.run_id }} \
            --report-link ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### GitLab CI

```yaml
detect-flakiness:
  stage: analysis
  script:
    - pnpm install
    - pnpm test:e2e || true
    - |
      flakiness-detective detect \
        --adapter playwright \
        --adapter-path ./test-results/report.json \
        --embedding google \
        --api-key $GOOGLE_AI_API_KEY
  artifacts:
    reports:
      json: flakiness-report.json
  only:
    - schedules
```

## Programmatic Usage

You can also use the CLI programmatically in TypeScript/JavaScript:

```typescript
import { createCliWithConfigFile } from "@flakiness-detective/cli";

async function analyzeFlakiness() {
  const cli = await createCliWithConfigFile({
    command: "detect",
    adapter: {
      type: "playwright",
      reportPath: "./test-results/report.json",
    },
    embedding: {
      type: "google",
      apiKey: process.env.GOOGLE_AI_API_KEY,
    },
    epsilon: 0.15,
    maxClusters: 5,
  });

  await cli.run();
}

analyzeFlakiness().catch(console.error);
```

## Configuration Validation

Config files are automatically validated with helpful error messages:

```
Config validation error in .flakinessrc.json:
  Invalid clustering.epsilon: must be a positive number
  Details: Got: -0.1
```

Common validation errors:

- Invalid adapter type
- Missing required fields (adapter, embedding)
- Invalid clustering parameters (negative epsilon, non-integer minPoints)
- Invalid output format
- Invalid distance metric

## Environment Variables

The CLI supports environment variable substitution in config files using `${VAR_NAME}` syntax:

```json
{
  "embedding": {
    "type": "google",
    "apiKey": "${GOOGLE_AI_API_KEY}"
  },
  "adapter": {
    "type": "firestore",
    "projectId": "${GOOGLE_CLOUD_PROJECT_ID}"
  }
}
```

## Debugging

Enable verbose logging to see detailed execution information:

```bash
flakiness-detective detect --verbose
```

Or in config file:

```json
{
  "verbose": true
}
```

## API Reference

### Types

```typescript
import type {
  CliConfig,
  FlakinessDetectiveConfigFile,
  ConfigFileDiscoveryResult,
} from "@flakiness-detective/cli";
```

### Functions

```typescript
// Create CLI instance
import { createCli } from "@flakiness-detective/cli";
const cli = createCli(config);
await cli.run();

// Create CLI with config file support
import { createCliWithConfigFile } from "@flakiness-detective/cli";
const cli = await createCliWithConfigFile(partialConfig);
await cli.run();

// Discover config file
import { discoverConfigFile } from "@flakiness-detective/cli";
const result = discoverConfigFile("./my-project");

// Load config file
import { discoverAndLoadConfig } from "@flakiness-detective/cli";
const config = await discoverAndLoadConfig();
```

## Troubleshooting

### Config file not found

The CLI searches for config files starting from the current directory up to the project root. Make sure your config file is in one of these locations.

### Invalid configuration

Check that your config file is valid JSON/JavaScript and matches the expected schema. Use `--verbose` to see detailed error messages.

### Adapter errors

- **Filesystem**: Ensure the path exists and is readable
- **Firestore**: Verify project ID and credentials
- **Playwright**: Check that the report file exists and is valid JSON

### Embedding provider errors

- **Google AI**: Verify API key is valid and has quota
- **Mock**: No API key needed, used for testing only

## Related Packages

- **@flakiness-detective/core** - Core detection engine ([docs](../core/README.md))
- **@flakiness-detective/adapters** - Data adapters and embedding providers ([docs](../adapters/README.md))
- **@flakiness-detective/utils** - Shared utilities ([docs](../utils/README.md))

## License

MIT
