import { createDataAdapter, createEmbeddingProvider } from '@flakiness-detective/adapters';
import type { DataAdapterConfig, EmbeddingProviderConfig } from '@flakiness-detective/adapters';
import { FlakinessDetective } from '@flakiness-detective/core';
import type { FailureCluster, FlakinessDetectiveConfig } from '@flakiness-detective/core';
import { createLogger } from '@flakiness-detective/utils';
import type { Logger } from '@flakiness-detective/utils';

/**
 * CLI configuration interface
 */
export interface CliConfig {
  // Core options
  command: 'detect' | 'report' | 'help';
  timeWindow?: number; // Days to look back (default: 7)

  // Data adapter configuration
  adapter: DataAdapterConfig;

  // Embedding provider configuration
  embedding: EmbeddingProviderConfig;

  // Clustering options
  epsilon?: number;
  minPoints?: number;
  minClusterSize?: number;
  distance?: 'euclidean' | 'cosine';
  maxClusters?: number;

  // Output options
  outputFormat?: 'json' | 'console';
  outputPath?: string;
  verbose?: boolean;
}

/**
 * Main CLI class for Flakiness Detective
 */
export class FlakinessDetectiveCli {
  private config: CliConfig;
  private logger: Logger;

  constructor(config: CliConfig) {
    this.config = config;
    this.logger = createLogger({
      level: config.verbose ? 'debug' : 'info',
    });
  }

