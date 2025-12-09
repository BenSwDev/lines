# E2E Tests with Playwright

## Overview

E2E tests using Playwright to simulate real user interactions across the entire application.

## Why Playwright?

- ✅ **Fast & Reliable** - Much faster than Selenium
- ✅ **Auto-Waiting** - Automatically waits for elements (no manual sleep needed)
- ✅ **Cross-Browser** - Tests run on Chrome, Firefox, Safari, Edge
- ✅ **Mobile Testing** - Can test mobile viewports
- ✅ **Video/Screenshots** - Automatically captures on failure
- ✅ **TypeScript Support** - Full type safety
- ✅ **Real User Simulation** - Acts like a real user, not just API calls

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug mode (step through tests)
pnpm test:e2e:debug

# Run specific test file
pnpm exec playwright test tests/e2e/modules/lines/create-line.spec.ts

# Run tests on specific browser
pnpm exec playwright test --project=chromium
```

## Test Structure

```
tests/e2e/
├── modules/
│   ├── lines/
│   │   ├── create-line.spec.ts
│   │   └── edit-line.spec.ts
│   ├── floor-plan-editor/
│   │   └── create-floor-plan.spec.ts
│   └── roles-hierarchy/
│       └── create-role.spec.ts
├── helpers/
│   ├── auth.ts          # Authentication helpers
│   └── seed.ts          # Test data seeding
└── README.md
```

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from "@playwright/test";

test("should create a line", async ({ page }) => {
  // Navigate
  await page.goto("/venues/test-venue/lines");

  // Click button
  await page.getByRole("button", { name: /צור ליין/i }).click();

  // Fill form
  await page.getByLabel(/שם/i).fill("Test Line");

  // Submit
  await page.getByRole("button", { name: /שמור/i }).click();

  // Verify
  await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible();
});
```

### Best Practices

1. **Use semantic selectors** - Prefer `getByRole`, `getByLabel`, `getByText`
2. **Use auto-waiting** - Playwright automatically waits, no need for `sleep()`
3. **Test user flows** - Test complete workflows, not just components
4. **Isolate tests** - Each test should be independent
5. **Use fixtures** - Share common setup/teardown logic

## Configuration

See `playwright.config.ts` for configuration options:

- **Base URL**: Set via `PLAYWRIGHT_TEST_BASE_URL` env var
- **Browsers**: Configured in `projects` array
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Taken on failure
- **Videos**: Recorded on failure

## CI/CD Integration

Tests run automatically on:

- Push to `main` or `develop`
- Pull requests

See `.github/workflows/playwright.yml` for CI configuration.
