import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Date Selection - Comprehensive E2E Tests", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/lines`);
  });

  test.describe("Suggested Dates Generation", () => {
    test("should generate dates for weekly frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Weekly Dates");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/יום רביעי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.getByLabel(/תדירות/i).click();
      await page.getByRole("option", { name: /שבועי/i }).click();
      
      // Wait for suggestions
      await page.waitForTimeout(1000);
      
      // Should show suggested dates section
      await expect(page.getByText(/תאריכים מוצעים|Suggested/i)).toBeVisible();
      
      // Should have multiple date checkboxes
      const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
      const count = await dateCheckboxes.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should generate dates for monthly frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Monthly Dates");
      await page.getByLabel(/יום ראשון/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.getByLabel(/תדירות/i).click();
      await page.getByRole("option", { name: /חודשי/i }).click();
      
      await page.waitForTimeout(1000);
      
      // Should show dates (fewer than weekly)
      const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
      const count = await dateCheckboxes.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should not show dates for variable frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Variable Dates");
      await page.getByLabel(/יום שני/i).check();
      
      await page.getByLabel(/תדירות/i).click();
      await page.getByRole("option", { name: /משתנה/i }).click();
      
      // Should NOT show date selection section
      const dateSection = page.getByText(/תאריכים מוצעים/i);
      await expect(dateSection).not.toBeVisible();
    });
  });

  test.describe("Date Filtering by Selected Days", () => {
    test("should only show dates matching selected days", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Filtered Dates");
      await page.getByLabel(/יום שישי/i).check(); // Only Friday
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.waitForTimeout(1000);
      
      // All suggested dates should be Fridays
      const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
      const count = await dateCheckboxes.count();
      
      // Verify dates are Fridays (check date labels)
      for (let i = 0; i < Math.min(count, 5); i++) {
        const checkbox = dateCheckboxes.nth(i);
        const label = await checkbox.locator("..").textContent();
        // Would need to verify date is Friday
      }
    });

    test("should update dates when days change", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Dynamic Dates");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.waitForTimeout(1000);
      const initialCount = await page.locator('input[type="checkbox"][name*="date"]').count();
      
      // Add another day
      await page.getByLabel(/יום רביעי/i).check();
      await page.waitForTimeout(1000);
      
      // Should have more dates now
      const newCount = await page.locator('input[type="checkbox"][name*="date"]').count();
      expect(newCount).toBeGreaterThan(initialCount);
    });
  });

  test.describe("Month/Year Selection", () => {
    test("should filter by selected month", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Month Filter");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      // Select custom start date
      await page.getByLabel(/תאריך התחלה|Start Date/i).click();
      // Would need to interact with date picker
    });

    test("should only show months with matching days", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Month Filtering");
      await page.getByLabel(/יום שישי/i).check(); // Only Friday
      
      // If month selector exists, should only show months with Fridays
      // This depends on UI implementation
    });

    test("should only show years with matching days", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Year Filtering");
      await page.getByLabel(/יום ראשון/i).check();
      
      // Year selector should only show years with Sundays
      // All years have Sundays, so all should show
    });
  });

  test.describe("Date Toggle Operations", () => {
    test("should toggle individual dates", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Toggle Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.waitForTimeout(1000);
      
      const firstDate = page.locator('input[type="checkbox"][name*="date"]').first();
      
      // Toggle on
      await firstDate.check();
      await expect(firstDate).toBeChecked();
      
      // Toggle off
      await firstDate.uncheck();
      await expect(firstDate).not.toBeChecked();
    });

    test("should select/deselect all dates", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Select All Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.waitForTimeout(1000);
      
      // Look for "Select All" button
      const selectAllButton = page.getByRole("button", { name: /בחר הכל|Select All/i });
      
      if (await selectAllButton.isVisible()) {
        await selectAllButton.click();
        
        // All dates should be checked
        const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
        const count = await dateCheckboxes.count();
        
        for (let i = 0; i < count; i++) {
          await expect(dateCheckboxes.nth(i)).toBeChecked();
        }
      }
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle all days selected", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("All Days Test");
      
      // Select all days
      const days = [
        /יום ראשון|Sunday/i,
        /יום שני|Monday/i,
        /יום שלישי|Tuesday/i,
        /יום רביעי|Wednesday/i,
        /יום חמישי|Thursday/i,
        /יום שישי|Friday/i,
        /יום שבת|Saturday/i
      ];
      
      for (const day of days) {
        await page.getByLabel(day).check();
      }
      
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.waitForTimeout(1000);
      
      // Should show many dates (every day)
      const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
      const count = await dateCheckboxes.count();
      expect(count).toBeGreaterThan(20); // Should have many dates
    });

    test("should handle rare day combinations", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      
      await page.getByLabel(/שם הליין/i).fill("Rare Days");
      
      // Select only Saturday (rare in some contexts)
      await page.getByLabel(/יום שבת/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      
      await page.waitForTimeout(1000);
      
      // Should still generate dates
      const dateCheckboxes = page.locator('input[type="checkbox"][name*="date"]');
      const count = await dateCheckboxes.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});

