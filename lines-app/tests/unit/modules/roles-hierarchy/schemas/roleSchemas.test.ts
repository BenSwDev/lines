import { describe, it, expect } from "vitest";
import { createRoleSchema, updateRoleSchema } from "@/modules/roles-hierarchy/schemas/roleSchemas";

describe("Role Schemas", () => {
  describe("createRoleSchema", () => {
    it("should validate required fields", () => {
      const validInput = {
        name: "Barista",
        color: "#3B82F6"
      };

      const result = createRoleSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate name is required", () => {
      const invalidInput = {
        color: "#3B82F6"
        // Missing name
      };

      const result = createRoleSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate color format", () => {
      const invalidInput = {
        name: "Barista",
        color: "invalid-color"
      };

      const result = createRoleSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept valid color format", () => {
      const validInput = {
        name: "Barista",
        color: "#3B82F6"
      };

      const result = createRoleSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate icon", () => {
      const validInput = {
        name: "Barista",
        color: "#3B82F6",
        icon: "☕"
      };

      const result = createRoleSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate parentRoleId", () => {
      const validInput = {
        name: "Barista",
        color: "#3B82F6",
        parentRoleId: "parent-role-1"
      };

      const result = createRoleSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate managerRoleId", () => {
      const validInput = {
        name: "Barista",
        color: "#3B82F6",
        managerRoleId: "manager-role-1"
      };

      const result = createRoleSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should accept optional fields", () => {
      const validInput = {
        name: "Barista",
        color: "#3B82F6",
        description: "Coffee barista",
        icon: "☕",
        requiresManagement: true,
        requiresStaffing: false,
        canManage: false
      };

      const result = createRoleSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("updateRoleSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate = {
        name: "Updated Name"
      };

      const result = updateRoleSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should validate updated fields", () => {
      const invalidUpdate = {
        name: "", // Empty name should fail
        color: "invalid"
      };

      const result = updateRoleSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("should allow empty update object", () => {
      const result = updateRoleSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should allow updating name only", () => {
      const update = {
        name: "New Name"
      };

      const result = updateRoleSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow updating color only", () => {
      const update = {
        color: "#EF4444"
      };

      const result = updateRoleSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow updating description", () => {
      const update = {
        description: "Updated description"
      };

      const result = updateRoleSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });
});
