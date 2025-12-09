// Auth mocks for testing

import { vi } from "vitest";

export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User"
};

export const mockGetCurrentUser = vi.fn().mockResolvedValue(mockUser);

export const mockUnauthorizedUser = vi.fn().mockResolvedValue(null);
