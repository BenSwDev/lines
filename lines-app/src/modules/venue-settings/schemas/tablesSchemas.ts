import { z } from "zod";

export const createTableSchema = z.object({
  name: z.string().min(1, "validation.tableNameRequired"),
  seats: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
  // Visual properties
  positionX: z.number().optional().nullable(),
  positionY: z.number().optional().nullable(),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  rotation: z.number().min(0).max(360).optional().nullable(),
  shape: z.enum(["rectangle", "circle", "oval", "square"]).optional().nullable()
});

export const updateTableSchema = z.object({
  name: z.string().min(1).optional(),
  seats: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
  // Visual properties
  positionX: z.number().optional().nullable(),
  positionY: z.number().optional().nullable(),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  rotation: z.number().min(0).max(360).optional().nullable(),
  shape: z.enum(["rectangle", "circle", "oval", "square"]).optional().nullable()
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
