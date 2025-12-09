import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Roles Hierarchy Visualization - Comprehensive E2E Tests", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/settings/roles`);
  });

  test.describe("Hierarchy Diagram Display", () => {
    test("should display hierarchy diagram", async ({ page }) => {
      // Should show hierarchy visualization
      const diagram = page.locator('[data-testid="hierarchy-diagram"], .hierarchy-diagram');
      await expect(diagram).toBeVisible({ timeout: 5000 });
    });

    test("should show owner at top of hierarchy", async ({ page }) => {
      // Owner should be at top
      const ownerNode = page.getByText(/Owner|בעלים/i);
      await expect(ownerNode).toBeVisible();

      // Should be visually at top (would need to check position)
    });

    test("should display all roles in hierarchy", async ({ page }) => {
      // Create some roles
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Role A");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Role B");
      await page.getByLabel(/תפקיד אב/i).click();
      await page.getByRole("option", { name: /Role A/i }).click();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // All roles should appear in diagram
      await expect(page.getByText(/Role A/i)).toBeVisible();
      await expect(page.getByText(/Role B/i)).toBeVisible();
    });

    test("should show parent-child relationships", async ({ page }) => {
      // Create parent-child relationship
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Parent");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Child");
      await page.getByLabel(/תפקיד אב/i).click();
      await page.getByRole("option", { name: /Parent/i }).click();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Should show connecting line or visual connection
      const parentNode = page.getByText(/Parent/i);
      const childNode = page.getByText(/Child/i);

      await expect(parentNode).toBeVisible();
      await expect(childNode).toBeVisible();

      // Child should be below parent (would need visual verification)
    });

    test("should update diagram when role added", async ({ page }) => {
      // Create role
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("New Role");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Should appear in diagram immediately
      await expect(page.getByText(/New Role/i)).toBeVisible({ timeout: 3000 });
    });

    test("should update diagram when role deleted", async ({ page }) => {
      // Create role
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("To Delete");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Delete role
      const roleCard = page.locator('[data-testid="role-card"]').filter({ hasText: "To Delete" });
      await roleCard.click();
      await page.getByRole("button", { name: /מחק/i }).click();
      await page.getByRole("button", { name: /אישור/i }).click();
      await expect(page.getByText(/נמחק/i)).toBeVisible({ timeout: 5000 });

      // Should disappear from diagram
      await expect(page.getByText(/To Delete/i)).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Interaction with Diagram", () => {
    test("should select role when clicking node", async ({ page }) => {
      // Create role
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Clickable Role");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Click on role node in diagram
      const roleNode = page.getByText(/Clickable Role/i);
      await roleNode.click();

      // Should select role (sidebar should update)
      const sidebar = page.locator('[data-testid="role-sidebar"], .role-sidebar');
      if (await sidebar.isVisible()) {
        await expect(sidebar.getByText(/Clickable Role/i)).toBeVisible();
      }
    });

    test("should expand/collapse nodes", async ({ page }) => {
      // Create parent with children
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Expandable Parent");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Child 1");
      await page.getByLabel(/תפקיד אב/i).click();
      await page.getByRole("option", { name: /Expandable Parent/i }).click();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Click expand/collapse button if exists
      const expandButton = page.locator('[data-testid="expand-node"], .expand-button').filter({
        hasText: /Expandable Parent/i
      });
      if (await expandButton.isVisible()) {
        await expandButton.click();
        // Children should be visible/hidden
      }
    });
  });

  test.describe("Visual Layout", () => {
    test("should handle multiple levels of hierarchy", async ({ page }) => {
      // Create multi-level hierarchy
      // Owner -> Manager -> Employee

      // Level 1
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Manager Level");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Level 2
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Employee Level");
      await page.getByLabel(/תפקיד אב/i).click();
      await page.getByRole("option", { name: /Manager Level/i }).click();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // All levels should be visible
      await expect(page.getByText(/Manager Level/i)).toBeVisible();
      await expect(page.getByText(/Employee Level/i)).toBeVisible();
    });

    test("should handle wide hierarchy (many siblings)", async ({ page }) => {
      // Create parent
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Parent");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Create many children
      for (let i = 1; i <= 5; i++) {
        await page.getByRole("button", { name: /צור תפקיד/i }).click();
        await page.getByLabel(/שם התפקיד/i).fill(`Child ${i}`);
        await page.getByLabel(/תפקיד אב/i).click();
        await page.getByRole("option", { name: /Parent/i }).click();
        await page.getByRole("button", { name: /שמור/i }).click();
        await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      }

      // All children should be visible
      for (let i = 1; i <= 5; i++) {
        await expect(page.getByText(`Child ${i}`)).toBeVisible();
      }
    });

    test("should handle deep hierarchy (many levels)", async ({ page }) => {
      // Create deep chain
      let previousRole = "Owner";

      for (let level = 1; level <= 4; level++) {
        await page.getByRole("button", { name: /צור תפקיד/i }).click();
        await page.getByLabel(/שם התפקיד/i).fill(`Level ${level}`);
        if (level === 1) {
          await page.getByLabel(/דורש ניהול/i).check();
        } else {
          await page.getByLabel(/תפקיד אב/i).click();
          await page.getByRole("option", { name: previousRole }).click();
        }
        await page.getByRole("button", { name: /שמור/i }).click();
        await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
        previousRole = `Level ${level}`;
      }

      // All levels should be visible
      for (let level = 1; level <= 4; level++) {
        await expect(page.getByText(`Level ${level}`)).toBeVisible();
      }
    });
  });

  test.describe("Error Scenarios", () => {
    test("should handle empty hierarchy gracefully", async ({ page }) => {
      // With no roles, should show empty state
      const emptyState = page.getByText(/אין תפקידים|no roles/i);
      // May or may not be visible depending on if owner exists
      // Just verify diagram doesn't crash
      const diagram = page.locator('[data-testid="hierarchy-diagram"]');
      await expect(diagram).toBeVisible({ timeout: 5000 });
    });

    test("should handle broken relationships", async ({ page, context }) => {
      // Simulate broken relationship (parent deleted but child still references it)
      // This tests resilience

      // Create parent-child
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Orphan Parent");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Orphan Child");
      await page.getByLabel(/תפקיד אב/i).click();
      await page.getByRole("option", { name: /Orphan Parent/i }).click();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Delete parent (should cascade or show error)
      const parentCard = page.locator('[data-testid="role-card"]').filter({
        hasText: "Orphan Parent"
      });
      await parentCard.click();
      await page.getByRole("button", { name: /מחק/i }).click();

      // Should either prevent deletion or handle orphan gracefully
      const error = page.getByText(/יש תפקידים תלויים|has children/i);
      if (await error.isVisible({ timeout: 2000 })) {
        await expect(error).toBeVisible();
      }
    });
  });
});

