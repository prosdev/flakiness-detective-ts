import { CodeBlock } from '@/components/code-block';
import Link from 'next/link';

export default function QuickStartPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Quick Start</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Get started with Flakiness Detective in under 5 minutes
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Step 1: Install</h2>
            <CodeBlock
              code={'pnpm add @flakiness-detective/core @flakiness-detective/adapters'}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Step 2: Basic Usage</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Create a simple detection script:
            </p>
            <CodeBlock
              code={`import { FlakinessDetective } from '@flakiness-detective/core';
import { 
  createDataAdapter, 
  createEmbeddingProvider 
} from '@flakiness-detective/adapters';

// Configure adapters
const dataAdapter = createDataAdapter({ 
  type: 'in-memory' 
});

const embeddingProvider = createEmbeddingProvider({ 
  type: 'mock' 
});

// Create detective instance
const detective = new FlakinessDetective(
  dataAdapter,
  embeddingProvider,
  {
    timeWindow: { days: 7 },
    clustering: {
      epsilon: 0.15,
      minPoints: 2,
      distance: 'cosine',
    }
  }
);

// Run detection
const clusters = await detective.detect();
console.log(\`Found \${clusters.length} flaky test patterns\`);`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Step 3: Add Test Failures</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Add some test failures to analyze:
            </p>
            <CodeBlock
              code={`const failures = [
  {
    id: '1',
    testTitle: 'Login button should be visible',
    testFilePath: 'tests/auth.spec.ts',
    errorMessage: 'Timeout 30000ms exceeded waiting for element',
    timestamp: new Date('2025-01-10'),
    metadata: {}
  },
  // ... more failures
];

await dataAdapter.addFailures(failures);

// Now detect patterns
const clusters = await detective.detect();`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Using the CLI</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Or use the CLI for quick analysis:
            </p>
            <CodeBlock
              code={`# Detect flaky tests
flakiness-detective detect \\
  --adapter=in-memory \\
  --embedding=mock \\
  --epsilon=0.15 \\
  --days=7

# Generate report
flakiness-detective report --limit=10`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/docs/core"
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">Core Package →</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn about clustering algorithms
                </p>
              </Link>
              <Link
                href="/docs/adapters"
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">Adapters →</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect to Firestore, filesystem, etc.
                </p>
              </Link>
              <Link
                href="/docs/configuration"
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">Configuration →</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fine-tune clustering parameters
                </p>
              </Link>
              <Link
                href="/docs/cli"
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">CLI Reference →</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete CLI documentation
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
