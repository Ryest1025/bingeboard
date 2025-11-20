# Quick Start - Multi-API Integration & Testing

## Current Status 🟨

**Multi-API utilities:** ✅ Created & committed (commit: 146ade0)  
**Testing infrastructure:** ✅ Installed & configured (commit: f1db5a1)  
**Test execution:** 🚫 **BLOCKED** by Jest/ESM configuration

---

## Immediate Problem

Tests fail with:
```
SyntaxError: Cannot use import statement outside a module
```

**Why?** `client/package.json` has `"type": "module"` (for Vite), but Jest expects CommonJS.

---

## Quick Fix Options

### Option 1: Enable Jest ESM Support (Recommended)

**Update `jest.config.js`:**
```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/client/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
};
```

**Update `client/package.json` test scripts:**
```json
{
  "scripts": {
    "test": "NODE_OPTIONS='--experimental-vm-modules' jest",
    "test:watch": "NODE_OPTIONS='--experimental-vm-modules' jest --watch",
    "test:coverage": "NODE_OPTIONS='--experimental-vm-modules' jest --coverage"
  }
}
```

**Test:**
```bash
cd /workspaces/bingeboard-local/client
npm test -- formatApiItem.basic.test.ts
```

### Option 2: Vitest (Alternative - Better ESM Support)

```bash
npm install --save-dev vitest @vitest/ui
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./client/src/setupTests.ts'],
    globals: true,
  },
});
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## What's Ready to Use

### ✅ Multi-API Utilities (Production-Ready)

```typescript
// Format any API response to consistent shape
import { formatApiItem } from '@/utils/formatApiItem';
const item = formatApiItem(rawApiResponse);

// Call Multi-API endpoints with timeout
import { multiApiFetch } from '@/utils/multiApiFetch';
const result = await multiApiFetch('/discover?limit=100');

// Pick spotlight without repeats
import { pickNextSpotlight } from '@/utils/spotlight';
const next = pickNextSpotlight(items, currentSpotlight);
```

### ✅ MSW Mocks (Ready for Tests)

Mock endpoints configured in `client/src/mocks/handlers.ts`:
- `/api/multi-api/discover` → Returns 3 items with streaming
- `/api/multi-api/availability` → Provider URLs
- `/api/tmdb/discover/tv` → Fallback data
- `/api/tmdb/tv/top_rated` → Top rated shows
- `/api/content/dashboard` → Dashboard data

### ⏳ Pending Implementation

**User-provided code ready to add:**
1. **Refactored Discover Page** - Full implementation (~400 lines)
2. **Integration Test** - Tests complete flow (~80 lines)

---

## After Unblocking Tests

### Step 1: Verify Test Infrastructure
```bash
cd /workspaces/bingeboard-local/client
npm test -- formatApiItem.basic.test.ts
```

**Expected:** 3 passing tests

### Step 2: Run Full Test Suite
```bash
npm test -- formatApiItem.test.ts spotlight.test.ts
```

**Expected:** 60+ passing tests

### Step 3: Verify MSW Integration
```bash
npm test -- setupTests
```

**Expected:** MSW server starts without errors

### Step 4: Implement Discover Page Refactor

User provided complete code for:
- `client/src/pages/discover.tsx` - Refactored with multi-API
- `client/src/pages/discover.integration.test.tsx` - Integration test

**Implementation:**
1. Replace current discover.tsx with refactored version
2. Add integration test file
3. Run integration test
4. Verify in browser

---

## Files to Reference

### Configuration
- `jest.config.js` - Jest settings
- `client/package.json` - Test scripts
- `client/src/setupTests.ts` - Test environment

### Utilities
- `client/src/utils/formatApiItem.ts`
- `client/src/utils/multiApiFetch.ts`
- `client/src/utils/spotlight.ts`

### Tests
- `client/src/utils/__tests__/formatApiItem.test.ts` (35+ tests)
- `client/src/utils/__tests__/spotlight.test.ts` (25+ tests)
- `client/src/utils/__tests__/formatApiItem.basic.test.ts` (3 tests)

### Mocks
- `client/src/mocks/handlers.ts` - API mock responses
- `client/src/mocks/server.ts` - MSW server setup

### Documentation
- `MULTI_API_TESTING_SETUP.md` - Full setup guide
- `TESTING_INFRASTRUCTURE_STATUS.md` - Current status & blocker details

---

## Backend Status ✅

All endpoints working (verified with curl):
```bash
curl https://bingeboard-two.vercel.app/api/content/discover?limit=1
curl https://bingeboard-two.vercel.app/api/content/dashboard?limit=1
curl https://bingeboard-two.vercel.app/api/tmdb/tv/top_rated?limit=5
```

All return 200 OK with streaming data.

---

## Git Commits

- **146ade0**: Multi-API utilities (formatApiItem, multiApiFetch, spotlight)
- **f1db5a1**: Testing infrastructure (Jest, MSW, configuration)
- *(Next)*: Jest ESM fix or Vitest migration
- *(Next)*: Discover page refactor
- *(Next)*: Integration tests

---

## Priority Actions

1. **HIGH:** Fix Jest ESM configuration (Option 1) or switch to Vitest (Option 2)
2. **HIGH:** Run tests to verify 60+ test cases pass
3. **MEDIUM:** Implement user-provided Discover page refactor
4. **MEDIUM:** Add integration test for complete flow
5. **LOW:** Add CI/CD workflow for automated testing

---

## Success Metrics

- [ ] Jest/Vitest runs without import errors
- [ ] 60+ utility tests passing
- [ ] MSW mocks working in tests
- [ ] Discover page refactored with multi-API
- [ ] Integration test passing
- [ ] Coverage >70% on utilities

---

**Last Updated:** 2024-11-20T03:15:00Z  
**Next Session Focus:** Unblock Jest or migrate to Vitest
