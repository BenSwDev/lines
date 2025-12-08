"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { cn } from "@/lib/utils";
import type { Line } from "@prisma/client";

type WeeklyScheduleViewProps = {
  lines: Line[];
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  onLineClick: (lineId: string) => void;
};

const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const DAYS_ENGLISH = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Gradient colors for different days
const DAY_GRADIENTS = [
  "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20", // Sun
  "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20", // Mon
  "from-pink-50 to-pink-100/50 dark:from-pink-950/30 dark:to-pink-900/20", // Tue
  "from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20", // Wed
  "from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20", // Thu
  "from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20", // Fri
  "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20" // Sat
];

export function WeeklyScheduleView({ lines, weekStartDay, onLineClick }: WeeklyScheduleViewProps) {
  const { t } = useTranslations();

  // Get week days in correct order based on weekStartDay
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (weekStartDay + i) % 7;
      days.push({
        index: dayIndex,
        hebrew: DAYS_HEBREW[dayIndex],
        english: DAYS_ENGLISH[dayIndex],
        gradient: DAY_GRADIENTS[dayIndex]
      });
    }
    return days;
  }, [weekStartDay]);

  // Group lines by day
  const linesByDay = useMemo(() => {
    const grouped: Record<number, Line[]> = {};
    weekDays.forEach((day) => {
      grouped[day.index] = [];
    });

    lines.forEach((line) => {
      line.days.forEach((dayIndex) => {
        if (grouped[dayIndex]) {
          grouped[dayIndex].push(line);
        }
      });
    });

    return grouped;
  }, [lines, weekDays]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("lines.weeklySchedule", { defaultValue: "מערכת שעות שבועית" })}
        </h2>
        <p className="text-muted-foreground">
          {t("lines.weeklyScheduleDescription", {
            defaultValue: "צפה בכל הליינים הפעילים לפי ימי השבוע"
          })}
        </p>
      </div>

      {/* Weekly Grid - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day, dayIdx) => {
          const dayLines = linesByDay[day.index] || [];
          return (
            <Card
              key={day.index}
              className={cn(
                "flex flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                `bg-gradient-to-br ${day.gradient}`,
                "border-border/50 hover:border-primary/30"
              )}
              style={{
                animationDelay: `${dayIdx * 50}ms`
              }}
            >
              {/* Day Header */}
              <div className="p-4 border-b border-border/30 bg-background/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-foreground">{day.hebrew}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {day.english}
                  </span>
                  {dayLines.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="mt-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20"
                    >
                      {dayLines.length}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Lines Content */}
              <CardContent className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[600px]">
                {dayLines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                      <Clock className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("lines.noLinesForDay", { defaultValue: "אין ליינים" })}
                    </p>
                  </div>
                ) : (
                  dayLines.map((line, lineIdx) => (
                    <Card
                      key={line.id}
                      className={cn(
                        "group cursor-pointer border-2 overflow-hidden transition-all duration-300",
                        "hover:border-primary/50 hover:shadow-xl hover:scale-[1.03]",
                        "bg-gradient-to-br from-card via-card to-card/95",
                        "border-border/50"
                      )}
                      style={{
                        animationDelay: `${dayIdx * 50 + lineIdx * 30}ms`
                      }}
                      onClick={() => onLineClick(line.id)}
                    >
                      {/* Decorative gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/10 transition-all duration-500 pointer-events-none" />

                      <CardContent className="p-4 space-y-3 relative z-10">
                        {/* Line Color & Name */}
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full flex-shrink-0 shadow-md ring-2 ring-background"
                            style={{ backgroundColor: line.color }}
                          />
                          <span className="font-bold text-sm truncate text-foreground">
                            {line.name}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                            <Clock className="h-3 w-3" />
                            <span>
                              {line.startTime} - {line.endTime}
                            </span>
                          </div>
                        </div>

                        {/* Frequency Badge */}
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium border-primary/20 bg-primary/5 text-primary"
                          >
                            {line.frequency === "weekly"
                              ? t("lines.weekly", { defaultValue: "שבועי" })
                              : line.frequency === "monthly"
                                ? t("lines.monthly", { defaultValue: "חודשי" })
                                : line.frequency === "oneTime"
                                  ? t("lines.oneTime", { defaultValue: "פעם אחת" })
                                  : t("lines.variable", { defaultValue: "משתנה" })}
                          </Badge>
                        </div>

                        {/* Quick Actions - Click anywhere on card opens drawer */}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
