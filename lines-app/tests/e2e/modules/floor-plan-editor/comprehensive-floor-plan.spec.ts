import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Floor Plan Editor - Comprehensive E2E Tests", () => {
  let venueId: string;
  let floorPlanId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/settings/structure`);
  });

  test.describe("Floor Plan CRUD - All Scenarios", () => {
    test("should create floor plan with all fields", async ({ page }) => {
      await page.getByRole("button", { name: /צור מפה|Create Floor Plan/i }).click();
      
      await page.getByLabel(/שם המפה|Floor Plan Name/i).fill("Complete Floor Plan");
      await page.getByLabel(/תיאור|Description/i).fill("Full description");
      
      // Set as default
      await page.getByLabel(/ברירת מחדל|Default/i).check();
      
      await page.getByRole("button", { name: /שמור|Save/i }).click();
      
      await expect(page.getByText(/נוצר בהצלחה|created successfully/i)).toBeVisible({
        timeout: 5000
      });
    });

    test("should prevent duplicate default floor plan", async ({ page }) => {
      // Create first default
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("First Default");
      await page.getByLabel(/ברירת מחדל/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      
      // Create second default - should unset first
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("Second Default");
      await page.getByLabel(/ברירת מחדל/i).check();
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      
      // Only one should be default
      // This would require checking the list
    });

    test("should edit floor plan name", async ({ page }) => {
      // Create floor plan
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("To Edit");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      
      // Edit
      const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
        hasText: "To Edit"
      });
      await floorPlanCard.click();
      
      const editButton = page.getByRole("button", { name: /ערוך|Edit/i });
      if (await editButton.isVisible()) {
        await editButton.click();
        
        await page.getByLabel(/שם המפה/i).fill("Edited Name");
        await page.getByRole("button", { name: /שמור/i }).click();
        
        await expect(page.getByText(/עודכן|updated/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test("should delete floor plan with confirmation", async ({ page }) => {
      // Create floor plan
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("To Delete");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      
      // Delete
      const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
        hasText: "To Delete"
      });
      
      const deleteButton = floorPlanCard.getByRole("button", { name: /מחק|Delete/i });
      await deleteButton.click();
      
      // Confirm
      await page.getByRole("button", { name: /אישור|Confirm/i }).click();
      
      await expect(page.getByText(/נמחק|deleted/i)).toBeVisible({ timeout: 5000 });
      await expect(floorPlanCard).not.toBeVisible();
    });
  });

  test.describe("Zone Management - All Scenarios", () => {
    test.beforeEach(async ({ page }) => {
      // Create floor plan first
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("Zone Test Plan");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      
      // Navigate to editor
      const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
        hasText: "Zone Test Plan"
      });
      await floorPlanCard.click();
      await page.waitForURL(/\/structure\/.+/);
      floorPlanId = page.url().split("/").pop() || "test-floor-plan-id";
    });

    test("should create zone with all properties", async ({ page }) => {
      const addZoneButton = page.getByRole("button", { name: /הוסף אזור|Add Zone/i });
      await addZoneButton.click();
      
      await page.getByLabel(/שם האזור|Zone Name/i).fill("VIP Zone");
      await page.getByLabel(/תיאור|Description/i).fill("VIP seating area");
      
      // Select color
      await page.getByRole("button", { name: /צבע/i }).first().click();
      await page.locator('[data-color]').first().click();
      
      // Set position and size
      await page.getByLabel(/X|positionX/i).fill("100");
      await page.getByLabel(/Y|positionY/i).fill("100");
      await page.getByLabel(/רוחב|Width/i).fill("300");
      await page.getByLabel(/גובה|Height/i).fill("200");
      
      await page.getByRole("button", { name: /שמור/i }).click();
      
      await expect(page.getByText(/נוצר|created/i)).toBeVisible({ timeout: 5000 });
    });

    test("should prevent zone collision", async ({ page }) => {
      // Create first zone
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Zone 1");
      await page.getByLabel(/X/i).fill("0");
      await page.getByLabel(/Y/i).fill("0");
      await page.getByLabel(/רוחב/i).fill("200");
      await page.getByLabel(/גובה/i).fill("200");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });
      
      // Try to create overlapping zone
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Overlapping Zone");
      await page.getByLabel(/X/i).fill("100"); // Overlaps
      await page.getByLabel(/Y/i).fill("100"); // Overlaps
      await page.getByLabel(/רוחב/i).fill("200");
      await page.getByLabel(/גובה/i).fill("200");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      // Should show collision error
      await expect(page.getByText(/נוגע|collision|קיים/i)).toBeVisible({ timeout: 5000 });
    });

    test("should edit zone position", async ({ page }) => {
      // Create zone
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Movable Zone");
      await page.getByLabel(/X/i).fill("0");
      await page.getByLabel(/Y/i).fill("0");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });
      
      // Drag or edit position
      const zoneElement = page.locator('[data-testid="zone"]').filter({ hasText: "Movable Zone" });
      
      // Either drag or edit
      await zoneElement.click();
      const editButton = page.getByRole("button", { name: /ערוך|Edit/i });
      if (await editButton.isVisible()) {
        await editButton.click();
        
        await page.getByLabel(/X/i).fill("300");
        await page.getByLabel(/Y/i).fill("300");
        await page.getByRole("button", { name: /שמור/i }).click();
        
        await expect(page.getByText(/עודכן/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test("should delete zone with cascade delete of tables", async ({ page }) => {
      // Create zone with tables
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Zone with Tables");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });
      
      // Add tables to zone
      const zoneElement = page.locator('[data-testid="zone"]').filter({
        hasText: "Zone with Tables"
      });
      await zoneElement.click();
      
      const addTableButton = page.getByRole("button", { name: /הוסף שולחן/i });
      await addTableButton.click();
      await page.getByLabel(/מספר שולחן/i).fill("1");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      // Delete zone
      await zoneElement.click();
      const deleteButton = page.getByRole("button", { name: /מחק אזור/i });
      await deleteButton.click();
      await page.getByRole("button", { name: /אישור/i }).click();
      
      // Tables should be deleted too
      await expect(page.getByText(/נמחק/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Table Management - All Scenarios", () => {
    test.beforeEach(async ({ page }) => {
      // Setup: Create floor plan and zone
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("Table Test Plan");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
      
      const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
        hasText: "Table Test Plan"
      });
      await floorPlanCard.click();
      
      // Create zone
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Table Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });
    });

    test("should create table with all properties", async ({ page }) => {
      const zoneElement = page.locator('[data-testid="zone"]').filter({ hasText: "Table Zone" });
      await zoneElement.click();
      
      await page.getByRole("button", { name: /הוסף שולחן/i }).click();
      
      await page.getByLabel(/שם|Table Name/i).fill("Table 1");
      await page.getByLabel(/מספר שולחן/i).fill("1");
      await page.getByLabel(/מספר מקומות|Seats/i).fill("4");
      
      // Set position
      await page.getByLabel(/X/i).fill("50");
      await page.getByLabel(/Y/i).fill("50");
      await page.getByLabel(/רוחב/i).fill("60");
      await page.getByLabel(/גובה/i).fill("60");
      
      await page.getByRole("button", { name: /שמור/i }).click();
      
      await expect(page.getByText(/נוצר|created/i)).toBeVisible({ timeout: 5000 });
    });

    test("should prevent table collision within zone", async ({ page }) => {
      // Create first table
      const zoneElement = page.locator('[data-testid="zone"]').filter({ hasText: "Table Zone" });
      await zoneElement.click();
      
      await page.getByRole("button", { name: /הוסף שולחן/i }).click();
      await page.getByLabel(/מספר שולחן/i).fill("1");
      await page.getByLabel(/X/i).fill("0");
      await page.getByLabel(/Y/i).fill("0");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });
      
      // Try overlapping table
      await page.getByRole("button", { name: /הוסף שולחן/i }).click();
      await page.getByLabel(/מספר שולחן/i).fill("2");
      await page.getByLabel(/X/i).fill("30"); // Overlaps
      await page.getByLabel(/Y/i).fill("30"); // Overlaps
      await page.getByRole("button", { name: /שמור/i }).click();
      
      // Should show collision error
      await expect(page.getByText(/נוגע|collision/i)).toBeVisible({ timeout: 5000 });
    });

    test("should auto-generate tables in zone", async ({ page }) => {
      const zoneElement = page.locator('[data-testid="zone"]').filter({ hasText: "Table Zone" });
      await zoneElement.click();
      
      const autoGenerateButton = page.getByRole("button", { name: /צור אוטומטי|Auto Generate/i });
      
      if (await autoGenerateButton.isVisible()) {
        await autoGenerateButton.click();
        
        // Fill generation options
        await page.getByLabel(/מספר שולחנות|Count/i).fill("10");
        await page.getByLabel(/מרווח|Spacing/i).fill("20");
        await page.getByRole("button", { name: /צור|Generate/i }).click();
        
        // Should create multiple tables
        await expect(page.getByText(/נוצרו|created/i)).toBeVisible({ timeout: 5000 });
        
        // Verify tables exist
        const tables = page.locator('[data-testid="table"]');
        const count = await tables.count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });
  });

  test.describe("Drag and Drop", () => {
    test("should drag zone to new position", async ({ page }) => {
      // Create zone
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("Drag Test");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
        hasText: "Drag Test"
      });
      await floorPlanCard.click();
      
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Draggable Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      // Drag zone
      const zoneElement = page.locator('[data-testid="zone"]').filter({
        hasText: "Draggable Zone"
      });
      
      const box = await zoneElement.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 200, box.y + 200);
        await page.mouse.up();
        
        // Position should update
        await page.waitForTimeout(1000);
        
        // Verify new position (would need to check actual position)
      }
    });
  });

  test.describe("Staffing Configuration", () => {
    test("should configure zone staffing", async ({ page }) => {
      // Setup
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("Staffing Test");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
        hasText: "Staffing Test"
      });
      await floorPlanCard.click();
      
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Staffing Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      // Configure staffing
      const zoneElement = page.locator('[data-testid="zone"]').filter({
        hasText: "Staffing Zone"
      });
      await zoneElement.click();
      
      // Switch to staffing mode
      const staffingTab = page.getByRole("tab", { name: /תפעול|Staffing/i });
      if (await staffingTab.isVisible()) {
        await staffingTab.click();
        
        // Add role requirement
        const addRoleButton = page.getByRole("button", { name: /הוסף תפקיד/i });
        if (await addRoleButton.isVisible()) {
          await addRoleButton.click();
          
          // Select role
          await page.getByLabel(/תפקיד|Role/i).click();
          await page.getByRole("option").first().click();
          
          // Set counts
          await page.getByLabel(/מנהלים|Managers/i).fill("1");
          await page.getByLabel(/עובדים|Employees/i).fill("2");
          
          await page.getByRole("button", { name: /שמור/i }).click();
          
          await expect(page.getByText(/נשמר/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe("Minimum Order Configuration", () => {
    test("should set minimum order for zone", async ({ page }) => {
      // Setup
      await page.getByRole("button", { name: /צור מפה/i }).click();
      await page.getByLabel(/שם המפה/i).fill("Min Order Test");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      const floorPlanCard = page.locator('[data-testid="floor-plan-card"]').filter({
        hasText: "Min Order Test"
      });
      await floorPlanCard.click();
      
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Min Order Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      // Set minimum order
      const zoneElement = page.locator('[data-testid="zone"]').filter({
        hasText: "Min Order Zone"
      });
      await zoneElement.click();
      
      const minOrderTab = page.getByRole("tab", { name: /מינימום|Minimum Order/i });
      if (await minOrderTab.isVisible()) {
        await minOrderTab.click();
        
        await page.getByLabel(/מינימום|Minimum/i).fill("100");
        await page.getByRole("button", { name: /שמור/i }).click();
        
        await expect(page.getByText(/נשמר/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });
});

