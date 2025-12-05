import type { LineOccurrence } from "@prisma/client";

export type { LineOccurrence };

export type EventStatus = "cancelled" | "ended" | "current" | "upcoming";

export type EventWithLine = LineOccurrence & {
  line: {
    id: string;
    name: string;
    color: string;
    days: number[];
    startTime: string;
    endTime: string;
    frequency: string;
  };
};

