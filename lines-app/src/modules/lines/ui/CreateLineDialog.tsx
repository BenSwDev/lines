"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { List, Clock, Palette, ChevronDown, X, Settings, Copy, Check } from "lucide-react";
import { createLine } from "../actions/createLine";
import { updateLine } from "../actions/updateLine";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";
import { COLOR_PALETTE } from "@/core/config/constants";
import { checkMultipleCollisions, type TimeRange } from "@/core/validation";
import { lineOccurrenceRepository } from "@/core/db";
import { cn } from "@/lib/utils";
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

type DaySchedule = {
  day: number;
  startTime: string;
  endTime: string;
  frequency: string;
  isOverridden?: boolean; // Track if this day has custom settings
};

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
  const [isCheckingCollisions, setIsCheckingCollisions] = useState(false);

  // Bulk settings (defaults for all days)
  const [bulkStartTime, setBulkStartTime] = useState("18:00");
  const [bulkEndTime, setBulkEndTime] = useState("22:00");
  const [bulkFrequency, setBulkFrequency] = useState("weekly");

  // Form state
  const [name, setName] = useState("");
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [color, setColor] = useState<string>(COLOR_PALETTE[0]);
  const [error, setError] = useState("");
  const [collisionError, setCollisionError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedDates, setSuggestedDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [showManualDates, setShowManualDates] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualDates, setManualDates] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  // Load existing line data or reset form
  useEffect(() => {
    if (existingLine) {
      setName(existingLine.name || "");
      setColor(existingLine.color || COLOR_PALETTE[0]);
      setBulkStartTime(existingLine.startTime || "18:00");
      setBulkEndTime(existingLine.endTime || "22:00");
      setBulkFrequency(existingLine.frequency || "weekly");

      // Convert existing line to daySchedules format
      const schedules: DaySchedule[] = (existingLine.days || []).map((day) => ({
        day,
        startTime: existingLine.startTime || "18:00",
        endTime: existingLine.endTime || "22:00",
        frequency: existingLine.frequency || "weekly",
        isOverridden: false
      }));
      setDaySchedules(schedules);
    } else if (!isOpen) {
      // Reset form when dialog closes and no existing line
      setName("");
      setDaySchedules([]);
      setColor(COLOR_PALETTE[0]);
      setBulkStartTime("18:00");
      setBulkEndTime("22:00");
      setBulkFrequency("weekly");
      setError("");
      setCollisionError("");
      setShowSuggestions(false);
      setSuggestedDates([]);
      setSelectedDates(new Set());
      setShowManualDates(false);
      setManualDate("");
      setManualDates([]);
      setExpandedDays(new Set());
    }
  }, [existingLine, isOpen]);

  const toggleDay = (dayValue: number) => {
    setDaySchedules((prev) => {
      const existing = prev.find((s) => s.day === dayValue);
      if (existing) {
        // Remove day
        const newExpanded = new Set(expandedDays);
        newExpanded.delete(dayValue);
        setExpandedDays(newExpanded);
        return prev.filter((s) => s.day !== dayValue);
      } else {
        // Add day with bulk defaults
        return [
          ...prev,
          {
            day: dayValue,
            startTime: bulkStartTime,
            endTime: bulkEndTime,
            frequency: bulkFrequency,
            isOverridden: false
          }
        ].sort((a, b) => a.day - b.day);
      }
    });
  };

  const applyBulkToAll = () => {
    setDaySchedules((prev) =>
      prev.map((s) => ({
        ...s,
        startTime: bulkStartTime,
        endTime: bulkEndTime,
        frequency: bulkFrequency,
        isOverridden: false
      }))
    );
    toast({
      title: "הוחל על כל הימים",
      description: "ההגדרות הכלליות הוחלו על כל הימים שנבחרו"
    });
  };

  const updateDaySchedule = (day: number, field: keyof DaySchedule, value: string | boolean) => {
    setDaySchedules((prev) =>
      prev.map((s) => {
        if (s.day === day) {
          return {
            ...s,
            [field]: value,
            isOverridden: true
          };
        }
        return s;
      })
    );
  };

  const resetDayToBulk = (day: number) => {
    setDaySchedules((prev) =>
      prev.map((s) =>
        s.day === day
          ? {
              ...s,
              startTime: bulkStartTime,
              endTime: bulkEndTime,
              frequency: bulkFrequency,
              isOverridden: false
            }
          : s
      )
    );
  };

  const getDaySchedule = (day: number): DaySchedule | undefined => {
    return daySchedules.find((s) => s.day === day);
  };

  const toggleDayExpansion = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const generateSuggestions = (schedules: DaySchedule[]) => {
    if (schedules.length === 0) return;

    const suggestions: string[] = [];
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 3); // 3 months horizon

    const current = new Date(today);
    while (current <= maxDate) {
      const dayOfWeek = current.getDay();
      const schedule = schedules.find((s) => s.day === dayOfWeek);

      if (schedule) {
        // Generate based on frequency
        let shouldInclude = false;

        if (schedule.frequency === "weekly") {
          shouldInclude = true;
        } else if (schedule.frequency === "monthly") {
          // First occurrence of this weekday in month
          const firstOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
          const firstOccurrence = new Date(firstOfMonth);
          while (firstOccurrence.getDay() !== dayOfWeek) {
            firstOccurrence.setDate(firstOccurrence.getDate() + 1);
          }
          shouldInclude = current.getDate() === firstOccurrence.getDate();
        } else if (schedule.frequency === "oneTime") {
          // Only if it's the next occurrence
          shouldInclude =
            current >= today && current <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        if (shouldInclude) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, "0");
          const day = String(current.getDate()).padStart(2, "0");
          suggestions.push(`${year}-${month}-${day}`);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    setSuggestedDates([...new Set(suggestions)].sort());
    setSelectedDates(new Set(suggestions));
    setShowSuggestions(true);
  };

  const toggleDate = (date: string) => {
    setSelectedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const addManualDate = () => {
    if (!manualDate) return;

    const date = new Date(manualDate);
    const dayOfWeek = date.getDay();
    const schedule = daySchedules.find((s) => s.day === dayOfWeek);

    if (!schedule) {
      toast({
        title: t("errors.generic"),
        description: "התאריך לא תואם לימים שנבחרו",
        variant: "destructive"
      });
      return;
    }

    if (manualDates.includes(manualDate) || selectedDates.has(manualDate)) {
      toast({
        title: t("errors.generic"),
        description: "תאריך זה כבר קיים",
        variant: "destructive"
      });
      return;
    }

    setManualDates([...manualDates, manualDate].sort());
    setManualDate("");
  };

  const removeManualDate = (date: string) => {
    setManualDates(manualDates.filter((d) => d !== date));
  };

  // Check for collisions before submitting
  const checkCollisions = async (): Promise<boolean> => {
    setIsCheckingCollisions(true);
    setCollisionError("");

    try {
      // Get all existing occurrences for this venue
      const existingOccurrences = await lineOccurrenceRepository.findByVenueId(venueId);
      const existingRanges: TimeRange[] = existingOccurrences
        .filter((occ) => occ.isActive)
        .map((occ) => ({
          date: occ.date,
          startTime: occ.startTime,
          endTime: occ.endTime
        }));

      // Build new ranges from selected dates and day schedules
      const newRanges: TimeRange[] = [];

      // From selected dates
      for (const date of Array.from(selectedDates)) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        const schedule = daySchedules.find((s) => s.day === dayOfWeek);

        if (schedule) {
          newRanges.push({
            date,
            startTime: schedule.startTime,
            endTime: schedule.endTime
          });
        }
      }

      // From manual dates
      for (const date of manualDates) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        const schedule = daySchedules.find((s) => s.day === dayOfWeek);

        if (schedule) {
          newRanges.push({
            date,
            startTime: schedule.startTime,
            endTime: schedule.endTime
          });
        }
      }

      // Check collisions
      const result = checkMultipleCollisions(newRanges, existingRanges);

      if (result.hasCollision) {
        setCollisionError(
          `נמצאו התנגשויות עם ${result.conflictingRanges.length} אירועים קיימים. לא ניתן ליצור אירועים חופפים באותו זמן.`
        );
        return false;
      }

      return true;
    } catch {
      setCollisionError("שגיאה בבדיקת התנגשויות");
      return false;
    } finally {
      setIsCheckingCollisions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCollisionError("");

    if (!name.trim()) {
      setError(t("lines.nameRequired"));
      return;
    }

    if (daySchedules.length === 0) {
      setError(t("lines.daysRequired"));
      return;
    }

    // Check for collisions
    const noCollisions = await checkCollisions();
    if (!noCollisions) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert daySchedules to legacy format for now (will update schema later)
      const days = daySchedules.map((s) => s.day);
      // Use first schedule's times as default (will be overridden per occurrence)
      const defaultStartTime = daySchedules[0]?.startTime || "18:00";
      const defaultEndTime = daySchedules[0]?.endTime || "22:00";
      const defaultFrequency = daySchedules[0]?.frequency || "weekly";

      const selectedDatesArray = Array.from(selectedDates);
      const allManualDates = manualDates.filter((date) => !selectedDates.has(date));

      // Use updateLine if editing, createLine if creating
      const result = existingLine
        ? await updateLine(venueId, existingLine.id, {
            name: name.trim(),
            days,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
            frequency: defaultFrequency,
            color,
            selectedDates: selectedDatesArray.length > 0 ? selectedDatesArray : undefined,
            manualDates: allManualDates.length > 0 ? allManualDates : undefined,
            daySchedules: daySchedules // Pass new structure
          })
        : await createLine(venueId, {
            name: name.trim(),
            days,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
            frequency: defaultFrequency,
            color,
            selectedDates: selectedDatesArray.length > 0 ? selectedDatesArray : undefined,
            manualDates: allManualDates.length > 0 ? allManualDates : undefined,
            daySchedules: daySchedules // Pass new structure
          });

      if (result.success) {
        toast({
          title: t("success.detailsUpdated"),
          description: existingLine ? t("lines.updatedSuccess") : t("lines.created")
        });
        handleClose();
        onSuccess();
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        setError(
          errorMsg
            ? translateError(errorMsg, t)
            : existingLine
              ? t("lines.updating")
              : t("lines.creating")
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isCheckingCollisions) {
      setName("");
      setDaySchedules([]);
      setColor(COLOR_PALETTE[0]);
      setBulkStartTime("18:00");
      setBulkEndTime("22:00");
      setBulkFrequency("weekly");
      setError("");
      setCollisionError("");
      setShowSuggestions(false);
      setSuggestedDates([]);
      setSelectedDates(new Set());
      setShowManualDates(false);
      setManualDate("");
      setManualDates([]);
      setExpandedDays(new Set());
      onClose();
    }
  };

  const selectedDays = daySchedules.map((s) => s.day);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <List className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {existingLine ? "עריכת ליין" : "יצירת ליין חדש"}
              </DialogTitle>
              <DialogDescription className="text-base">
                הגדר לוח זמנים, ימים וצבע לאירועים חוזרים
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {collisionError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {collisionError}
              </div>
            )}

            {/* Name and Color - Compact Row */}
            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label className="text-sm font-semibold">צבע</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between gap-2 h-10"
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-5 w-5 rounded border-2 border-border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">בחר צבע</span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">בחר צבע</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_PALETTE.map((paletteColor) => (
                          <button
                            key={paletteColor}
                            type="button"
                            onClick={() => setColor(paletteColor)}
                            disabled={isSubmitting}
                            className={cn(
                              "h-10 w-10 rounded-lg border-2 transition-all",
                              color === paletteColor
                                ? "border-primary ring-2 ring-primary ring-offset-2 scale-110"
                                : "border-border/50 hover:border-primary/50 hover:scale-105"
                            )}
                            style={{ backgroundColor: paletteColor }}
                            aria-label={`בחר צבע ${paletteColor}`}
                          >
                            {color === paletteColor && (
                              <Check className="h-4 w-4 text-primary-foreground mx-auto drop-shadow-lg" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Bulk Settings - Professional Card */}
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent p-5 shadow-sm">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <Label className="text-base font-bold text-foreground">הגדרות כלליות</Label>
                  </div>
                  {selectedDays.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyBulkToAll}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      החל על כל הימים
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkStartTime" className="text-xs text-muted-foreground">
                      <Clock className="ml-1 inline h-3 w-3" />
                      שעת התחלה
                    </Label>
                    <Input
                      id="bulkStartTime"
                      type="time"
                      value={bulkStartTime}
                      onChange={(e) => setBulkStartTime(e.target.value)}
                      disabled={isSubmitting}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulkEndTime" className="text-xs text-muted-foreground">
                      <Clock className="ml-1 inline h-3 w-3" />
                      שעת סיום
                    </Label>
                    <Input
                      id="bulkEndTime"
                      type="time"
                      value={bulkEndTime}
                      onChange={(e) => setBulkEndTime(e.target.value)}
                      disabled={isSubmitting}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulkFrequency" className="text-xs text-muted-foreground">
                      תדירות
                    </Label>
                    <Select value={bulkFrequency} onValueChange={setBulkFrequency}>
                      <SelectTrigger id="bulkFrequency" className="h-9 text-sm">
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
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  הגדרות אלו יחולו על כל הימים שנבחרו. ניתן לשנות הגדרות ספציפיות לכל יום.
                </p>
              </div>
            </div>

            {/* Days Selector - Compact */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">בחר ימים *</Label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const schedule = getDaySchedule(day.value);
                  const isSelected = !!schedule;
                  const isExpanded = expandedDays.has(day.value);
                  const isOverridden = schedule?.isOverridden;

                  return (
                    <div key={day.value} className="space-y-2">
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={() => toggleDayExpansion(day.value)}
                      >
                        <div
                          className={cn(
                            "relative rounded-lg border-2 transition-all cursor-pointer",
                            isSelected
                              ? "border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm"
                              : "border-border/50 bg-card hover:border-primary/30"
                          )}
                        >
                          <div className="flex flex-col items-center p-3">
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleDay(day.value)}
                              disabled={isSubmitting}
                              className="mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label
                              htmlFor={`day-${day.value}`}
                              className="text-xs font-semibold cursor-pointer text-center"
                            >
                              {day.short}
                            </label>
                            {isSelected && isOverridden && (
                              <div className="mt-1 h-1 w-1 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <CollapsibleContent className="mt-2">
                            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-foreground">
                                  {day.label}
                                </span>
                                {isOverridden && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => resetDayToBulk(day.value)}
                                    className="h-6 text-xs"
                                  >
                                    איפוס
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">התחלה</Label>
                                    <Input
                                      type="time"
                                      value={schedule.startTime}
                                      onChange={(e) =>
                                        updateDaySchedule(day.value, "startTime", e.target.value)
                                      }
                                      disabled={isSubmitting}
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">סיום</Label>
                                    <Input
                                      type="time"
                                      value={schedule.endTime}
                                      onChange={(e) =>
                                        updateDaySchedule(day.value, "endTime", e.target.value)
                                      }
                                      disabled={isSubmitting}
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">תדירות</Label>
                                  <Select
                                    value={schedule.frequency}
                                    onValueChange={(value) =>
                                      updateDaySchedule(day.value, "frequency", value)
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-xs">
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
                              </div>
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
              {selectedDays.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  לחץ על יום שנבחר כדי לשנות הגדרות ספציפיות
                </p>
              )}
            </div>

            {/* Suggested Dates - Collapsible */}
            {daySchedules.length > 0 && (
              <Collapsible open={showSuggestions} onOpenChange={setShowSuggestions}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">תאריכים מוצעים</Label>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateSuggestions(daySchedules)}
                      >
                        {showSuggestions ? "הסתר" : "הצג תאריכים"}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="space-y-2">
                      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                        <p className="font-medium">
                          {selectedDates.size} תאריכים נבחרו מתוך {suggestedDates.length}
                        </p>
                      </div>
                      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
                        {suggestedDates.slice(0, 20).map((date) => (
                          <div
                            key={date}
                            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted"
                          >
                            <Checkbox
                              checked={selectedDates.has(date)}
                              onCheckedChange={() => toggleDate(date)}
                            />
                            <span className="text-sm">
                              {new Date(date).toLocaleDateString("he-IL", {
                                weekday: "long",
                                day: "numeric",
                                month: "long"
                              })}
                            </span>
                          </div>
                        ))}
                        {suggestedDates.length > 20 && (
                          <p className="text-xs text-muted-foreground px-2 py-1">
                            +{suggestedDates.length - 20} תאריכים נוספים
                          </p>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Manual Dates - Collapsible */}
            {daySchedules.length > 0 && (
              <Collapsible open={showManualDates} onOpenChange={setShowManualDates}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={showManualDates}
                      onCheckedChange={(checked) => setShowManualDates(!!checked)}
                    />
                    <Label>הוסף תאריכים ידנית</Label>
                  </div>
                  <CollapsibleContent>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={manualDate}
                          onChange={(e) => setManualDate(e.target.value)}
                          min={(() => {
                            const today = new Date();
                            const year = today.getFullYear();
                            const month = String(today.getMonth() + 1).padStart(2, "0");
                            const day = String(today.getDate()).padStart(2, "0");
                            return `${year}-${month}-${day}`;
                          })()}
                          className="flex-1"
                        />
                        <Button type="button" onClick={addManualDate} disabled={!manualDate}>
                          הוסף
                        </Button>
                      </div>
                      {manualDates.length > 0 && (
                        <div className="space-y-1 rounded-lg border p-2">
                          {manualDates.map((date) => (
                            <div
                              key={date}
                              className="flex items-center justify-between rounded bg-muted px-2 py-1"
                            >
                              <span className="text-sm">
                                {new Date(date).toLocaleDateString("he-IL", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short"
                                })}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeManualDate(date)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isCheckingCollisions}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || isCheckingCollisions || !name.trim() || daySchedules.length === 0
              }
            >
              {isSubmitting || isCheckingCollisions ? "בודק..." : existingLine ? "עדכון" : "יצירה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
