import { CodeBlock } from '@/components/code-block';
import Link from 'next/link';

export default function CorePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Core Package</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Detection engine with DBSCAN clustering and pattern extraction
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The core package (
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                @flakiness-detective/core
              </code>
              ) contains the main detection algorithms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>DBSCAN clustering with cosine/euclidean distance</li>
              <li>Rich Playwright error parsing</li>
              <li>Pattern extraction and frequency analysis</li>
              <li>Deterministic cluster IDs</li>
              <li>Input validation and type safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Installation</h2>
            <CodeBlock code={'pnpm add @flakiness-detective/core'} language="bash" />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
            <CodeBlock
              code={`import { FlakinessDetective } from '@flakiness-detective/core';

const detective = new FlakinessDetective(
  dataAdapter,
  embeddingProvider,
  {
    timeWindow: { days: 7 },
    clustering: {
      epsilon: 0.15,
      minPoints: 2,
      minClusterSize: 2,
      distance: 'cosine',
      maxClusters: 5
    }
  },
  'info' // log level
);

const clusters = await detective.detect();`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Configuration</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Time Window</h3>
            <CodeBlock
              code={`timeWindow: {
  days: 7  // Analyze failures from last 7 days
}`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-3 mt-6">Clustering Options</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">epsilon (default: 0.15)</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Distance threshold for clustering. Lower values create tighter, more specific
                  clusters.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">minPoints (default: 2)</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Minimum neighbors required for a core point in DBSCAN.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">minClusterSize (default: 2)</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Minimum failures required to form a cluster.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">distance (default: 'cosine')</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Distance metric:{' '}
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">cosine</code> or{' '}
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">euclidean</code>.
                  Cosine is better for semantic embeddings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">maxClusters (default: 5)</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Maximum number of clusters to return (top N by size).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Pattern Extraction</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The core package automatically extracts patterns from Playwright errors:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <strong>Locators:</strong> CSS selectors, role-based locators
              </li>
              <li>
                <strong>Matchers:</strong> toBeVisible, toContainText, etc.
              </li>
              <li>
                <strong>Values:</strong> Actual vs expected values
              </li>
              <li>
                <strong>Timeouts:</strong> Timeout durations
              </li>
              <li>
                <strong>Line numbers:</strong> Source code locations
              </li>
              <li>
                <strong>Run IDs:</strong> GitHub Actions run identifiers
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">TypeScript Types</h2>
            <CodeBlock
              code={`import type { 
  FlakinessDetectiveConfig,
  TestFailure,
  FailureCluster 
} from '@flakiness-detective/core';`}
              language="typescript"
            />
          </section>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-2">Learn More</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/core"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View source on GitHub →
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.npmjs.com/package/@flakiness-detective/core"
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
