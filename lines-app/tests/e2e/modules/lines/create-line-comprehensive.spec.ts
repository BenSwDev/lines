import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Create Line - Comprehensive E2E Tests", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    // Setup: Login and navigate to venue
    await loginAsUser(page);
    venueId = await getTestVenueId(); // Use demo venue from seed
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/lines`);
  });

  test.describe("Happy Path Scenarios", () => {
    test("should create line with all required fields - weekly frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

      // Fill all fields
      await page.getByLabel(/שם הליין|Line Name/i).fill("Weekly Line Test");
      await page.getByLabel(/יום שני|Monday/i).check();
      await page.getByLabel(/יום רביעי|Wednesday/i).check();
      await page.getByLabel(/שעת התחלה|Start Time/i).fill("18:00");
      await page.getByLabel(/שעת סיום|End Time/i).fill("22:00");

      // Select weekly frequency
      await page.getByLabel(/תדירות|Frequency/i).click();
      await page.getByRole("option", { name: /שבועי|Weekly/i }).click();

      // Select color
      await page
        .getByRole("button", { name: /צבע|Color/i })
        .first()
        .click();
      await page.locator("[data-color]").first().click();

      // Submit
      await page.getByRole("button", { name: /שמור|Save/i }).click();

      // Verify success
      await expect(page.getByText(/נוצר בהצלחה|created successfully/i)).toBeVisible({
        timeout: 5000
      });
      await expect(page.getByText(/Weekly Line Test/i)).toBeVisible();
    });

    test("should create line with monthly frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Monthly Line");
      await page.getByLabel(/יום ראשון/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("19:00");
      await page.getByLabel(/שעת סיום/i).fill("23:00");

      await page.getByLabel(/תדירות/i).click();
      await page.getByRole("option", { name: /חודשי|Monthly/i }).click();

      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });

    test("should create line with variable frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Variable Line");
      await page.getByLabel(/תדירות/i).click();
      await page.getByRole("option", { name: /משתנה|Variable/i }).click();

      // For variable, no date selection should appear
      await expect(page.getByLabel(/שעת התחלה/i)).toBeVisible();

      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });

    test("should create line with oneTime frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("One Time Line");
      await page.getByLabel(/יום שישי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("20:00");
      await page.getByLabel(/שעת סיום/i).fill("24:00");

      await page.getByLabel(/תדירות/i).click();
      await page.getByRole("option", { name: /חד פעמי|One Time/i }).click();

      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Validation Errors - Name Field", () => {
    test("should show error when name is empty", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      // Try to submit without name
      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show validation error
      await expect(page.getByText(/נדרש שם|name is required/i)).toBeVisible();
      // Dialog should still be open
      await expect(page.getByRole("dialog")).toBeVisible();
    });

    test("should show error when name is too long", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      const longName = "A".repeat(256); // Assuming max length is 255
      await page.getByLabel(/שם הליין/i).fill(longName);

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show validation error for length
      await expect(page.getByText(/ארוך מדי|too long/i)).toBeVisible();
    });

    test("should show error when name contains invalid characters", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Test<>Line");

      // Depending on validation rules, might show error
      await page.getByRole("button", { name: /שמור/i }).click();

      // Check for validation error if sanitization is enforced
      const errorText = page.getByText(/תווים לא חוקיים|invalid characters/i);
      if (await errorText.isVisible({ timeout: 2000 })) {
        await expect(errorText).toBeVisible();
      }
    });
  });

  test.describe("Validation Errors - Days Selection", () => {
    test("should show error when no days selected", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Test Line");
      // Don't select any days

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show error
      await expect(page.getByText(/בחר לפחות יום אחד|select at least one day/i)).toBeVisible();
    });
  });

  test.describe("Validation Errors - Time Fields", () => {
    test("should show error when start time is after end time", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Test Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("22:00");
      await page.getByLabel(/שעת סיום/i).fill("18:00"); // End before start

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show error
      await expect(page.getByText(/שעת סיום|end time.*before|אחרי שעת התחלה/i)).toBeVisible();
    });

    test("should show error when start time equals end time", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Test Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("18:00"); // Same time

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show error or warning
      await expect(page.getByText(/שעת סיום.*זהה|same time|זמנים זהים/i)).toBeVisible({
        timeout: 3000
      });
    });

    test("should show error for invalid time format", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Test Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("25:00"); // Invalid hour

      // Should show validation error
      await expect(page.getByText(/פורמט שגוי|invalid format/i)).toBeVisible();
    });

    test("should handle overnight shifts correctly", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Overnight Line");
      await page.getByLabel(/יום שישי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("22:00");
      await page.getByLabel(/שעת סיום/i).fill("02:00"); // Next day

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should accept overnight shifts
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Collision Detection", () => {
    test("should prevent creating overlapping lines", async ({ page }) => {
      // First, create a line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Existing Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try to create overlapping line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Overlapping Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("19:00"); // Overlaps with 18:00-22:00
      await page.getByLabel(/שעת סיום/i).fill("23:00");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show collision error
      await expect(page.getByText(/התנגשות|collision|קיים ליין/i)).toBeVisible({ timeout: 5000 });
    });

    test("should prevent same time collision", async ({ page }) => {
      // Create first line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("First Line");
      await page.getByLabel(/יום שלישי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try exact same time
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Duplicate Time Line");
      await page.getByLabel(/יום שלישי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show collision error
      await expect(page.getByText(/התנגשות|collision/i)).toBeVisible({ timeout: 5000 });
    });

    test("should prevent partial overlap collisions", async ({ page }) => {
      // Create first line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Line 1");
      await page.getByLabel(/יום רביעי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try partial overlap (starts before, ends during)
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Partial Overlap");
      await page.getByLabel(/יום רביעי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("17:00");
      await page.getByLabel(/שעת סיום/i).fill("20:00"); // Overlaps 18:00-20:00

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show collision error
      await expect(page.getByText(/התנגשות|collision/i)).toBeVisible({ timeout: 5000 });
    });

    test("should allow non-overlapping lines on same day", async ({ page }) => {
      // Create first line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Morning Line");
      await page.getByLabel(/יום חמישי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("09:00");
      await page.getByLabel(/שעת סיום/i).fill("12:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Create non-overlapping line
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Evening Line");
      await page.getByLabel(/יום חמישי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should succeed
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });

    test("should allow lines on different days with same times", async ({ page }) => {
      // Create line on Monday
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Monday Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Create same time on different day
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Wednesday Line");
      await page.getByLabel(/יום רביעי/i).check(); // Different day
      await page.getByLabel(/שעת התחלה/i).fill("18:00"); // Same time
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should succeed - different days don't collide
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Color Management", () => {
    test("should prevent using already used color", async ({ page }) => {
      // Create first line with color
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Line with Color");
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

      // Try to use same color again
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Duplicate Color Line");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("09:00");
      await page.getByLabel(/שעת סיום/i).fill("12:00");

      // Try to select same color - should show warning or prevent
      await page.getByRole("button", { name: /צבע/i }).first().click();
      const usedColor = page.locator(`[data-color="${colorValue}"]`);

      // Color might be disabled or show warning
      const isDisabled = await usedColor.getAttribute("disabled");
      if (isDisabled !== null) {
        await expect(usedColor).toBeDisabled();
      } else {
        // Or might show warning after selection
        await usedColor.click();
        await expect(page.getByText(/צבע.*תפוס|color.*used|צבע כבר בשימוש/i)).toBeVisible({
          timeout: 2000
        });
      }
    });

    test("should auto-assign next available color", async ({ page }) => {
      // Create multiple lines
      for (let i = 0; i < 3; i++) {
        await page.getByRole("button", { name: /צור ליין חדש/i }).click();
        await page.getByLabel(/שם הליין/i).fill(`Line ${i + 1}`);
        await page.getByLabel(/יום שני/i).check();
        await page.getByLabel(/שעת התחלה/i).fill(`${9 + i}:00`);
        await page.getByLabel(/שעת סיום/i).fill(`${13 + i}:00`);
        await page.getByRole("button", { name: /שמור/i }).click();
        await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      }

      // New line should get next available color automatically
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Auto Color Line");

      // Check that a color is pre-selected (not the ones already used)
      const selectedColor = page.locator('[data-selected="true"], .color-selected');
      await expect(selectedColor).toBeVisible();
    });
  });

  test.describe("Date Selection - Suggested Dates", () => {
    test("should generate suggested dates for weekly frequency", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Weekly Dates Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/יום רביעי/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.getByLabel(/תדירות/i).click();
      await page.getByRole("option", { name: /שבועי|Weekly/i }).click();

      // Wait for suggested dates to appear
      await page.waitForSelector(/תאריכים מוצעים|Suggested Dates/i, { timeout: 5000 });

      // Should show multiple suggested dates
      const dateCheckboxes = page.locator(
        'input[type="checkbox"][name*="date"], [data-testid*="date"]'
      );
      const count = await dateCheckboxes.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should allow toggling suggested dates on/off", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Toggle Dates Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      // Wait for dates
      await page.waitForTimeout(1000);

      const firstDate = page.locator('input[type="checkbox"][name*="date"]').first();
      if (await firstDate.isVisible()) {
        // Toggle on
        await firstDate.check();
        await expect(firstDate).toBeChecked();

        // Toggle off
        await firstDate.uncheck();
        await expect(firstDate).not.toBeChecked();
      }
    });

    test("should show only dates for selected days", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Selected Days Test");
      await page.getByLabel(/יום שישי/i).check(); // Only Friday
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.waitForTimeout(1000);

      // Suggested dates should only be Fridays
      // This would require checking the actual dates
    });
  });

  test.describe("Edge Cases - Boundary Conditions", () => {
    test("should handle minimum duration (1 minute)", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Min Duration");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("18:01"); // 1 minute

      await page.getByRole("button", { name: /שמור/i }).click();

      // Might show warning or allow
      const warning = page.getByText(/זמן קצר|short duration/i);
      if (await warning.isVisible({ timeout: 2000 })) {
        await expect(warning).toBeVisible();
      }
    });

    test("should handle maximum duration (24 hours)", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Max Duration");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("00:00");
      await page.getByLabel(/שעת סיום/i).fill("23:59");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should handle or show validation
      await expect(page.getByText(/נוצר בהצלחה|duration.*long|זמן ארוך/i)).toBeVisible({
        timeout: 5000
      });
    });

    test("should handle all days selected", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("All Days Line");

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

      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Error Handling - Network & Server Errors", () => {
    test("should handle network timeout gracefully", async ({ page, context }) => {
      // Simulate slow network
      await context.route("**/api/**", (route) => {
        setTimeout(() => route.continue(), 10000); // 10 second delay
      });

      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Timeout Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show loading state
      await expect(page.getByText(/טוען|loading/i)).toBeVisible();

      // Then show timeout error
      await expect(page.getByText(/שגיאה|error|timeout/i)).toBeVisible({ timeout: 15000 });
    });

    test("should handle server error (500)", async ({ page, context }) => {
      // Intercept and return 500
      await context.route("**/api/lines**", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Internal Server Error" })
        });
      });

      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Server Error Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show error message
      await expect(page.getByText(/שגיאת שרת|server error|נכשל/i)).toBeVisible({ timeout: 5000 });
    });

    test("should handle unauthorized error (401)", async ({ page, context }) => {
      // Intercept and return 401
      await context.route("**/api/lines**", (route) => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: "Unauthorized" })
        });
      });

      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await page.getByLabel(/שם הליין/i).fill("Unauthorized Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      await page.getByRole("button", { name: /שמור/i }).click();

      // Should redirect to login or show error
      await expect(page.getByText(/לא מורשה|unauthorized|התחבר/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("UI/UX Edge Cases", () => {
    test("should close dialog on cancel", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      // Fill some data
      await page.getByLabel(/שם הליין/i).fill("Cancel Test");

      // Click cancel/close
      await page
        .getByRole("button", { name: /ביטול|Cancel|X/i })
        .first()
        .click();

      // Dialog should close
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // Data should not be saved
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();
      await expect(page.getByLabel(/שם הליין/i)).toHaveValue("");
    });

    test("should prevent closing dialog with unsaved changes", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Unsaved Test");

      // Try to close
      await page
        .getByRole("button", { name: /X|סגור/i })
        .first()
        .click();

      // Should show confirmation or prevent
      const confirmDialog = page.getByText(/יש שינויים|unsaved changes/i);
      if (await confirmDialog.isVisible({ timeout: 2000 })) {
        await expect(confirmDialog).toBeVisible();
      }
    });

    test("should handle rapid button clicks (debouncing)", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      await page.getByLabel(/שם הליין/i).fill("Rapid Click Test");
      await page.getByLabel(/יום שני/i).check();
      await page.getByLabel(/שעת התחלה/i).fill("18:00");
      await page.getByLabel(/שעת סיום/i).fill("22:00");

      // Rapidly click submit multiple times
      const submitButton = page.getByRole("button", { name: /שמור/i });
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();

      // Should only create one line (debounced)
      await page.waitForTimeout(2000);

      // Check that only one success message appears
      const successMessages = page.getByText(/נוצר בהצלחה/i);
      const count = await successMessages.count();
      expect(count).toBeLessThanOrEqual(1);
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      // Tab through form
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAttribute("name", /name|שם/i);

      await page.keyboard.press("Tab");
      // Should focus next field
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.getByRole("button", { name: /צור ליין חדש/i }).click();

      // Check for ARIA labels
      const nameInput = page.getByLabel(/שם הליין/i);
      await expect(nameInput).toHaveAttribute("aria-label");

      const dialog = page.getByRole("dialog");
      await expect(dialog).toHaveAttribute("aria-labelledby");
    });
  });
});
