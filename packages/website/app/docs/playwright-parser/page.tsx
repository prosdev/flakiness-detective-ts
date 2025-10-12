import { CodeBlock } from '@/components/code-block';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Playwright Parser - Flakiness Detective',
  description: 'Production-grade Playwright test failure parser with optional metadata tracking',
};

export default function PlaywrightParserPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">@flakiness-detective/playwright-parser</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Production-grade Playwright test failure parser with optional metadata tracking
        </p>
        <div className="flex gap-2 mt-4">
          <a
            href="https://www.npmjs.com/package/@flakiness-detective/playwright-parser"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View on npm
          </a>
          <a
            href="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/playwright-parser"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h2>Overview</h2>
        <p>
          The Playwright Parser extracts structured information from Playwright test failures,
          including error details, test metadata, and execution results. It implements a{' '}
          <strong>hybrid approach</strong>: works perfectly without any configuration, but provides
          enhanced features when you add optional annotations.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6">
          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 Key Features</p>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 mb-0">
            <li>✅ Zero Config - Works immediately without any setup</li>
            <li>🎯 Rich Error Parsing - Extracts matcher, locator, expected/actual values</li>
            <li>🔄 Hybrid Approach - Auto-generates test IDs when annotations are missing</li>
            <li>📊 Optional Metadata - Add annotations for enhanced tracking</li>
            <li>🏭 Production Tested - Battle-tested with 79 passing tests</li>
          </ul>
        </div>

        <h2>Installation</h2>
        <CodeBlock
          code={`# npm
npm install @flakiness-detective/playwright-parser

# pnpm
pnpm add @flakiness-detective/playwright-parser

# yarn
yarn add @flakiness-detective/playwright-parser`}
          language="bash"
        />

        <h2>Quick Start</h2>
        <p>
          Use the parser in your custom Playwright reporter or analysis tool. It works immediately
          without any configuration:
        </p>
        <CodeBlock
          code={`import { parsePlaywrightTest } from '@flakiness-detective/playwright-parser';
import type { TestCase, TestResult } from '@playwright/test/reporter';

// In your custom reporter
const parsed = parsePlaywrightTest(test, result);

console.log(parsed.error.matcher);    // 'toBeVisible'
console.log(parsed.error.locator);    // 'button[name="Submit"]'
console.log(parsed.error.expected);   // 'visible'
console.log(parsed.error.actual);     // 'hidden'
console.log(parsed.metadata.testCaseId); // 'auto-a3f7b9c4' (auto-generated!)`}
          language="typescript"
        />

        <h2>Level Up with Annotations</h2>
        <p>For better tracking across test renames and historical analysis, add annotations:</p>
        <CodeBlock
          code={`test('user can login', async ({ page }) => {
  // Add testCaseId for stable tracking
  test.info().annotations.push({
    type: 'testCaseId',
    description: 'TC-AUTH-001'
  });
  
  // Optional: group by user journey
  test.info().annotations.push({
    type: 'journeyId',
    description: 'authentication'
  });
  
  // Optional: organize into test suites
  test.info().annotations.push({
    type: 'testSuiteName',
    description: 'Login Tests'
  });
  
  // Your test code...
});`}
          language="typescript"
        />

        <h2>Why Annotations?</h2>
        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 mt-0">Without annotations (still works!)</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Pattern detection across similar errors</li>
              <li>✅ Clustering by locator, matcher, etc.</li>
              <li>✅ Basic flakiness detection</li>
              <li>⚠️ Test renames break history</li>
            </ul>
          </div>
          <div className="border border-green-200 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
            <h3 className="text-lg font-semibold mb-3 mt-0">With annotations (10x better!)</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ All the above PLUS:</li>
              <li>✅ Track test history across renames</li>
              <li>✅ Temporal pattern detection</li>
              <li>✅ Journey-level insights</li>
              <li>✅ Long-term stability trends</li>
            </ul>
          </div>
        </div>

        <h2>Complete Example</h2>
        <p>Here's a full example of using the parser in a custom reporter:</p>
        <CodeBlock
          code={`import { parsePlaywrightTest } from '@flakiness-detective/playwright-parser';
import type { TestCase, TestResult, Reporter } from '@playwright/test/reporter';

class FlakinessReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'failed' && result.status !== 'timedOut') {
      return; // Only process failures
    }

    const parsed = parsePlaywrightTest(test, result, {
      // Optional: enable strict mode (require annotations)
      strict: false,
      
      // Optional: customize auto-ID strategy
      autoIdStrategy: 'hash', // 'hash' | 'uuid' | 'none'
      
      // Optional: warn users about missing annotations
      warnOnMissingAnnotations: true,
      
      // Optional: extract custom annotations
      customAnnotationTypes: ['priority', 'owner', 'tags']
    });

    // Send to your flakiness detection system
    this.sendToAnalytics({
      testId: parsed.metadata.testCaseId,
      journey: parsed.metadata.journeyId,
      error: parsed.error,
      result: parsed.result,
      timestamp: new Date()
    });
  }
}

export default FlakinessReporter;`}
          language="typescript"
        />

        <h2>API Reference</h2>

        <h3>parsePlaywrightTest(test, result, options?)</h3>
        <p>Main parsing function that extracts all information from a failed test.</p>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 my-4">
          <p className="font-mono text-sm mb-2">
            <strong>Parameters:</strong>
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              <code>test: TestCase</code> - The Playwright test case
            </li>
            <li>
              <code>result: TestResult</code> - The test result (must be 'failed' or 'timedOut')
            </li>
            <li>
              <code>options?: ParserOptions</code> - Optional configuration
            </li>
          </ul>
          <p className="font-mono text-sm mt-4 mb-2">
            <strong>Returns:</strong>
          </p>
          <p className="text-sm">
            <code>ParsedTestFailure</code> - Complete parsed test failure object
          </p>
        </div>

        <h3>ParserOptions</h3>
        <CodeBlock
          code={`interface ParserOptions {
  // Strict mode: throw error if required annotations missing
  strict?: boolean; // Default: false
  
  // Warn when annotations are missing (educates users)
  warnOnMissingAnnotations?: boolean; // Default: true
  
  // Strategy for auto-generating testCaseId
  autoIdStrategy?: 'hash' | 'uuid' | 'none'; // Default: 'hash'
  
  // Custom annotation types to extract
  customAnnotationTypes?: string[];
}`}
          language="typescript"
        />

        <h3>ParsedTestFailure</h3>
        <CodeBlock
          code={`interface ParsedTestFailure {
  // Structured error details
  error: PlaywrightErrorDetails;
  
  // Test metadata (annotations + auto-generated)
  metadata: TestMetadata;
  
  // Test information
  test: TestInfo;
  
  // Execution result
  result: TestResultInfo;
}`}
          language="typescript"
        />

        <h2>Use Cases</h2>

        <h3>1. Flakiness Detection System</h3>
        <p>Collect structured failure data for AI-powered analysis:</p>
        <CodeBlock
          code={`const parsed = parsePlaywrightTest(test, result);

await sendToFlakinessDetector({
  testId: parsed.metadata.testCaseId,
  journey: parsed.metadata.journeyId,
  errorSignature: {
    matcher: parsed.error.matcher,
    locator: parsed.error.locator,
    message: parsed.error.message
  },
  timestamp: new Date()
});`}
          language="typescript"
        />

        <h3>2. Database Storage</h3>
        <p>Store structured failure data for historical analysis:</p>
        <CodeBlock
          code={`await db.collection('test_failures').add({
  testCaseId: parsed.metadata.testCaseId,
  testTitle: parsed.test.title,
  errorMessage: parsed.error.message,
  locator: parsed.error.locator,
  matcher: parsed.error.matcher,
  expected: parsed.error.expected,
  actual: parsed.error.actual,
  timestamp: new Date()
});`}
          language="typescript"
        />

        <h3>3. CI/CD Integration</h3>
        <p>Generate detailed failure reports in your CI pipeline:</p>
        <CodeBlock
          code={`class CIReporter implements Reporter {
  failures = [];
  
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      const parsed = parsePlaywrightTest(test, result);
      this.failures.push(parsed);
    }
  }
  
  onEnd() {
    console.log(\`📊 Failure Report (\${this.failures.length} failures)\`);
    
    for (const failure of this.failures) {
      console.log(\`❌ \${failure.test.title}\`);
      console.log(\`   ID: \${failure.metadata.testCaseId}\`);
      console.log(\`   Matcher: \${failure.error.matcher}\`);
      console.log(\`   Locator: \${failure.error.locator}\`);
    }
  }
}`}
          language="typescript"
        />

        <h2>Advanced Configuration</h2>

        <h3>Strict Mode</h3>
        <p>Enforce annotations for production systems:</p>
        <CodeBlock
          code={`const parsed = parsePlaywrightTest(test, result, {
  strict: true,           // Throws error if testCaseId missing
  autoIdStrategy: 'none'  // Disable auto-generation
});`}
          language="typescript"
        />

        <h3>Custom ID Strategy</h3>
        <CodeBlock
          code={`// Deterministic hash (recommended)
parsePlaywrightTest(test, result, { autoIdStrategy: 'hash' });

// Random UUID (for one-off analysis)
parsePlaywrightTest(test, result, { autoIdStrategy: 'uuid' });

// No auto-generation (annotations required)
parsePlaywrightTest(test, result, { autoIdStrategy: 'none' });`}
          language="typescript"
        />

        <h2>Integration with Flakiness Detective</h2>
        <p>
          This parser works seamlessly with the{' '}
          <a href="/docs/core" className="text-blue-600 hover:underline">
            @flakiness-detective/core
          </a>{' '}
          package for AI-powered flakiness detection:
        </p>
        <CodeBlock
          code={`import { FlakinessDetective } from '@flakiness-detective/core';
import { createDataAdapter, createEmbeddingProvider } from '@flakiness-detective/adapters';
import { parsePlaywrightTest } from '@flakiness-detective/playwright-parser';

// Parse and store failures in your reporter
class MyReporter implements Reporter {
  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      const parsed = parsePlaywrightTest(test, result);
      await adapter.saveFailure(parsed);
    }
  }
}

// Later: Run flakiness detection
const detective = new FlakinessDetective(adapter, embeddingProvider);
const clusters = await detective.detect();`}
          language="typescript"
        />

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-6">
          <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
            💡 Pro Tip: Start Simple
          </p>
          <p className="text-green-800 dark:text-green-200 mb-0">
            The parser works great without annotations. Start using it immediately, see the value,
            then add annotations incrementally to unlock advanced features. This progressive
            enhancement approach means you get value in 30 seconds, not 30 hours.
          </p>
        </div>

        <h2>Learn More</h2>
        <div className="grid md:grid-cols-3 gap-4 my-6">
          <a
            href="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/playwright-parser"
            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2 mt-0">📚 Full README</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
              Complete documentation with all API details
            </p>
          </a>
          <a
            href="https://github.com/prosdev/flakiness-detective-ts/tree/main/packages/playwright-parser/src/__tests__"
            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2 mt-0">🧪 Test Examples</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
              79 tests showing real-world usage patterns
            </p>
          </a>
          <a
            href="https://github.com/prosdev/flakiness-detective-ts/issues/2"
            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2 mt-0">🎯 GitHub Issue</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
              Design discussion and implementation plan
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
