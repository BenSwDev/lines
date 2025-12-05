"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { toISODate, getStartOfWeek, isToday } from "@/utils/date";
import { isOvernightShift } from "@/core/validation";
import { Calendar as CalendarIcon } from "lucide-react";

type CalendarEvent = {
  id: string;
  lineId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  isActive: boolean;
  isOvernight?: boolean;
};

type CalendarGridProps = {
  view: "day" | "week" | "month";
  currentDate: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  compressed?: boolean;
};

export function CalendarGrid({
  view,
  currentDate,
  events,
  onEventClick,
  compressed = false
}: CalendarGridProps) {
  const date = new Date(currentDate + "T00:00:00");

  if (view === "month") {
    return <MonthView date={date} events={events} onEventClick={onEventClick} />;
  }

  if (view === "week") {
    return (
      <WeekView date={date} events={events} onEventClick={onEventClick} compressed={compressed} />
    );
  }

  return (
    <DayView date={date} events={events} onEventClick={onEventClick} compressed={compressed} />
  );
}

function MonthView({
  date,
  events,
  onEventClick
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get the first day of the month's weekday (0 = Sunday, 6 = Saturday)
  // For Hebrew calendar, week starts on Saturday (6) at position 0 (rightmost in RTL)
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate padding for Hebrew calendar (Saturday = position 0)
  // Hebrew week order (RTL): ש(6), ו(5), ה(4), ד(3), ג(2), ב(1), א(0)
  // If first day is Saturday (6), it should be at position 0 -> padding = 0
  // If first day is Sunday (0), it should be at position 6 -> padding = 6
  // If first day is Monday (1), it should be at position 5 -> padding = 5
  // Formula: padding = (7 - (firstDayOfWeek - 6 + 7) % 7) % 7
  // Simplified: padding = firstDayOfWeek === 6 ? 0 : (6 - firstDayOfWeek + 7) % 7
  const paddingDays = firstDayOfWeek === 6 ? 0 : (6 - firstDayOfWeek + 7) % 7;

  const days: (number | null)[] = [];
  const weeks: (number | null)[][] = [];

  // Previous month padding (for Hebrew calendar - Saturday first)
  for (let i = 0; i < paddingDays; i++) {
    days.push(null);
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Group into weeks (7 days per week)
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Ensure we have complete weeks (fill last week if needed)
  if (weeks.length > 0) {
    const lastWeek = weeks[weeks.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push(null);
    }
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = toISODate(new Date(date.getFullYear(), date.getMonth(), day));
    return events.filter((e) => e.date === dateStr);
  };

  const isTodayDate = (day: number | null) => {
    if (!day) return false;
    const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
    return isToday(dayDate);
  };

  // Hebrew weekday labels (Saturday to Friday, RTL order)
  const weekdayLabels = ["ש", "ו", "ה", "ד", "ג", "ב", "א"];

  return (
    <div className="space-y-2">
      {/* Header - Hebrew weekdays in RTL order */}
      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 gap-2">
          {week.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            const today = isTodayDate(day);
            const isOtherMonth = day === null;

            return (
              <Card
                key={dayIdx}
                className={cn(
                  "min-h-[120px] p-2 transition-all",
                  isOtherMonth && "bg-muted/20 opacity-50",
                  today && !isOtherMonth && "border-2 border-primary bg-primary/5",
                  day &&
                    dayEvents.length > 0 &&
                    "hover:border-primary/50 hover:shadow-sm cursor-pointer"
                )}
              >
                {day && (
                  <>
                    <div
                      className={cn(
                        "mb-2 text-sm font-semibold",
                        today && "text-primary font-bold"
                      )}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className="group cursor-pointer rounded px-2 py-1 text-xs transition-all hover:opacity-90 hover:shadow-sm"
                          style={{
                            backgroundColor: `${event.color}20`,
                            borderRight: `3px solid ${event.color}`
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: event.color }}
                            />
                            <span className="font-medium truncate">{event.startTime}</span>
                            {event.isOvernight && (
                              <span className="text-[10px] text-muted-foreground">(+1)</span>
                            )}
                          </div>
                          {event.title && (
                            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                              {event.title}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground font-medium pt-1">
                          +{dayEvents.length - 3} עוד
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function WeekView({
  date,
  events,
  onEventClick,
  compressed
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  compressed: boolean;
}) {
  const startOfWeek = getStartOfWeek(date);

  // Generate 7 days starting from Saturday (Hebrew week start)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Calculate hour bounds based on events if compressed
  const hourBounds = useMemo(() => {
    if (!compressed || events.length === 0) {
      return { minHour: 0, maxHour: 24 };
    }

    const hours = events.flatMap((e) => {
      const [startH] = e.startTime.split(":").map(Number);
      const [endH, endM] = e.endTime.split(":").map(Number);
      const endHour = e.endTime === "24:00" ? 24 : endM > 0 ? endH + 1 : endH;
      return [startH, endHour];
    });

    const minHour = Math.max(0, Math.min(...hours) - 1);
    const maxHour = Math.min(24, Math.max(...hours) + 1);

    return { minHour, maxHour };
  }, [compressed, events]);

  const hours = useMemo(() => {
    if (compressed) {
      const range = hourBounds.maxHour - hourBounds.minHour;
      return Array.from({ length: range + 1 }, (_, i) => hourBounds.minHour + i);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  }, [compressed, hourBounds]);

  // Get events for a specific day and hour
  const getEventsForDayHour = (dayDate: Date, hour: number) => {
    const dateStr = toISODate(dayDate);
    return events.filter((e) => {
      if (e.date !== dateStr) return false;

      const [eventStartH] = e.startTime.split(":").map(Number);

      // Check if event starts at this hour or spans this hour
      if (eventStartH === hour) return true;

      // Check if event is overnight and spans this hour
      if (e.isOvernight) {
        const [eventEndH] = e.endTime.split(":").map(Number);
        if (eventEndH === 24 || eventEndH === 0) {
          // Overnight event - check if it spans to next day
          if (hour >= eventStartH || hour < (eventEndH === 24 ? 24 : eventEndH)) {
            return true;
          }
        }
      }

      return false;
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="grid min-w-[800px] grid-cols-8 gap-px bg-border">
        {/* Header */}
        <div className="bg-card p-2 font-medium text-sm" />
        {days.map((d) => {
          const dayDateStr = toISODate(d);
          const isTodayDate = isToday(d);
          return (
            <div
              key={dayDateStr}
              className={cn(
                "bg-card p-2 text-center text-sm",
                isTodayDate && "bg-primary/10 font-bold"
              )}
            >
              <div className="font-semibold">
                {d.toLocaleDateString("he-IL", { weekday: "short" })}
              </div>
              <div className={cn("text-muted-foreground", isTodayDate && "text-primary font-bold")}>
                {d.getDate()}
              </div>
            </div>
          );
        })}

        {/* Hours rows */}
        {hours.map((hour) => (
          <div key={hour} className="col-span-8 grid grid-cols-8 gap-px">
            <div className="bg-card p-2 text-xs text-muted-foreground font-medium border-r">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((d) => {
              const dayDateStr = toISODate(d);
              const hourEvents = getEventsForDayHour(d, hour);
              return (
                <div
                  key={`${dayDateStr}-${hour}`}
                  className="bg-card p-1 min-h-[60px] border-r last:border-r-0"
                >
                  {hourEvents.map((event) => {
                    const [startH] = event.startTime.split(":").map(Number);
                    const isEventStart = startH === hour;

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={cn(
                          "cursor-pointer rounded px-2 py-1 text-xs transition-all hover:opacity-90 hover:shadow-sm mb-1",
                          !isEventStart && "opacity-70"
                        )}
                        style={{
                          backgroundColor: `${event.color}40`,
                          borderRight: `3px solid ${event.color}`
                        }}
                      >
                        {isEventStart && (
                          <div className="font-medium truncate">
                            {event.title || `${event.startTime}-${event.endTime}`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({
  date,
  events,
  onEventClick,
  compressed
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  compressed: boolean;
}) {
  const dateStr = toISODate(date);
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => {
      const [aH, aM] = a.startTime.split(":").map(Number);
      const [bH, bM] = b.startTime.split(":").map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });

  // Calculate hour bounds if compressed
  const hourBounds = useMemo(() => {
    if (!compressed || dayEvents.length === 0) {
      return { minHour: 0, maxHour: 24 };
    }

    const hours = dayEvents.flatMap((e) => {
      const [startH] = e.startTime.split(":").map(Number);
      const [endH, endM] = e.endTime.split(":").map(Number);
      const endHour = e.endTime === "24:00" ? 24 : endM > 0 ? endH + 1 : endH;
      return [startH, endHour];
    });

    const minHour = Math.max(0, Math.min(...hours) - 1);
    const maxHour = Math.min(24, Math.max(...hours) + 1);

    return { minHour, maxHour };
  }, [compressed, dayEvents]);

  const hours = useMemo(() => {
    if (compressed) {
      const range = hourBounds.maxHour - hourBounds.minHour;
      return Array.from({ length: range + 1 }, (_, i) => hourBounds.minHour + i);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  }, [compressed, hourBounds]);

  const isTodayDate = isToday(date);

  if (dayEvents.length === 0) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="אין אירועים ביום הזה"
        description={
          isTodayDate
            ? "אין אירועים מתוכננים להיום"
            : `אין אירועים בתאריך ${date.toLocaleDateString("he-IL", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}`
        }
        className="min-h-[400px]"
      />
    );
  }

  return (
    <div className="space-y-2">
      {hours.map((hour) => {
        const hourEvents = dayEvents.filter((e) => {
          const [eventHour] = e.startTime.split(":").map(Number);
          return eventHour === hour;
        });

        if (hourEvents.length === 0 && compressed) {
          return null;
        }

        return (
          <Card
            key={hour}
            className={cn(
              "transition-all hover:shadow-sm",
              hourEvents.length > 0 && "hover:border-primary/50"
            )}
          >
            <div className="flex gap-4 p-4">
              <div className="w-16 shrink-0 text-right text-sm font-semibold text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </div>
              <div className="flex-1 space-y-3">
                {hourEvents.length === 0 ? (
                  <div className="text-sm text-muted-foreground">—</div>
                ) : (
                  hourEvents.map((event) => {
                    const overnight = isOvernightShift(event.startTime, event.endTime);
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="group cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50 hover:shadow-md"
                        style={{
                          borderRightColor: event.color,
                          borderRightWidth: 4
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: event.color }}
                              />
                              <h3 className="font-bold text-lg">{event.title || "אירוע"}</h3>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>
                                <span className="font-medium">זמן:</span> {event.startTime} -{" "}
                                {event.endTime}
                                {overnight && (
                                  <Badge variant="outline" className="mr-2 text-xs">
                                    משמרת לילה (+1)
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {!event.isActive && <Badge variant="secondary">בוטל</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
