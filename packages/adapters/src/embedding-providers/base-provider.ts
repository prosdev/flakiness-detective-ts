import { EmbeddingProvider } from '@flakiness-detective/core';

/**
 * Base implementation of the EmbeddingProvider interface
 */
export abstract class BaseEmbeddingProvider implements EmbeddingProvider {
  /**
   * Generates embeddings for the given texts
   * @param texts Array of text strings to embed
   */
  abstract generateEmbeddings(texts: string[]): Promise<number[][]>;
}
