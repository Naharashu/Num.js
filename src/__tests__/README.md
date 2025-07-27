# Testing Setup

This directory contains tests for the Num.js TypeScript migration.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch
```

## Test Structure

- `setup.test.ts` - Basic setup verification tests
- Future test files will be organized by module:
  - `core.test.ts` - Core mathematical functions
  - `matrix.test.ts` - Matrix and Array3d classes
  - `neural.test.ts` - Neural network functions

## Writing Tests

Tests use Bun's built-in test runner. Example:

```typescript
import { test, expect, describe } from "bun:test";

describe("My Module", () => {
  test("should do something", () => {
    expect(1 + 1).toBe(2);
  });
});
```