import { CodeBlock } from '@/components/code-block';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Stop Guessing.
                <br />
                <span className="text-blue-600 dark:text-blue-400">Detect Flaky Tests with AI</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Identify and resolve flaky tests using semantic embeddings and density-based
                clustering. Open source, production-ready, and built for modern CI/CD.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/docs"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="https://github.com/prosdev/flakiness-detective-ts"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 font-semibold rounded-lg transition-colors"
              >
                View on GitHub
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Production Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Get Started in Minutes</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Install from npm and start detecting flaky tests immediately
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Installation</h3>
              <CodeBlock
                code={`# Install core packages
pnpm add @flakiness-detective/core @flakiness-detective/adapters

# Install peer dependencies (for Firestore and AI)
pnpm add @google-cloud/firestore @google/generative-ai

# Or install CLI globally
pnpm add -g @flakiness-detective/cli`}
                language="bash"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Basic Usage</h3>
              <CodeBlock
                code={`import { FlakinessDetective } from '@flakiness-detective/core';
import { createDataAdapter, createEmbeddingProvider } from '@flakiness-detective/adapters';

// Configure adapters
const dataAdapter = createDataAdapter({ type: 'in-memory' });
const embeddingProvider = createEmbeddingProvider({ type: 'mock' });

// Run detection
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

const clusters = await detective.detect();
console.log(\`Found \${clusters.length} flaky test patterns\`);`}
                language="typescript"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to detect, analyze, and resolve flaky tests
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="AI-Powered Analysis"
              description="Uses semantic embeddings to understand test failure patterns beyond simple text matching"
              icon="🤖"
            />
            <FeatureCard
              title="DBSCAN Clustering"
              description="Groups similar failures using density-based clustering with configurable distance metrics"
              icon="🎯"
            />
            <FeatureCard
              title="Rich Pattern Extraction"
              description="Automatically extracts patterns from Playwright errors including locators, matchers, and timeouts"
              icon="🔍"
            />
            <FeatureCard
              title="Flexible Adapters"
              description="Support for multiple data sources: Firestore, Filesystem, In-Memory, and Playwright reports"
              icon="🔌"
            />
            <FeatureCard
              title="Production Ready"
              description="Comprehensive input validation, type safety, and error handling for production use"
              icon="✅"
            />
            <FeatureCard
              title="CLI & Programmatic API"
              description="Use from command line for CI/CD or programmatically in your Node.js applications"
              icon="⚡"
            />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">npm Packages</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Modular packages designed to work together or independently
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <PackageCard
              name="@flakiness-detective/core"
              description="Core detection engine with DBSCAN clustering algorithms"
              href="/packages/core"
            />
            <PackageCard
              name="@flakiness-detective/adapters"
              description="Data adapters and AI providers for flexible integrations"
              href="/packages/adapters"
            />
            <PackageCard
              name="@flakiness-detective/cli"
              description="Command-line interface for CI/CD pipelines"
              href="/packages/cli"
            />
            <PackageCard
              name="@flakiness-detective/utils"
              description="Shared utilities and logger for all packages"
              href="/packages/utils"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Fix Your Flaky Tests?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join developers who are using Flakiness Detective to improve their test reliability
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs"
              className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors"
            >
              Read the Docs
            </Link>
            <Link
              href="https://github.com/prosdev/flakiness-detective-ts"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-white hover:bg-white/10 font-semibold rounded-lg transition-colors"
            >
              Star on GitHub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function PackageCard({
  name,
  description,
  href,
}: {
  name: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
    >
      <h3 className="text-lg font-mono font-semibold mb-2 text-blue-600 dark:text-blue-400">
        {name}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}
