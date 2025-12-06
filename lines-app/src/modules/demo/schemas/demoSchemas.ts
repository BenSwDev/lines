/**
 * Demo Module Schemas
 * 
 * Zod validation schemas for demo module.
 * Currently minimal as demo is primarily client-side UI,
 * but prepared for future server-side analytics or configuration.
 */

import { z } from "zod";

/**
 * Schema for demo analytics events
 * Used for tracking user interactions with the demo
 */
export const demoAnalyticsEventSchema = z.object({
  type: z.enum(["step_viewed", "cta_clicked", "demo_completed", "registration_clicked"]),
  stepId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  metadata: z.record(z.unknown()).optional(),
});

export type DemoAnalyticsEventInput = z.infer<typeof demoAnalyticsEventSchema>;

/**
 * Schema for demo configuration (future: server-side config)
 */
export const demoConfigSchema = z.object({
  enabled: z.boolean().default(true),
  autoAdvance: z.boolean().default(false),
  autoAdvanceDelay: z.number().int().positive().default(5000),
});

export type DemoConfig = z.infer<typeof demoConfigSchema>;

