import type { LineOccurrence, Line } from "@prisma/client";

export type CalendarView = "day" | "week" | "month" | "list";

export type CalendarEvent = LineOccurrence & {
  line: Line;
  isOvernight: boolean;
};

export type CalendarBounds = {
  minHour: number;
  maxHour: number;
};

