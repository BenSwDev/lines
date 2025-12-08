"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { List, Clock, Palette, Calendar, Trash2 } from "lucide-react";
import { createLine } from "../actions/createLine";
import { updateLine } from "../actions/updateLine";
import { deleteLine } from "../actions/deleteLine";
import { checkLineCollisions } from "../actions/checkCollisions";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";
import { COLOR_PALETTE } from "@/core/config/constants";
import type { TimeRange } from "@/core/validation";
import { cn } from "@/lib/utils";
import { toISODate } from "@/utils/date";
import type { Line } from "@prisma/client";

type CreateLineDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  onSuccess: () => void;
  existingLine?: Line | null;
};

const DAYS_OF_WEEK = [
  { value: 0, label: "ראשון", short: "א" },
  { value: 1, label: "שני", short: "ב" },
  { value: 2, label: "שלישי", short: "ג" },
  { value: 3, label: "רביעי", short: "ד" },
  { value: 4, label: "חמישי", short: "ה" },
  { value: 5, label: "שישי", short: "ו" },
  { value: 6, label: "שבת", short: "ש" }
];

const FREQUENCIES = [
  { value: "weekly", label: "שבועי" },
  { value: "monthly", label: "חודשי" },
  { value: "variable", label: "משתנה" },
  { value: "oneTime", label: "חד פעמי" }
];

const MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר"
];

type StartDateMode = "next" | "custom";

