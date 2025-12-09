import { describe, it, expect, beforeEach, vi } from "vitest";
import { lineReservationSettingsService } from "@/modules/lines/services/lineReservationSettingsService";
import { lineReservationSettingsRepository } from "@/core/db/repositories/LineReservationSettingsRepository";
import { prisma } from "@/core/integrations/prisma/client";
import { mockLine } from "@/../../../fixtures/lines";

vi.mock("@/core/db/repositories/LineReservationSettingsRepository", () => ({
  lineReservationSettingsRepository: {
    getOrCreate: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock("@/core/integrations/prisma/client", () => ({
  prisma: {
    line: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

describe("LineReservationSettingsService", () => {
  const lineId = "line-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreate()", () => {
    it("should return existing settings", async () => {
      const mockSettings = {
        id: "settings-1",
        lineId,
        allowPersonalLink: true,
        requireApproval: false,
        manageWaitlist: true,
        daySchedules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(lineReservationSettingsRepository.getOrCreate).mockResolvedValue(mockSettings);

      const result = await lineReservationSettingsService.getOrCreate(lineId);

      expect(result).toEqual(mockSettings);
      expect(lineReservationSettingsRepository.getOrCreate).toHaveBeenCalledWith(lineId);
    });

    it("should create default settings if not exists", async () => {
      const mockSettings = {
        id: "settings-1",
        lineId,
        allowPersonalLink: false,
        requireApproval: false,
        manageWaitlist: false,
        daySchedules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(lineReservationSettingsRepository.getOrCreate).mockResolvedValue(mockSettings);

      const result = await lineReservationSettingsService.getOrCreate(lineId);

      expect(result).toEqual(mockSettings);
      expect(result.allowPersonalLink).toBe(false);
      expect(result.requireApproval).toBe(false);
      expect(result.manageWaitlist).toBe(false);
    });

    it("should return settings with day schedules", async () => {
      const mockSettings = {
        id: "settings-1",
        lineId,
        allowPersonalLink: true,
        requireApproval: false,
        manageWaitlist: false,
        daySchedules: [
          {
            id: "schedule-1",
            dayOfWeek: 1,
            startTime: "18:00",
            endTime: "22:00",
            intervalMinutes: 30,
            customerMessage: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(lineReservationSettingsRepository.getOrCreate).mockResolvedValue(mockSettings);

      const result = await lineReservationSettingsService.getOrCreate(lineId);

      expect(result.daySchedules).toHaveLength(1);
      expect(result.daySchedules[0].dayOfWeek).toBe(1);
    });

    it("should handle repository errors", async () => {
      vi.mocked(lineReservationSettingsRepository.getOrCreate).mockRejectedValue(
        new Error("Database error")
      );

      await expect(lineReservationSettingsService.getOrCreate(lineId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("update()", () => {
    it("should create new settings if not exists", async () => {
      const input = {
        allowPersonalLink: true,
        requireApproval: false,
        manageWaitlist: true
      };

      const mockSettings = {
        id: "settings-1",
        lineId,
        ...input,
        daySchedules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(mockLine);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return await callback({
          lineReservationSettings: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(mockSettings),
            update: vi.fn(),
            findUnique: vi.fn().mockResolvedValue(mockSettings)
          },
          lineReservationDaySchedule: {
            deleteMany: vi.fn(),
            createMany: vi.fn()
          }
        } as any);
      });

      const result = await lineReservationSettingsService.update(lineId, input);

      expect(result).toBeDefined();
      expect(prisma.line.findUnique).toHaveBeenCalledWith({ where: { id: lineId } });
    });

    it("should update existing settings", async () => {
      const input = {
        allowPersonalLink: false,
        requireApproval: true,
        manageWaitlist: false
      };

      const existingSettings = {
        id: "settings-1",
        lineId,
        allowPersonalLink: true,
        requireApproval: false,
        manageWaitlist: true,
        daySchedules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(mockLine);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return await callback({
          lineReservationSettings: {
            findUnique: vi.fn().mockResolvedValue(existingSettings),
            create: vi.fn(),
            update: vi.fn().mockResolvedValue({ ...existingSettings, ...input }),
            findUnique: vi.fn().mockResolvedValue({ ...existingSettings, ...input })
          },
          lineReservationDaySchedule: {
            deleteMany: vi.fn(),
            createMany: vi.fn()
          }
        } as any);
      });

      const result = await lineReservationSettingsService.update(lineId, input);

      expect(result).toBeDefined();
    });

    it("should throw error if line not found", async () => {
      const input = {
        allowPersonalLink: true,
        requireApproval: false,
        manageWaitlist: false
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(null);

      await expect(lineReservationSettingsService.update(lineId, input)).rejects.toThrow(
        "Line not found"
      );
    });

    it("should update day schedules when provided", async () => {
      const input = {
        allowPersonalLink: true,
        requireApproval: false,
        manageWaitlist: false,
        daySchedules: [
          {
            dayOfWeek: 1,
            startTime: "18:00",
            endTime: "22:00",
            intervalMinutes: 30,
            customerMessage: "Test message"
          }
        ]
      };

      const mockSettings = {
        id: "settings-1",
        lineId,
        allowPersonalLink: true,
        requireApproval: false,
        manageWaitlist: false,
        daySchedules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(mockLine);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const tx = {
          lineReservationSettings: {
            findUnique: vi
              .fn()
              .mockResolvedValueOnce(mockSettings)
              .mockResolvedValueOnce({
                ...mockSettings,
                daySchedules: [
                  {
                    id: "schedule-1",
                    ...input.daySchedules[0],
                    customerMessage: "Test message",
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                ]
              }),
            create: vi.fn(),
            update: vi.fn().mockResolvedValue(mockSettings)
          },
          lineReservationDaySchedule: {
            deleteMany: vi.fn(),
            createMany: vi.fn()
          }
        } as any;

        return await callback(tx);
      });

      const result = await lineReservationSettingsService.update(lineId, input);

      expect(result).toBeDefined();
    });
  });

  describe("delete()", () => {
    it("should delete settings successfully", async () => {
      vi.mocked(lineReservationSettingsRepository.delete).mockResolvedValue(undefined);

      await lineReservationSettingsService.delete(lineId);

      expect(lineReservationSettingsRepository.delete).toHaveBeenCalledWith(lineId);
    });

    it("should handle deletion errors", async () => {
      vi.mocked(lineReservationSettingsRepository.delete).mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(lineReservationSettingsService.delete(lineId)).rejects.toThrow("Delete failed");
    });
  });
});
