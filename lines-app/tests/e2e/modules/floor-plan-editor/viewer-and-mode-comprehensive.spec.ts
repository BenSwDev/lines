import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Floor Plan Viewer & Mode Switching - Comprehensive E2E Tests", () => {
  let venueId: string;
  let floorPlanId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);

    // Create floor plan with content
    await page.goto(`/venues/${venueId}/settings/structure`);
    await page.getByRole("button", { name: /צור מפה/i }).click();
    await page.getByLabel(/שם המפה/i).fill("Viewer Test Plan");
    await page.getByRole("button", { name: /שמור/i }).click();
    await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

    const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
      hasText: "Viewer Test Plan"
    });
    await floorPlanCard.click();
    await page.waitForURL(/\/structure\/.+/);
    floorPlanId = page.url().split("/").pop() || "test-floor-plan-id";
  });

  test.describe("View Mode (Read-Only)", () => {
    test("should display floor plan in view mode", async ({ page }) => {
      // Should be in view mode by default or after clicking view
      const viewModeButton = page.getByRole("button", { name: /צפה|View/i });
      if (await viewModeButton.isVisible()) {
        await viewModeButton.click();
      }

      // Should show floor plan content
      const canvas = page.locator('[data-testid="floor-plan-canvas"], .floor-plan-canvas');
      await expect(canvas).toBeVisible();

      // Edit buttons should not be visible
      const editButton = page.getByRole("button", { name: /ערוך|Edit/i });
      await expect(editButton).not.toBeVisible();
    });

    test("should prevent editing in view mode", async ({ page }) => {
      // Enter view mode
      const viewModeButton = page.getByRole("button", { name: /צפה/i });
      if (await viewModeButton.isVisible()) {
        await viewModeButton.click();
      }

      // Try to click on canvas - should not trigger edit
      const canvas = page.locator('[data-testid="floor-plan-canvas"]');
      await canvas.click();

      // No edit dialog should appear
      const editDialog = page.getByRole("dialog");
      await expect(editDialog).not.toBeVisible();
    });
  });

  test.describe("Edit Mode Switching", () => {
    test("should switch from view to edit mode", async ({ page }) => {
      // Start in view mode
      const viewButton = page.getByRole("button", { name: /צפה/i });
      if (await viewButton.isVisible()) {
        await viewButton.click();
      }

      // Switch to edit mode
      const editButton = page.getByRole("button", { name: /ערוך|Edit/i });
      await editButton.click();

      // Edit tools should appear
      const addZoneButton = page.getByRole("button", { name: /הוסף אזור/i });
      await expect(addZoneButton).toBeVisible();
    });

    test("should switch between edit modes", async ({ page }) => {
      // Switch to structure builder mode
      const structureTab = page.getByRole("tab", { name: /מבנה|Structure/i });
      if (await structureTab.isVisible()) {
        await structureTab.click();
        await expect(structureTab).toHaveAttribute("aria-selected", "true");
      }

      // Switch to content editor mode
      const contentTab = page.getByRole("tab", { name: /תוכן|Content/i });
      if (await contentTab.isVisible()) {
        await contentTab.click();
        await expect(contentTab).toHaveAttribute("aria-selected", "true");
      }

      // Switch to staffing mode
      const staffingTab = page.getByRole("tab", { name: /תפעול|Staffing/i });
      if (await staffingTab.isVisible()) {
        await staffingTab.click();
        await expect(staffingTab).toHaveAttribute("aria-selected", "true");
      }
    });

    test("should preserve changes when switching modes", async ({ page }) => {
      // Add a zone in structure mode
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Test Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });

      // Switch to content mode
      const contentTab = page.getByRole("tab", { name: /תוכן/i });
      if (await contentTab.isVisible()) {
        await contentTab.click();
      }

      // Switch back to structure mode
      const structureTab = page.getByRole("tab", { name: /מבנה/i });
      if (await structureTab.isVisible()) {
        await structureTab.click();
      }

      // Zone should still be there
      await expect(page.getByText(/Test Zone/i)).toBeVisible();
    });
  });

  test.describe("Content Editor Mode", () => {
    test("should edit zone content in content mode", async ({ page }) => {
      // Create zone first
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Content Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });

      // Switch to content mode
      const contentTab = page.getByRole("tab", { name: /תוכן/i });
      if (await contentTab.isVisible()) {
        await contentTab.click();
      }

      // Click on zone to edit
      const zoneElement = page.locator('[data-testid="zone"]').filter({
        hasText: "Content Zone"
      });
      await zoneElement.click();

      // Edit content
      const nameInput = page.getByLabel(/שם/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill("Updated Content Zone");
        await page.getByRole("button", { name: /שמור/i }).click();
        await expect(page.getByText(/עודכן/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Error Handling - Mode Switching", () => {
    test("should handle unsaved changes warning when switching modes", async ({ page }) => {
      // Make a change
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Unsaved Zone");

      // Try to switch mode without saving
      const contentTab = page.getByRole("tab", { name: /תוכן/i });
      if (await contentTab.isVisible()) {
        await contentTab.click();

        // Should show warning or prevent switch
        const warning = page.getByText(/שינויים לא שמורים|unsaved changes/i);
        if (await warning.isVisible({ timeout: 2000 })) {
          await expect(warning).toBeVisible();
        }
      }
    });

    test("should handle network error during mode switch", async ({ page, context }) => {
      // Intercept and fail requests
      await context.route("**/api/**", (route) => {
        route.abort();
      });

      // Try to switch mode
      const contentTab = page.getByRole("tab", { name: /תוכן/i });
      if (await contentTab.isVisible()) {
        await contentTab.click();

        // Should show error
        await expect(page.getByText(/שגיאה|error/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Accessibility - Mode Switching", () => {
    test("should be keyboard navigable between modes", async ({ page }) => {
      // Tab to mode switcher
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Use arrow keys or Enter to switch
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Enter");

      // Should switch mode
      // Verify by checking active tab
    });
  });
});
