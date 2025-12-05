"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Phone } from "lucide-react";
import type { Line, LineOccurrence } from "@prisma/client";

type EventDetailPageProps = {
  occurrence: LineOccurrence;
  line: Line;
  venueId: string;
  prevOccurrence?: { id: string; date: string } | null;
  nextOccurrence?: { id: string; date: string } | null;
  totalOccurrences: number;
  currentIndex: number;
};

export function EventDetailPage({
  occurrence,
  line,
  venueId,
  prevOccurrence,
  nextOccurrence,
  totalOccurrences,
  currentIndex
}: EventDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backContext = searchParams.get("back") || "lines";

  const handleBack = () => {
    if (backContext === "calendar") {
      const view = searchParams.get("view") || "month";
      const date = searchParams.get("date") || occurrence.date;
      router.push(`/venues/${venueId}/calendar?view=${view}&date=${date}`);
    } else {
      router.push(`/venues/${venueId}/lines/${line.id}`);
    }
  };

  const handlePrev = () => {
    if (prevOccurrence) {
      router.push(`/venues/${venueId}/events/${line.id}/${prevOccurrence.id}?back=${backContext}`);
    }
  };

  const handleNext = () => {
    if (nextOccurrence) {
      router.push(`/venues/${venueId}/events/${line.id}/${nextOccurrence.id}?back=${backContext}`);
    }
  };

  const title = occurrence.title || `${line.name} - ${occurrence.date}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          חזרה {backContext === "calendar" ? "ללוח שנה" : "לליינים"}
        </Button>
        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-0 shadow-sm">
          אירוע {currentIndex + 1} מתוך {totalOccurrences}
        </Badge>
      </div>

      {/* Line Context */}
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
        {/* Decorative glow */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <CardHeader className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-xl blur-md opacity-50"
                style={{ backgroundColor: line.color }}
              />
              <div
                className="relative h-14 w-14 rounded-xl border-2 border-white/20 shadow-lg"
                style={{ backgroundColor: line.color }}
              />
            </div>
            <div>
              <CardTitle className="text-2xl">{line.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {line.days.join(", ")} • {line.startTime}-{line.endTime} • {line.frequency}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event Summary */}
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
        {/* Decorative glow */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between text-2xl">
            <span className="font-bold">{title}</span>
            <div className="flex gap-2">
              {occurrence.isExpected ? (
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                  מתוכנן
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm">
                  ידני
                </Badge>
              )}
              {occurrence.isActive ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                  פעיל
                </Badge>
              ) : (
                <Badge variant="destructive" className="shadow-sm">
                  בוטל
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="flex items-center gap-6 rounded-lg bg-muted/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">תאריך</p>
                <p className="font-semibold">{occurrence.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">שעות</p>
                <p className="font-semibold">
                  {occurrence.startTime} - {occurrence.endTime}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Section */}
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
        {/* Decorative glow */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <CardHeader className="relative z-10">
          <CardTitle className="text-xl">פרטים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {occurrence.subtitle && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">כותרת משנה</p>
              <p className="mt-1">{occurrence.subtitle}</p>
            </div>
          )}
          {occurrence.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">תיאור</p>
              <p className="mt-1 whitespace-pre-wrap">{occurrence.description}</p>
            </div>
          )}
          {occurrence.location && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">מיקום</p>
                <p className="mt-1">{occurrence.location}</p>
              </div>
            </div>
          )}
          {occurrence.contact && (
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">איש קשר</p>
                <p className="mt-1">{occurrence.contact}</p>
              </div>
            </div>
          )}
          {!occurrence.subtitle &&
            !occurrence.description &&
            !occurrence.location &&
            !occurrence.contact && <p className="text-center text-muted-foreground">—</p>}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={!prevOccurrence}>
          <ChevronRight className="ml-2 h-4 w-4" />
          אירוע קודם
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          {prevOccurrence && nextOccurrence
            ? "ניווט חופשי בין כל האירועים"
            : !prevOccurrence && nextOccurrence
              ? "זהו האירוע הראשון"
              : prevOccurrence && !nextOccurrence
                ? "זהו האירוע האחרון"
                : "זהו האירוע היחיד"}
        </div>
        <Button variant="outline" onClick={handleNext} disabled={!nextOccurrence}>
          אירוע הבא
          <ChevronLeft className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
