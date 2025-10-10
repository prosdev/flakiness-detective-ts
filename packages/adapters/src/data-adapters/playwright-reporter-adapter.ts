import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { TestFailure, TestFailureMetadata } from '@flakiness-detective/core';
import { Logger } from '@flakiness-detective/utils';
import { BaseDataAdapter } from './base-adapter';

/**
 * Playwright JSON Reporter types
 * Based on https://playwright.dev/docs/test-reporters#json-reporter
 */
interface PlaywrightJSONReport {
  config: {
    rootDir: string;
    version: string;
  };
  suites: PlaywrightSuite[];
}

interface PlaywrightSuite {
  title: string;
  file: string;
  line: number;
  column: number;
  specs: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

interface PlaywrightSpec {
  title: string;
  ok: boolean;
  tests: PlaywrightTest[];
  id: string;
  file: string;
  line: number;
  column: number;
}

interface PlaywrightTest {
  timeout: number;
  annotations: unknown[];
  expectedStatus: string;
  projectId: string;
  projectName: string;
  results: PlaywrightTestResult[];
  status: string;
}

interface PlaywrightTestResult {
  workerIndex: number;
  status: string;
  duration: number;
  errors: PlaywrightError[];
  stdout: unknown[];
  stderr: unknown[];
  retry: number;
  startTime: string;
  attachments: PlaywrightAttachment[];
}

interface PlaywrightError {
  message?: string;
  stack?: string;
  value?: string;
  location?: {
    file: string;
    line: number;
    column: number;
  };
  snippet?: string;
}

interface PlaywrightAttachment {
  name: string;
  contentType: string;
  path?: string;
  body?: string;
}

/**
 * Configuration for PlaywrightReporterAdapter
 */
export interface PlaywrightReporterAdapterConfig {
  /** Path to Playwright JSON report file or directory containing reports */
  reportPath: string;
  /** Optional GitHub Actions run ID for linking */
  runId?: string;
  /** Optional report link URL for reference */
  reportLink?: string;
  /** Optional project name (defaults to extracted from report) */
  projectName?: string;
}

/**
 * Adapter for reading test failures directly from Playwright JSON reports
 * This allows integration without needing a custom reporter
 */
export class PlaywrightReporterAdapter extends BaseDataAdapter {
  private config: PlaywrightReporterAdapterConfig;
  private logger: Logger;

  constructor(config: PlaywrightReporterAdapterConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
  }

