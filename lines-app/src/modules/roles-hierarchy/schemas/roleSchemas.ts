import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  parentRoleId: z.string().optional(),
  managerRoleId: z.string().optional(), // Role that manages this role
  order: z.number().int().min(0).default(0),
  requiresManagement: z.boolean().default(false),
  requiresStaffing: z.boolean().default(false), // Does this role need staffing assignment?
  canManage: z.boolean().default(false) // Can this role have managers?
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  parentRoleId: z.string().optional().nullable(),
  managerRoleId: z.string().optional().nullable(), // Role that manages this role
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  requiresManagement: z.boolean().optional(),
  requiresStaffing: z.boolean().optional(), // Does this role need staffing assignment?
  canManage: z.boolean().optional() // Can this role have managers?
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
