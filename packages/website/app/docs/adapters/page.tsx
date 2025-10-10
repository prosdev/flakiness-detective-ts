import { CodeBlock } from '@/components/code-block';
import Link from 'next/link';

export default function AdaptersPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Adapters Package</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Data adapters and AI providers for flexible integrations
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The adapters package provides pluggable storage backends and AI embedding providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Installation</h2>
            <CodeBlock
              code={`pnpm add @flakiness-detective/adapters

# Optional peer dependencies
pnpm add @google-cloud/firestore @google/generative-ai`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Adapters</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">In-Memory Adapter</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Fast, ephemeral storage for development and testing.
            </p>
            <CodeBlock
              code={`import { createDataAdapter } from '@flakiness-detective/adapters';

const adapter = createDataAdapter({ 
  type: 'in-memory' 
}, logger);`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-3 mt-6">Filesystem Adapter</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              JSON-based persistence with automatic Date serialization.
            </p>
            <CodeBlock
              code={`const adapter = createDataAdapter({
  type: 'filesystem',
  basePath: './data',
  failuresFile: 'failures.json',
  clustersFile: 'clusters.json'
}, logger);`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-3 mt-6">Firestore Adapter</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Production-ready Google Cloud Firestore integration with custom schema support.
            </p>
            <CodeBlock
              code={`import * as admin from 'firebase-admin';

const adapter = createDataAdapter({
  type: 'firestore',
  firestoreDb: admin.firestore(),
  failuresCollection: 'test_failures',
  clustersCollection: 'flaky_clusters'
}, logger);`}
              language="typescript"
            />

            <h4 className="text-lg font-semibold mb-3 mt-4">Custom Schema Support</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect to existing Firestore collections with custom schemas:
            </p>
            <CodeBlock
              code={`const adapter = createDataAdapter({
  type: 'firestore',
  firestoreDb: admin.firestore(),
  customSchema: {
    fieldMapping: {
      id: 'id',
      testTitle: 'testName',
      testFile: 'testFile',
      errorMessage: 'errorMessage',
      timestamp: 'createdAt',
      metadata: {
        projectName: 'projectName',
        runId: 'runId'
      }
    },
    failureFilter: {
      field: 'status',
      operator: '==',
      value: 'failed'
    }
  }
}, logger);`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Embedding Providers</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Google Generative AI</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Production embeddings using Google's text-embedding-004 model.
            </p>
            <CodeBlock
              code={`import { createEmbeddingProvider } from '@flakiness-detective/adapters';

const provider = createEmbeddingProvider({
  type: 'google',
  apiKey: process.env.GOOGLE_AI_API_KEY,
  model: 'text-embedding-004',
  batchSize: 100,
  batchDelay: 1000
}, logger);`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-3 mt-6">Mock Provider</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Deterministic embeddings for testing (no API calls).
            </p>
            <CodeBlock
              code={`const provider = createEmbeddingProvider({
  type: 'mock'
}, logger);`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Factory Functions</h2>
            <CodeBlock
              code={`import { 
  createDataAdapter, 
  createEmbeddingProvider 
} from '@flakiness-detective/adapters';

// Create adapter based on config
const adapter = createDataAdapter(config, logger);

// Create provider based on config
const provider = createEmbeddingProvider(config, logger);`}
              language="typescript"
            />
          </section>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-2">Learn More</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/adapters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View source on GitHub →
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.npmjs.com/package/@flakiness-detective/adapters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View on npm →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
