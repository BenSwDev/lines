// Export types
export * from "./types";

// Export main components (keep V2 for backward compatibility)
// Note: FloorPlanEditorV2 exports types that are already exported from ./types
export { FloorPlanEditorV2 } from "./ui/FloorPlanEditorV2";

// Export new components
export { HierarchicalSidebar } from "./ui/Sidebar/HierarchicalSidebar";
export { EditPanel } from "./ui/EditPanel";

// Export hooks
export * from "./hooks";

// Export actions
export * from "./actions/floorPlanActions";
export * from "./actions/templateActions";

// Export utils
export * from "./utils/zoneContainment";
export * from "./utils/smartDefaults";
export * from "./utils/historyManager";
export * from "./utils/clipboardManager";
export * from "./utils/autoSave";
export * from "./utils/alignmentGuides";
export * from "./utils/floorPlanTemplates";
