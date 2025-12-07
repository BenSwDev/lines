"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowRight, Calendar, Edit, ArrowLeft } from "lucide-react";
import type { Line, LineOccurrence } from "@prisma/client";
import { LineReservationSettings } from "./LineReservationSettings";

type LineDetailPageProps = {
  line: Line;
  occurrences: LineOccurrence[];
  venueId: string;
};

export function LineDetailPage({ line, occurrences, venueId }: LineDetailPageProps) {
  const router = useRouter();

  const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const daysText = line.days.map((d) => DAYS_HEBREW[d]).join(", ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/venues/${venueId}/lines`)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {line.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {daysText} • {line.startTime}-{line.endTime}
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/venues/${venueId}/lines?edit=${line.id}`)}
          className="bg-gradient-to-r from-primary to-primary/90 shadow-md hover:shadow-lg"
        >
          <Edit className="ml-2 h-4 w-4" />
          עריכה
        </Button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
          {/* Decorative glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl" />

          <CardHeader className="relative z-10 pb-2">
            <p className="text-sm font-medium text-muted-foreground">אירועים</p>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-3xl font-bold text-foreground">{occurrences.length}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
          {/* Decorative glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl" />

          <CardHeader className="relative z-10 pb-2">
            <p className="text-sm font-medium text-muted-foreground">תדירות</p>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-xl font-bold text-foreground">{line.frequency}</p>
          </CardContent>
        </Card>
      </div>

      {/* Occurrences List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">אירועים</h2>
        {occurrences.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="אין אירועים עדיין"
            description="האירועים יופיעו כאן לאחר יצירתם או לאחר שהם מתוכננים על פי לוח הזמנים של הליין"
          />
        ) : (
          <div className="space-y-2">
            {occurrences.map((occurrence) => (
              <Card
                key={occurrence.id}
                className="group relative cursor-pointer overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 transition-all duration-300 hover:scale-[1.01] hover:border-primary/50 hover:shadow-xl"
                onClick={() => router.push(`/venues/${venueId}/events/${line.id}/${occurrence.id}`)}
              >
                {/* Decorative glow on hover */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardContent className="relative z-10 flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded-lg border-2 border-border/50 shadow-md"
                      style={{ backgroundColor: line.color }}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {occurrence.title || occurrence.date}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {occurrence.date} • {occurrence.startTime}-{occurrence.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {occurrence.isActive ? (
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-sm">
                        פעיל
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shadow-sm">
                        בוטל
                      </Badge>
                    )}
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Line Reservation Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">הגדרות הזמנות</h2>
        <LineReservationSettings lineId={line.id} venueId={venueId} />
      </div>
    </div>
  );
}
