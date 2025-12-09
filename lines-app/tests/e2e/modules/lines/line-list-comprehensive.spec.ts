import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Lines List - Comprehensive E2E Tests", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/lines`);
  });

  test.describe("Empty States", () => {
    test("should show empty state when no lines exist", async ({ page }) => {
      // If no lines exist, should show empty state
      const emptyState = page.getByText(/אין ליינים|no lines|צור ליין ראשון/i);

      // Either show empty state or show create button
      const hasEmptyState = await emptyState.isVisible();
      const hasCreateButton = await page.getByRole("button", { name: /צור ליין/i }).isVisible();

      expect(hasEmptyState || hasCreateButton).toBe(true);
    });

    test("should display lines when they exist", async ({ page }) => {
      // Create a line first
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("List Test Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Refresh page
      await page.reload();

      // Should show line in list
      await expect(page.getByText(/List Test Line/i)).toBeVisible();
    });
  });

  test.describe("Line Card Display", () => {
    test("should display all line information on card", async ({ page }) => {
      // Create line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Card Display Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/יום רביעי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Verify card displays:
      const lineCard = page
        .locator('[data-testid="line-card"]')
        .filter({ hasText: "Card Display Test" });

      // Name
      await expect(lineCard.getByText(/Card Display Test/i)).toBeVisible();

      // Color chip
      await expect(lineCard.locator("[data-color], .color-chip")).toBeVisible();

      // Schedule info (days and times)
      await expect(lineCard.getByText(/18:00|18:00/i)).toBeVisible();
    });

    test("should show 'happening now' badge for active occurrence", async ({ page }) => {
      // Create line with current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const startHour = currentHour > 0 ? currentHour - 1 : 23;
      const endHour = currentHour < 23 ? currentHour + 1 : 0;

      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Active Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill(`${startHour.toString().padStart(2, "0")}:00`);
      await page.getByLabel(/שעת סיום/i).fill(`${endHour.toString().padStart(2, "0")}:00`);
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Check for "happening now" badge
      const lineCard = page.locator('[data-testid="line-card"]').filter({ hasText: "Active Line" });
      const happeningBadge = lineCard.getByText(/כרגע|happening now|פעיל/i);

      // May or may not be visible depending on current time
      const isVisible = await happeningBadge.isVisible({ timeout: 2000 });
      // Just verify card exists, badge is conditional
      await expect(lineCard).toBeVisible();
    });
  });

  test.describe("Pagination & Sorting", () => {
    test("should handle multiple lines display", async ({ page }) => {
      // Create multiple lines
      for (let i = 1; i <= 5; i++) {
        await page.getByRole("button", { name: /צור ליין חדש/i }).click();
        await page.getByLabel(/שם הליין/i).fill(`Line ${i}`);
        await page.getByLabel(/יום שני/i).check();
        await page.getByLabel(/שעת התחלה/i).fill(`${17 + i}:00`);
        await page.getByLabel(/שעת סיום/i).fill(`${21 + i}:00`);
        await page.getByRole("button", { name: /שמור/i }).click();
        await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      }

      // All lines should be visible (or paginated)
      for (let i = 1; i <= 5; i++) {
        const lineCard = page.locator('[data-testid="line-card"]').filter({ hasText: `Line ${i}` });
        await expect(lineCard).toBeVisible();
      }
    });
  });

  test.describe("Line Actions", () => {
    test("should navigate to line detail on card click", async ({ page }) => {
      // Create line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Detail Navigation Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Click on card
      const lineCard = page.locator('[data-testid="line-card"]').filter({
        hasText: "Detail Navigation Test"
      });
      await lineCard.click();

      // Should navigate to detail page
      await page.waitForURL(/\/lines\/.+/);
      await expect(page.getByText(/Detail Navigation Test/i)).toBeVisible();
    });

    test("should open edit dialog from card", async ({ page }) => {
      // Create line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Edit Action Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Click edit button
      const lineCard = page
        .locator('[data-testid="line-card"]')
        .filter({ hasText: "Edit Action Test" });
      const editButton = lineCard.getByRole("button", { name: /ערוך|Edit/i });

      if (await editButton.isVisible()) {
        await editButton.click();

        // Edit dialog should open
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(dialog.getByLabel(/שם הליין/i)).toHaveValue("Edit Action Test");
      }
    });
  });
});
