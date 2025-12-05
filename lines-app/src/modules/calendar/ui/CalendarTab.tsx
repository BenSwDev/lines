"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { getCalendarData } from "../actions/getCalendarData";
import { useToast } from "@/hooks/use-toast";

type CalendarView = "day" | "week" | "month" | "list";

export function CalendarTab() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const venueId = params.venueId as string;
  const [view, setView] = useState<CalendarView>(
    (searchParams.get("view") as CalendarView) || "month",
  );
  const [currentDate, setCurrentDate] = useState(
    searchParams.get("date") || new Date().toISOString().split("T")[0],
  );
  const [compressed, setCompressed] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCalendar = async () => {
    setIsLoading(true);
    const result = await getCalendarData(venueId);

    if (result.success) {
      setData(result.data);
    } else {
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת הלוח",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const changeView = (newView: CalendarView) => {
    setView(newView);
    router.push(`/venues/${venueId}/calendar?view=${newView}&date=${currentDate}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">טוען לוח שנה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">לוח שנה</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const prev = new Date(currentDate);
                prev.setDate(prev.getDate() - 1);
                setCurrentDate(prev.toISOString().split("T")[0]);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="min-w-[150px] text-center font-medium">
              {new Date(currentDate).toLocaleDateString("he-IL", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const next = new Date(currentDate);
                next.setDate(next.getDate() + 1);
                setCurrentDate(next.toISOString().split("T")[0]);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date().toISOString().split("T")[0])}
            >
              היום
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCompressed(!compressed)}
            title={compressed ? "הרחב שעות" : "כווץ שעות ריקות"}
          >
            {compressed ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>

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

      {/* Calendar placeholder (will build simple version) */}
      <Card className="min-h-[600px] p-6">
        <div className="text-center text-muted-foreground">
          <CalendarIcon className="mx-auto h-16 w-16 mb-4" />
          <p className="text-lg font-medium">תצוגת {view === "month" ? "חודש" : view === "week" ? "שבוע" : view === "day" ? "יום" : "רשימה"}</p>
          <p className="text-sm mt-2">Calendar component יתווסף בשלב הבא</p>
          {compressed && <Badge className="mt-4">שעות מכווצות</Badge>}
        </div>
      </Card>

      {/* Legend */}
      <div>
        <h3 className="mb-3 text-sm font-medium">מקרא:</h3>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {(data as { lines?: { id: string; name: string; color: string }[] })?.lines?.map((line) => (
              <div
                key={line.id}
                className="flex shrink-0 items-center gap-2 rounded-lg border bg-card px-3 py-2"
              >
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: line.color }}
                />
                <span className="text-sm">{line.name}</span>
              </div>
            )) || (
              <p className="text-sm text-muted-foreground">אין ליינים להצגה</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
