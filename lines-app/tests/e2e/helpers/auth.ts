import { Page } from "@playwright/test";

/**
 * Helper function to authenticate user for E2E tests
 * Uses existing seeded credentials (demo@lines.app / demo123)
 * or test credentials created via seed script
 */
export async function loginAsUser(
  page: Page,
  email: string = "demo@lines.app",
  password: string = "demo123"
) {
  // Get base URL from environment or use default
  const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 
                  process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.TEST_BASE_URL || 
                  "http://localhost:3000";
  
  // Navigate to login page
  await page.goto(`${baseURL}/auth/login`);
  await page.waitForLoadState("networkidle");

  // Fill login form - use IDs directly
  const emailInput = page.locator('#email');
  await emailInput.waitFor({ state: "visible", timeout: 5000 });
  await emailInput.fill(email);

  const passwordInput = page.locator('#password');
  await passwordInput.waitFor({ state: "visible", timeout: 5000 });
  await passwordInput.fill(password);

  // Submit - find button by type submit
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.waitFor({ state: "visible", timeout: 5000 });
  await submitButton.click();

  // Wait for navigation - could go to dashboard or venues
  await page.waitForURL(/\/(dashboard|venues)/, { timeout: 15000 });

  // Wait a bit for session to be fully established
  await page.waitForTimeout(2000);
}

/**
 * Helper to navigate to a specific venue
 * Assumes user is already authenticated
 */
export async function navigateToVenue(page: Page, venueId: string) {
  const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 
                  process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.TEST_BASE_URL || 
                  "http://localhost:3000";
  await page.goto(`${baseURL}/venues/${venueId}`);
  await page.waitForLoadState("networkidle");
}

/**
 * Helper to get test venue ID
 * Creates a real (non-demo) venue for testing
 */
export async function getTestVenueId(): Promise<string> {
  // Use a real venue ID (not starting with "demo-") to avoid demo redirects
  // This ensures tests can access the venue normally
  return "test-venue-e2e";
}
