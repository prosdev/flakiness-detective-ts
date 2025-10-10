import Link from 'next/link';

export default function PackagesPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Packages</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Modular packages designed to work together or independently
        </p>

        <div className="space-y-8">
          <PackageSection
            name="@flakiness-detective/core"
            description="Core detection engine with DBSCAN clustering algorithms and pattern extraction"
            version="0.1.0"
            npmUrl="https://www.npmjs.com/package/@flakiness-detective/core"
            githubUrl="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/core"
            features={[
              'DBSCAN clustering with cosine/euclidean distance',
              'Rich Playwright error parsing',
              'Deterministic cluster IDs',
              'Input validation and type safety',
            ]}
          />

          <PackageSection
            name="@flakiness-detective/adapters"
            description="Data adapters and AI providers for flexible integrations"
            version="0.1.0"
            npmUrl="https://www.npmjs.com/package/@flakiness-detective/adapters"
            githubUrl="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/adapters"
            features={[
              'Firestore adapter with custom schema support',
              'Filesystem adapter with JSON persistence',
              'In-memory adapter for testing',
              'Google Generative AI provider',
              'Mock provider for testing',
            ]}
          />

          <PackageSection
            name="@flakiness-detective/cli"
            description="Command-line interface for CI/CD integration"
            version="0.1.0"
            npmUrl="https://www.npmjs.com/package/@flakiness-detective/cli"
            githubUrl="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/cli"
            features={[
              'detect command for running analysis',
              'report command for viewing clusters',
              'Configuration file support (.json, .js, .ts)',
              'Debug mode with detailed logging',
            ]}
          />

          <PackageSection
            name="@flakiness-detective/utils"
            description="Shared utilities and logger for all packages"
            version="0.1.0"
            npmUrl="https://www.npmjs.com/package/@flakiness-detective/utils"
            githubUrl="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/utils"
            features={[
              'Configurable logger with multiple levels',
              'Optional timestamps',
              'Shared helper functions',
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function PackageSection({
  name,
  description,
  version,
  npmUrl,
  githubUrl,
  features,
}: {
  name: string;
  description: string;
  version: string;
  npmUrl: string;
  githubUrl: string;
  features: string[];
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
        <div>
          <h2 className="text-2xl font-mono font-semibold text-blue-600 dark:text-blue-400 mb-2">
            {name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md">
            v{version}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Features:</h3>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li
              key={`${name}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for static content
                index
              }`}
              className="text-gray-600 dark:text-gray-400 flex items-start gap-2"
            >
              <span className="text-green-500 mt-1">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={npmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <span>View on npm</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </Link>
        <Link
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors text-sm"
        >
          <span>View on GitHub</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
