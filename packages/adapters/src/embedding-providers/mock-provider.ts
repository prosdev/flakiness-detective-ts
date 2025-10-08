import { Logger } from '@flakiness-detective/utils';
import { BaseEmbeddingProvider } from './base-provider';

/**
 * Mock implementation of the EmbeddingProvider interface
 * Generates deterministic pseudo-random embeddings for testing
 */
export class MockEmbeddingProvider extends BaseEmbeddingProvider {
  private dimensions: number;
  private logger: Logger;

  /**
   * Creates a new MockEmbeddingProvider
   * @param logger Logger instance
   * @param dimensions Number of dimensions for the embeddings
   */
  constructor(logger: Logger, dimensions = 128) {
    super();
    this.dimensions = dimensions;
    this.logger = logger;
  }

  /**
   * Generates mock embeddings for the given texts
   * @param texts Array of text strings to embed
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    this.logger.log(`Generating mock embeddings for ${texts.length} texts`);

    return texts.map((text) => this.generateMockEmbedding(text));
  }

  /**
   * Generates a mock embedding for a single text
   * Uses a deterministic algorithm based on the text content
   * @param text Text to embed
   */
  private generateMockEmbedding(text: string): number[] {
    // Create a simple hash of the text
    const hash = this.simpleHash(text);

    // Use the hash as a seed to generate a pseudo-random vector
    const embedding = new Array(this.dimensions).fill(0).map((_, i) => {
      // Generate a value between -1 and 1 based on the hash and position
      const value = Math.sin(hash * (i + 1)) / 2 + 0.5;
      return value * 2 - 1;
    });

    // Normalize the embedding to unit length
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / magnitude);
  }

  /**
   * Generates a simple hash of a string
   * @param str String to hash
   */
  private simpleHash(str: string): number {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }

    return Math.abs(hash);
  }
}
