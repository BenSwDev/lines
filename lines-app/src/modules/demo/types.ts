/**
 * Demo Module Types
 *
 * TypeScript types for the demo module.
 * This module provides an interactive marketing demo experience.
 */

/**
 * Demo step configuration
 */
export interface DemoStep {
  /** Unique identifier for the step */
  id: string;
  /** Step title (Hebrew) */
  title: string;
  /** Badge text displayed on the step */
  badge: string;
  /** Main description text */
  description: string;
  /** List of bullet points for this step */
  bullets: string[];
}

/**
 * Overlay card configuration for visual demo elements
 */
export interface OverlayCard {
  /** Card title */
  title: string;
  /** Card body text */
  body: string;
  /** React icon component */
  icon: React.ReactNode;
  /** CSS classes for positioning and styling */
  className: string;
}

/**
 * Demo state management
 */
export interface DemoState {
  /** Currently active step index (0-based) */
  activeStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * Demo analytics event (for future tracking)
 */
export interface DemoAnalyticsEvent {
  /** Event type */
  type: "step_viewed" | "cta_clicked" | "demo_completed" | "registration_clicked";
  /** Step ID if applicable */
  stepId?: string;
  /** Timestamp */
  timestamp: Date;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
