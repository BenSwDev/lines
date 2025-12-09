import { test, expect } from "@playwright/test";
import { loginAsUser, navigateToVenue, getTestVenueId } from "../../helpers/auth";

test.describe("Create Line E2E", () => {
  let venueId: string;

  test.beforeEach(async ({ page }) => {
    // Authenticate first
    await loginAsUser(page);

    // Get test venue ID
    venueId = await getTestVenueId();

    // Navigate to lines page
    await navigateToVenue(page, venueId);
    await page.goto(`/venues/${venueId}/lines`);
  });

  test("should navigate to lines page", async ({ page }) => {
    // Verify we're on the lines page
    await expect(page).toHaveURL(/\/venues\/.+\/lines/);

    // Check for create button or header
    const createButton = page.getByRole("button", { name: /צור ליין חדש|Create New Line/i });
    await expect(createButton).toBeVisible();
  });

  test("should open create line dialog", async ({ page }) => {
    // Click create button
    const createButton = page.getByRole("button", { name: /צור ליין חדש|Create New Line/i });
    await createButton.click();

    // Verify dialog is open
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Check dialog title
    await expect(dialog.getByText(/ליין|Line/i)).toBeVisible();
  });

  test("should fill in line name", async ({ page }) => {
    // Open dialog
    await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

    // Fill name field
    const nameInput = page.getByLabel(/שם הליין|Line Name/i);
    await nameInput.fill("Test Line E2E");

    await expect(nameInput).toHaveValue("Test Line E2E");
  });

  test("should select days of week", async ({ page }) => {
    // Open dialog
    await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

    // Select Monday checkbox
    const mondayCheckbox = page.getByLabel(/יום שני|Monday/i);
    await mondayCheckbox.check();

    await expect(mondayCheckbox).toBeChecked();

    // Select Wednesday
    const wednesdayCheckbox = page.getByLabel(/יום רביעי|Wednesday/i);
    await wednesdayCheckbox.check();

    await expect(wednesdayCheckbox).toBeChecked();
  });

  test("should set start and end times", async ({ page }) => {
    // Open dialog
    await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

    // Set start time
    const startTimeInput = page.getByLabel(/שעת התחלה|Start Time/i);
    await startTimeInput.fill("18:00");
    await expect(startTimeInput).toHaveValue("18:00");

    // Set end time
    const endTimeInput = page.getByLabel(/שעת סיום|End Time/i);
    await endTimeInput.fill("22:00");
    await expect(endTimeInput).toHaveValue("22:00");
  });

  test("should select frequency (weekly)", async ({ page }) => {
    // Open dialog
    await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

    // Select frequency
    const frequencySelect = page.getByLabel(/תדירות|Frequency/i);
    await frequencySelect.click();

    // Select weekly option
    await page.getByRole("option", { name: /שבועי|Weekly/i }).click();

    // Verify selection
    await expect(frequencySelect).toContainText(/שבועי|Weekly/i);
  });

  test("should select color from palette", async ({ page }) => {
    // Open dialog
    await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

    // Click color picker
    const colorButton = page.getByRole("button", { name: /צבע|Color/i }).first();
    await colorButton.click();

    // Select first color option
    const colorOptions = page.locator('[role="button"][aria-label*="color"], [data-color]').first();
    await colorOptions.click();
  });

  test("should review and toggle suggested dates", async ({ page }) => {
    // Open dialog
    await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

    // Fill required fields to generate suggestions
    await page.getByLabel(/שם הליין|Line Name/i).fill("Test Line");
    await page.getByLabel(/יום שני|Monday/i).check();
    await page.getByLabel(/שעת התחלה|Start Time/i).fill("18:00");
    await page.getByLabel(/שעת סיום|End Time/i).fill("22:00");

    // Wait for suggestions to appear
    await page.waitForSelector(/תאריכים מוצעים|Suggested Dates/i, { timeout: 5000 });

    // Toggle a date checkbox
    const dateCheckboxes = page.locator(
      'input[type="checkbox"][name*="date"], [data-testid*="date"]'
    );
    const firstDate = dateCheckboxes.first();
    if (await firstDate.isVisible()) {
      await firstDate.check();
      await expect(firstDate).toBeChecked();
    }
  });

  test("should submit form and create line", async ({ page }) => {
    // Open dialog
    await page.getByRole("button", { name: /צור ליין חדש|Create New Line/i }).click();

    // Fill all required fields
    await page.getByLabel(/שם הליין|Line Name/i).fill("E2E Test Line");
    await page.getByLabel(/יום שני|Monday/i).check();
    await page.getByLabel(/שעת התחלה|Start Time/i).fill("18:00");
    await page.getByLabel(/שעת סיום|End Time/i).fill("22:00");

    // Submit form
    const submitButton = page.getByRole("button", { name: /שמור|Save/i });
    await submitButton.click();

    // Wait for dialog to close or success message
    await page.waitForTimeout(1000);

    // Verify line appears in list or success toast
    const successMessage = page.getByText(/נוצר בהצלחה|created successfully|הוסף בהצלחה/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test("should verify line appears in list after creation", async ({ page }) => {
    // After creating a line, verify it appears in the list
    const lineCard = page.locator('[data-testid="line-card"], .line-card').filter({
      hasText: "E2E Test Line"
    });

    await expect(lineCard).toBeVisible({ timeout: 5000 });

    // Verify line details are displayed
    await expect(lineCard.getByText(/E2E Test Line/i)).toBeVisible();
  });
});
