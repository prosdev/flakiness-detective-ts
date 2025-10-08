import { EmbeddingProvider } from '@flakiness-detective/core';
import { Logger } from '@flakiness-detective/utils';
import { BaseEmbeddingProvider } from './base-provider';

/**
 * Interface for Google GenAI Client
 */
interface GoogleGenAIClient {
  getGenerativeModel(options: { model: string }): GoogleGenAIModel;
}

/**
 * Interface for Google GenAI Model
 */
interface GoogleGenAIModel {
  embedContent(options: {
    content: { parts: Array<{ text: string }> };
    taskType: GoogleEmbeddingTaskType;
  }): Promise<{ embedding: { values: number[] } }>;
}

/**
 * Task types for Google Generative AI embeddings
 */
export type GoogleEmbeddingTaskType = 'SEMANTIC_SIMILARITY' | 'CLASSIFICATION' | 'CLUSTERING';

/**
 * Configuration options for Google GenAI embedding provider
 */
export interface GoogleGenAIConfig {
  /**
   * API key for Google GenAI. If not provided, will try to use GENAI_API_KEY
   * environment variable.
   */
  apiKey?: string;
  /** Model name to use for embeddings (default: 'embedding-001') */
  modelName?: string;
  /** Task type for embeddings (default: 'CLUSTERING') */
  taskType?: GoogleEmbeddingTaskType;
  /** Number of dimensions for embeddings (determined by model) */
  dimensions?: number;
  /** Max batch size for embedding requests (default: 5) */
  maxBatchSize?: number;
  /** Delay between batch requests in ms (default: 100) */
  batchDelay?: number;
}

/**
 * Implementation of EmbeddingProvider using Google's Generative AI
 */
export class GoogleGenAIProvider extends BaseEmbeddingProvider {
  private apiKey: string;
  private modelName: string;
  private taskType: GoogleEmbeddingTaskType;
  private maxBatchSize: number;
  private batchDelay: number;
  private logger: Logger;
  private genAIClient: GoogleGenAIClient | null = null;
  private embeddingModel: GoogleGenAIModel | null = null;

  /**
   * Creates a new GoogleGenAIProvider
   * @param config Configuration options
   * @param logger Logger instance
   */
  constructor(config: GoogleGenAIConfig, logger: Logger) {
    super();
    // Try to get API key from config or environment variable
    this.apiKey = config.apiKey || process.env.GENAI_API_KEY || '';

    if (!this.apiKey) {
      throw new Error(
        'Google GenAI API key is required. Provide it in the config or set the GENAI_API_KEY environment variable.'
      );
    }

    this.modelName = config.modelName || 'embedding-001';
    this.taskType = config.taskType || 'CLUSTERING';
    this.maxBatchSize = config.maxBatchSize || 5;
    this.batchDelay = config.batchDelay || 100;
    this.logger = logger;

    this.logger.log(
      `Initialized Google GenAI provider with configuration: model=${this.modelName}, taskType=${this.taskType}, maxBatchSize=${this.maxBatchSize}`
    );
  }

  /**
   * Initializes the Google GenAI client and model
   * Lazy-loaded to avoid unnecessary initialization
   */
  private async initializeClient(): Promise<void> {
    if (this.genAIClient) {
      return;
    }

    try {
      // Dynamically import Google GenAI to avoid issues with CJS/ESM compatibility
      const { GoogleGenerativeAI } = await import('@google/generative-ai');

      this.genAIClient = new GoogleGenerativeAI(this.apiKey) as GoogleGenAIClient;

      if (!this.genAIClient) {
        throw new Error('Failed to initialize Google GenAI client');
      }

      this.embeddingModel = this.genAIClient.getGenerativeModel({
        model: this.modelName,
      });

      this.logger.log(`Initialized Google GenAI client with model ${this.modelName}`);
    } catch (error) {
      this.logger.log(`Error initializing Google GenAI client: ${String(error)}`);
      throw new Error(`Failed to initialize Google GenAI client: ${error}`);
    }
  }

  /**
   * Generates embeddings for a batch of texts
   * @param texts Array of texts to embed
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    await this.initializeClient();

    if (texts.length === 0) {
      return [];
    }

    this.logger.log(`Generating embeddings for ${texts.length} texts`);

    const batches: string[][] = this.createBatches(texts, this.maxBatchSize);
    const embeddings: number[][] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        // Process each batch
        const batchResult = await Promise.all(batch.map((text) => this.embedContent(text)));

        embeddings.push(...batchResult);

        // Add a small delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, this.batchDelay));
        }
      } catch (error) {
        this.logger.log(`Error embedding batch ${i + 1}: ${String(error)}`);
        throw new Error(`Failed to generate embeddings for batch: ${error}`);
      }
    }

    return embeddings;
  }

  /**
   * Generates embedding for a single text
   * @param text Text to embed
   */
  async embedContent(text: string): Promise<number[]> {
    await this.initializeClient();

    if (!this.embeddingModel) {
      throw new Error('Embedding model not initialized');
    }

    try {
      const result = await this.embeddingModel.embedContent({
        content: { parts: [{ text }] },
        taskType: this.taskType,
      });

      return result.embedding.values;
    } catch (error) {
      this.logger.log(`Error embedding content: ${String(error)}`);
      throw new Error(`Failed to embed content: ${error}`);
    }
  }

  /**
   * Splits an array into batches of specified size
   * @param array Array to split
   * @param batchSize Maximum size of each batch
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }
}

/**
 * Creates a new GoogleGenAIProvider
 * @param config Configuration options
 * @param logger Logger instance
 */
export function createGoogleGenAIProvider(
  config: GoogleGenAIConfig,
  logger: Logger
): EmbeddingProvider {
  return new GoogleGenAIProvider(config, logger);
}
