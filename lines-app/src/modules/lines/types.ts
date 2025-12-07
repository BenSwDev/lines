import type {
  Line,
  LineOccurrence,
  LineReservationSettings,
  LineReservationDaySchedule
} from "@prisma/client";

export type { Line, LineOccurrence };

export type LineWithOccurrences = Line & {
  occurrences: LineOccurrence[];
};

export type LineSummaryStats = {
  totalEvents: number;
  activeEvents: number;
  cancelledEvents: number;
};

export type EventStatus = "cancelled" | "ended" | "current" | "upcoming";

export type LineReservationSettingsWithRelations = LineReservationSettings & {
  daySchedules: LineReservationDaySchedule[];
};
