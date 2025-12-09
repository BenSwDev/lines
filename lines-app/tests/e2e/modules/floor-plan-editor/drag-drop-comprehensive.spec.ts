import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Floor Plan Drag & Drop - Comprehensive E2E Tests", () => {
  let venueId: string;
  let floorPlanId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    venueId = await getTestVenueId();
    await navigateToVenue(page, venueId);
    
    // Create floor plan
    await page.goto(`/venues/${venueId}/settings/structure`);
    await page.getByRole("button", { name: /צור מפה/i }).click();
    await page.getByLabel(/שם המפה/i).fill("Drag Test Plan");
    await page.getByRole("button", { name: /שמור/i }).click();
    await expect(page.getByText(/נוצר בהצלחה/i)).toBeVisible({ timeout: 5000 });
    
    // Navigate to editor
    const floorPlanCard = page.locator('[data-testid="floor-plan-card"], .floor-plan-card').filter({
      hasText: "Drag Test Plan"
    });
    await floorPlanCard.click();
    await page.waitForURL(/\/structure\/.+/);
    floorPlanId = page.url().split("/").pop() || "test-floor-plan-id";
  });

  test.describe("Zone Drag & Drop", () => {
    test("should drag zone to new position", async ({ page }) => {
      // Create zone
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Draggable Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      await expect(page.getByText(/נוצר/i)).toBeVisible({ timeout: 5000 });
      
      // Find zone element
      const zoneElement = page.locator('[data-testid="zone"], .zone-element').first();
      await expect(zoneElement).toBeVisible();
      
      // Get initial position
      const initialBox = await zoneElement.boundingBox();
      expect(initialBox).not.toBeNull();
      
      // Drag to new position
      if (initialBox) {
        await zoneElement.hover();
        await page.mouse.move(initialBox.x + initialBox.width / 2, initialBox.y + initialBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(initialBox.x + 300, initialBox.y + 300);
        await page.mouse.up();
        
        // Wait for position update
        await page.waitForTimeout(1000);
        
        // Verify position changed (check new bounding box)
        const newBox = await zoneElement.boundingBox();
        if (newBox && initialBox) {
          expect(newBox.x).not.toBe(initialBox.x);
          expect(newBox.y).not.toBe(initialBox.y);
        }
      }
    });

    test("should prevent dragging zone outside canvas", async ({ page }) => {
      // Create zone
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Boundary Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      const zoneElement = page.locator('[data-testid="zone"]').first();
      const zoneBox = await zoneElement.boundingBox();
      
      // Get canvas boundaries
      const canvas = page.locator('[data-testid="floor-plan-canvas"], .floor-plan-canvas');
      const canvasBox = await canvas.boundingBox();
      
      if (zoneBox && canvasBox) {
        // Try to drag outside
        await zoneElement.hover();
        await page.mouse.move(zoneBox.x + zoneBox.width / 2, zoneBox.y + zoneBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(-100, -100); // Outside canvas
        await page.mouse.up();
        
        // Zone should stay within bounds
        await page.waitForTimeout(1000);
        const finalBox = await zoneElement.boundingBox();
        
        if (finalBox && canvasBox) {
          expect(finalBox.x).toBeGreaterThanOrEqual(canvasBox.x);
          expect(finalBox.y).toBeGreaterThanOrEqual(canvasBox.y);
        }
      }
    });
  });

  test.describe("Table Drag & Drop", () => {
    test.beforeEach(async ({ page }) => {
      // Create zone first
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Table Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      // Create table
      const zoneElement = page.locator('[data-testid="zone"]').first();
      await zoneElement.click();
      await page.getByRole("button", { name: /הוסף שולחן/i }).click();
      await page.getByLabel(/מספר שולחן/i).fill("1");
      await page.getByRole("button", { name: /שמור/i }).click();
    });

    test("should drag table within zone", async ({ page }) => {
      const tableElement = page.locator('[data-testid="table"], .table-element').first();
      await expect(tableElement).toBeVisible();
      
      const initialBox = await tableElement.boundingBox();
      
      if (initialBox) {
        await tableElement.hover();
        await page.mouse.move(initialBox.x + initialBox.width / 2, initialBox.y + initialBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(initialBox.x + 100, initialBox.y + 100);
        await page.mouse.up();
        
        await page.waitForTimeout(1000);
        
        const newBox = await tableElement.boundingBox();
        if (newBox && initialBox) {
          expect(newBox.x).not.toBe(initialBox.x);
        }
      }
    });

    test("should prevent dragging table outside zone", async ({ page }) => {
      const tableElement = page.locator('[data-testid="table"]').first();
      const tableBox = await tableElement.boundingBox();
      
      const zoneElement = page.locator('[data-testid="zone"]').first();
      const zoneBox = await zoneElement.boundingBox();
      
      if (tableBox && zoneBox) {
        // Try to drag outside zone
        await tableElement.hover();
        await page.mouse.move(tableBox.x + tableBox.width / 2, tableBox.y + tableBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(zoneBox.x + zoneBox.width + 100, zoneBox.y + zoneBox.height + 100);
        await page.mouse.up();
        
        await page.waitForTimeout(1000);
        
        // Table should stay within zone bounds
        const finalBox = await tableElement.boundingBox();
        if (finalBox && zoneBox) {
          expect(finalBox.x + finalBox.width).toBeLessThanOrEqual(zoneBox.x + zoneBox.width);
          expect(finalBox.y + finalBox.height).toBeLessThanOrEqual(zoneBox.y + zoneBox.height);
        }
      }
    });
  });

  test.describe("Resize Operations", () => {
    test("should resize zone", async ({ page }) => {
      await page.getByRole("button", { name: /הוסף אזור/i }).click();
      await page.getByLabel(/שם האזור/i).fill("Resizable Zone");
      await page.getByRole("button", { name: /שמור/i }).click();
      
      const zoneElement = page.locator('[data-testid="zone"]').first();
      await zoneElement.click();
      
      // Find resize handle
      const resizeHandle = page.locator('[data-resize-handle], .resize-handle').first();
      
      if (await resizeHandle.isVisible()) {
        const initialBox = await zoneElement.boundingBox();
        
        // Resize
        await resizeHandle.hover();
        await page.mouse.move(
          (await resizeHandle.boundingBox())?.x || 0,
          (await resizeHandle.boundingBox())?.y || 0
        );
        await page.mouse.down();
        await page.mouse.move(
          (await resizeHandle.boundingBox())?.x || 0 + 100,
          (await resizeHandle.boundingBox())?.y || 0 + 100
        );
        await page.mouse.up();
        
        await page.waitForTimeout(1000);
        
        const newBox = await zoneElement.boundingBox();
        if (newBox && initialBox) {
          expect(newBox.width).not.toBe(initialBox.width);
          expect(newBox.height).not.toBe(initialBox.height);
        }
      }
    });
  });
});

