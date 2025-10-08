import { Logger } from '@flakiness-detective/utils';
import { describe, expect, it, vi } from 'vitest';
import { GoogleGenAIProvider, createGoogleGenAIProvider } from './google-genai-provider';

// Mock the Google GenAI client
vi.mock('@google/generative-ai', async () => {
  const mockEmbeddingValues = [0.1, 0.2, 0.3, 0.4, 0.5];

  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          embedContent: vi.fn().mockResolvedValue({
            embedding: { values: mockEmbeddingValues },
          }),
        };
      }
    },
  };
});

describe('GoogleGenAIProvider', () => {
  const mockLogger: Logger = {
    log: vi.fn(),
  } as unknown as Logger;

  // Save original env
  const originalEnv = process.env.GENAI_API_KEY;

  beforeEach(() => {
    // Set up environment variable for tests
    process.env.GENAI_API_KEY = 'test-env-api-key';
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv === undefined) {
      process.env.GENAI_API_KEY = undefined;
    } else {
      process.env.GENAI_API_KEY = originalEnv;
    }
    vi.clearAllMocks();
  });

  const config = {
    apiKey: 'test-api-key',
    modelName: 'test-model',
    taskType: 'CLUSTERING' as const,
    maxBatchSize: 2,
    batchDelay: 10,
  };

  it('should create a GoogleGenAIProvider instance', () => {
    const provider = new GoogleGenAIProvider(config, mockLogger);
    expect(provider).toBeInstanceOf(GoogleGenAIProvider);
  });

  it('should create a provider using the factory function', () => {
    const provider = createGoogleGenAIProvider(config, mockLogger);
    expect(provider).toBeDefined();
  });

  it('should create a provider using the API key from environment variable', () => {
    // Create provider with no API key in config, should use environment variable
    const provider = createGoogleGenAIProvider({ modelName: 'test-model' }, mockLogger);
    expect(provider).toBeDefined();
  });

  it('should generate embeddings for a single text', async () => {
    const provider = new GoogleGenAIProvider(config, mockLogger);
    const embedding = await provider.embedContent('test text');

    expect(embedding).toHaveLength(5);
    expect(embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
  });

  it('should generate embeddings for multiple texts', async () => {
    const provider = new GoogleGenAIProvider(config, mockLogger);
    const texts = ['text1', 'text2', 'text3'];
    const embeddings = await provider.generateEmbeddings(texts);

    expect(embeddings).toHaveLength(3);
    expect(embeddings[0]).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
  });

  it('should handle empty input gracefully', async () => {
    const provider = new GoogleGenAIProvider(config, mockLogger);
    const embeddings = await provider.generateEmbeddings([]);

    expect(embeddings).toHaveLength(0);
    expect(embeddings).toEqual([]);
  });

  it('should batch requests according to maxBatchSize', async () => {
    const provider = new GoogleGenAIProvider(
      {
        ...config,
        maxBatchSize: 2, // Set batch size to 2
      },
      mockLogger
    );

    const texts = ['text1', 'text2', 'text3', 'text4', 'text5'];
    const embeddings = await provider.generateEmbeddings(texts);

    expect(embeddings).toHaveLength(5);
    expect(mockLogger.log).toHaveBeenCalledWith('Generating embeddings for 5 texts');
  });
});
