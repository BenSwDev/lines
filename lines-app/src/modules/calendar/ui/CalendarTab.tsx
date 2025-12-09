"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/core/i18n/provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  Calendar as CalendarIcon
} from "lucide-react";
import { getCalendarData } from "../actions/getCalendarData";
import { useToast } from "@/hooks/use-toast";
import { translateError } from "@/utils/translateError";
import { CalendarGrid } from "./CalendarGrid";
import {
  toISODate,
  getTodayISODate,
  addDays,
  addWeeks,
  addMonths,
  getStartOfWeek
} from "@/utils/date";
import type { LineOccurrence, Line } from "@prisma/client";

type CalendarView = "day" | "week" | "month" | "list";

type CalendarData = {
  occurrences: (LineOccurrence & {
    line: Line;
    isOvernight?: boolean;
  })[];
  lines: { id: string; name: string; color: string }[];
};

export function CalendarTab() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslations();

  const venueId = params.venueId as string;
  const [view, setView] = useState<CalendarView>(
    (searchParams.get("view") as CalendarView) || "month"
  );
  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) return dateParam;
    return getTodayISODate();
  });
  const [compressed, setCompressed] = useState(false);
  const [data, setData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCalendar = async () => {
    setIsLoading(true);
    try {
      const result = await getCalendarData(venueId);

      if (result.success && result.data) {
        setData(result.data as CalendarData);
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        toast({
          title: t("errors.generic"),
          description: errorMsg ? translateError(errorMsg, t) : t("errors.loadingCalendar"),
          variant: "destructive"
        });
        setData(null);
      }
    } catch {
      toast({
        title: t("errors.generic"),
        description: t("errors.unexpected"),
        variant: "destructive"
      });
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  useEffect(() => {
    // Update URL when view or date changes
    router.replace(`/venues/${venueId}/calendar?view=${view}&date=${currentDate}`, {
      scroll: false
    });
  }, [view, currentDate, venueId, router]);

  const changeView = (newView: CalendarView) => {
    setView(newView);
  };

  // Navigation handlers based on view
  const navigateBackward = () => {
    const date = new Date(currentDate + "T00:00:00");
    let newDate: Date;

    if (view === "month") {
      newDate = addMonths(date, -1);
    } else if (view === "week") {
      newDate = addWeeks(date, -1);
    } else {
      newDate = addDays(date, -1);
    }

    setCurrentDate(toISODate(newDate));
  };

  const navigateForward = () => {
    const date = new Date(currentDate + "T00:00:00");
    let newDate: Date;

    if (view === "month") {
      newDate = addMonths(date, 1);
    } else if (view === "week") {
      newDate = addWeeks(date, 1);
    } else {
      newDate = addDays(date, 1);
    }

    setCurrentDate(toISODate(newDate));
  };

  const goToToday = () => {
    setCurrentDate(getTodayISODate());
  };

  // Format date display based on view
  const dateDisplay = useMemo(() => {
    const date = new Date(currentDate + "T00:00:00");

    if (view === "month") {
      return date.toLocaleDateString("he-IL", {
        month: "long",
        year: "numeric"
      });
    } else if (view === "week") {
      const weekStart = getStartOfWeek(date);
      const weekEnd = addDays(weekStart, 6);
      return `${weekStart.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "long"
      })} - ${weekEnd.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}`;
    } else {
      return date.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }, [currentDate, view]);

  // Map events for calendar grid
  const calendarEvents = useMemo(() => {
    if (!data?.occurrences) return [];

    return data.occurrences
      .filter((occ) => occ.isActive !== false)
      .map((occ) => ({
        id: occ.id,
        lineId: occ.lineId,
        title: occ.title || occ.line?.name || "",
        date: occ.date,
        startTime: occ.startTime,
        endTime: occ.endTime,
        color: occ.line?.color || "#3B82F6",
        isActive: occ.isActive ?? true,
        isOvernight: occ.isOvernight ?? false
      }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">לוח שנה</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={navigateBackward}
              className="rtl:order-3 ltr:order-1"
              aria-label="תאריך קודם"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <span className="min-w-[200px] text-center font-medium order-2 text-sm sm:text-base">
              {dateDisplay}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={navigateForward}
              className="rtl:order-1 ltr:order-3"
              aria-label="תאריך הבא"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="text-sm">
              היום
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view !== "month" && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCompressed(!compressed)}
              title={compressed ? "הרחב שעות" : "כווץ שעות ריקות"}
              aria-label={compressed ? "הרחב שעות" : "כווץ שעות ריקות"}
            >
              {compressed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          )}

          <Select value={view} onValueChange={(v) => changeView(v as CalendarView)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">יום</SelectItem>
              <SelectItem value="week">שבוע</SelectItem>
              <SelectItem value="month">חודש</SelectItem>
              <SelectItem value="list">רשימה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Grid */}
      {data && (
        <CalendarGrid
          view={view === "list" ? "month" : view}
          currentDate={currentDate}
          events={calendarEvents}
          onEventClick={(event) => router.push(`/venues/${venueId}/lines/${event.lineId}`)}
          compressed={compressed}
        />
      )}

      {/* Empty State */}
      {!isLoading && (!data || calendarEvents.length === 0) && (
        <EmptyState
          icon={CalendarIcon}
          title="אין אירועים בלוח השנה"
          description="צור ליין חדש כדי להתחיל להוסיף אירועים ללוח השנה שלך"
          action={{
            label: "צור ליין חדש",
            onClick: () => router.push(`/venues/${venueId}/lines`)
          }}
          className="min-h-[400px]"
        />
      )}

      {/* Legend */}
      {data && data.lines && data.lines.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">מקרא:</h3>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {data.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex shrink-0 items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-sm transition-all hover:shadow-md"
                >
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: line.color }}
                    aria-label={`צבע ליין ${line.name}`}
                  />
                  <span className="text-sm font-medium">{line.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
