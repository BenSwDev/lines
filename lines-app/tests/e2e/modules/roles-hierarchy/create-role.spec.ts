import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Create Role E2E", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/settings/roles`);
  });

  test("should navigate to roles page", async ({ page }) => {
    await expect(page).toHaveURL(/\/venues\/.+\/settings\/roles/);

    const createButton = page.getByRole("button", { name: /צור תפקיד|Create Role/i });
    await expect(createButton).toBeVisible();
  });

  test("should open create role dialog", async ({ page }) => {
    await page.getByRole("button", { name: /צור תפקיד|Create Role/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(dialog.getByText(/תפקיד|Role/i)).toBeVisible();
  });

  test("should fill role details", async ({ page }) => {
    await page.getByRole("button", { name: /צור תפקיד|Create Role/i }).click();

    // Fill name
    const nameInput = page.getByLabel(/שם התפקיד|Role Name/i);
    await nameInput.fill("Barista E2E");
    await expect(nameInput).toHaveValue("Barista E2E");

    // Select color
    const colorButton = page.getByRole("button", { name: /צבע|Color/i }).first();
    await colorButton.click();

    // Select icon if available
    const iconInput = page.getByLabel(/אייקון|Icon/i);
    if (await iconInput.isVisible()) {
      await iconInput.fill("☕");
    }
  });

  test("should create role with management requirement", async ({ page }) => {
    await page.getByRole("button", { name: /צור תפקיד|Create Role/i }).click();

    await page.getByLabel(/שם התפקיד|Role Name/i).fill("Manager Role");

    // Check requires management
    const managementCheckbox = page.getByLabel(/דורש ניהול|Requires Management/i);
    await managementCheckbox.check();

    // Submit
    await page.getByRole("button", { name: /שמור|Save/i }).click();

    // Verify success
    await expect(page.getByText(/נוצר בהצלחה|created successfully/i)).toBeVisible({
      timeout: 5000
    });
  });

  test("should verify role appears in hierarchy", async ({ page }) => {
    // After creating role, verify it appears
    const roleCard = page.locator('[data-testid="role-card"], .role-card').filter({
      hasText: "Barista E2E"
    });

    await expect(roleCard).toBeVisible({ timeout: 5000 });
  });
});
