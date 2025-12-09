import { describe, it, expect } from "vitest";
import {
  createFloorPlanSchema,
  updateFloorPlanSchema,
  createZoneSchema,
  updateZoneContentSchema,
  createTableSchema,
  updateTableContentSchema,
  createVenueAreaSchema,
  updateStaffingSchema,
  updateMinimumOrderSchema
} from "@/modules/floor-plan-editor/schemas/floorPlanSchemas";

describe("Floor Plan Schemas", () => {
  describe("createFloorPlanSchema", () => {
    it("should validate required fields", () => {
      const validInput = {
        venueId: "venue-1",
        name: "Main Floor"
      };

      const result = createFloorPlanSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate name is required", () => {
      const invalidInput = {
        venueId: "venue-1"
        // Missing name
      };

      const result = createFloorPlanSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate venueId is required", () => {
      const invalidInput = {
        name: "Main Floor"
        // Missing venueId
      };

      const result = createFloorPlanSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept optional zones", () => {
      const validInput = {
        venueId: "venue-1",
        name: "Main Floor",
        zones: [
          {
            name: "VIP Zone",
            color: "#3B82F6",
            zoneNumber: 1
          }
        ]
      };

      const result = createFloorPlanSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should accept optional venueAreas", () => {
      const validInput = {
        venueId: "venue-1",
        name: "Main Floor",
        venueAreas: [
          {
            areaType: "kitchen",
            name: "Kitchen",
            positionX: 0,
            positionY: 0,
            width: 100,
            height: 100
          }
        ]
      };

      const result = createFloorPlanSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should accept optional lineIds", () => {
      const validInput = {
        venueId: "venue-1",
        name: "Main Floor",
        lineIds: ["line-1", "line-2"]
      };

      const result = createFloorPlanSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("updateFloorPlanSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate = {
        id: "floor-plan-1",
        name: "Updated Name"
      };

      const result = updateFloorPlanSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const invalidUpdate = {
        name: "Updated Name"
        // Missing id
      };

      const result = updateFloorPlanSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe("createZoneSchema", () => {
    it("should validate required fields", () => {
      const validInput = {
        floorPlanId: "floor-plan-1",
        venueId: "venue-1",
        name: "VIP Zone",
        color: "#3B82F6"
      };

      const result = createZoneSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate zoneType enum", () => {
      const validInput = {
        floorPlanId: "floor-plan-1",
        venueId: "venue-1",
        name: "Bar Zone",
        color: "#3B82F6",
        zoneType: "bar"
      };

      const result = createZoneSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid zoneType", () => {
      const invalidInput = {
        floorPlanId: "floor-plan-1",
        venueId: "venue-1",
        name: "Zone",
        color: "#3B82F6",
        zoneType: "invalid"
      };

      const result = createZoneSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("updateZoneContentSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate = {
        id: "zone-1",
        name: "Updated Zone Name"
      };

      const result = updateZoneContentSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const invalidUpdate = {
        name: "Updated Name"
      };

      const result = updateZoneContentSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe("createTableSchema", () => {
    it("should validate required fields", () => {
      const validInput = {
        zoneId: "zone-1",
        name: "Table 1"
      };

      const result = createTableSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should accept optional seats", () => {
      const validInput = {
        zoneId: "zone-1",
        name: "Table 1",
        seats: 4
      };

      const result = createTableSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("updateTableContentSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate = {
        id: "table-1",
        name: "Updated Table Name"
      };

      const result = updateTableContentSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe("createVenueAreaSchema", () => {
    it("should validate required fields", () => {
      const validInput = {
        floorPlanId: "floor-plan-1",
        venueId: "venue-1",
        areaType: "kitchen",
        name: "Kitchen",
        positionX: 0,
        positionY: 0,
        width: 100,
        height: 100
      };

      const result = createVenueAreaSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require position and size fields", () => {
      const invalidInput = {
        floorPlanId: "floor-plan-1",
        venueId: "venue-1",
        areaType: "kitchen",
        name: "Kitchen"
        // Missing position and size
      };

      const result = createVenueAreaSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("updateStaffingSchema", () => {
    it("should validate staffing rules", () => {
      const validInput = {
        targetType: "zone" as const,
        targetId: "zone-1",
        staffingRules: [
          {
            roleId: "role-1",
            managers: 1,
            employees: 2
          }
        ]
      };

      const result = updateStaffingSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate targetType enum", () => {
      const invalidInput = {
        targetType: "invalid" as any,
        targetId: "zone-1",
        staffingRules: []
      };

      const result = updateStaffingSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("updateMinimumOrderSchema", () => {
    it("should validate minimum order", () => {
      const validInput = {
        targetType: "table" as const,
        targetId: "table-1",
        minimumPrice: 100
      };

      const result = updateMinimumOrderSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject negative minimum price", () => {
      const invalidInput = {
        targetType: "table" as const,
        targetId: "table-1",
        minimumPrice: -10
      };

      const result = updateMinimumOrderSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
