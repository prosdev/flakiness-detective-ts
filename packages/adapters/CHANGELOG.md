# @flakiness-detective/adapters

## 0.1.1

### Patch Changes

- b497b91: Initial public release of Flakiness Detective

  This is the first public release of Flakiness Detective, an AI-powered test flakiness detection tool that uses semantic embeddings and DBSCAN clustering to identify patterns in test failures.

  **Core Features:**

  - DBSCAN clustering with cosine/euclidean distance metrics
  - Rich Playwright error parsing and pattern extraction
  - Pluggable data adapters (In-Memory, Filesystem, Firestore)
  - AI embedding providers (Google Generative AI, Mock)
  - Custom Firestore schema support for existing test reporters
  - Configuration file support (.json, .js, .ts)
  - Debug mode with detailed logging and performance tracking
  - Command-line interface for CI/CD integration

  **Published Packages:**

  - `@flakiness-detective/utils` - Logger and shared utilities
  - `@flakiness-detective/core` - Detection engine with clustering algorithms
  - `@flakiness-detective/adapters` - Data adapters and AI providers
  - `@flakiness-detective/cli` - Command-line interface

  **Getting Started:**

  ```bash
  # Install packages
  pnpm add @flakiness-detective/core @flakiness-detective/adapters

  # Install peer dependencies (if using Firestore/Google AI)
  pnpm add @google-cloud/firestore @google/generative-ai

  # Or install CLI globally
  pnpm add -g @flakiness-detective/cli
  ```

  See the README for full documentation and examples.

- Updated dependencies [b497b91]
  - @flakiness-detective/utils@0.1.1
  - @flakiness-detective/core@0.1.1
