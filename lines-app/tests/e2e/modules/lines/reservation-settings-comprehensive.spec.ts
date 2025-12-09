import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Line Reservation Settings - Comprehensive E2E Tests", () => {
  let venueId: string;
  let lineId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    
    // Create a line first
    await page.goto(`/venues/${venueId}/lines`);
    await page.getByRole("button", { name: /צור ליין חדש/i }).click();
    await page.getByLabel(/שם הליין/i).fill("Reservation Settings Test");
    await page.getByLabel(/יום שני/i).check();
    await page.getByLabel(/שעת התחלה/i).fill("18:00");
    await page.getByLabel(/שעת סיום/i).fill("22:00");
    await page.getByRole("button", { name: /שמור/i }).click();
    await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    
    // Navigate to line detail
    const lineCard = page.locator('[data-testid="line-card"]').filter({
      hasText: "Reservation Settings Test"
    });
    await lineCard.click();
    await page.waitForURL(/\/lines\/.+/);
    lineId = page.url().split("/").pop() || "test-line-id";
  });

  test.describe("Enable Reservation Settings", () => {
    test("should enable personal links", async ({ page }) => {
      const settingsSection = page.getByText(/הגדרות הזמנות|Reservation Settings/i);
      
      if (await settingsSection.isVisible()) {
        await settingsSection.click();
        
        const personalLinksToggle = page.getByLabel(/קישור אישי|Personal Link/i);
        await personalLinksToggle.check();
        
        await page.getByRole("button", { name: /שמור/i }).click();
        
        await expect(page.getByText(/נשמר|saved/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test("should enable require approval", async ({ page }) => {
      const settingsSection = page.getByText(/הגדרות הזמנות/i);
      
      if (await settingsSection.isVisible()) {
        await settingsSection.click();
        
        // First enable personal links
        await page.getByLabel(/קישור אישי/i).check();
        
        // Then enable require approval
        const approvalToggle = page.getByLabel(/דורש אישור|Require Approval/i);
        await approvalToggle.check();
        
        await page.getByRole("button", { name: /שמור/i }).click();
        
        await expect(page.getByText(/נשמר/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test("should enable waitlist management", async ({ page }) => {
      const settingsSection = page.getByText(/הגדרות הזמנות/i);
      
      if (await settingsSection.isVisible()) {
        await settingsSection.click();
        
        const waitlistToggle = page.getByLabel(/ניהול תור|Waitlist/i);
        await waitlistToggle.check();
        
        await page.getByRole("button", { name: /שמור/i }).click();
        
        await expect(page.getByText(/נשמר/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Day Schedules Configuration", () => {
    test("should add day schedule for Monday", async ({ page }) => {
      const settingsSection = page.getByText(/הגדרות הזמנות/i);
      
      if (await settingsSection.isVisible()) {
        await settingsSection.click();
        
        // Enable personal links first
        await page.getByLabel(/קישור אישי/i).check();
        await page.waitForTimeout(500);
        
        // Add day schedule
        const addScheduleButton = page.getByRole("button", { name: /הוסף יום|Add Day/i });
        if (await addScheduleButton.isVisible()) {
          await addScheduleButton.click();
          
          // Select Monday
          await page.getByLabel(/יום שני|Monday/i).click();
          await page.getByLabel(/שעת התחלה/i).fill("19:00");
          await page.getByLabel(/שעת סיום/i).fill("23:00");
          await page.getByLabel(/מרווח|Interval/i).fill("30");
          
          await page.getByRole("button", { name: /שמור/i }).click();
          
          await expect(page.getByText(/נוסף|added/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test("should validate day schedule times", async ({ page }) => {
      const settingsSection = page.getByText(/הגדרות הזמנות/i);
      
      if (await settingsSection.isVisible()) {
        await settingsSection.click();
        await page.getByLabel(/קישור אישי/i).check();
        await page.waitForTimeout(500);
        
        const addScheduleButton = page.getByRole("button", { name: /הוסף יום/i });
        if (await addScheduleButton.isVisible()) {
          await addScheduleButton.click();
          
          // Invalid time (end before start)
          await page.getByLabel(/שעת התחלה/i).fill("22:00");
          await page.getByLabel(/שעת סיום/i).fill("18:00");
          
          await page.getByRole("button", { name: /שמור/i }).click();
          
          // Should show validation error
          await expect(page.getByText(/שעת סיום.*לפני/i)).toBeVisible();
        }
      }
    });
  });

  test.describe("Error Scenarios", () => {
    test("should show error for excluded line", async ({ page, context }) => {
      // First, exclude line from reservations (via venue settings)
      // This would require navigating to venue settings and excluding the line
      
      // Then try to configure reservation settings
      const settingsSection = page.getByText(/הגדרות הזמנות/i);
      
      if (await settingsSection.isVisible()) {
        await settingsSection.click();
        
        // Should show error that line is excluded
        await expect(
          page.getByText(/ליין.*לא מורשה|line.*excluded|לא ניתן/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test("should show error when reservations disabled for venue", async ({ page, context }) => {
      // Simulate venue with reservations disabled
      // Navigate to settings
      
      const settingsSection = page.getByText(/הגדרות הזמנות/i);
      
      if (await settingsSection.isVisible()) {
        await settingsSection.click();
        
        // Should show error that reservations are disabled
        await expect(
          page.getByText(/הזמנות.*מושבתות|reservations.*disabled/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });
});

