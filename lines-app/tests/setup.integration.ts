// Integration test setup
// This file runs before each integration test

import { beforeEach, vi } from "vitest";

// Global setup for integration tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock next-auth and related modules to avoid Next.js runtime dependencies in Vitest
vi.mock(
  "next-auth",
  () => ({
    // Minimal surface used in server actions
    getServerSession: vi.fn().mockResolvedValue(null),
    default: {
      handlers: { GET: vi.fn(), POST: vi.fn() }
    }
  }),
  { virtual: true }
);

vi.mock(
  "next-auth/react",
  () => ({
    useSession: () => ({ data: null, status: "unauthenticated" }),
    getSession: vi.fn().mockResolvedValue(null),
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children
  }),
  { virtual: true }
);

vi.mock(
  "next-auth/next",
  () => ({
    getServerSession: vi.fn().mockResolvedValue(null)
  }),
  { virtual: true }
);

export {};
