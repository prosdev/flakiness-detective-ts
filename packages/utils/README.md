# @flakiness-detective/utils

Shared utilities and helper functions for Flakiness Detective.

## Overview

This package provides common utilities used across all Flakiness Detective packages, including logging, type definitions, and helper functions.

## Logger

A simple, configurable logger with multiple log levels.

### Usage

```typescript
import { createLogger } from "@flakiness-detective/utils";

const logger = createLogger({ level: "info" });

logger.log("Processing test failures...");
logger.log("Found 10 clusters");
```

### Log Levels

- `debug` - Detailed debugging information
- `info` - General informational messages (default)
- `warn` - Warning messages
- `error` - Error messages
- `silent` - No output

### Custom Logger Implementation

You can also implement your own logger:

```typescript
import type { Logger } from "@flakiness-detective/utils";

const customLogger: Logger = {
  log: (message: string) => {
    // Your custom logging logic
    console.log(`[CUSTOM] ${message}`);
  },
};
```

## API Reference

### `createLogger(options)`

Creates a logger instance with the specified configuration.

**Parameters**:

- `options.level` - Log level (`'debug'` | `'info'` | `'warn'` | `'error'` | `'silent'`)

**Returns**: `Logger` instance

### `Logger` Interface

```typescript
interface Logger {
  log(message: string): void;
}
```

## Examples

### Basic Logging

```typescript
import { createLogger } from "@flakiness-detective/utils";

const logger = createLogger({ level: "info" });

logger.log("Starting flakiness detection...");
logger.log("Analysis complete");
```

### Debug Mode

```typescript
import { createLogger } from "@flakiness-detective/utils";

const logger = createLogger({ level: "debug" });

logger.log("Fetching failures from database...");
logger.log("Generating embeddings...");
logger.log("Running DBSCAN clustering...");
```

### Silent Mode

```typescript
import { createLogger } from "@flakiness-detective/utils";

const logger = createLogger({ level: "silent" });

// No output
logger.log("This will not be logged");
```

## Integration

The `utils` package is used by all other Flakiness Detective packages:

- **Core**: For logging detection pipeline progress
- **Adapters**: For logging adapter operations (fetch, save, etc.)
- **CLI**: For user-facing output and verbose logging

## Related Packages

- **@flakiness-detective/core** - Core detection engine ([docs](../core/README.md))
- **@flakiness-detective/adapters** - Data adapters and embedding providers ([docs](../adapters/README.md))
- **@flakiness-detective/cli** - Command-line interface ([docs](../cli/README.md))

## License

MIT
