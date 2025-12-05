"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { List, Clock, Palette } from "lucide-react";
import { createLine } from "../actions/createLine";
import { useToast } from "@/hooks/use-toast";
import { COLOR_PALETTE } from "@/core/config/constants";
import type { Line } from "@prisma/client";

type CreateLineDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  onSuccess: () => void;
  existingLine?: Line | null;
};

const DAYS_OF_WEEK = [
  { value: 0, label: "ראשון" },
  { value: 1, label: "שני" },
  { value: 2, label: "שלישי" },
  { value: 3, label: "רביעי" },
  { value: 4, label: "חמישי" },
  { value: 5, label: "שישי" },
  { value: 6, label: "שבת" },
];

const FREQUENCIES = [
  { value: "weekly", label: "שבועי" },
  { value: "monthly", label: "חודשי" },
  { value: "variable", label: "משתנה" },
  { value: "oneTime", label: "חד פעמי" },
];

export function CreateLineDialog({
  isOpen,
  onClose,
  venueId,
  onSuccess,
  existingLine,
}: CreateLineDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [frequency, setFrequency] = useState("weekly");
  const [color, setColor] = useState<string>(COLOR_PALETTE[0]);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedDates, setSuggestedDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [showManualDates, setShowManualDates] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualDates, setManualDates] = useState<string[]>([]);

  // Load existing line data
  useEffect(() => {
    if (existingLine) {
      setName(existingLine.name || "");
      setDays(existingLine.days || []);
      setStartTime(existingLine.startTime || "18:00");
      setEndTime(existingLine.endTime || "22:00");
      setFrequency(existingLine.frequency || "weekly");
      setColor(existingLine.color || COLOR_PALETTE[0]);
    }
  }, [existingLine]);

  const toggleDay = (dayValue: number) => {
    setDays((prev) => {
      const newDays = prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue].sort();
      
      // Regenerate suggestions when days change
      if (newDays.length > 0) {
        generateSuggestions(newDays, frequency);
      } else {
        setSuggestedDates([]);
        setSelectedDates(new Set());
      }
      
      return newDays;
    });
  };

  const generateSuggestions = (selectedDays: number[], freq: string) => {
    if (selectedDays.length === 0) return;

    const suggestions: string[] = [];
    const today = new Date();
    const maxDate = new Date();
    
    // Set horizon based on frequency
    if (freq === "weekly") {
      maxDate.setMonth(today.getMonth() + 3); // 3 months
    } else if (freq === "monthly") {
      maxDate.setMonth(today.getMonth() + 6); // 6 months
    } else {
      maxDate.setMonth(today.getMonth() + 2); // 2 months for variable/oneTime
    }

    const current = new Date(today);
    while (current <= maxDate) {
      if (selectedDays.includes(current.getDay())) {
        suggestions.push(current.toISOString().split("T")[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    setSuggestedDates(suggestions);
    // Select all by default
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
    
    // Check if date matches selected days
    const date = new Date(manualDate);
    if (!days.includes(date.getDay())) {
      toast({
        title: "שגיאה",
        description: "התאריך לא תואם את הימים שנבחרו",
        variant: "destructive",
      });
      return;
    }

    if (manualDates.includes(manualDate) || selectedDates.has(manualDate)) {
      toast({
        title: "שגיאה",
        description: "התאריך כבר קיים",
        variant: "destructive",
      });
      return;
    }

    setManualDates([...manualDates, manualDate].sort());
    setManualDate("");
  };

  const removeManualDate = (date: string) => {
    setManualDates(manualDates.filter((d) => d !== date));
  };

  const isOvernight = endTime <= startTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("שם הליין הוא שדה חובה");
      return;
    }

    if (days.length === 0) {
      setError("יש לבחור לפחות יום אחד");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createLine(venueId, {
        name: name.trim(),
        days,
        startTime,
        endTime,
        frequency,
        color,
      });

      if (result.success) {
        toast({
          title: "הצלחה!",
          description: `הליין "${name}" נוצר בהצלחה`,
        });
        handleClose();
        onSuccess();
      } else {
        setError(result.error || "שגיאה ביצירת הליין");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא צפויה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setDays([]);
      setStartTime("18:00");
      setEndTime("22:00");
      setFrequency("weekly");
      setColor(COLOR_PALETTE[0]);
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {existingLine ? "עריכת ליין" : "יצירת ליין חדש"}
              </DialogTitle>
              <DialogDescription>
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

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">שם הליין *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: ערב ג'אז"
                disabled={isSubmitting}
              />
            </div>

            {/* Days */}
            <div className="space-y-3">
              <Label>ימים בשבוע *</Label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex flex-col items-center">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={days.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`day-${day.value}`}
                      className="mt-1 text-xs cursor-pointer"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  <Clock className="ml-1 inline h-3 w-3" />
                  שעת התחלה *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  <Clock className="ml-1 inline h-3 w-3" />
                  שעת סיום *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {isOvernight && (
              <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                ⚠️ משמרת לילה - האירוע ימשך עד למחרת (+1)
              </div>
            )}

            {/* Frequency */}
            <div className="space-y-2">
              <Label>תדירות</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
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

            {/* Color Picker */}
            <div className="space-y-3">
              <Label>
                <Palette className="ml-1 inline h-4 w-4" />
                צבע ייחודי
              </Label>
              <div className="grid grid-cols-5 gap-3">
                {COLOR_PALETTE.map((paletteColor) => (
                  <button
                    key={paletteColor}
                    type="button"
                    onClick={() => setColor(paletteColor)}
                    disabled={isSubmitting}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      color === paletteColor
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: paletteColor }}
                  >
                    {color === paletteColor && (
                      <span className="text-white text-xl">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                נבחר: {color} ({COLOR_PALETTE.indexOf(color) + 1}/15)
              </p>
            </div>

            {/* Suggested Dates */}
            {days.length > 0 && (
              <div className="space-y-3">
                <Label>תאריכים מוצעים</Label>
                {!showSuggestions ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => generateSuggestions(days, frequency)}
                  >
                    הצג תאריכים מוצעים
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-lg border bg-muted/50 p-3 text-sm">
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
                              month: "long",
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
                )}
              </div>
            )}

            {/* Manual Dates */}
            {days.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showManualDates}
                    onCheckedChange={(checked) => setShowManualDates(!!checked)}
                  />
                  <Label>הוסף תאריכים ידנית</Label>
                </div>
                {showManualDates && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Button
                        type="button"
                        onClick={addManualDate}
                        disabled={!manualDate}
                      >
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
                                month: "short",
                              })}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeManualDate(date)}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || days.length === 0}>
              {isSubmitting ? "שומר..." : existingLine ? "עדכון" : "יצירה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

