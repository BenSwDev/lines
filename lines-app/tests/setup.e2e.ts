// E2E test setup
// This file runs before each E2E test

import { beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  // Setup for E2E tests
  // Mock window.location, localStorage, etc. if needed
});

export {};
