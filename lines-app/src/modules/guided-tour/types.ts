/**
 * Guided Tour Module - TypeScript Types
 * 
 * Types for the guided tour system that provides step-by-step guidance
 * on real application screens with tooltips and highlights.
 */

export type TourStepId =
  | "lines-intro"
  | "lines-create-button"
  | "lines-card"
  | "lines-empty-state"
  | "roles-intro"
  | "roles-departments"
  | "roles-hierarchy"
  | "map-intro"
  | "map-zones"
  | "map-tables"
  | "menus-intro"
  | "menus-upload"
  | "menus-list";

export type TourPageId = "lines" | "roles" | "map" | "menus" | "info" | "calendar";

export interface TourStep {
  id: TourStepId;
  pageId: TourPageId;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for element to highlight
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: {
    type: "click" | "scroll" | "wait";
    selector?: string;
    delay?: number;
  };
  nextStepId?: TourStepId;
  prevStepId?: TourStepId;
  skipable?: boolean;
}

export interface TourPage {
  id: TourPageId;
  title: string;
  description: string;
  steps: TourStepId[];
  order: number; // Order in the tour flow
}

export interface TourProgress {
  currentStepId: TourStepId | null;
  completedSteps: TourStepId[];
  currentPageId: TourPageId | null;
  startedAt: number | null;
  completedAt: number | null;
}

export interface TourConfig {
  enabled: boolean;
  autoStart: boolean;
  showProgress: boolean;
  allowSkip: boolean;
  storageKey: string;
}

