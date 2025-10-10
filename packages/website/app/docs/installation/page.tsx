import { CodeBlock } from '@/components/code-block';
import Link from 'next/link';

export default function InstallationPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Installation</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Node.js v22 or higher (LTS recommended)</li>
              <li>pnpm v8 or higher (recommended) or npm/yarn</li>
              <li>Google Generative AI API key (for production embeddings)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Install from npm</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Install the core packages from npm:
            </p>
            <CodeBlock
              code={`# Install core packages
pnpm add @flakiness-detective/core @flakiness-detective/adapters

# Or with npm
npm install @flakiness-detective/core @flakiness-detective/adapters

# Or with yarn
yarn add @flakiness-detective/core @flakiness-detective/adapters`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Optional: Peer Dependencies</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              If you're using Firestore or Google AI embeddings, install the peer dependencies:
            </p>
            <CodeBlock
              code={`# For Firestore storage
pnpm add @google-cloud/firestore

# For AI embeddings
pnpm add @google/generative-ai

# Or install both
pnpm add @google-cloud/firestore @google/generative-ai`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">CLI Installation</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Install the CLI globally for command-line usage:
            </p>
            <CodeBlock
              code={`# Install globally
pnpm add -g @flakiness-detective/cli

# Or use npx (no installation needed)
npx @flakiness-detective/cli detect --help`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Development Setup</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              For contributing or development, clone the monorepo:
            </p>
            <CodeBlock
              code={`# Clone the repository
git clone https://github.com/prosdev/flakiness-detective-ts.git
cd flakiness-detective-ts

# Install dependencies
pnpm install

# Build all packages
pnpm build`}
              language="bash"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Verify Installation</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Verify that everything is installed correctly:
            </p>
            <CodeBlock
              code={`# Check CLI version
npx @flakiness-detective/cli --version

# Or in Node.js
node -e "console.log(require('@flakiness-detective/core'))"
`}
              language="bash"
            />
          </section>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Now that you have Flakiness Detective installed, check out:
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs/quick-start"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Quick Start Guide →
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/configuration"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Configuration Options →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
