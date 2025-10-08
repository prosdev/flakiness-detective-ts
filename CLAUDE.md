# CLAUDE.md

This file provides configuration and guidance for Claude Code when working with the flakiness-detective-ts monorepo.

## Project Overview

Flakiness Detective is a tool designed to detect and analyze flaky tests in CI/CD pipelines. This project uses a TypeScript monorepo structure with pnpm workspaces and Turborepo.

## Package Structure

```
packages/
├── core/       # Core functionality and data models
├── utils/      # Shared utilities 
└── analyzer/   # Test analysis and flakiness detection
```

## Project Commands

```bash
# Install dependencies 
pnpm install

# Build all packages (required before typecheck)
pnpm build

# Lint all packages
pnpm lint

# Type check all packages (must run AFTER build)
pnpm typecheck

# Run all tests
pnpm test

# Watch mode for tests
pnpm test:watch

# Clean all build outputs
pnpm clean
```

## Important Workflows

### Critical Build Order
- Always run `pnpm build` before `pnpm typecheck` because TypeScript needs the built `.d.ts` files from dependencies.
- Package dependency order: `@flakiness-detective/core` → `@flakiness-detective/utils` → `@flakiness-detective/analyzer`

### Testing
- Tests use Vitest with a centralized configuration at the root (`vitest.config.ts`).
- Test files should match: `**/*.test.ts` or `**/*.spec.ts` in `packages/*/src/`
- Always run tests from the root directory using `pnpm test`

### Code Style Requirements
- TypeScript strict mode is enabled
- Biome handles linting and formatting (config in `biome.json`)
- Conventional Commits are enforced via Commitlint
- Commit message format: `type(scope): description`

## Development Guidance

When working on the flakiness detection logic:
1. Core package should contain essential data structures and interfaces
2. Utils package should contain helper functions and shared utilities
3. Analyzer package should implement the main flakiness detection algorithms

When implementing new features:
1. Determine which package the feature belongs in
2. Follow existing patterns and code organization
3. Add appropriate tests
4. Ensure proper imports using workspace protocol