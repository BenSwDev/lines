import { z } from "zod";
import { colorSchema } from "@/core/validation";

export const createZoneSchema = z.object({
  name: z.string().min(1, "שם האזור הוא שדה חובה"),
  color: colorSchema,
  description: z.string().optional()
});

export const updateZoneSchema = z.object({
  name: z.string().min(1).optional(),
  color: colorSchema.optional(),
  description: z.string().optional()
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;

