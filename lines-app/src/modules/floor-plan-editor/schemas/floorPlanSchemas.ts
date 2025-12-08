import { z } from "zod";

// ============================================================================
// FLOOR PLAN SCHEMAS
// ============================================================================

export const staffingRuleSchema = z.object({
  roleId: z.string(),
  count: z.number().int().min(0),
  roleName: z.string().optional(),
  roleColor: z.string().optional()
});

export const createTableSchema = z.object({
  zoneId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  seats: z.number().int().min(1).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  shape: z.string().optional(),
  tableType: z.string().optional(),
  tableNumber: z.number().int().optional()
});

export const createZoneSchema = z.object({
  floorPlanId: z.string().optional(),
  venueId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  description: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  shape: z.string().optional(),
  zoneNumber: z.number().int().optional(),
  tables: z.array(createTableSchema).optional()
});

export const createVenueAreaSchema = z.object({
  floorPlanId: z.string().optional(),
  venueId: z.string().optional(),
  areaType: z.string().min(1, "Area type is required"),
  name: z.string().min(1, "Name is required"),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().optional(),
  shape: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional()
});

export const createFloorPlanSchema = z.object({
  venueId: z.string().min(1, "Venue ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  zones: z.array(createZoneSchema).optional(),
  venueAreas: z.array(createVenueAreaSchema).optional(),
  lineIds: z.array(z.string()).optional()
});

export const updateFloorPlanSchema = z.object({
  id: z.string().min(1, "Floor plan ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  lineIds: z.array(z.string()).optional()
});

// ============================================================================
// CONTENT UPDATE SCHEMAS
// ============================================================================

export const updateZoneContentSchema = z.object({
  id: z.string().min(1, "Zone ID is required"),
  name: z.string().min(1).optional(),
  zoneNumber: z.number().int().optional().nullable(),
  description: z.string().optional().nullable()
});

export const updateTableContentSchema = z.object({
  id: z.string().min(1, "Table ID is required"),
  name: z.string().min(1).optional(),
  tableNumber: z.number().int().optional().nullable(),
  seats: z.number().int().min(1).optional().nullable()
});

// ============================================================================
// STAFFING UPDATE SCHEMAS
// ============================================================================

export const updateStaffingSchema = z.object({
  targetType: z.enum(["zone", "table"]),
  targetId: z.string().min(1, "Target ID is required"),
  staffingRules: z.array(staffingRuleSchema)
});

// ============================================================================
// MINIMUM ORDER UPDATE SCHEMAS
// ============================================================================

export const updateMinimumOrderSchema = z.object({
  targetType: z.enum(["zone", "table"]),
  targetId: z.string().min(1, "Target ID is required"),
  minimumPrice: z.number().min(0, "Minimum price must be positive")
});

// ============================================================================
// WIZARD SCHEMAS
// ============================================================================

export const venueShapeSchema = z.enum(["rectangle", "square", "l-shape", "custom"]);
export const venueSizeSchema = z.enum(["small", "medium", "large"]);

export const wizardZoneSchema = z.object({
  id: z.string(),
  type: z.enum(["seating", "bar", "restroom", "entrance", "vip", "stage", "kitchen", "dj-booth"]),
  name: z.string().min(1),
  color: z.string().min(1),
  tableCount: z.number().int().min(0),
  seatsPerTable: z.number().int().min(1),
  autoFill: z.boolean(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  size: z.object({
    width: z.number(),
    height: z.number()
  })
});

export const wizardStateSchema = z.object({
  venueShape: venueShapeSchema,
  venueSize: venueSizeSchema,
  zones: z.array(wizardZoneSchema),
  floorPlanName: z.string().min(1, "Floor plan name is required"),
  selectedLineIds: z.array(z.string())
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateFloorPlanInput = z.infer<typeof createFloorPlanSchema>;
export type UpdateFloorPlanInput = z.infer<typeof updateFloorPlanSchema>;
export type UpdateZoneContentInput = z.infer<typeof updateZoneContentSchema>;
export type UpdateTableContentInput = z.infer<typeof updateTableContentSchema>;
export type UpdateStaffingInput = z.infer<typeof updateStaffingSchema>;
export type UpdateMinimumOrderInput = z.infer<typeof updateMinimumOrderSchema>;
export type WizardStateInput = z.infer<typeof wizardStateSchema>;
export type WizardZoneInput = z.infer<typeof wizardZoneSchema>;
