import { describe, it, expect } from "vitest";
import { createLineSchema, updateLineSchema } from "@/modules/lines/schemas/lineSchemas";
import { COLOR_PALETTE } from "@/core/config/constants";

describe("Line Schemas", () => {
  describe("createLineSchema", () => {
    it("should validate required fields", () => {
      const validInput = {
        name: "Test Line",
        days: [1, 3, 5],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0]
      };

      const result = createLineSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const invalidInput = {
        days: [1, 3, 5],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0]
      };

      const result = createLineSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate name length", () => {
      const longName = "a".repeat(256); // Too long
      const invalidInput = {
        name: longName,
        days: [1],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0]
      };

      const result = createLineSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate days array has at least 1 day", () => {
      const invalidInput = {
        name: "Test Line",
        days: [],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0]
      };

      const result = createLineSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate time format (HH:MM)", () => {
      const invalidInput = {
        name: "Test Line",
        days: [1],
        startTime: "25:00", // Invalid hour
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0]
      };

      const result = createLineSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept valid time format", () => {
      const validInput = {
        name: "Test Line",
        days: [1],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0]
      };

      const result = createLineSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate frequency enum", () => {
      const invalidInput = {
        name: "Test Line",
        days: [1],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "invalid",
        color: COLOR_PALETTE[0]
      };

      const result = createLineSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept all valid frequency values", () => {
      const frequencies = ["weekly", "monthly", "variable", "oneTime"];

      frequencies.forEach((frequency) => {
        const validInput = {
          name: "Test Line",
          days: [1],
          startTime: "18:00",
          endTime: "22:00",
          frequency,
          color: COLOR_PALETTE[0]
        };

        const result = createLineSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });
    });

    it("should validate color format", () => {
      const invalidInput = {
        name: "Test Line",
        days: [1],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: "invalid-color"
      };

      const result = createLineSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate selectedDates array", () => {
      const validInput = {
        name: "Test Line",
        days: [1],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0],
        selectedDates: ["2025-01-06", "2025-01-13"]
      };

      const result = createLineSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate manualDates array", () => {
      const validInput = {
        name: "Test Line",
        days: [1],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0],
        manualDates: ["2025-01-15"]
      };

      const result = createLineSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid date format in selectedDates", () => {
      const invalidInput = {
        name: "Test Line",
        days: [1],
        startTime: "18:00",
        endTime: "22:00",
        frequency: "weekly",
        color: COLOR_PALETTE[0],
        selectedDates: ["invalid-date"]
      };

      const result = createLineSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("updateLineSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate = {
        name: "Updated Name"
      };

      const result = updateLineSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should allow updating name only", () => {
      const update = {
        name: "New Name"
      };

      const result = updateLineSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow updating schedule only", () => {
      const update = {
        days: [2, 4],
        startTime: "19:00",
        endTime: "23:00"
      };

      const result = updateLineSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow updating frequency only", () => {
      const update = {
        frequency: "monthly"
      };

      const result = updateLineSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should validate updated fields", () => {
      const invalidUpdate = {
        name: "", // Empty name should fail
        frequency: "invalid"
      };

      const result = updateLineSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("should allow empty update object", () => {
      const result = updateLineSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
