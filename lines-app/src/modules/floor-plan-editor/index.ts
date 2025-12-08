// Floor Plan Editor Module
// Main entry point for the floor plan editor
// NOTE: UI components temporarily disabled while being refactored

// Types
export * from "./types";

// Schemas (only export schema objects, not type aliases that conflict with types)
export {
  staffingRuleSchema,
  createTableSchema,
  createZoneSchema,
  createVenueAreaSchema,
  createFloorPlanSchema,
  updateFloorPlanSchema,
  updateZoneContentSchema,
  updateTableContentSchema,
  updateStaffingSchema,
  updateMinimumOrderSchema,
  venueShapeSchema,
  venueSizeSchema,
  wizardZoneSchema,
  wizardStateSchema
} from "./schemas/floorPlanSchemas";

// Actions
export * from "./actions/floorPlanActions";

// Services
export { floorPlanService } from "./services/floorPlanService";

// UI Components
export { FloorPlanList } from "./ui/FloorPlanList";
export { ManageFloorPlanLinesDialog } from "./ui/ManageFloorPlanLinesDialog";
export { FloorPlanEditor } from "./ui/FloorPlanEditor";
export { FloorPlanWizard } from "./ui/wizard/FloorPlanWizard";
export { FloorPlanViewer } from "./ui/viewer/FloorPlanViewer";
export { ContentEditor } from "./ui/modes/ContentEditor";
export { StaffingEditor } from "./ui/modes/StaffingEditor";
export { MinimumOrderEditor } from "./ui/modes/MinimumOrderEditor";
