import { describe, it, expect, beforeEach, vi } from "vitest";
import { linesService } from "@/modules/lines/services/linesService";
import { lineRepository } from "@/core/db";
import { COLOR_PALETTE, COLOR_PALETTE_SIZE } from "@/core/config/constants";
// No fixtures needed for this test

vi.mock("@/core/db", () => ({
  lineRepository: {
    findUsedColorsByVenueId: vi.fn(),
    isColorAvailable: vi.fn(),
    countByVenueId: vi.fn()
  }
}));

describe("LinesService", () => {
  const venueId = "venue-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAvailableColors()", () => {
    it("should return all colors when none are used", async () => {
      vi.mocked(lineRepository.findUsedColorsByVenueId).mockResolvedValue([]);

      const result = await linesService.getAvailableColors(venueId);

      expect(result).toEqual(COLOR_PALETTE);
      expect(lineRepository.findUsedColorsByVenueId).toHaveBeenCalledWith(venueId);
    });

    it("should exclude already used colors", async () => {
      const usedColors = [COLOR_PALETTE[0], COLOR_PALETTE[1]];
      vi.mocked(lineRepository.findUsedColorsByVenueId).mockResolvedValue(usedColors);

      const result = await linesService.getAvailableColors(venueId);

      expect(result).not.toContain(usedColors[0]);
      expect(result).not.toContain(usedColors[1]);
      expect(result.length).toBe(COLOR_PALETTE.length - usedColors.length);
    });

    it("should return empty array when all colors are used", async () => {
      vi.mocked(lineRepository.findUsedColorsByVenueId).mockResolvedValue(COLOR_PALETTE);

      const result = await linesService.getAvailableColors(venueId);

      expect(result).toEqual([]);
    });
  });

  describe("isColorAvailable()", () => {
    it("should return true for available color", async () => {
      vi.mocked(lineRepository.isColorAvailable).mockResolvedValue(true);

      const result = await linesService.isColorAvailable(venueId, COLOR_PALETTE[0]);

      expect(result).toBe(true);
      expect(lineRepository.isColorAvailable).toHaveBeenCalledWith(
        venueId,
        COLOR_PALETTE[0],
        undefined
      );
    });

    it("should return false for used color", async () => {
      vi.mocked(lineRepository.isColorAvailable).mockResolvedValue(false);

      const result = await linesService.isColorAvailable(venueId, COLOR_PALETTE[0]);

      expect(result).toBe(false);
    });

    it("should return true for own color when updating", async () => {
      const lineId = "line-1";
      vi.mocked(lineRepository.isColorAvailable).mockResolvedValue(true);

      const result = await linesService.isColorAvailable(venueId, COLOR_PALETTE[0], lineId);

      expect(result).toBe(true);
      expect(lineRepository.isColorAvailable).toHaveBeenCalledWith(
        venueId,
        COLOR_PALETTE[0],
        lineId
      );
    });
  });

  describe("getNextAvailableColor()", () => {
    it("should return first available color", async () => {
      const availableColors = [COLOR_PALETTE[2], COLOR_PALETTE[3]];
      vi.mocked(lineRepository.findUsedColorsByVenueId).mockResolvedValue([
        COLOR_PALETTE[0],
        COLOR_PALETTE[1]
      ]);

      const result = await linesService.getNextAvailableColor(venueId);

      expect(result).toBe(availableColors[0]);
    });

    it("should throw error when all colors are used", async () => {
      vi.mocked(lineRepository.findUsedColorsByVenueId).mockResolvedValue(COLOR_PALETTE);

      await expect(linesService.getNextAvailableColor(venueId)).rejects.toThrow(
        "כל הצבעים תפוסים. מחק ליין קיים כדי לפנות צבע"
      );
    });
  });

  describe("isOvernightShift()", () => {
    it("should return true for overnight shift (22:00-02:00)", () => {
      const result = linesService.isOvernightShift("22:00", "02:00");
      expect(result).toBe(true);
    });

    it("should return false for regular shift", () => {
      const result = linesService.isOvernightShift("18:00", "22:00");
      expect(result).toBe(false);
    });

    it("should handle 24:00 end time", () => {
      const result = linesService.isOvernightShift("22:00", "24:00");
      expect(result).toBe(true);
    });

    it("should return false for same day shift", () => {
      const result = linesService.isOvernightShift("09:00", "17:00");
      expect(result).toBe(false);
    });
  });

  describe("countLines()", () => {
    it("should return correct count for venue", async () => {
      const count = 5;
      vi.mocked(lineRepository.countByVenueId).mockResolvedValue(count);

      const result = await linesService.countLines(venueId);

      expect(result).toBe(count);
      expect(lineRepository.countByVenueId).toHaveBeenCalledWith(venueId);
    });

    it("should return 0 for venue with no lines", async () => {
      vi.mocked(lineRepository.countByVenueId).mockResolvedValue(0);

      const result = await linesService.countLines(venueId);

      expect(result).toBe(0);
    });
  });

  describe("canCreateNewLine()", () => {
    it("should return true when under limit", async () => {
      const count = COLOR_PALETTE_SIZE - 1;
      vi.mocked(lineRepository.countByVenueId).mockResolvedValue(count);

      const result = await linesService.canCreateNewLine(venueId);

      expect(result).toBe(true);
    });

    it("should return false when at limit (15 colors)", async () => {
      vi.mocked(lineRepository.countByVenueId).mockResolvedValue(COLOR_PALETTE_SIZE);

      const result = await linesService.canCreateNewLine(venueId);

      expect(result).toBe(false);
    });

    it("should return false when over limit", async () => {
      vi.mocked(lineRepository.countByVenueId).mockResolvedValue(COLOR_PALETTE_SIZE + 1);

      const result = await linesService.canCreateNewLine(venueId);

      expect(result).toBe(false);
    });
  });
});
