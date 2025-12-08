import { z } from "zod";
import { timeSchema, colorSchema, weekdaySchema, frequencySchema } from "@/core/validation";

// Day schedule schema - allows different times and frequency per day
const dayScheduleSchema = z.object({
  day: weekdaySchema,
  startTime: timeSchema,
  endTime: timeSchema,
  frequency: frequencySchema
});

export const createLineSchema = z.object({
  name: z.string().min(1, "validation.lineNameRequired"),
  days: z.array(weekdaySchema).min(1, "validation.daysRequired"),
  startTime: timeSchema, // Legacy - kept for backward compatibility
  endTime: timeSchema, // Legacy - kept for backward compatibility
  frequency: frequencySchema, // Legacy - kept for backward compatibility
  color: colorSchema,
  floorPlanId: z.string().nullable().optional(), // Optional floor plan assignment
  // New flexible structure - per-day schedules
  daySchedules: z.array(dayScheduleSchema).optional(),
  // Optional occurrence data for initial creation
  selectedDates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"))
    .optional(),
  manualDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat")).optional()
});

export const updateLineSchema = createLineSchema.partial();

export const occurrenceInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
  isExpected: z.boolean(),
  isActive: z.boolean().optional()
});

export const syncOccurrencesSchema = z.object({
  occurrences: z.array(occurrenceInputSchema)
});

export type CreateLineInput = z.infer<typeof createLineSchema>;
export type UpdateLineInput = z.infer<typeof updateLineSchema>;
export type OccurrenceInput = z.infer<typeof occurrenceInputSchema>;
export type SyncOccurrencesInput = z.infer<typeof syncOccurrencesSchema>;