export function CreateLineDialog({
  isOpen,
  onClose,
  venueId,
  onSuccess,
  existingLine
}: CreateLineDialogProps) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - לפי סדר החשיבות
  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "variable" | "oneTime">(
    "weekly"
  );
  const [startDateMode, setStartDateMode] = useState<StartDateMode>("next");
  const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth());
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [color, setColor] = useState<string>(COLOR_PALETTE[0]);
  const [error, setError] = useState("");


  // Calculate next occurrence date based on selected days
  const nextOccurrenceDate = useMemo(() => {
    if (selectedDays.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the next occurrence of any selected day
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dayOfWeek = checkDate.getDay();

      if (selectedDays.includes(dayOfWeek)) {
        return checkDate;
      }
    }

    return null;
  }, [selectedDays]);

  // Get available dates for custom selection (only dates matching selected days)
  const availableDates = useMemo(() => {
    if (selectedDays.length === 0) return [];

    const dates: Date[] = [];
    const start = new Date(customYear, customMonth, 1);
    const end = new Date(customYear, customMonth + 1, 0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        dates.push(new Date(d));
      }
    }

    return dates;
  }, [selectedDays, customMonth, customYear]);

  // Get available months (only months with dates matching selected days in selected year)
  const availableMonths = useMemo(() => {
    if (selectedDays.length === 0) return [];

    const months: number[] = [];

    // Check all months in the selected year
    for (let month = 0; month < 12; month++) {
      const start = new Date(customYear, month, 1);
      const end = new Date(customYear, month + 1, 0);
      let hasMatchingDate = false;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (selectedDays.includes(dayOfWeek)) {
          hasMatchingDate = true;
          break;
        }
      }

      if (hasMatchingDate) {
        months.push(month);
      }
    }

    return months.sort((a, b) => a - b);
  }, [selectedDays, customYear]);

  // Get available years (only years with dates matching selected days)
  const availableYearsWithDates = useMemo(() => {
    if (selectedDays.length === 0) return [];

    const years: number[] = [];
    const currentYear = new Date().getFullYear();

    // Check all years from current to 5 years ahead
    for (let year = currentYear; year <= currentYear + 5; year++) {
      let hasMatchingDate = false;

      // Check all months in this year
      for (let month = 0; month < 12; month++) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (selectedDays.includes(dayOfWeek)) {
            hasMatchingDate = true;
            break;
          }
        }

        if (hasMatchingDate) break;
      }

      if (hasMatchingDate) {
        years.push(year);
      }
    }

    return years;
  }, [selectedDays]);

  // Load existing line data or reset form
  useEffect(() => {
    if (existingLine) {
      setName(existingLine.name || "");
      setColor(existingLine.color || COLOR_PALETTE[0]);
      setStartTime(existingLine.startTime || "18:00");
      setEndTime(existingLine.endTime || "22:00");
      setFrequency(
        (existingLine.frequency as "weekly" | "monthly" | "variable" | "oneTime") || "weekly"
      );
      setSelectedDays(existingLine.days || []);
      setStartDateMode("custom");

      // Try to get first occurrence date if exists
      const loadFirstOccurrence = async () => {
        try {
          const { lineOccurrenceRepository } = await import("@/core/db");
          const occurrences = await lineOccurrenceRepository.findByLineId(existingLine.id);
          if (occurrences.length > 0) {
            const firstDate = new Date(occurrences[0].date);
            setCustomMonth(firstDate.getMonth());
            setCustomYear(firstDate.getFullYear());
          } else {
            const today = new Date();
            setCustomMonth(today.getMonth());
            setCustomYear(today.getFullYear());
          }
        } catch {
          // Silently fallback to today's date if loading fails
          const today = new Date();
          setCustomMonth(today.getMonth());
          setCustomYear(today.getFullYear());
        }
      };

      loadFirstOccurrence();
    } else if (!isOpen) {
      // Reset form when dialog closes
      setName("");
      setSelectedDays([]);
      setFrequency("weekly");
      setStartDateMode("next");
      setStartTime("18:00");
      setEndTime("22:00");
      setColor(COLOR_PALETTE[0]);
      setError("");
      const today = new Date();
      setCustomMonth(today.getMonth());
      setCustomYear(today.getFullYear());
    }
  }, [existingLine, isOpen]);

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((d) => d !== dayValue);
      } else {
        return [...prev, dayValue].sort((a, b) => a - b);
      }
    });
  };

  const getSelectedStartDate = (): Date | null => {
    if (startDateMode === "next") {
      return nextOccurrenceDate;
    } else {
      // For custom, return first available date in selected month/year
      return availableDates.length > 0 ? availableDates[0] : null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("שם הליין הוא שדה חובה");
      return;
    }

    if (selectedDays.length === 0) {
      setError("יש לבחור לפחות יום אחד");
      return;
    }

    // For variable frequency, skip occurrence generation and date validation
    // User will add occurrences manually
    const occurrences: TimeRange[] = [];

    if (frequency !== "variable") {
      const startDate = getSelectedStartDate();
      if (!startDate) {
        setError("לא ניתן למצוא תאריך התחלה תואם לימים שנבחרו");
        return;
      }

      // Generate occurrences based on start date and frequency
      // Always generate until end of calendar year (December 31)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate end of calendar year
      const endOfYear = new Date(startDate.getFullYear(), 11, 31); // December 31
      endOfYear.setHours(23, 59, 59, 999);

      // Validation: Check if start date is not in the past
      if (startDate < today) {
        setError("תאריך ההתחלה לא יכול להיות בעבר");
        setIsSubmitting(false);
        return;
      }

      // Validation: Check if there's time remaining in the year
      if (startDate > endOfYear) {
        setError("תאריך ההתחלה לא יכול להיות אחרי סוף השנה");
        setIsSubmitting(false);
        return;
      }

      if (frequency === "oneTime") {
        // Single occurrence - only if it's within the year
        if (startDate <= endOfYear) {
          occurrences.push({
            date: toISODate(startDate),
            startTime,
            endTime
          });
        }
      } else if (frequency === "weekly") {
        // Generate weekly occurrences until end of calendar year
        // Start from the start date and generate all occurrences
        for (let d = new Date(startDate); d <= endOfYear; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (selectedDays.includes(dayOfWeek)) {
            occurrences.push({
              date: toISODate(d),
              startTime,
              endTime
            });
          }
        }
      } else if (frequency === "monthly") {
        // Generate monthly occurrences until end of calendar year
        // For each selected day, find first occurrence in each month
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();

        // Generate for all months from start month until December
        for (let monthOffset = 0; monthOffset <= 11 - startMonth; monthOffset++) {
          const currentMonth = new Date(startYear, startMonth + monthOffset, 1);
          const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const lastOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

          // For each selected day, find first occurrence in this month
          selectedDays.forEach((targetDay) => {
            const checkDate = new Date(firstOfMonth);
            // Find first occurrence of targetDay in this month
            while (
              checkDate.getDay() !== targetDay &&
              checkDate.getMonth() === firstOfMonth.getMonth() &&
              checkDate <= lastOfMonth
            ) {
              checkDate.setDate(checkDate.getDate() + 1);
            }
            // Only add if it's in the current month and >= startDate and <= endOfYear
            if (
              checkDate.getMonth() === firstOfMonth.getMonth() &&
              checkDate >= startDate &&
              checkDate <= endOfYear
            ) {
              occurrences.push({
                date: toISODate(checkDate),
                startTime,
                endTime
              });
            }
          });
        }
      }

      // Validation: Check if any occurrences were generated (skip for variable)
      if (occurrences.length === 0) {
        setError("לא ניתן ליצור אירועים - אין תאריכים זמינים עד סוף השנה");
        setIsSubmitting(false);
        return;
      }
    }

    // Check for collisions (skip for variable frequency)
    setIsSubmitting(true);
    try {
      if (frequency !== "variable" && occurrences.length > 0) {
        const collisionResult = await checkLineCollisions(venueId, occurrences, existingLine?.id);
        if (!collisionResult.success) {
          setError(collisionResult.error || "נמצאו התנגשויות עם אירועים קיימים");
          setIsSubmitting(false);
          return;
        }
      }

      // Create daySchedules format
      const daySchedules = selectedDays.map((day) => ({
        day,
        startTime,
        endTime,
        frequency
      }));

      // Use updateLine if editing, createLine if creating
      // For variable frequency, don't send selectedDates (occurrences are managed manually)
      const lineData = {
        name: name.trim(),
        days: selectedDays,
        startTime,
        endTime,
        frequency,
        color,
        daySchedules,
        ...(frequency !== "variable" &&
          occurrences.length > 0 && {
            selectedDates: occurrences.map((occ) => occ.date)
          })
      };

      const result = existingLine
        ? await updateLine(venueId, existingLine.id, lineData)
        : await createLine(venueId, lineData);

      if (result.success) {
        toast({
          title: t("success.detailsUpdated"),
          description: existingLine ? t("lines.updatedSuccess") : t("lines.created")
        });
        handleClose();
        onSuccess();
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        setError(errorMsg ? translateError(errorMsg, t) : t("errors.unexpected"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setSelectedDays([]);
      setFrequency("weekly");
      setStartDateMode("next");
      setStartTime("18:00");
      setEndTime("22:00");
      setColor(COLOR_PALETTE[0]);
      setError("");
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!existingLine) return;

    if (!confirm("האם אתה בטוח שברצונך למחוק את הליין הזה?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteLine(venueId, existingLine.id);
      if (result.success) {
        toast({
          title: t("success.deleted", { defaultValue: "נמחק בהצלחה" }),
          description: t("lines.lineDeleted", { defaultValue: "הליין נמחק בהצלחה" })
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: t("errors.generic"),
          description: result.error ? translateError(result.error, t) : t("errors.deleteFailed"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting line:", error);
      toast({
        title: t("errors.generic"),
        description: t("errors.deleteFailed"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <List className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold">
                {existingLine ? "עריכת ליין" : "יצירת ליין חדש"}
              </SheetTitle>
              <SheetDescription className="text-base">
                הגדר ליין חדש לאירועים חוזרים
              </SheetDescription>
            </div>
            {existingLine && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-6">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* 1. שם הליין */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                שם הליין *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: ערב ג'אז"
                disabled={isSubmitting}
                className="h-10"
              />
            </div>

            {/* 2. בחירת ימים */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">בחר ימים *</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      disabled={isSubmitting}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg border-2 font-semibold text-sm transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
              {selectedDays.length === 0 && (
                <p className="text-xs text-muted-foreground">יש לבחור לפחות יום אחד</p>
              )}
            </div>

            {/* 3. תדירות */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm font-semibold">
                תדירות
              </Label>
              <Select
                value={frequency}
                onValueChange={(value) =>
                  setFrequency(value as "weekly" | "monthly" | "variable" | "oneTime")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="frequency" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. תאריך התחלה - רק אם frequency לא variable */}
            {frequency !== "variable" && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">תאריך התחלה</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={startDateMode === "next" ? "default" : "outline"}
                      onClick={() => setStartDateMode("next")}
                      disabled={isSubmitting || selectedDays.length === 0}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 ml-2" />
                      הקרוב
                    </Button>
                    <Button
                      type="button"
                      variant={startDateMode === "custom" ? "default" : "outline"}
                      onClick={() => setStartDateMode("custom")}
                      disabled={isSubmitting || selectedDays.length === 0}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 ml-2" />
                      התאמה אישית
                    </Button>
                  </div>

                  {startDateMode === "next" && nextOccurrenceDate && (
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-sm font-medium">
                        התאריך הקרוב: {formatDate(nextOccurrenceDate)}
                      </p>
                    </div>
                  )}

                  {startDateMode === "custom" && (
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">שנה</Label>
                          <Select
                            value={customYear.toString()}
                            onValueChange={(value) => {
                              const newYear = parseInt(value);
                              setCustomYear(newYear);
                              // Calculate available months for new year
                              const months: number[] = [];
                              for (let month = 0; month < 12; month++) {
                                const start = new Date(newYear, month, 1);
                                const end = new Date(newYear, month + 1, 0);
                                let hasMatchingDate = false;
                                for (
                                  let d = new Date(start);
                                  d <= end;
                                  d.setDate(d.getDate() + 1)
                                ) {
                                  const dayOfWeek = d.getDay();
                                  if (selectedDays.includes(dayOfWeek)) {
                                    hasMatchingDate = true;
                                    break;
                                  }
                                }
                                if (hasMatchingDate) {
                                  months.push(month);
                                }
                              }
                              // Reset month to first available month in new year, or keep current if available
                              if (months.length > 0) {
                                const newMonth = months.includes(customMonth)
                                  ? customMonth
                                  : months[0];
                                setCustomMonth(newMonth);
                              }
                            }}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableYearsWithDates.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">חודש</Label>
                          <Select
                            value={customMonth.toString()}
                            onValueChange={(value) => setCustomMonth(parseInt(value))}
                            disabled={isSubmitting || availableMonths.length === 0}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMonths.length > 0 ? (
                                availableMonths.map((monthIndex) => (
                                  <SelectItem key={monthIndex} value={monthIndex.toString()}>
                                    {MONTHS[monthIndex]}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value={customMonth.toString()} disabled>
                                  {MONTHS[customMonth]} (אין תאריכים)
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {availableDates.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs">תאריכים זמינים</Label>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {availableDates.map((date, index) => (
                              <div
                                key={index}
                                className="text-sm p-2 rounded bg-background border border-border"
                              >
                                {formatDate(date)}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            התאריך הראשון ({formatDate(availableDates[0])}) ייבחר אוטומטית
                          </p>
                        </div>
                      )}

                      {availableDates.length === 0 && (
                        <p className="text-xs text-destructive">
                          לא נמצאו תאריכים תואמים לימים שנבחרו בחודש ובשנה שנבחרו
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. שעות פעילות */}
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                שעות פעילות
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs">
                    שעת התחלה
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs">
                    שעת סיום
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* 6. צבע */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4" />
                צבע
              </Label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    disabled={isSubmitting}
                    className={cn(
                      "h-10 w-10 rounded-lg border-2 transition-all",
                      color === c
                        ? "border-foreground shadow-md scale-110"
                        : "border-border hover:border-primary/50 hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedDays.length === 0}>
              {isSubmitting ? "שומר..." : existingLine ? "שמור שינויים" : "צור ליין"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
