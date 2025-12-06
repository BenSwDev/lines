/**
 * Demo Module - Public Exports
 * 
 * This module provides an interactive marketing demo experience
 * for showcasing the Lines application features.
 */

// UI Components
export { ImmersiveDemo } from "./ui/ImmersiveDemo";

// Actions
export { trackDemoEvent, getDemoConfig, generateDemoData } from "./actions/demoActions";

// Services
export { demoService } from "./services/demoService";

// Types
export type { DemoStep, OverlayCard, DemoState, DemoAnalyticsEvent } from "./types";

