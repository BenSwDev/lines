import type { Line, LineOccurrence } from "@prisma/client";

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
