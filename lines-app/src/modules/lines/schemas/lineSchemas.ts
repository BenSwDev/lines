import { z } from "zod";
import { timeSchema, colorSchema, weekdaySchema, frequencySchema } from "@/core/validation";

export const createLineSchema = z.object({
  name: z.string().min(1, "שם הליין הוא שדה חובה"),
  days: z.array(weekdaySchema).min(1, "יש לבחור לפחות יום אחד"),
  startTime: timeSchema,
  endTime: timeSchema,
  frequency: frequencySchema,
  color: colorSchema,
});

export const updateLineSchema = createLineSchema.partial();

export const occurrenceInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isExpected: z.boolean(),
  isActive: z.boolean().optional(),
});

export const syncOccurrencesSchema = z.object({
  occurrences: z.array(occurrenceInputSchema),
});

export type CreateLineInput = z.infer<typeof createLineSchema>;
export type UpdateLineInput = z.infer<typeof updateLineSchema>;
export type OccurrenceInput = z.infer<typeof occurrenceInputSchema>;
export type SyncOccurrencesInput = z.infer<typeof syncOccurrencesSchema>;

