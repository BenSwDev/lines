import type {
  ReservationSettings,
  ReservationSettingsLineExclusion,
  ReservationSettingsDaySchedule,
  Line
} from "@prisma/client";

export type {
  ReservationSettings,
  ReservationSettingsLineExclusion,
  ReservationSettingsDaySchedule
};

export type ReservationSettingsWithRelations = ReservationSettings & {
  excludedLines: (ReservationSettingsLineExclusion & {
    line: Line;
  })[];
  daySchedules: ReservationSettingsDaySchedule[];
};

export type ReservationSettingsDayScheduleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  intervalMinutes?: number | null;
  customerMessage?: string | null;
};

export type ReservationSettingsInput = {
  acceptsReservations: boolean;
  allowPersonalLink: boolean;
  requireApproval: boolean;
  manualRegistrationOnly: boolean;
  manageWaitlist: boolean;
  excludedLineIds: string[];
  daySchedules: ReservationSettingsDayScheduleInput[];
};

