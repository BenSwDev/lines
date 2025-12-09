// Test helper utilities

import { COLOR_PALETTE } from "@/core/config/constants";

/**
 * Create a mock venue ID
 */
export function createMockVenueId(): string {
  return `venue-${Math.random().toString(36).substring(7)}`;
}

/**
 * Create a mock user ID
 */
export function createMockUserId(): string {
  return `user-${Math.random().toString(36).substring(7)}`;
}

/**
 * Create a date string in ISO format (YYYY-MM-DD)
 */
export function createDateString(daysFromNow: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

/**
 * Get a random color from the palette
 */
export function getRandomColor(): string {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
}

/**
 * Create an array of days for testing
 */
export function createDaysArray(days: number[]): number[] {
  return days;
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
