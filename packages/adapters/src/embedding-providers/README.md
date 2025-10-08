# Embedding Providers

This directory contains implementations of various embedding providers for the Flakiness Detective system.

## Available Providers

### Mock Embedding Provider

A simple provider that generates deterministic pseudo-random embeddings for testing purposes.

```typescript
import { createEmbeddingProvider } from '@flakiness-detective/adapters';
import { createLogger } from '@flakiness-detective/utils';

const logger = createLogger({ level: 'info' });
const provider = createEmbeddingProvider(
  { 
    type: 'mock', 
    dimensions: 128 
  },
  logger
);
```

### Google GenAI Embedding Provider

A provider that uses Google's Generative AI to generate embeddings.

```typescript
import { createEmbeddingProvider } from '@flakiness-detective/adapters';
import { createLogger } from '@flakiness-detective/utils';

const logger = createLogger({ level: 'info' });
const provider = createEmbeddingProvider(
  {
    type: 'google',
    apiKey: 'YOUR_GOOGLE_API_KEY', // Optional if GENAI_API_KEY environment variable is set
    modelName: 'embedding-001', // Optional, defaults to 'embedding-001'
    taskType: 'CLUSTERING', // Optional, defaults to 'CLUSTERING'
    maxBatchSize: 5, // Optional, defaults to 5
    batchDelay: 100 // Optional, defaults to 100ms
  },
  logger
);

// Alternatively, you can set the GENAI_API_KEY environment variable and omit the apiKey
// GENAI_API_KEY=your_api_key node your_script.js
const envProvider = createEmbeddingProvider(
  {
    type: 'google',
    // API key will be read from GENAI_API_KEY environment variable
  },
  logger
);
```

#### Configuration Options

- `apiKey` (optional): Your Google AI API key. If not provided, will try to use the `GENAI_API_KEY` environment variable
- `modelName` (optional): The embedding model to use (default: 'embedding-001')
- `taskType` (optional): The task type for embeddings:
  - 'SEMANTIC_SIMILARITY': For finding similar texts
  - 'CLASSIFICATION': For categorizing texts
  - 'CLUSTERING': For grouping similar texts (default)
- `maxBatchSize` (optional): Maximum number of texts to process in a single batch (default: 5)
- `batchDelay` (optional): Delay between batch requests in milliseconds (default: 100)

## Creating Custom Embedding Providers

To create a custom embedding provider, implement the `BaseEmbeddingProvider` class:

```typescript
import { BaseEmbeddingProvider } from '@flakiness-detective/adapters';

export class CustomEmbeddingProvider extends BaseEmbeddingProvider {
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Your implementation here
  }

  async embedContent(text: string): Promise<number[]> {
    // Your implementation here
  }
}
```