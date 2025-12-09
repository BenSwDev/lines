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
  // Navigate to login page
  await page.goto("/auth/login");

  // Fill login form
  await page.getByLabel(/אימייל|Email/i).fill(email);
  await page.getByLabel(/סיסמה|Password/i).fill(password);

  // Submit
  await page.getByRole("button", { name: /התחבר|Login|כניסה/i }).click();

  // Wait for redirect to dashboard or venues (login successful)
  await page.waitForURL(/\/(dashboard|venues)/, { timeout: 10000 });

  // Wait a bit for session to be fully established
  await page.waitForTimeout(1000);
}

/**
 * Helper to navigate to a specific venue
 * Assumes user is already authenticated
 */
export async function navigateToVenue(page: Page, venueId: string) {
  await page.goto(`/venues/${venueId}`);
  await page.waitForLoadState("networkidle");
}

/**
 * Helper to get test venue ID
 * Uses demo venue from seed, or creates a test venue
 */
export async function getTestVenueId(): Promise<string> {
  // For now, use demo venue from seed
  // In future, could create dynamic test venue
  return "demo-venue-1";
}
