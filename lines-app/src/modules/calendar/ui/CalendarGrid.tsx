"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  lineId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  isActive: boolean;
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
  compressed = false,
}: CalendarGridProps) {
  const date = new Date(currentDate);

  if (view === "month") {
    return <MonthView date={date} events={events} onEventClick={onEventClick} />;
  }

  if (view === "week") {
    return (
      <WeekView
        date={date}
        events={events}
        onEventClick={onEventClick}
        compressed={compressed}
      />
    );
  }

  return (
    <DayView
      date={date}
      events={events}
      onEventClick={onEventClick}
      compressed={compressed}
    />
  );
}

function MonthView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const days = [];
  const weeks = [];

  // Previous month padding
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Group into weeks
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-7 gap-2">
        {["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((day) => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 gap-2">
          {week.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            return (
              <Card
                key={dayIdx}
                className={cn(
                  "min-h-[100px] p-2",
                  !day && "bg-muted/30",
                  day && dayEvents.length > 0 && "cursor-pointer hover:border-primary/50",
                )}
              >
                {day && (
                  <>
                    <div className="mb-2 text-sm font-semibold">{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className="cursor-pointer rounded px-1 py-0.5 text-xs hover:opacity-80"
                          style={{ backgroundColor: event.color + "40" }}
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <span className="mr-1">{event.startTime}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
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
  compressed,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  compressed: boolean;
}) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = compressed
    ? Array.from({ length: 12 }, (_, i) => i + 8) // 8:00-20:00
    : Array.from({ length: 24 }, (_, i) => i); // 0:00-23:00

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[800px] grid-cols-8 gap-px bg-border">
        {/* Header */}
        <div className="bg-card p-2" />
        {days.map((d) => (
          <div key={d.toISOString()} className="bg-card p-2 text-center text-sm">
            <div className="font-semibold">
              {d.toLocaleDateString("he-IL", { weekday: "short" })}
            </div>
            <div className="text-muted-foreground">{d.getDate()}</div>
          </div>
        ))}

        {/* Hours rows */}
        {hours.map((hour) => (
          <div key={hour} className="col-span-8 grid grid-cols-8 gap-px">
            <div className="bg-card p-2 text-xs text-muted-foreground">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((d) => {
              const dateStr = d.toISOString().split("T")[0];
              const hourEvents = events.filter(
                (e) =>
                  e.date === dateStr &&
                  parseInt(e.startTime.split(":")[0]) === hour,
              );
              return (
                <div key={d.toISOString()} className="bg-card p-1">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="cursor-pointer rounded px-2 py-1 text-xs hover:opacity-80"
                      style={{ backgroundColor: event.color + "60" }}
                    >
                      {event.title || event.startTime}
                    </div>
                  ))}
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
  compressed,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  compressed: boolean;
}) {
  const dateStr = date.toISOString().split("T")[0];
  const dayEvents = events.filter((e) => e.date === dateStr);

  const hours = compressed
    ? Array.from({ length: 12 }, (_, i) => i + 8)
    : Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-px">
      {hours.map((hour) => {
        const hourEvents = dayEvents.filter(
          (e) => parseInt(e.startTime.split(":")[0]) === hour,
        );
        return (
          <Card key={hour} className="flex items-start gap-4 p-4">
            <div className="w-16 text-sm font-medium">
              {String(hour).padStart(2, "0")}:00
            </div>
            <div className="flex-1 space-y-2">
              {hourEvents.length === 0 ? (
                <div className="text-sm text-muted-foreground">—</div>
              ) : (
                hourEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="cursor-pointer rounded-lg border p-3 transition-all hover:border-primary/50"
                    style={{ borderRightColor: event.color, borderRightWidth: 4 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                      {!event.isActive && (
                        <Badge variant="secondary">בוטל</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

