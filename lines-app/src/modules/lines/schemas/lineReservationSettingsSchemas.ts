import { z } from "zod";

export const lineReservationDayScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$|^24:00$/, "Invalid time format (HH:MM or 24:00)"),
  intervalMinutes: z.number().int().positive().nullable().optional(),
  customerMessage: z.string().nullable().optional()
});

export const lineReservationSettingsSchema = z.object({
  allowPersonalLink: z.boolean(),
  requireApproval: z.boolean(),
  manageWaitlist: z.boolean(),
  daySchedules: z.array(lineReservationDayScheduleSchema).optional()
});

export type LineReservationSettingsInput = z.infer<typeof lineReservationSettingsSchema>;
export type LineReservationDayScheduleInput = z.infer<typeof lineReservationDayScheduleSchema>;
