import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLineReservationSettings,
  updateLineReservationSettings
} from "@/modules/lines/actions/lineReservationSettingsActions";
import { getCurrentUser } from "@/core/auth/session";
import { lineReservationSettingsService } from "@/modules/lines/services/lineReservationSettingsService";
import { prisma } from "@/core/integrations/prisma/client";
import { mockLine } from "../../../../fixtures/lines";

vi.mock("@/core/auth/session");
vi.mock("@/modules/lines/services/lineReservationSettingsService");
vi.mock("@/core/integrations/prisma/client");

describe("lineReservationSettingsActions Integration", () => {
  const lineId = "line-1";
  const venueId = "venue-1";
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: mockUserId,
      email: "test@example.com"
    } as any);
  });

  describe("getLineReservationSettings", () => {
    it("should get settings successfully", async () => {
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

      vi.mocked(prisma.line.findUnique).mockResolvedValue(mockLine as any);
      vi.mocked(lineReservationSettingsService.getOrCreate).mockResolvedValue(mockSettings as any);

      const result = await getLineReservationSettings(lineId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSettings);
    });

    it("should create default settings if missing", async () => {
      const defaultSettings = {
        id: "settings-1",
        lineId,
        allowPersonalLink: false,
        requireApproval: false,
        manageWaitlist: false,
        daySchedules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(mockLine as any);
      vi.mocked(lineReservationSettingsService.getOrCreate).mockResolvedValue(
        defaultSettings as any
      );

      const result = await getLineReservationSettings(lineId);

      expect(result.success).toBe(true);
      expect(result.data?.allowPersonalLink).toBe(false);
    });

    it("should return error for excluded line", async () => {
      const excludedLine = {
        ...mockLine,
        venue: {
          reservationSettings: {
            excludeLines: [lineId]
          }
        }
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(excludedLine as any);

      const result = await getLineReservationSettings(lineId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error if reservations disabled", async () => {
      const venueWithDisabledReservations = {
        ...mockLine,
        venue: {
          acceptsReservations: false
        }
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(venueWithDisabledReservations as any);

      const result = await getLineReservationSettings(lineId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should validate user authorization", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const result = await getLineReservationSettings(lineId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should handle day schedules correctly", async () => {
      const settingsWithSchedules = {
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

      vi.mocked(prisma.line.findUnique).mockResolvedValue(mockLine as any);
      vi.mocked(lineReservationSettingsService.getOrCreate).mockResolvedValue(
        settingsWithSchedules as any
      );

      const result = await getLineReservationSettings(lineId);

      expect(result.success).toBe(true);
      expect(result.data?.daySchedules).toHaveLength(1);
    });
  });

  describe("updateLineReservationSettings", () => {
    it("should update settings successfully", async () => {
      const input = {
        allowPersonalLink: true,
        requireApproval: true,
        manageWaitlist: false
      };

      const updatedSettings = {
        id: "settings-1",
        lineId,
        ...input,
        daySchedules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(mockLine as any);
      vi.mocked(lineReservationSettingsService.update).mockResolvedValue(updatedSettings as any);

      const result = await updateLineReservationSettings(lineId, input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedSettings);
    });

    it("should validate line eligibility", async () => {
      const input = {
        allowPersonalLink: true
      };

      const excludedLine = {
        ...mockLine,
        venue: {
          reservationSettings: {
            excludeLines: [lineId]
          }
        }
      };

      vi.mocked(prisma.line.findUnique).mockResolvedValue(excludedLine as any);

      const result = await updateLineReservationSettings(lineId, input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
