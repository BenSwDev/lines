import { z } from "zod";

/**
 * Guided Tour validation schemas
 */

export const tourStepIdSchema = z.enum([
  "lines-intro",
  "lines-create-button",
  "lines-card",
  "lines-empty-state",
  "roles-intro",
  "roles-departments",
  "roles-hierarchy",
  "map-intro",
  "map-zones",
  "map-tables",
  "menus-intro",
  "menus-upload",
  "menus-list"
]);

export const tourPageIdSchema = z.enum([
  "lines",
  "roles",
  "map",
  "menus",
  "info",
  "calendar"
]);

export const tourStepSchema = z.object({
  id: tourStepIdSchema,
  pageId: tourPageIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  targetSelector: z.string().optional(),
  position: z.enum(["top", "bottom", "left", "right", "center"]).optional(),
  action: z
    .object({
      type: z.enum(["click", "scroll", "wait"]),
      selector: z.string().optional(),
      delay: z.number().optional()
    })
    .optional(),
  nextStepId: tourStepIdSchema.optional(),
  prevStepId: tourStepIdSchema.optional(),
  skipable: z.boolean().optional().default(true)
});

export const tourPageSchema = z.object({
  id: tourPageIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  steps: z.array(tourStepIdSchema),
  order: z.number().int().positive()
});

export const tourProgressSchema = z.object({
  currentStepId: tourStepIdSchema.nullable(),
  completedSteps: z.array(tourStepIdSchema),
  currentPageId: tourPageIdSchema.nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable()
});

export const tourConfigSchema = z.object({
  enabled: z.boolean().default(true),
  autoStart: z.boolean().default(false),
  showProgress: z.boolean().default(true),
  allowSkip: z.boolean().default(true),
  storageKey: z.string().default("lines-tour-progress")
});

export type TourStepInput = z.infer<typeof tourStepSchema>;
export type TourPageInput = z.infer<typeof tourPageSchema>;
export type TourProgressInput = z.infer<typeof tourProgressSchema>;
export type TourConfigInput = z.infer<typeof tourConfigSchema>;

