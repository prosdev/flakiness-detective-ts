#!/usr/bin/env tsx

/**
 * Link checker for markdown files
 * Validates internal file links and basic URL format
 */

import fs from 'node:fs';
import path from 'node:path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Files to check (markdown files)
const filesToCheck = [
  'README.md',
  'ROADMAP.md',
  'AGENTS.md',
  'CLAUDE.md',
  'CONTRIBUTING.md',
  'packages/core/README.md',
  'packages/cli/README.md',
  'packages/adapters/README.md',
  'packages/utils/README.md',
];

// Regex patterns for different link types
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
const RELATIVE_PATH_REGEX = /^[^:\/]+\.(md|ts|js|json|yaml|yml)$/i;
const ANCHOR_LINK_REGEX = /^#[a-z0-9-]+$/i;

let errors = 0;

console.log('🔗 Checking documentation links...\n');

/**
 * Validate URL format (basic check)
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check links in a markdown file
 */
function checkMarkdownFile(filePath: string): void {
  const fullPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`${YELLOW}⚠${RESET} Skipping ${filePath} (file not found)`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  let fileErrors = 0;

  // Find all markdown links
  for (const [index, line] of lines.entries()) {
    const lineNum = index + 1;
    const linkRegex = new RegExp(MARKDOWN_LINK_REGEX);
    let match: RegExpExecArray | null;

    // biome-ignore lint/suspicious/noAssignInExpressions: Standard pattern for regex exec loops
    while ((match = linkRegex.exec(line)) !== null) {
      const linkText = match[1];
      const linkTarget = match[2];

      // Skip mailto and other special protocols
      if (linkTarget.startsWith('mailto:') || linkTarget.startsWith('tel:')) {
        continue;
      }

      // Check anchor links (skip for now - would need full content parsing)
      if (ANCHOR_LINK_REGEX.test(linkTarget)) {
        continue;
      }

      // Check relative file paths
      if (RELATIVE_PATH_REGEX.test(linkTarget)) {
        const targetPath = path.resolve(path.dirname(fullPath), linkTarget);
        const relativePath = path.relative(process.cwd(), targetPath);

        if (!fs.existsSync(targetPath)) {
          console.error(`${RED}✗${RESET} ${filePath}:${lineNum} - Broken link: ${linkTarget}`);
          console.error(`  Link text: "${linkText}"`);
          console.error(`  Expected path: ${relativePath}\n`);
          errors++;
          fileErrors++;
        }
      }
      // Check absolute URLs (basic format validation)
      else if (linkTarget.startsWith('http://') || linkTarget.startsWith('https://')) {
        if (!isValidUrl(linkTarget)) {
          console.error(
            `${RED}✗${RESET} ${filePath}:${lineNum} - Invalid URL format: ${linkTarget}`
          );
          console.error(`  Link text: "${linkText}"\n`);
          errors++;
          fileErrors++;
        }
      }
      // Check relative paths with directories
      else if (linkTarget.includes('/') && !linkTarget.startsWith('http')) {
        // Handle paths like ../core/README.md or packages/core/README.md
        const targetPath = path.resolve(path.dirname(fullPath), linkTarget);

        if (!fs.existsSync(targetPath)) {
          console.error(`${RED}✗${RESET} ${filePath}:${lineNum} - Broken link: ${linkTarget}`);
          console.error(`  Link text: "${linkText}"`);
          console.error(`  Expected path: ${path.relative(process.cwd(), targetPath)}\n`);
          errors++;
          fileErrors++;
        }
      }
    }
  }

  if (fileErrors === 0) {
    console.log(`${GREEN}✓${RESET} ${filePath}`);
  }
}

// Check all files
for (const file of filesToCheck) {
  checkMarkdownFile(file);
}

// Print summary
console.log(`\n${'─'.repeat(50)}`);
if (errors > 0) {
  console.error(`\n${RED}✗ Found ${errors} broken link${errors > 1 ? 's' : ''}${RESET}`);
  console.error('Please fix the broken links before committing.\n');
  process.exit(1);
}
console.log(`\n${GREEN}✓ All links are valid!${RESET}\n`);
process.exit(0);
