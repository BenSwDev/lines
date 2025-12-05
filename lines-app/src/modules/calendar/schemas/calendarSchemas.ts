import { z } from "zod";
import { dateSchema } from "@/core/validation";

export const calendarViewSchema = z.enum(["day", "week", "month", "list"], {
  errorMap: () => ({ message: "תצוגת לוח שנה לא חוקית" })
});

export const calendarQuerySchema = z.object({
  view: calendarViewSchema.optional(),
  date: dateSchema.optional()
});

export type CalendarView = z.infer<typeof calendarViewSchema>;
export type CalendarQuery = z.infer<typeof calendarQuerySchema>;
