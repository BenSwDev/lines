import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Create Floor Plan E2E", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/settings/structure`);
  });

  test("should navigate to floor plan page", async ({ page }) => {
    await expect(page).toHaveURL(/\/venues\/.+\/settings\/structure/);

    const createButton = page.getByRole("button", { name: /צור מפה|Create Floor Plan/i });
    await expect(createButton).toBeVisible();
  });

  test("should open create floor plan dialog", async ({ page }) => {
    await page.getByRole("button", { name: /צור מפה|Create Floor Plan/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
  });

  test("should fill floor plan name", async ({ page }) => {
    await page.getByRole("button", { name: /צור מפה|Create Floor Plan/i }).click();

    const nameInput = page.getByLabel(/שם המפה|Floor Plan Name/i);
    await nameInput.fill("Main Floor E2E");

    await expect(nameInput).toHaveValue("Main Floor E2E");
  });

  test("should create zone on floor plan", async ({ page }) => {
    // Create or open floor plan
    await page.getByRole("button", { name: /צור מפה|Create Floor Plan/i }).click();
    await page.getByLabel(/שם המפה|Floor Plan Name/i).fill("Test Floor");
    await page.getByRole("button", { name: /שמור|Save/i }).click();

    // Wait for editor to load
    await page.waitForSelector('[data-testid="floor-plan-editor"], .floor-plan-editor', {
      timeout: 5000
    });

    // Click add zone button
    const addZoneButton = page.getByRole("button", { name: /הוסף אזור|Add Zone/i });
    await addZoneButton.click();

    // Fill zone details
    await page.getByLabel(/שם האזור|Zone Name/i).fill("VIP Zone");

    // Save zone
    await page.getByRole("button", { name: /שמור|Save/i }).click();

    // Verify zone appears
    await expect(page.getByText(/VIP Zone/i)).toBeVisible({ timeout: 5000 });
  });

  test("should add table to zone", async ({ page }) => {
    // Navigate to floor plan editor
    await page.goto(`/venues/${venueId}/settings/structure/test-floor-plan-id`);

    // Click on a zone
    const zone = page.locator('[data-testid="zone"], .zone').first();
    await zone.click();

    // Click add table
    const addTableButton = page.getByRole("button", { name: /הוסף שולחן|Add Table/i });
    await addTableButton.click();

    // Fill table details
    await page.getByLabel(/מספר שולחן|Table Number/i).fill("1");
    await page.getByLabel(/מספר מקומות|Seats/i).fill("4");

    // Save
    await page.getByRole("button", { name: /שמור|Save/i }).click();

    // Verify table appears
    await expect(page.getByText(/שולחן 1|Table 1/i)).toBeVisible({ timeout: 5000 });
  });
});
