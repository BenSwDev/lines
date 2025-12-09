/**
 * Helper functions for seeding test data
 * These would typically interact with your database or API
 */

export interface TestVenue {
  id: string;
  name: string;
  userId: string;
}

export interface TestLine {
  id: string;
  name: string;
  venueId: string;
}

/**
 * Create a test venue for E2E tests
 * In real implementation, this would call your API or seed the database
 */
export async function createTestVenue(name: string = "E2E Test Venue"): Promise<TestVenue> {
  // This would typically call your API or seed function
  // For now, return a mock structure
  return {
    id: `venue-${Date.now()}`,
    name,
    userId: "test-user-id"
  };
}

/**
 * Create a test line for E2E tests
 */
export async function createTestLine(
  venueId: string,
  name: string = "E2E Test Line"
): Promise<TestLine> {
  return {
    id: `line-${Date.now()}`,
    name,
    venueId
  };
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(venueId: string) {
  // Implement cleanup logic
  // This would typically delete the test venue and all related data
}