  /**
   * Fetches failures from Playwright JSON reports within the specified time window
   * @param days Number of days to look back
   */
  async fetchFailures(days: number): Promise<TestFailure[]> {
    const cutoffDate = this.createTimeFilter(days);

    try {
      // Check if reportPath is a file or directory
      const stat = await fs.stat(this.config.reportPath);
      const reportFiles: string[] = [];

      if (stat.isDirectory()) {
        // Read all JSON files from directory
        const files = await fs.readdir(this.config.reportPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            reportFiles.push(path.join(this.config.reportPath, file));
          }
        }
        this.logger.log(
          `Found ${reportFiles.length} JSON report files in ${this.config.reportPath}`
        );
      } else {
        // Single file
        reportFiles.push(this.config.reportPath);
      }

      const allFailures: TestFailure[] = [];

      for (const reportFile of reportFiles) {
        this.logger.log(`Processing report: ${reportFile}`);
        const failures = await this.parseReportFile(reportFile, cutoffDate);
        allFailures.push(...failures);
      }

      this.logger.log(
        `Extracted ${allFailures.length} failures from ${reportFiles.length} report(s)`
      );
      return allFailures;
    } catch (error) {
      this.logger.log(`Error fetching failures from Playwright reports: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Not implemented for reporter adapter - reports are read-only
   */
  async saveClusters(): Promise<void> {
    throw new Error(
      'saveClusters is not supported for PlaywrightReporterAdapter - use a different adapter for persistence'
    );
  }

  /**
   * Not implemented for reporter adapter - reports are read-only
   */
  async fetchClusters(): Promise<never[]> {
    throw new Error(
      'fetchClusters is not supported for PlaywrightReporterAdapter - use a different adapter for persistence'
    );
  }

  /**
   * Parses a single Playwright JSON report file
   */
  private async parseReportFile(filePath: string, cutoffDate: Date): Promise<TestFailure[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const report: PlaywrightJSONReport = JSON.parse(content);

      const failures: TestFailure[] = [];

      // Recursively process all suites
      for (const suite of report.suites) {
        this.processSuite(suite, failures, cutoffDate, report);
      }

      return failures;
    } catch (error) {
      this.logger.log(`Error parsing report file ${filePath}: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Recursively processes a test suite
   */
  private processSuite(
    suite: PlaywrightSuite,
    failures: TestFailure[],
    cutoffDate: Date,
    report: PlaywrightJSONReport
  ): void {
    // Process specs in this suite
    for (const spec of suite.specs) {
      this.processSpec(spec, suite, failures, cutoffDate, report);
    }

    // Recursively process nested suites
    if (suite.suites) {
      for (const nestedSuite of suite.suites) {
        this.processSuite(nestedSuite, failures, cutoffDate, report);
      }
    }
  }

  /**
   * Processes a test spec
   */
  private processSpec(
    spec: PlaywrightSpec,
    suite: PlaywrightSuite,
    failures: TestFailure[],
    cutoffDate: Date,
    report: PlaywrightJSONReport
  ): void {
    for (const test of spec.tests) {
      // Only process failed/timed out tests
      if (test.status !== 'failed' && test.status !== 'timedOut') {
        continue;
      }

      for (const result of test.results) {
        // Only process failed results
        if (result.status !== 'failed' && result.status !== 'timedOut') {
          continue;
        }

        const timestamp = new Date(result.startTime);

        // Filter by cutoff date
        if (timestamp < cutoffDate) {
          continue;
        }

        // Extract error information
        const error = result.errors[0]; // Take first error
        if (!error) {
          continue;
        }

        const failure = this.createTestFailure(spec, suite, test, result, error, report, timestamp);

        failures.push(failure);
      }
    }
  }

  /**
   * Creates a TestFailure object from Playwright test result
   */
  private createTestFailure(
    spec: PlaywrightSpec,
    suite: PlaywrightSuite,
    test: PlaywrightTest,
    result: PlaywrightTestResult,
    error: PlaywrightError,
    _report: PlaywrightJSONReport,
    timestamp: Date
  ): TestFailure {
    const errorMessage = error.message || error.value || 'Unknown error';
    const errorStack = error.stack;
    const lineNumber = error.location?.line || spec.line;
    const errorSnippet = error.snippet;

    // Try to extract actual/expected values from error message
    const metadata: TestFailureMetadata = {
      projectName: test.projectName,
      suiteName: suite.title,
      duration: result.duration,
      lineNumber,
      errorSnippet,
      runId: this.config.runId,
      reportLink: this.config.reportLink,
    };

    // Parse structured error if available (Playwright sometimes includes this)
    if (typeof errorMessage === 'object' && errorMessage !== null) {
      const errorMap = errorMessage as unknown as Record<string, unknown>;
      if (errorMap.actual) {
        metadata.actualValue = String(errorMap.actual);
      }
      if (errorMap.expected) {
        metadata.expectedValue = String(errorMap.expected);
      }
      if (errorMap.locator) {
        metadata.locator = String(errorMap.locator);
      }
      if (errorMap.matcher) {
        metadata.matcher = String(errorMap.matcher);
      }
      if (errorMap.timeout) {
        metadata.timeout = Number(errorMap.timeout);
      }
    }

    // Generate a unique ID for this failure
    const failureId = `${test.projectName}-${spec.file}-${spec.title}-${timestamp.getTime()}-${
      result.retry
    }`;

    return {
      id: failureId,
      testTitle: spec.title,
      testFilePath: spec.file,
      errorMessage: String(errorMessage),
      errorStack,
      timestamp,
      metadata,
    };
  }
}

/**
 * Factory function to create a Playwright reporter adapter
 * @param config Playwright reporter adapter configuration
 * @param logger Logger instance
 */
export function createPlaywrightReporterAdapter(
  config: PlaywrightReporterAdapterConfig,
  logger: Logger
): PlaywrightReporterAdapter {
  return new PlaywrightReporterAdapter(config, logger);
}
