import { z } from "zod";

export const createZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
  description: z.string().optional()
});

export const updateZoneSchema = createZoneSchema.partial();
