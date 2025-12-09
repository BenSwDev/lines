// Database mocks for testing

import { vi } from "vitest";

export const mockPrisma = {
  line: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn()
  },
  lineOccurrence: {
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn()
  },
  floorPlan: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn()
  },
  zone: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn()
  },
  table: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn()
  },
  role: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn()
  },
  venue: {
    findUnique: vi.fn(),
    findFirst: vi.fn()
  }
};

export const resetMocks = () => {
  Object.values(mockPrisma).forEach((model) => {
    Object.values(model).forEach((method) => {
      if (typeof method === "function") {
        vi.mocked(method).mockReset();
      }
    });
  });
};