  /**
   * Runs the CLI command
   */
  async run(): Promise<void> {
    try {
      switch (this.config.command) {
        case 'detect':
          await this.runDetection();
          break;
        case 'report':
          await this.runReport();
          break;
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      this.logger.log(`Error: ${String(error)}`);
      process.exit(1);
    }
  }

  /**
   * Runs flakiness detection
   */
  private async runDetection(): Promise<void> {
    this.logger.log('Starting flakiness detection...');

    // Create data adapter and embedding provider
    const dataAdapter = createDataAdapter(this.config.adapter, this.logger);
    const embeddingProvider = createEmbeddingProvider(this.config.embedding, this.logger);

    // Build configuration
    const detectiveConfig: FlakinessDetectiveConfig = {
      timeWindow: {
        days: this.config.timeWindow || 7,
      },
      clustering: {
        epsilon: this.config.epsilon ?? 0.15,
        minPoints: this.config.minPoints ?? 2,
        minClusterSize: this.config.minClusterSize ?? 2,
        distance: this.config.distance ?? 'cosine',
        maxClusters: this.config.maxClusters ?? 5,
      },
    };

    // Create and run detective
    const detective = new FlakinessDetective(
      dataAdapter,
      embeddingProvider,
      detectiveConfig,
      this.config.verbose ? 'debug' : 'info'
    );

    const clusters = await detective.detect();

    // Output results
    await this.outputClusters(clusters);

    this.logger.log(`Detection complete. Found ${clusters.length} flaky test cluster(s).`);
  }

  /**
   * Runs report generation (fetches existing clusters)
   */
  private async runReport(): Promise<void> {
    this.logger.log('Generating report from saved clusters...');

    const dataAdapter = createDataAdapter(this.config.adapter, this.logger);
    const maxClusters = this.config.maxClusters ?? 10;

    const clusters = await dataAdapter.fetchClusters(maxClusters);

    // Output results
    await this.outputClusters(clusters);

    this.logger.log(`Report complete. Retrieved ${clusters.length} cluster(s).`);
  }

  /**
   * Outputs clusters in the specified format
   */
  private async outputClusters(clusters: FailureCluster[]): Promise<void> {
    const format = this.config.outputFormat || 'console';

    if (format === 'json') {
      const jsonOutput = JSON.stringify(clusters, null, 2);

      if (this.config.outputPath) {
        // Write to file
        const fs = await import('node:fs/promises');
        await fs.writeFile(this.config.outputPath, jsonOutput, 'utf-8');
        this.logger.log(`Results written to ${this.config.outputPath}`);
      } else {
        // Write to stdout
        console.log(jsonOutput);
      }
    } else {
      // Console format
      this.printConsoleClusters(clusters);
    }
  }

  /**
   * Prints clusters in a human-readable console format
   */
  private printConsoleClusters(clusters: FailureCluster[]): void {
    if (clusters.length === 0) {
      console.log('\nNo flaky test clusters found.');
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Found ${clusters.length} Flaky Test Cluster(s)`);
    console.log('='.repeat(80));

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      console.log(`\nCluster ${i + 1}: ${cluster.id}`);
      console.log(`${'─'.repeat(80)}`);
      console.log(`  Failure Count: ${cluster.metadata.failureCount}`);
      console.log(`  First Seen: ${cluster.metadata.firstSeen.toISOString()}`);
      console.log(`  Last Seen: ${cluster.metadata.lastSeen.toISOString()}`);

      if (cluster.failurePattern) {
        console.log(`  Failure Pattern: ${cluster.failurePattern}`);
      }

      if (cluster.assertionPattern) {
        console.log(`  Assertion Pattern: ${cluster.assertionPattern}`);
      }

      // Common patterns
      if (cluster.commonPatterns.filePaths.length > 0) {
        console.log(`  Files: ${cluster.commonPatterns.filePaths.join(', ')}`);
      }

      if (cluster.commonPatterns.locators.length > 0) {
        console.log(`  Locators: ${cluster.commonPatterns.locators.join(', ')}`);
      }

      if (cluster.commonPatterns.matchers.length > 0) {
        console.log(`  Matchers: ${cluster.commonPatterns.matchers.join(', ')}`);
      }

      // Sample error message
      if (cluster.metadata.errorMessages.length > 0) {
        console.log(`  Sample Error: ${cluster.metadata.errorMessages[0].substring(0, 150)}...`);
      }

      // Run IDs (for linking to CI)
      if (cluster.metadata.runIds.length > 0) {
        console.log(
          `  Run IDs: ${cluster.metadata.runIds.slice(0, 5).join(', ')}${
            cluster.metadata.runIds.length > 5 ? '...' : ''
          }`
        );
      }
    }

    console.log(`\n${'='.repeat(80)}\n`);
  }

  /**
   * Shows help information
   */
  private showHelp(): void {
    console.log(`
Flakiness Detective CLI
=======================

Usage:
  flakiness-detective detect [options]  - Detect flaky test patterns
  flakiness-detective report [options]  - Generate report from saved clusters
  flakiness-detective help              - Show this help message

Detection Options:
  --time-window <days>         Number of days to look back (default: 7)
  --epsilon <number>           DBSCAN epsilon parameter (default: 0.15)
  --min-points <number>        DBSCAN minimum points (default: 2)
  --min-cluster-size <number>  Minimum cluster size (default: 2)
  --distance <type>            Distance metric: euclidean | cosine (default: cosine)
  --max-clusters <number>      Maximum number of clusters to return (default: 5)

Data Adapter Options:
  --adapter <type>             Adapter type: filesystem | memory | firestore | playwright
  --adapter-path <path>        Path for filesystem adapter or Playwright report
  --firestore-project <id>     Firestore project ID
  --run-id <id>                GitHub Actions run ID (for Playwright adapter)
  --report-link <url>          Report link URL (for Playwright adapter)

Embedding Provider Options:
  --embedding <type>           Provider type: google | mock
  --api-key <key>              API key for embedding provider
  --dimensions <number>        Embedding dimensions
  --model <name>               Model name (e.g., text-embedding-004)

Output Options:
  --output-format <format>     Output format: json | console (default: console)
  --output-path <path>         Output file path (for json format)
  --verbose                    Enable verbose logging

Examples:
  # Detect flakiness from Playwright reports
  flakiness-detective detect \\
    --adapter playwright \\
    --adapter-path ./test-results/report.json \\
    --embedding google \\
    --api-key YOUR_API_KEY

  # Detect with custom clustering options
  flakiness-detective detect \\
    --adapter filesystem \\
    --adapter-path ./data \\
    --embedding google \\
    --api-key YOUR_API_KEY \\
    --epsilon 0.2 \\
    --max-clusters 10 \\
    --distance cosine

  # Generate JSON report
  flakiness-detective report \\
    --adapter filesystem \\
    --adapter-path ./data \\
    --output-format json \\
    --output-path ./flakiness-report.json
`);
  }
}

/**
 * Factory function to create CLI instance
 */
export function createCli(config: CliConfig): FlakinessDetectiveCli {
  return new FlakinessDetectiveCli(config);
}
