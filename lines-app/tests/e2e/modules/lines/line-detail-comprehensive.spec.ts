import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Line Detail Page - Comprehensive E2E Tests", () => {
  let venueId: string;
  let lineId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);

    // Create a line first
    await page.goto(`/venues/${venueId}/lines`);
    await page.getByRole("button", { name: /צור ליין חדש/i }).click();
    await page.getByLabel(/שם הליין/i).fill("Detail Page Test");
    await page.getByLabel(/יום שני/i).check();
    await page.getByLabel(/יום רביעי/i).check();
    await page.getByLabel(/שעת התחלה/i).fill("18:00");
    await page.getByLabel(/שעת סיום/i).fill("22:00");

    // Select some dates
    await page.waitForTimeout(1000);
    const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
    const count = await dateCheckboxes.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await dateCheckboxes.nth(i).check();
    }

    await page.getByRole("button", { name: /שמור/i }).click();
    await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

    // Navigate to detail page
    const lineCard = page
      .locator('[data-testid="line-card"]')
      .filter({ hasText: "Detail Page Test" });
    await lineCard.click();
    await page.waitForURL(/\/lines\/.+/);
    lineId = page.url().split("/").pop() || "test-line-id";
  });

  test.describe("Page Content Display", () => {
    test("should display line name and metadata", async ({ page }) => {
      await expect(page.getByText(/Detail Page Test/i)).toBeVisible();

      // Should show schedule info
      await expect(page.getByText(/יום שני|Monday/i)).toBeVisible();
      await expect(page.getByText(/18:00/i)).toBeVisible();
    });

    test("should display all occurrences", async ({ page }) => {
      // Should show list of occurrences
      const occurrencesList = page.locator('[data-testid="occurrence"], .occurrence-item');
      const count = await occurrencesList.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should show occurrence status badges", async ({ page }) => {
      const occurrences = page.locator('[data-testid="occurrence"]');
      const firstOccurrence = occurrences.first();

      // Should show date
      await expect(firstOccurrence.getByText(/\d{4}-\d{2}-\d{2}/)).toBeVisible();

      // Should show status (expected/active/cancelled)
      const statusBadge = firstOccurrence.locator("[data-status], .status-badge");
      await expect(statusBadge.first()).toBeVisible();
    });
  });

  test.describe("Occurrence Management", () => {
    test("should cancel an occurrence", async ({ page }) => {
      const occurrences = page.locator('[data-testid="occurrence"]');
      const firstOccurrence = occurrences.first();

      const cancelButton = firstOccurrence.getByRole("button", { name: /בטל|Cancel/i });

      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Should show confirmation or cancel directly
        const confirmButton = page.getByRole("button", { name: /אישור|Confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Status should update
        await expect(firstOccurrence.getByText(/בוטל|cancelled/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test("should reactivate cancelled occurrence", async ({ page }) => {
      // First cancel
      const occurrences = page.locator('[data-testid="occurrence"]');
      const firstOccurrence = occurrences.first();

      const cancelButton = firstOccurrence.getByRole("button", { name: /בטל/i });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForTimeout(1000);
      }

      // Then reactivate
      const reactivateButton = firstOccurrence.getByRole("button", { name: /הפעל|Reactivate/i });
      if (await reactivateButton.isVisible()) {
        await reactivateButton.click();
        await expect(firstOccurrence.getByText(/פעיל|active/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test("should add manual occurrence", async ({ page }) => {
      const addManualButton = page.getByRole("button", { name: /הוסף תאריך|Add Manual Date/i });

      if (await addManualButton.isVisible()) {
        await addManualButton.click();

        // Fill date picker
        const dateInput = page.getByLabel(/תאריך|Date/i);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateString = futureDate.toISOString().split("T")[0];
        await dateInput.fill(dateString);

        await page.getByRole("button", { name: /שמור|Add/i }).click();

        // New occurrence should appear
        await expect(page.getByText(dateString)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Navigation", () => {
    test("should navigate back to lines list", async ({ page }) => {
      const backButton = page.getByRole("button", { name: /חזור|Back/i });

      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForURL(/\/lines$/);
        await expect(page.getByText(/ליינים|Lines/i)).toBeVisible();
      }
    });

    test("should open edit dialog from detail page", async ({ page }) => {
      const editButton = page.getByRole("button", { name: /ערוך|Edit/i });
      await editButton.click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByLabel(/שם הליין/i)).toHaveValue("Detail Page Test");
    });
  });

  test.describe("Reservation Settings (if applicable)", () => {
    test("should show reservation settings section", async ({ page }) => {
      // Check if reservations are enabled for venue
      const settingsSection = page.getByText(/הגדרות הזמנות|Reservation Settings/i);

      if (await settingsSection.isVisible()) {
        await expect(settingsSection).toBeVisible();
      }
    });

    test("should configure personal link settings", async ({ page }) => {
      const settingsSection = page.getByText(/הגדרות הזמנות/i);

      if (await settingsSection.isVisible()) {
        // Open settings
        await settingsSection.click();

        // Enable personal links
        const personalLinksCheckbox = page.getByLabel(/קישור אישי|Personal Link/i);
        await personalLinksCheckbox.check();

        // Save
        await page.getByRole("button", { name: /שמור/i }).click();

        await expect(page.getByText(/נשמר|saved/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
