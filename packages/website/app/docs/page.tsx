import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Documentation</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Everything you need to get started with Flakiness Detective
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <DocCard
            title="Quick Start"
            description="Get up and running with Flakiness Detective in minutes"
            href="/docs/quick-start"
            icon="🚀"
          />
          <DocCard
            title="Installation"
            description="Install packages from npm and configure your environment"
            href="/docs/installation"
            icon="📦"
          />
          <DocCard
            title="Core Package"
            description="Learn about the detection engine and clustering algorithms"
            href="/docs/core"
            icon="🎯"
          />
          <DocCard
            title="Adapters"
            description="Connect to Firestore, Filesystem, or custom data sources"
            href="/docs/adapters"
            icon="🔌"
          />
          <DocCard
            title="CLI"
            description="Use the command-line interface for CI/CD pipelines"
            href="/docs/cli"
            icon="⌨️"
          />
          <DocCard
            title="Configuration"
            description="Configure clustering, time windows, and more"
            href="/docs/configuration"
            icon="⚙️"
          />
        </div>

        <div className="mt-16 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Can't find what you're looking for? Check out these resources:
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                href="https://github.com/prosdev/flakiness-detective-ts/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ask a question on GitHub Discussions
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/prosdev/flakiness-detective-ts/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Report an issue on GitHub
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/prosdev/flakiness-detective-ts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Browse the source code
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DocCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}
