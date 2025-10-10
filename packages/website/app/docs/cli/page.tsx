import { CodeBlock } from '@/components/code-block';
import Link from 'next/link';

export default function CliPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">CLI Reference</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Command-line interface for CI/CD integration
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Installation</h2>
            <CodeBlock
              code={`# Install globally
pnpm add -g @flakiness-detective/cli

# Or use npx (no installation needed)
npx @flakiness-detective/cli --help`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Commands</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">detect</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Run flakiness detection on test failures.
            </p>
            <CodeBlock code={'flakiness-detective detect [options]'} language="bash" />

            <h4 className="text-lg font-semibold mb-3 mt-4">Options</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">--adapter &lt;type&gt;</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Data adapter: in-memory, filesystem, firestore (default: in-memory)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">--embedding &lt;type&gt;</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Embedding provider: google, mock (default: mock)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">--days &lt;number&gt;</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Time window in days (default: 7)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">--epsilon &lt;number&gt;</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  DBSCAN epsilon value (default: 0.15)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">
                  --min-points &lt;number&gt;
                </code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  DBSCAN minPoints (default: 2)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">--distance &lt;metric&gt;</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Distance metric: cosine, euclidean (default: cosine)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">
                  --max-clusters &lt;number&gt;
                </code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Maximum clusters to return (default: 5)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <code className="text-blue-600 dark:text-blue-400">--verbose, -v</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Enable debug mode with detailed logging
                </p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-3 mt-6">Examples</h4>
            <CodeBlock
              code={`# Basic usage
flakiness-detective detect

# With Firestore and Google AI
flakiness-detective detect \\
  --adapter=firestore \\
  --embedding=google \\
  --days=14

# Debug mode
flakiness-detective detect --verbose

# Custom clustering parameters
flakiness-detective detect \\
  --epsilon=0.2 \\
  --min-points=3 \\
  --distance=euclidean`}
              language="bash"
            />

            <h3 className="text-xl font-semibold mb-3 mt-8">report</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate a report from saved clusters.
            </p>
            <CodeBlock
              code={`flakiness-detective report [options]

Options:
  --limit <number>    Maximum clusters to show (default: 10)
  --output <format>   Output format: console, json (default: console)`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Configuration Files</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The CLI supports configuration files for easier management:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Supported Files</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mb-4">
              <li>
                <code>.flakinessrc.json</code>
              </li>
              <li>
                <code>.flakinessrc.js</code>
              </li>
              <li>
                <code>flakiness-detective.config.js</code>
              </li>
              <li>
                <code>.flakinessrc.ts</code>
              </li>
              <li>
                <code>flakiness-detective.config.ts</code>
              </li>
              <li>
                <code>package.json</code> (flakinessDetective field)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Example Configuration</h3>
            <CodeBlock
              code={`// .flakinessrc.json
{
  "adapter": {
    "type": "firestore",
    "failuresCollection": "test_failures",
    "clustersCollection": "flaky_clusters"
  },
  "embedding": {
    "type": "google",
    "model": "text-embedding-004"
  },
  "timeWindow": {
    "days": 7
  },
  "clustering": {
    "epsilon": 0.15,
    "minPoints": 2,
    "distance": "cosine",
    "maxClusters": 5
  }
}`}
              language="json"
            />

            <p className="text-gray-600 dark:text-gray-400 mt-4">
              CLI arguments take precedence over config files.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">CI/CD Integration</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">GitHub Actions</h3>
            <CodeBlock
              code={`name: Detect Flaky Tests
on: [push]

jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      
      - name: Install CLI
        run: npm install -g @flakiness-detective/cli
      
      - name: Detect Flaky Tests
        run: |
          flakiness-detective detect \\
            --adapter=firestore \\
            --embedding=google \\
            --verbose
        env:
          GOOGLE_AI_API_KEY: \${{ secrets.GOOGLE_AI_API_KEY }}`}
              language="yaml"
            />
          </section>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-2">Learn More</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View source on GitHub →
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.npmjs.com/package/@flakiness-detective/cli"
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
