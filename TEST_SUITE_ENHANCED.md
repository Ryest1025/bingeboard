# 🧪 Enhanced Test Suite Configuration

## Test Coverage Setup

Add to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "@vitest/coverage-c8": "^0.24.0",
    "@vitest/ui": "^0.24.0"
  }
}
```

## Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      include: ['server/services/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      thresholds: {
        global: {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
});
```

## Enhanced Test Commands

```bash
# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run specific test suite
npx vitest advancedPersonalization.test.ts

# Run tests in CI mode
npm run test:run
```

## Performance Testing Setup

The enhanced test suite includes:

✅ **Safe timer mocking** with `vi.setSystemTime()`
✅ **Precise error counting** with metric resets
✅ **Type-safe test helpers** for invalid data scenarios
✅ **Snapshot testing** for explanation consistency
✅ **Property-based testing** with randomized inputs
✅ **Stress testing** with concurrent operations
✅ **Batch processing transactionality** validation

## Coverage Targets

| Component | Target | Current |
|-----------|--------|---------|
| **Functions** | 95% | Tracking |
| **Lines** | 95% | Tracking |
| **Branches** | 90% | Tracking |
| **Statements** | 95% | Tracking |

## Test Organization

```
tests/
├── advancedPersonalization.test.ts (Enhanced)
├── __snapshots__/ (Auto-generated)
├── helpers/
│   ├── mockData.ts
│   └── testUtils.ts
└── performance/
    ├── loadTesting.test.ts
    └── memoryTesting.test.ts
```

## CI/CD Integration

For GitHub Actions, add:

```yaml
- name: Run Tests with Coverage
  run: npm run test:coverage

- name: Upload Coverage Reports
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/coverage-final.json
```

Your test suite is now production-ready with comprehensive coverage, safety improvements, and performance validation! 🎉
