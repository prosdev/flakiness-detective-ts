import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('Link Checker', () => {
  it('should validate all documentation links', () => {
    // This test ensures all links in our documentation are valid
    // If this fails, it means we have broken links that need to be fixed
    const result = execSync('pnpm validate:links', { encoding: 'utf-8' });

    // Strip ANSI color codes for easier testing
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Need to strip ANSI codes
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '');

    expect(stripped).toContain('✓ All links are valid!');
    expect(stripped).toContain('✓ README.md');
    expect(stripped).toContain('✓ ROADMAP.md');
    expect(stripped).toContain('✓ AGENTS.md');
    expect(stripped).toContain('✓ CLAUDE.md');
    expect(stripped).toContain('✓ CONTRIBUTING.md');
    expect(stripped).toContain('✓ packages/core/README.md');
  });

  it('should check that the validate:links script exists and is executable', () => {
    // Ensure the command is defined in package.json
    const packageJson = require('../package.json');
    expect(packageJson.scripts['validate:links']).toBeDefined();
    expect(packageJson.scripts['validate:links']).toContain('tsx scripts/check-links.ts');
  });
});
