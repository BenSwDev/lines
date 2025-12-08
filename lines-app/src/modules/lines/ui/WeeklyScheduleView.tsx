"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { Line } from "@prisma/client";

type WeeklyScheduleViewProps = {
  lines: Line[];
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  onLineClick: (lineId: string) => void;
};

const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const DAYS_ENGLISH = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyScheduleView({
  lines,
  weekStartDay,
  onLineClick
}: WeeklyScheduleViewProps) {
  const { t } = useTranslations();

  // Get week days in correct order based on weekStartDay
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (weekStartDay + i) % 7;
      days.push({
        index: dayIndex,
        hebrew: DAYS_HEBREW[dayIndex],
        english: DAYS_ENGLISH[dayIndex]
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {t("lines.weeklySchedule", { defaultValue: "מערכת שעות שבועית" })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("lines.weeklyScheduleDescription", {
              defaultValue: "צפה בכל הליינים הפעילים לפי ימי השבוע"
            })}
          </p>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayLines = linesByDay[day.index] || [];
          return (
            <Card key={day.index} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold">{day.hebrew}</span>
                    <span className="text-xs text-muted-foreground">{day.english}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {dayLines.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {t("lines.noLinesForDay", { defaultValue: "אין ליינים" })}
                  </div>
                ) : (
                  dayLines.map((line) => (
                    <Card
                      key={line.id}
                      className="cursor-pointer border-2 hover:border-primary/50 transition-colors group"
                      onClick={() => onLineClick(line.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        {/* Line Color & Name */}
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: line.color }}
                          />
                          <span className="font-semibold text-sm truncate">{line.name}</span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {line.startTime} - {line.endTime}
                          </span>
                        </div>

                        {/* Frequency Badge */}
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {line.frequency === "weekly"
                              ? t("lines.weekly", { defaultValue: "שבועי" })
                              : line.frequency === "monthly"
                                ? t("lines.monthly", { defaultValue: "חודשי" })
                                : line.frequency === "oneTime"
                                  ? t("lines.oneTime", { defaultValue: "פעם אחת" })
                                  : t("lines.variable", { defaultValue: "משתנה" })}
                          </Badge>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center justify-between pt-1 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLineClick(line.id);
                            }}
                          >
                            <ArrowRight className="h-3 w-3 ml-1" />
                            {t("common.view", { defaultValue: "צפה" })}
                          </Button>
                        </div>
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

