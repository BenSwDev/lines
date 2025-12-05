import { z } from "zod";

export const updateOccurrenceSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  contact: z.string().optional(),
  isActive: z.boolean().optional()
});

export type UpdateOccurrenceInput = z.infer<typeof updateOccurrenceSchema>;
