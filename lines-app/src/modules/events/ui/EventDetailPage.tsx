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
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          חזרה {backContext === "calendar" ? "ללוח שנה" : "לליינים"}
        </Button>
        <Badge variant="outline">
          אירוע {currentIndex + 1} מתוך {totalOccurrences}
        </Badge>
      </div>

      {/* Line Context */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg border-2"
              style={{ backgroundColor: line.color }}
            />
            <div>
              <CardTitle>{line.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {line.days.join(", ")} • {line.startTime}-{line.endTime} • {line.frequency}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex gap-2">
              {occurrence.isExpected ? (
                <Badge variant="secondary">מתוכנן</Badge>
              ) : (
                <Badge>ידני</Badge>
              )}
              {occurrence.isActive ? (
                <Badge className="bg-green-600">פעיל</Badge>
              ) : (
                <Badge variant="destructive">בוטל</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{occurrence.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {occurrence.startTime} - {occurrence.endTime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>פרטים</CardTitle>
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
