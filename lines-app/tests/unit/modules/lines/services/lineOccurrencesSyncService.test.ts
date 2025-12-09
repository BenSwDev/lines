import { describe, it, expect, beforeEach, vi } from "vitest";
import { lineOccurrencesSyncService } from "@/modules/lines/services/lineOccurrencesSyncService";
import { lineOccurrenceRepository } from "@/core/db";
import { mockLine, mockOccurrence } from "@/../../../fixtures/lines";
import type { OccurrenceInput } from "@/modules/lines/services/lineOccurrencesSyncService";

vi.mock("@/core/db", () => ({
  lineOccurrenceRepository: {
    deleteByLineId: vi.fn(),
    createMany: vi.fn(),
    findByLineIdAndDate: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
}));

describe("LineOccurrencesSyncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncOccurrences()", () => {
    it("should delete existing occurrences before creating", async () => {
      const occurrences: OccurrenceInput[] = [
        { date: "2025-01-06", isExpected: true },
        { date: "2025-01-08", isExpected: true }
      ];

      await lineOccurrencesSyncService.syncOccurrences(mockLine, occurrences);

      expect(lineOccurrenceRepository.deleteByLineId).toHaveBeenCalledWith(mockLine.id);
      expect(lineOccurrenceRepository.createMany).toHaveBeenCalled();
    });

    it("should create all provided occurrences", async () => {
      const occurrences: OccurrenceInput[] = [
        { date: "2025-01-06", isExpected: true, isActive: true },
        { date: "2025-01-08", isExpected: false, isActive: true }
      ];

      await lineOccurrencesSyncService.syncOccurrences(mockLine, occurrences);

      expect(lineOccurrenceRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            lineId: mockLine.id,
            venueId: mockLine.venueId,
            date: "2025-01-06",
            isExpected: true,
            isActive: true
          }),
          expect.objectContaining({
            date: "2025-01-08",
            isExpected: false
          })
        ])
      );
    });

    it("should use line defaults for missing times", async () => {
      const occurrences: OccurrenceInput[] = [
        { date: "2025-01-06", isExpected: true }
        // No startTime/endTime
      ];

      await lineOccurrencesSyncService.syncOccurrences(mockLine, occurrences);

      expect(lineOccurrenceRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            startTime: mockLine.startTime,
            endTime: mockLine.endTime
          })
        ])
      );
    });

    it("should use occurrence-specific times when provided", async () => {
      const occurrences: OccurrenceInput[] = [
        {
          date: "2025-01-06",
          isExpected: true,
          startTime: "19:00",
          endTime: "23:00"
        }
      ];

      await lineOccurrencesSyncService.syncOccurrences(mockLine, occurrences);

      expect(lineOccurrenceRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            startTime: "19:00",
            endTime: "23:00"
          })
        ])
      );
    });

    it("should handle empty occurrences array", async () => {
      await lineOccurrencesSyncService.syncOccurrences(mockLine, []);

      expect(lineOccurrenceRepository.deleteByLineId).toHaveBeenCalled();
      expect(lineOccurrenceRepository.createMany).not.toHaveBeenCalled();
    });
  });

  describe("syncOccurrencesWithSchedules()", () => {
    it("should delete and recreate occurrences with schedules", async () => {
      const occurrences: OccurrenceInput[] = [
        { date: "2025-01-06", isExpected: true, startTime: "19:00", endTime: "23:00" }
      ];

      await lineOccurrencesSyncService.syncOccurrencesWithSchedules(mockLine, occurrences);

      expect(lineOccurrenceRepository.deleteByLineId).toHaveBeenCalled();
      expect(lineOccurrenceRepository.createMany).toHaveBeenCalled();
    });
  });

  describe("addManualOccurrence()", () => {
    it("should create manual occurrence", async () => {
      const lineId = "line-1";
      const venueId = "venue-1";
      const date = "2025-01-15";
      const startTime = "19:00";
      const endTime = "23:00";

      vi.mocked(lineOccurrenceRepository.findByLineIdAndDate).mockResolvedValue(null);
      vi.mocked(lineOccurrenceRepository.create).mockResolvedValue(mockOccurrence);

      await lineOccurrencesSyncService.addManualOccurrence(
        lineId,
        venueId,
        date,
        startTime,
        endTime
      );

      expect(lineOccurrenceRepository.findByLineIdAndDate).toHaveBeenCalledWith(lineId, date);
      expect(lineOccurrenceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          date,
          startTime,
          endTime,
          isExpected: false,
          isActive: true
        })
      );
    });

    it("should throw error if date already exists", async () => {
      const lineId = "line-1";
      const venueId = "venue-1";
      const date = "2025-01-15";

      vi.mocked(lineOccurrenceRepository.findByLineIdAndDate).mockResolvedValue(mockOccurrence);

      await expect(
        lineOccurrencesSyncService.addManualOccurrence(lineId, venueId, date, "19:00", "23:00")
      ).rejects.toThrow("תאריך כבר קיים עבור הליין הזה");
    });
  });

  describe("cancelOccurrence()", () => {
    it("should set isActive to false", async () => {
      const occurrenceId = "occurrence-1";

      await lineOccurrencesSyncService.cancelOccurrence(occurrenceId);

      expect(lineOccurrenceRepository.update).toHaveBeenCalledWith(occurrenceId, {
        isActive: false
      });
    });
  });

  describe("reactivateOccurrence()", () => {
    it("should set isActive to true", async () => {
      const occurrenceId = "occurrence-1";

      await lineOccurrencesSyncService.reactivateOccurrence(occurrenceId);

      expect(lineOccurrenceRepository.update).toHaveBeenCalledWith(occurrenceId, {
        isActive: true
      });
    });
  });
});
