"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Calendar, Clock, MoreVertical, Edit, Eye } from "lucide-react";
import { formatDate } from "@/utils/date";
import type { Line } from "@prisma/client";

type LineCardProps = {
  line: Line & { occurrences?: { id: string }[] };
  onEdit: () => void;
  onViewEvents: () => void;
  onViewLine: () => void;
};

const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const FREQUENCY_HEBREW = {
  weekly: "שבועי",
  monthly: "חודשי",
  variable: "משתנה",
  oneTime: "חד פעמי"
};

export function LineCard({ line, onEdit, onViewEvents, onViewLine }: LineCardProps) {
  const daysText = line.days.map((d) => DAYS_HEBREW[d]).join(", ");
  const frequencyText =
    FREQUENCY_HEBREW[line.frequency as keyof typeof FREQUENCY_HEBREW] || line.frequency;
  const eventCount = line.occurrences?.length || 0;

  // Check if happening now (simplified - would need full occurrence data)
  const isHappeningNow = false; // TODO: Implement with real occurrence time check

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10">
      {/* Color bar */}
      <div className="absolute right-0 top-0 h-full w-1" style={{ backgroundColor: line.color }} />

      <CardHeader className="relative pr-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Color chip */}
            <div
              className="h-10 w-10 rounded-lg border-2 border-border"
              style={{ backgroundColor: line.color }}
            />
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight">{line.name}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                עודכן {formatDate(line.updatedAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="ml-2 h-4 w-4" />
                עריכה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewLine}>
                <Eye className="ml-2 h-4 w-4" />
                עמוד הליין
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Schedule info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>ימים: {daysText}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {line.startTime} - {line.endTime}
              {line.endTime <= line.startTime && " (+1)"}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {frequencyText}
          </Badge>
          <Badge variant="outline" className="text-xs">
            צבע: {line.color}
          </Badge>
          {isHappeningNow && (
            <Badge className="animate-pulse bg-green-500 text-xs">מתקיים כעת</Badge>
          )}
        </div>

        {/* Event summary */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs">
          <p className="font-medium">
            {eventCount} {eventCount === 1 ? "אירוע" : "אירועים"}
          </p>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="default" className="flex-1" onClick={onViewLine}>
          עמוד הליין
        </Button>
        <Button variant="outline" onClick={onViewEvents} disabled={eventCount === 0}>
          צפה באירועים
        </Button>
      </CardFooter>
    </Card>
  );
}
