import { z } from "zod";

// ============================================================================
// FLOOR PLAN SCHEMAS
// ============================================================================

export const createFloorPlanSchema = z.object({
  venueId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  zones: z
    .array(
      z.object({
        name: z.string(),
        color: z.string(),
        description: z.string().optional(),
        positionX: z.number().optional(),
        positionY: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        shape: z.string().optional(),
        zoneNumber: z.number().optional(),
        tables: z
          .array(
            z.object({
              name: z.string(),
              seats: z.number().optional(),
              positionX: z.number().optional(),
              positionY: z.number().optional(),
              width: z.number().optional(),
              height: z.number().optional(),
              tableNumber: z.number().optional()
            })
          )
          .optional()
      })
    )
    .optional(),
  venueAreas: z
    .array(
      z.object({
        areaType: z.string(),
        name: z.string(),
        positionX: z.number(),
        positionY: z.number(),
        width: z.number(),
        height: z.number(),
        shape: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        rotation: z.number().optional()
      })
    )
    .optional(),
  lineIds: z.array(z.string()).optional()
});

export const updateFloorPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
  isLocked: z.boolean().optional()
});

// ============================================================================
// ZONE SCHEMAS
// ============================================================================

export const createZoneSchema = z.object({
  floorPlanId: z.string(),
  venueId: z.string(),
  name: z.string().min(1),
  color: z.string(),
  description: z.string().optional().nullable(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  shape: z.string().optional(),
  zoneNumber: z.number().optional().nullable(),
  zoneType: z.enum(["seating", "bar", "kitchen"]).optional().default("seating"),
  isKitchen: z.boolean().optional().default(false),
  // Bar-specific fields
  barNumber: z.number().optional().nullable(),
  barName: z.string().optional().nullable(),
  barSeats: z.number().optional().nullable(),
  barMinimumPrice: z.number().optional().nullable()
});

export const updateZoneContentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  zoneNumber: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  zoneType: z.enum(["seating", "bar", "kitchen"]).optional(),
  isKitchen: z.boolean().optional(),
  // Bar-specific fields
  barNumber: z.number().optional().nullable(),
  barName: z.string().optional().nullable(),
  barSeats: z.number().optional().nullable(),
  barMinimumPrice: z.number().optional().nullable()
});

export const updateZonePositionSchema = z.object({
  id: z.string(),
  positionX: z.number(),
  positionY: z.number()
});

export const updateZoneSizeSchema = z.object({
  id: z.string(),
  width: z.number(),
  height: z.number()
});

// ============================================================================
// TABLE SCHEMAS
// ============================================================================

export const createTableSchema = z.object({
  zoneId: z.string(),
  name: z.string().min(1),
  seats: z.number().optional().nullable(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  tableNumber: z.number().optional().nullable()
});

export const updateTableContentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  tableNumber: z.number().optional().nullable(),
  seats: z.number().optional().nullable()
});

export const updateTablePositionSchema = z.object({
  id: z.string(),
  positionX: z.number(),
  positionY: z.number()
});

export const updateTableSizeSchema = z.object({
  id: z.string(),
  width: z.number(),
  height: z.number()
});

export const updateTableRotationSchema = z.object({
  id: z.string(),
  rotation: z.number()
});

// ============================================================================
// VENUE AREA SCHEMAS
// ============================================================================

export const createVenueAreaSchema = z.object({
  floorPlanId: z.string(),
  venueId: z.string(),
  areaType: z.string(),
  name: z.string().min(1),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number(),
  height: z.number(),
  shape: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  rotation: z.number().optional()
});

export const updateVenueAreaPositionSchema = z.object({
  id: z.string(),
  positionX: z.number(),
  positionY: z.number()
});

export const updateVenueAreaSizeSchema = z.object({
  id: z.string(),
  width: z.number(),
  height: z.number()
});

export const updateVenueAreaRotationSchema = z.object({
  id: z.string(),
  rotation: z.number()
});

// ============================================================================
// STAFFING SCHEMAS
// ============================================================================

export const updateStaffingSchema = z.object({
  targetType: z.enum(["zone", "table"]),
  targetId: z.string(),
  staffingRules: z.array(
    z.object({
      roleId: z.string(),
      managers: z.number().min(0).default(0), // Number of managers (0-X)
      employees: z.number().min(0).default(0), // Number of regular employees (0-X)
      roleName: z.string().optional(),
      roleColor: z.string().optional(),
      // Legacy support
      count: z.number().min(0).optional() // Deprecated: use employees instead
    })
  )
});

// ============================================================================
// MINIMUM ORDER SCHEMAS
// ============================================================================

export const updateMinimumOrderSchema = z.object({
  targetType: z.enum(["zone", "table"]),
  targetId: z.string(),
  minimumPrice: z.number().min(0)
});

// ============================================================================
// LINE LINKING SCHEMAS
// ============================================================================

export const updateFloorPlanLinesSchema = z.object({
  floorPlanId: z.string(),
  lineIds: z.array(z.string())
});

// ============================================================================
// LINE FLOOR PLAN STAFFING SCHEMAS
// ============================================================================

export const updateLineFloorPlanStaffingSchema = z.object({
  lineId: z.string(),
  floorPlanId: z.string(),
  targetType: z.enum(["zone", "table"]),
  targetId: z.string().nullable(),
  staffingRules: z.array(
    z.object({
      roleId: z.string(),
      managers: z.number().min(0).default(0), // Number of managers (0-X)
      employees: z.number().min(0).default(0), // Number of regular employees (0-X)
      roleName: z.string().optional(),
      roleColor: z.string().optional(),
      // Legacy support
      count: z.number().min(0).optional() // Deprecated: use employees instead
    })
  )
});

// ============================================================================
// LINE FLOOR PLAN MINIMUM ORDER SCHEMAS
// ============================================================================

export const updateLineFloorPlanMinimumOrderSchema = z.object({
  lineId: z.string(),
  floorPlanId: z.string(),
  targetType: z.enum(["zone", "table"]),
  targetId: z.string().nullable(),
  minimumPrice: z.number().min(0)
});
