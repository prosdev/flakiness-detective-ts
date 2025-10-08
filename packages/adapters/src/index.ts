// Data Adapters
export { BaseDataAdapter } from './data-adapters/base-adapter';

import { FilesystemAdapter } from './data-adapters/filesystem-adapter';
// Import directly rather than re-exporting
import { InMemoryAdapter } from './data-adapters/in-memory-adapter';
export type { FilesystemAdapterConfig } from './data-adapters/filesystem-adapter';

// Embedding Providers
export { BaseEmbeddingProvider } from './embedding-providers/base-provider';
import { createGoogleGenAIProvider } from './embedding-providers/google-genai-provider';
import { MockEmbeddingProvider } from './embedding-providers/mock-provider';
export type {
  GoogleGenAIConfig,
  GoogleEmbeddingTaskType,
} from './embedding-providers/google-genai-provider';

// Import dependencies
import { Logger } from '@flakiness-detective/utils';

// Configuration interfaces
export interface DataAdapterConfig {
  type: 'filesystem' | 'memory' | 'firestore';
  path?: string;
  projectId?: string;
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
