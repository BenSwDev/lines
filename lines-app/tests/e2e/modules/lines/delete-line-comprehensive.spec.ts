import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Delete Line - Comprehensive E2E Tests", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/lines`);
  });

  test.describe("Basic Delete Operations", () => {
    test("should delete line successfully", async ({ page }) => {
      // Create line first
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Line to Delete");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Delete it
      const lineCard = page
        .locator('[data-testid="line-card"]')
        .filter({ hasText: "Line to Delete" });
      await lineCard.click();

      const deleteButton = page.getByRole("button", { name: /מחק|Delete/i });
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole("button", { name: /אישור|Confirm|מחק/i });
      await confirmButton.click();

      // Verify line removed
      await expect(lineCard).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/נמחק|deleted/i)).toBeVisible();
    });

    test("should cancel delete confirmation", async ({ page }) => {
      // Create line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Cancel Delete Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try to delete but cancel
      const lineCard = page
        .locator('[data-testid="line-card"]')
        .filter({ hasText: "Cancel Delete Test" });
      await lineCard.click();

      const deleteButton = page.getByRole("button", { name: /מחק|Delete/i });
      await deleteButton.click();

      // Cancel deletion
      const cancelButton = page.getByRole("button", { name: /ביטול|Cancel/i });
      await cancelButton.click();

      // Line should still exist
      await expect(lineCard).toBeVisible();
    });
  });

  test.describe("Delete Edge Cases", () => {
    test("should handle delete of line with many occurrences", async ({ page }) => {
      // Create line with occurrences
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Line with Many Occurrences");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/יום רביעי/i).check();
      await page.getByLabel(/יום שישי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      // Select many dates
      await page.waitForTimeout(1000);
      const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
      const count = await dateCheckboxes.count();
      for (let i = 0; i < Math.min(count, 10); i++) {
        await dateCheckboxes.nth(i).check();
      }

      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Delete - should handle cascade delete of all occurrences
      const lineCard = page.locator('[data-testid="line-card"]').filter({
        hasText: "Line with Many Occurrences"
      });
      await lineCard.click();

      await page.getByRole("button", { name: /מחק/i }).click();
      await page.getByRole("button", { name: /אישור|Confirm/i }).click();

      // Should delete successfully
      await expect(page.getByText(/נמחק/i)).toBeVisible({ timeout: 10000 });
    });

    test("should free color after deletion", async ({ page }) => {
      // Create line with specific color
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Color Test Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      // Select first color
      await page.getByRole("button", { name: /צבע/i }).first().click();
      const firstColor = page.locator("[data-color]").first();
      const colorValue = await firstColor.getAttribute("data-color");
      await firstColor.click();

      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Delete line
      const lineCard = page
        .locator('[data-testid="line-card"]')
        .filter({ hasText: "Color Test Line" });
      await lineCard.click();
      await page.getByRole("button", { name: /מחק/i }).click();
      await page.getByRole("button", { name: /אישור/i }).click();
      await expect(page.getByText(/נמחק/i)).toBeVisible({ timeout: 5000 });

      // Color should be available again
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByRole("button", { name: /צבע/i }).first().click();

      const colorButton = page.locator(`[data-color="${colorValue}"]`);
      // Should not be disabled
      await expect(colorButton).not.toBeDisabled();
    });
  });
});
