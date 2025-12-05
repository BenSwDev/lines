import { z } from "zod";

export const createTableSchema = z.object({
  name: z.string().min(1, "שם השולחן הוא שדה חובה"),
  seats: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
});

export const updateTableSchema = z.object({
  name: z.string().min(1).optional(),
  seats: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;

