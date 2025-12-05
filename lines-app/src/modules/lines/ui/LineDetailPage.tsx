"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight, Calendar, Edit, ArrowLeft } from "lucide-react";
import type { Line, LineOccurrence } from "@prisma/client";

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
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg border-2"
              style={{ backgroundColor: line.color }}
            />
            <div>
              <h1 className="text-3xl font-bold">{line.name}</h1>
              <p className="text-sm text-muted-foreground">
                {daysText} • {line.startTime}-{line.endTime}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/venues/${venueId}/lines?edit=${line.id}`)}>
          <Edit className="ml-2 h-4 w-4" />
          עריכה
        </Button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">אירועים</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{occurrences.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">תדירות</p>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{line.frequency}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">צבע</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-sm">{line.color}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occurrences List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">אירועים</h2>
        {occurrences.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">אין אירועים עדיין</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {occurrences.map((occurrence) => (
              <Card
                key={occurrence.id}
                className="cursor-pointer transition-all hover:border-primary/50"
                onClick={() =>
                  router.push(
                    `/venues/${venueId}/events/${line.id}/${occurrence.id}`,
                  )
                }
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {occurrence.title || occurrence.date}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {occurrence.date} • {occurrence.startTime}-
                        {occurrence.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {occurrence.isActive ? (
                      <Badge variant="default">פעיל</Badge>
                    ) : (
                      <Badge variant="secondary">בוטל</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

