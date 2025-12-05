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
    <div className="space-y-3">
      {/* Header - Hebrew weekdays with beautiful styling */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        {weekdayLabels.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-muted-foreground/70 uppercase tracking-wider py-2 rounded-lg bg-gradient-to-b from-muted/30 to-transparent"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 gap-3">
          {week.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            const today = isTodayDate(day);
            const isOtherMonth = day === null;

            return (
              <Card
                key={dayIdx}
                className={cn(
                  "group relative min-h-[140px] p-3 transition-all duration-300 overflow-hidden",
                  "border-2 hover:border-primary/30 hover:shadow-lg hover:scale-[1.02]",
                  isOtherMonth && "bg-muted/10 opacity-40 border-muted/30",
                  today &&
                    !isOtherMonth &&
                    "border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md ring-2 ring-primary/20",
                  !today &&
                    !isOtherMonth &&
                    "bg-gradient-to-br from-background to-muted/20 border-border/50",
                  day && dayEvents.length > 0 && "cursor-pointer hover:shadow-xl"
                )}
              >
                {/* Decorative corner accent for today */}
                {today && !isOtherMonth && (
                  <div className="absolute top-0 left-0 h-12 w-12 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full" />
                )}

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-lg" />

                {day && (
                  <>
                    <div className="relative z-10 flex items-center justify-between mb-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all duration-300",
                          today
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg scale-110"
                            : "bg-muted/50 text-foreground group-hover:bg-primary/10 group-hover:scale-110"
                        )}
                      >
                        {day}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="flex -space-x-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className="h-2 w-2 rounded-full border-2 border-background shadow-sm"
                              style={{ backgroundColor: event.color }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 border-2 border-background" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 space-y-1.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className="group/event relative cursor-pointer rounded-lg px-2.5 py-2 text-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md backdrop-blur-sm border border-transparent hover:border-border/50"
                          style={{
                            background: `linear-gradient(135deg, ${event.color}25 0%, ${event.color}15 50%, ${event.color}08 100%)`,
                            borderLeft: `3px solid ${event.color}`
                          }}
                        >
                          {/* Event glow on hover */}
                          <div
                            className="absolute inset-0 rounded-lg opacity-0 group-hover/event:opacity-100 transition-opacity duration-200 blur-sm"
                            style={{ backgroundColor: event.color }}
                          />

                          <div className="relative z-10 flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full shadow-sm flex-shrink-0"
                              style={{ backgroundColor: event.color }}
                            />
                            <span className="font-semibold text-foreground flex-1 truncate">
                              {event.startTime}
                            </span>
                            {event.isOvernight && (
                              <span className="text-[10px] text-muted-foreground bg-muted/50 px-1 rounded">
                                +1
                              </span>
                            )}
                          </div>
                          {event.title && (
                            <div className="relative z-10 mt-1 truncate text-[10px] font-medium text-muted-foreground">
                              {event.title}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="pt-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                          +{dayEvents.length - 3} עוד אירועים
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
    <div className="overflow-x-auto rounded-xl border-2 border-border/50 shadow-lg bg-gradient-to-br from-background to-muted/10">
      <div className="grid min-w-[800px] grid-cols-8 gap-0.5 bg-gradient-to-br from-muted/20 to-muted/10 p-0.5">
        {/* Header */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 p-3 font-bold text-sm text-muted-foreground/70 uppercase tracking-wider" />
        {days.map((d) => {
          const dayDateStr = toISODate(d);
          const isTodayDate = isToday(d);
          return (
            <div
              key={dayDateStr}
              className={cn(
                "relative p-3 text-center text-sm transition-all duration-300",
                isTodayDate
                  ? "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 font-bold shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 backdrop-blur-sm hover:bg-card"
              )}
            >
              {isTodayDate && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              )}
              <div
                className={cn("relative z-10 font-semibold mb-1", isTodayDate && "text-primary")}
              >
                {d.toLocaleDateString("he-IL", { weekday: "short" })}
              </div>
              <div
                className={cn(
                  "relative z-10 text-lg font-bold",
                  isTodayDate ? "text-primary" : "text-muted-foreground"
                )}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}

        {/* Hours rows */}
        {hours.map((hour) => (
          <div key={hour} className="col-span-8 grid grid-cols-8 gap-0.5">
            <div className="bg-gradient-to-br from-muted/20 to-muted/10 p-3 text-xs font-bold text-muted-foreground/70 border-r border-border/30">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((d) => {
              const dayDateStr = toISODate(d);
              const hourEvents = getEventsForDayHour(d, hour);
              const isTodayDate = isToday(d);
              return (
                <div
                  key={`${dayDateStr}-${hour}`}
                  className={cn(
                    "group relative min-h-[60px] p-1.5 border-r border-border/30 last:border-r-0 transition-all duration-200 hover:bg-card/80 backdrop-blur-sm",
                    isTodayDate && "bg-gradient-to-br from-primary/10 to-primary/5"
                  )}
                >
                  {isTodayDate && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
                  )}
                  <div className="relative z-10 space-y-1">
                    {hourEvents.map((event) => {
                      const [startH] = event.startTime.split(":").map(Number);
                      const isEventStart = startH === hour;

                      return (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className={cn(
                            "group/event relative cursor-pointer rounded-lg px-2.5 py-1.5 text-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/20",
                            !isEventStart && "opacity-70"
                          )}
                          style={{
                            background: `linear-gradient(135deg, ${event.color}25 0%, ${event.color}15 50%, ${event.color}08 100%)`,
                            borderLeft: `3px solid ${event.color}`
                          }}
                        >
                          {/* Event glow on hover */}
                          <div
                            className="absolute inset-0 rounded-lg opacity-0 group-hover/event:opacity-100 transition-opacity duration-200 blur-sm"
                            style={{ backgroundColor: event.color }}
                          />

                          {isEventStart && (
                            <div className="relative z-10 font-semibold truncate text-foreground">
                              {event.title || `${event.startTime}-${event.endTime}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
              "group relative overflow-hidden border-2 transition-all duration-300",
              "bg-gradient-to-br from-background to-muted/10",
              hourEvents.length > 0
                ? "hover:border-primary/50 hover:shadow-xl hover:scale-[1.01]"
                : "border-border/30 hover:border-border/50"
            )}
          >
            {/* Decorative gradient overlay */}
            {hourEvents.length > 0 && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            <div className="relative z-10 flex gap-4 p-5">
              <div className="relative w-20 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg" />
                <div className="relative text-center py-2">
                  <div className="text-lg font-bold text-primary">
                    {String(hour).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">:00</div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {hourEvents.length === 0 ? (
                  <div className="text-sm text-muted-foreground/50 italic py-2">—</div>
                ) : (
                  hourEvents.map((event) => {
                    const overnight = isOvernightShift(event.startTime, event.endTime);
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="group/event relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm border-transparent hover:border-white/20 overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${event.color}20 0%, ${event.color}10 50%, ${event.color}05 100%)`,
                          borderRightColor: event.color,
                          borderRightWidth: 4
                        }}
                      >
                        {/* Event glow on hover */}
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover/event:opacity-100 transition-opacity duration-300 blur-xl"
                          style={{ backgroundColor: event.color }}
                        />

                        <div className="relative z-10 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="relative">
                                <div
                                  className="absolute inset-0 rounded-full blur-md opacity-50"
                                  style={{ backgroundColor: event.color }}
                                />
                                <div
                                  className="relative h-4 w-4 rounded-full shrink-0 shadow-lg"
                                  style={{ backgroundColor: event.color }}
                                />
                              </div>
                              <h3 className="font-bold text-xl text-foreground">
                                {event.title || "אירוע"}
                              </h3>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1.5 mr-7">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">זמן:</span>
                                <span className="font-medium">
                                  {event.startTime} - {event.endTime}
                                </span>
                                {overnight && (
                                  <Badge className="bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground border-0 shadow-sm text-xs">
                                    משמרת לילה (+1)
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {!event.isActive && (
                              <Badge variant="secondary" className="shadow-sm">
                                בוטל
                              </Badge>
                            )}
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
