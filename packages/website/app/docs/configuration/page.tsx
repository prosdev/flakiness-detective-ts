import { CodeBlock } from '@/components/code-block';

export default function ConfigurationPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Configuration</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Complete configuration reference for Flakiness Detective
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Configuration Object</h2>
            <CodeBlock
              code={`import type { FlakinessDetectiveConfig } from '@flakiness-detective/core';

const config: FlakinessDetectiveConfig = {
  timeWindow: {
    days: 7
  },
  clustering: {
    epsilon: 0.15,
    minPoints: 2,
    minClusterSize: 2,
    distance: 'cosine',
    maxClusters: 5
  }
};`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Time Window</h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <code className="text-blue-600 dark:text-blue-400">timeWindow.days</code>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Number of days to look back for test failures.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <strong>Type:</strong> number
                </li>
                <li>
                  <strong>Default:</strong> 7
                </li>
                <li>
                  <strong>Range:</strong> 1-365
                </li>
              </ul>
            </div>
            <CodeBlock
              code={`timeWindow: {
  days: 14  // Analyze last 2 weeks
}`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Clustering Options</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-blue-600 dark:text-blue-400">clustering.epsilon</code>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Maximum distance between two points to be considered neighbors in DBSCAN.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>Type:</strong> number
                  </li>
                  <li>
                    <strong>Default:</strong> 0.15 (for cosine distance)
                  </li>
                  <li>
                    <strong>Range:</strong> 0.0-1.0
                  </li>
                  <li>
                    <strong>Tip:</strong> Lower values = tighter, more specific clusters
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-blue-600 dark:text-blue-400">clustering.minPoints</code>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Minimum number of neighbors required for a point to be a core point in DBSCAN.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>Type:</strong> number
                  </li>
                  <li>
                    <strong>Default:</strong> 2
                  </li>
                  <li>
                    <strong>Range:</strong> 2-10
                  </li>
                  <li>
                    <strong>Tip:</strong> Higher values = require more similar failures
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-blue-600 dark:text-blue-400">clustering.minClusterSize</code>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Minimum number of failures required to form a cluster.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>Type:</strong> number
                  </li>
                  <li>
                    <strong>Default:</strong> 2
                  </li>
                  <li>
                    <strong>Range:</strong> 2-100
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-blue-600 dark:text-blue-400">clustering.distance</code>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Distance metric for comparing embeddings.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>Type:</strong> 'cosine' | 'euclidean'
                  </li>
                  <li>
                    <strong>Default:</strong> 'cosine'
                  </li>
                  <li>
                    <strong>Recommended:</strong> Use 'cosine' for semantic embeddings
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-blue-600 dark:text-blue-400">clustering.maxClusters</code>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Maximum number of clusters to return (top N by size).
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>Type:</strong> number
                  </li>
                  <li>
                    <strong>Default:</strong> 5
                  </li>
                  <li>
                    <strong>Range:</strong> 1-100
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Example Configurations</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Strict Clustering</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              For finding only very similar failures:
            </p>
            <CodeBlock
              code={`{
  timeWindow: { days: 7 },
  clustering: {
    epsilon: 0.1,      // Tighter threshold
    minPoints: 3,      // Require more neighbors
    minClusterSize: 3, // Larger clusters only
    distance: 'cosine',
    maxClusters: 5
  }
}`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-3 mt-6">Loose Clustering</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">For finding broader patterns:</p>
            <CodeBlock
              code={`{
  timeWindow: { days: 14 },
  clustering: {
    epsilon: 0.25,     // Looser threshold
    minPoints: 2,      // Default
    minClusterSize: 2, // Include smaller clusters
    distance: 'cosine',
    maxClusters: 10    // Show more clusters
  }
}`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-3 mt-6">Production Recommended</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Balanced configuration for production use:
            </p>
            <CodeBlock
              code={`{
  timeWindow: { days: 7 },
  clustering: {
    epsilon: 0.15,
    minPoints: 2,
    minClusterSize: 2,
    distance: 'cosine',
    maxClusters: 5
  }
}`}
              language="typescript"
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Tuning Guide</h2>

            <div className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-semibold mb-2">Too many clusters?</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    Decrease <code>epsilon</code> (0.15 → 0.1)
                  </li>
                  <li>
                    Increase <code>minPoints</code> (2 → 3)
                  </li>
                  <li>
                    Increase <code>minClusterSize</code> (2 → 3)
                  </li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-semibold mb-2">Not finding patterns?</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    Increase <code>epsilon</code> (0.15 → 0.2)
                  </li>
                  <li>
                    Increase <code>timeWindow.days</code> (7 → 14)
                  </li>
                  <li>
                    Try <code>distance: 'euclidean'</code>
                  </li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-semibold mb-2">Clusters too broad?</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    Decrease <code>epsilon</code> (0.15 → 0.12)
                  </li>
                  <li>
                    Use <code>distance: 'cosine'</code> for semantic similarity
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
