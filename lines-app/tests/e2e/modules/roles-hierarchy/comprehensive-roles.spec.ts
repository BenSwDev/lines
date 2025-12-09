import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Roles & Hierarchy - Comprehensive E2E Tests", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/settings/roles`);
  });

  test.describe("Role CRUD - All Scenarios", () => {
    test("should create role with all fields", async ({ page }) => {
      await page.getByRole("button", { name: /צור תפקיד|Create Role/i }).click();

      await page.getByLabel(/שם התפקיד|Role Name/i).fill("Complete Role");
      await page.getByLabel(/תיאור|Description/i).fill("Full role description");

      // Select color
      await page.getByRole("button", { name: /צבע/i }).first().click();
      await page.locator("[data-color]").first().click();

      // Select icon
      const iconInput = page.getByLabel(/אייקון|Icon/i);
      if (await iconInput.isVisible()) {
        await iconInput.fill("👨‍💼");
      }

      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });

    test("should prevent duplicate role names", async ({ page }) => {
      // Create first role
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Duplicate Test");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try to create duplicate
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Duplicate Test");
      await page.getByRole("button", { name: /שמור/i }).click();

      // Should show error
      await expect(page.getByText(/קיים|exists|שם תפוס/i)).toBeVisible({ timeout: 5000 });
    });

    test("should edit role", async ({ page }) => {
      // Create role
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("To Edit");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Edit
      const roleCard = page.locator('[data-testid="role-card"]').filter({ hasText: "To Edit" });
      await roleCard.click();

      const editButton = page.getByRole("button", { name: /ערוך/i });
      await editButton.click();

      await page.getByLabel(/שם התפקיד/i).fill("Edited Role");
      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/עודכן/i)).toBeVisible({ timeout: 5000 });
    });

    test("should delete role", async ({ page }) => {
      // Create role
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("To Delete");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Delete
      const roleCard = page.locator('[data-testid="role-card"]').filter({ hasText: "To Delete" });
      await roleCard.click();

      const deleteButton = page.getByRole("button", { name: /מחק/i });
      await deleteButton.click();

      await page.getByRole("button", { name: /אישור/i }).click();

      await expect(page.getByText(/נמחק/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Hierarchy Management", () => {
    test("should create parent-child relationship", async ({ page }) => {
      // Create parent role first
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Parent Role");
      await page.getByLabel(/דורש ניהול|Requires Management/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Create child role
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Child Role");

      // Select parent
      await page.getByLabel(/תפקיד אב|Parent Role/i).click();
      await page.getByRole("option", { name: /Parent Role/i }).click();

      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    });

    test("should prevent circular references", async ({ page }) => {
      // Create role A
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Role A");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Create role B with A as parent
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Role B");
      await page.getByLabel(/תפקיד אב/i).click();
      await page.getByRole("option", { name: /Role A/i }).click();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try to set B as parent of A (circular)
      const roleACard = page.locator('[data-testid="role-card"]').filter({ hasText: "Role A" });
      await roleACard.click();
      await page.getByRole("button", { name: /ערוך/i }).click();

      await page.getByLabel(/תפקיד אב/i).click();
      // Role B should not appear or should be disabled
      const roleBOption = page.getByRole("option", { name: /Role B/i });
      const isDisabled = await roleBOption.getAttribute("disabled");

      // Should prevent selection or show error
      if (isDisabled === null) {
        await roleBOption.click();
        await page.getByRole("button", { name: /שמור/i }).click();

        // Should show error
        await expect(page.getByText(/מעגלי|circular/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test("should prevent deleting role with children", async ({ page }) => {
      // Create parent
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Parent with Child");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Create child
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Child Role");
      await page.getByLabel(/תפקיד אב/i).click();
      await page.getByRole("option", { name: /Parent with Child/i }).click();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try to delete parent
      const parentCard = page.locator('[data-testid="role-card"]').filter({
        hasText: "Parent with Child"
      });
      await parentCard.click();
      await page.getByRole("button", { name: /מחק/i }).click();

      // Should show error
      await expect(page.getByText(/יש תפקידים תלויים|has children/i)).toBeVisible({
        timeout: 5000
      });
    });
  });

  test.describe("Management Roles", () => {
    test("should auto-create management role", async ({ page }) => {
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Managed Role");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Verify management role created (should appear in list)
      await expect(page.getByText(/ניהול Managed Role/i)).toBeVisible();
    });

    test("should update management role name when role name changes", async ({ page }) => {
      // Create role with management
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Original Name");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Edit name
      const roleCard = page.locator('[data-testid="role-card"]').filter({
        hasText: "Original Name"
      });
      await roleCard.click();
      await page.getByRole("button", { name: /ערוך/i }).click();

      await page.getByLabel(/שם התפקיד/i).fill("Updated Name");
      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/עודכן/i)).toBeVisible({ timeout: 5000 });

      // Management role name should update
      await expect(page.getByText(/ניהול Updated Name/i)).toBeVisible();
    });

    test("should prevent editing management role directly", async ({ page }) => {
      // Create role with management
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Test Role");
      await page.getByLabel(/דורש ניהול/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try to edit management role directly
      const managementRoleCard = page.locator('[data-testid="role-card"]').filter({
        hasText: /ניהול Test Role/i
      });

      if (await managementRoleCard.isVisible()) {
        await managementRoleCard.click();
        const editButton = page.getByRole("button", { name: /ערוך/i });

        // Edit button should be disabled or show error
        const isDisabled = await editButton.getAttribute("disabled");
        if (isDisabled === null) {
          await editButton.click();

          // Should show error
          await expect(page.getByText(/לא ניתן|cannot edit/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe("Validation Errors", () => {
    test("should show error for empty role name", async ({ page }) => {
      await page.getByRole("button", { name: /צור תפקיד/i }).click();

      await page.getByRole("button", { name: /שמור/i }).click();

      await expect(page.getByText(/נדרש שם|name is required/i)).toBeVisible();
    });

    test("should validate parent role is management role", async ({ page }) => {
      // Create regular role (not management)
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Regular Role");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });

      // Try to set regular role as parent
      await page.getByRole("button", { name: /צור תפקיד/i }).click();
      await page.getByLabel(/שם התפקיד/i).fill("Child Attempt");
      await page.getByLabel(/תפקיד אב/i).click();

      // Regular role should not appear in parent list, or should show error
      const regularOption = page.getByRole("option", { name: /Regular Role/i });
      if (await regularOption.isVisible()) {
        await regularOption.click();
        await page.getByRole("button", { name: /שמור/i }).click();

        // Should show error
        await expect(page.getByText(/תפקיד אב.*ניהול|parent.*management/i)).toBeVisible({
          timeout: 5000
        });
      }
    });
  });
});
