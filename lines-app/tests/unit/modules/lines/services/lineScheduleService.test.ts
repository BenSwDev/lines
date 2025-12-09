import { describe, it, expect, beforeEach, vi } from "vitest";
import { lineScheduleService } from "@/modules/lines/services/lineScheduleService";
import { toISODate } from "@/utils/date";

describe("LineScheduleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateSuggestions()", () => {
    it("should generate weekly suggestions correctly", () => {
      const days = [1, 3, 5]; // Monday, Wednesday, Friday
      const anchorDate = new Date("2025-01-06"); // Monday (day 1)
      const horizonMonths = 1;

      const result = lineScheduleService.generateSuggestions(
        days,
        "weekly",
        anchorDate,
        horizonMonths
      );

      expect(result.length).toBeGreaterThan(0);
      // All generated dates should be on one of the selected days
      result.forEach((dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        const dayOfWeek = date.getDay();
        expect(days.includes(dayOfWeek)).toBe(true);
      });
      // Should include the anchor date since it's Monday
      expect(result).toContain(toISODate(anchorDate));
    });

    it("should generate monthly suggestions correctly", () => {
      const days = [0]; // Sunday
      const anchorDate = new Date("2025-01-05"); // Sunday
      const horizonMonths = 2;

      const result = lineScheduleService.generateSuggestions(
        days,
        "monthly",
        anchorDate,
        horizonMonths
      );

      expect(result.length).toBeGreaterThan(0);
      // Should generate multiple occurrences (one per month)
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("should generate oneTime suggestions correctly", () => {
      const days = [1]; // Monday
      const anchorDate = new Date("2025-01-06"); // Monday (day 1)

      const result = lineScheduleService.generateSuggestions(days, "oneTime", anchorDate);

      expect(result.length).toBe(1);
      // Should return the anchor date since it's already Monday
      expect(result[0]).toBe(toISODate(anchorDate));
    });

    it("should return empty array for variable frequency", () => {
      const days = [1, 3, 5];
      const anchorDate = new Date();

      const result = lineScheduleService.generateSuggestions(days, "variable", anchorDate);

      expect(result).toEqual([]);
    });

    it("should return empty array when days array is empty", () => {
      const days: number[] = [];
      const anchorDate = new Date();

      const result = lineScheduleService.generateSuggestions(days, "weekly", anchorDate);

      expect(result).toEqual([]);
    });

    it("should respect horizon months parameter", () => {
      const days = [1]; // Monday
      const anchorDate = new Date("2025-01-06");
      const horizonMonths = 1; // 1 month

      const shortResult = lineScheduleService.generateSuggestions(
        days,
        "weekly",
        anchorDate,
        horizonMonths
      );

      const longResult = lineScheduleService.generateSuggestions(
        days,
        "weekly",
        anchorDate,
        horizonMonths * 2
      );

      expect(longResult.length).toBeGreaterThan(shortResult.length);
    });
  });

  describe("generateWeekly()", () => {
    it("should generate all occurrences for selected days", () => {
      const days = [1, 3]; // Monday, Wednesday
      const start = new Date("2025-01-06"); // Monday
      const horizonMonths = 1; // ~4 weeks

      // Test via public method
      const result = lineScheduleService.generateSuggestions(days, "weekly", start, horizonMonths);

      expect(result.length).toBeGreaterThan(0);
      // Should have multiple occurrences (at least 2 Mondays and 2 Wednesdays in a month)
      expect(result.length).toBeGreaterThanOrEqual(8);
      // Verify all are Monday or Wednesday
      result.forEach((dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        expect([1, 3].includes(date.getDay())).toBe(true);
      });
    });

    it("should handle multiple days correctly", () => {
      const days = [0, 6]; // Sunday, Saturday
      const start = new Date("2025-01-05"); // Sunday
      const horizonMonths = 0.25; // ~1 week

      const result = lineScheduleService.generateSuggestions(days, "weekly", start, horizonMonths);

      expect(result.length).toBeGreaterThanOrEqual(2);
      // Verify all are Sunday or Saturday
      result.forEach((dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        expect([0, 6].includes(date.getDay())).toBe(true);
      });
    });

    it("should respect start and end dates", () => {
      const days = [1]; // Monday
      const start = new Date("2025-01-13"); // Monday
      const horizonMonths = 0.25; // ~1 week

      const result = lineScheduleService.generateSuggestions(days, "weekly", start, horizonMonths);

      // All dates should be >= start
      result.forEach((dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        expect(date >= start).toBe(true);
      });
    });
  });

  describe("generateMonthly()", () => {
    it("should generate all monthly occurrences", () => {
      const days = [0]; // Sunday
      const start = new Date("2025-01-05"); // First Sunday in January
      const horizonMonths = 3;

      const result = lineScheduleService.generateSuggestions(days, "monthly", start, horizonMonths);

      expect(result.length).toBeGreaterThanOrEqual(3); // At least one per month
    });

    it("should handle month boundaries correctly", () => {
      const days = [1]; // Monday
      const start = new Date("2025-01-27"); // Late January
      const horizonMonths = 2;

      const result = lineScheduleService.generateSuggestions(days, "monthly", start, horizonMonths);

      // Should include occurrences in February and March
      expect(result.length).toBeGreaterThan(0);
    });

    it("should skip dates before start date", () => {
      const days = [0]; // Sunday
      const start = new Date("2025-01-12"); // Second Sunday
      const horizonMonths = 1;

      const result = lineScheduleService.generateSuggestions(days, "monthly", start, horizonMonths);

      // All dates should be >= start
      result.forEach((dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        expect(date >= start).toBe(true);
      });
    });
  });

  describe("generateOneTime()", () => {
    it("should find next occurrence for each day", () => {
      const days = [1, 3, 5]; // Monday, Wednesday, Friday
      const start = new Date("2025-01-06"); // Monday (day 1)

      const result = lineScheduleService.generateSuggestions(days, "oneTime", start);

      expect(result.length).toBe(days.length);
      // Should find the next occurrence of each day
      result.forEach((dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        expect(days.includes(date.getDay())).toBe(true);
      });
      // Monday should be the anchor date
      expect(result).toContain(toISODate(start));
    });

    it("should return sorted dates", () => {
      const days = [5, 1, 3]; // Friday, Monday, Wednesday (unordered)
      const start = new Date("2025-01-06"); // Monday

      const result = lineScheduleService.generateSuggestions(days, "oneTime", start);

      // Should be sorted
      for (let i = 1; i < result.length; i++) {
        const date1 = new Date(result[i - 1] + "T00:00:00");
        const date2 = new Date(result[i] + "T00:00:00");
        expect(date2 >= date1).toBe(true);
      }
    });
  });
});
