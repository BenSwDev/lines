import { test, expect } from "@playwright/test";

test.describe("Edit Line E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/venues/test-venue-id/lines");
  });

  test("should open edit dialog for existing line", async ({ page }) => {
    // Find an existing line card
    const lineCard = page.locator('[data-testid="line-card"], .line-card').first();
    await expect(lineCard).toBeVisible();

    // Click edit button or click on card
    const editButton = lineCard.getByRole("button", { name: /ערוך|Edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();
    } else {
      // Click on card itself if no edit button
      await lineCard.click();
    }

    // Verify dialog opens with line data
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
  });

  test("should update line name", async ({ page }) => {
    // Open edit dialog
    const lineCard = page.locator('[data-testid="line-card"], .line-card').first();
    await lineCard.click();

    // Update name
    const nameInput = page.getByLabel(/שם הליין|Line Name/i);
    await nameInput.clear();
    await nameInput.fill("Updated Line Name");

    // Save
    await page.getByRole("button", { name: /שמור|Save/i }).click();

    // Verify update
    await expect(page.getByText(/Updated Line Name/i)).toBeVisible({ timeout: 5000 });
  });

  test("should update schedule", async ({ page }) => {
    // Open edit dialog
    const lineCard = page.locator('[data-testid="line-card"], .line-card').first();
    await lineCard.click();

    // Uncheck Monday, check Friday
    await page.getByLabel(/יום שני|Monday/i).uncheck();
    await page.getByLabel(/יום שישי|Friday/i).check();

    // Update times
    await page.getByLabel(/שעת התחלה|Start Time/i).fill("19:00");

    // Save
    await page.getByRole("button", { name: /שמור|Save/i }).click();

    // Verify success
    await expect(page.getByText(/עודכן|updated/i)).toBeVisible({ timeout: 5000 });
  });

  test("should delete line", async ({ page }) => {
    // Open line detail or edit dialog
    const lineCard = page.locator('[data-testid="line-card"], .line-card').first();
    await lineCard.click();

    // Click delete button
    const deleteButton = page.getByRole("button", { name: /מחק|Delete/i });
    await deleteButton.click();

    // Confirm deletion in confirmation dialog
    const confirmButton = page.getByRole("button", { name: /אישור|Confirm/i });
    await confirmButton.click();

    // Verify line is removed
    await expect(lineCard).not.toBeVisible({ timeout: 5000 });
  });
});
