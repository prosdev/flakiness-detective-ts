// Data Adapters
export { BaseDataAdapter } from './data-adapters/base-adapter';

import { FilesystemAdapter } from './data-adapters/filesystem-adapter';
// Import directly rather than re-exporting
import { InMemoryAdapter } from './data-adapters/in-memory-adapter';
export {
  FirestoreAdapter,
  createFirestoreAdapter,
} from './data-adapters/firestore-adapter';
export {
  PlaywrightReporterAdapter,
  createPlaywrightReporterAdapter,
} from './data-adapters/playwright-reporter-adapter';
export type { FilesystemAdapterConfig } from './data-adapters/filesystem-adapter';
export type { FirestoreAdapterConfig } from './data-adapters/firestore-adapter';
export type { PlaywrightReporterAdapterConfig } from './data-adapters/playwright-reporter-adapter';

// Embedding Providers
export { BaseEmbeddingProvider } from './embedding-providers/base-provider';
import { createGoogleGenAIProvider } from './embedding-providers/google-genai-provider';
import { MockEmbeddingProvider } from './embedding-providers/mock-provider';
export type {
  GoogleGenAIConfig,
  GoogleEmbeddingTaskType,
} from './embedding-providers/google-genai-provider';

import { Logger } from '@flakiness-detective/utils';
// Import dependencies
import type { Firestore } from '@google-cloud/firestore';
import { createFirestoreAdapter as createFirestoreAdapterHelper } from './data-adapters/firestore-adapter';
import { createPlaywrightReporterAdapter as createPlaywrightReporterAdapterHelper } from './data-adapters/playwright-reporter-adapter';

// Configuration interfaces
export interface DataAdapterConfig {
  type: 'filesystem' | 'memory' | 'firestore' | 'playwright';
  path?: string;
  projectId?: string;
  firestoreDb?: Firestore;
  failuresCollection?: string;
  clustersCollection?: string;
  reportPath?: string;
  runId?: string;
  reportLink?: string;
  projectName?: string;
}

export interface EmbeddingProviderConfig {
  type: 'google' | 'mock' | 'custom';
  apiKey?: string;
  dimensions?: number;
  modelName?: string;
  taskType?: 'SEMANTIC_SIMILARITY' | 'CLASSIFICATION' | 'CLUSTERING';
  maxBatchSize?: number;
  batchDelay?: number;
}

// Factory functions
export function createDataAdapter(config: DataAdapterConfig, logger: Logger) {
  switch (config.type) {
    case 'memory':
      return new InMemoryAdapter(logger);
    case 'filesystem':
      return new FilesystemAdapter({ dataDir: config.path || './data' }, logger);
    case 'firestore':
      if (!config.firestoreDb) {
        throw new Error('Firestore database instance required for firestore adapter');
      }
      return createFirestoreAdapterHelper(
        {
          db: config.firestoreDb,
          failuresCollection: config.failuresCollection,
          clustersCollection: config.clustersCollection,
        },
        logger
      );
    case 'playwright':
      if (!config.reportPath) {
        throw new Error('reportPath is required for playwright adapter');
      }
      return createPlaywrightReporterAdapterHelper(
        {
          reportPath: config.reportPath,
          runId: config.runId,
          reportLink: config.reportLink,
          projectName: config.projectName,
        },
        logger
      );
    default:
      throw new Error(`Unsupported data adapter type: ${config.type}`);
  }
}

export function createEmbeddingProvider(config: EmbeddingProviderConfig, logger: Logger) {
  switch (config.type) {
    case 'mock':
      return new MockEmbeddingProvider(logger, config.dimensions || 128);
    case 'google':
      // API key can be provided via config or environment variable
      return createGoogleGenAIProvider(
        {
          apiKey: config.apiKey,
          modelName: config.modelName,
          taskType: config.taskType as 'SEMANTIC_SIMILARITY' | 'CLASSIFICATION' | 'CLUSTERING',
          dimensions: config.dimensions,
          maxBatchSize: config.maxBatchSize,
          batchDelay: config.batchDelay,
        },
        logger
      );
    default:
      throw new Error(`Unsupported embedding provider type: ${config.type}`);
  }
}
