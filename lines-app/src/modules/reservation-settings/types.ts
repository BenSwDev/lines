import type {
  ReservationSettings,
  ReservationSettingsLineExclusion,
  ReservationSettingsDaySchedule,
  ReservationFormField,
  ReservationFormDesign,
  Line
} from "@prisma/client";

export type {
  ReservationSettings,
  ReservationSettingsLineExclusion,
  ReservationSettingsDaySchedule,
  ReservationFormField,
  ReservationFormDesign
};

export type ReservationSettingsWithRelations = ReservationSettings & {
  excludedLines: (ReservationSettingsLineExclusion & {
    line: Line;
  })[];
  daySchedules: ReservationSettingsDaySchedule[];
  formFields: ReservationFormField[];
  formDesign: ReservationFormDesign | null;
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
  formFields?: ReservationFormFieldInput[];
  formDesign?: ReservationFormDesignInput;
};

export type ReservationFormFieldInput = {
  id?: string;
  fieldType:
    | "name"
    | "email"
    | "phone"
    | "date"
    | "time"
    | "number"
    | "text"
    | "textarea"
    | "select"
    | "checkbox"
    | "custom";
  fieldKey: string;
  label: string;
  placeholder?: string | null;
  isRequired: boolean;
  isEnabled: boolean;
  order: number;
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  } | null;
  options?: Array<{ value: string; label: string }> | null;
};

export type ReservationFormDesignInput = {
  primaryColor?: string;
  secondaryColor?: string | null;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  borderRadius?: string;
  fontFamily?: string | null;
  headerText?: string | null;
  footerText?: string | null;
  logoUrl?: string | null;
};
