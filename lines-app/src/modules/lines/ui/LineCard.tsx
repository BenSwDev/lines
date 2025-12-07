"use client";

import { memo } from "react";
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
import { useTranslations } from "@/core/i18n/provider";
import type { Line } from "@prisma/client";

type LineCardProps = {
  line: Line & { occurrences?: { id: string }[] };
  onEdit: () => void;
  onViewEvents: () => void;
  onViewLine: () => void;
  "data-tour"?: string;
};

const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const FREQUENCY_HEBREW = {
  weekly: "שבועי",
  monthly: "חודשי",
  variable: "משתנה",
  oneTime: "חד פעמי"
};

export const LineCard = memo(function LineCard({
  line,
  onEdit,
  onViewEvents,
  onViewLine,
  "data-tour": dataTour
}: LineCardProps) {
  const { t } = useTranslations();
  const daysText = line.days.map((d) => DAYS_HEBREW[d]).join(", ");
  const frequencyText =
    FREQUENCY_HEBREW[line.frequency as keyof typeof FREQUENCY_HEBREW] || line.frequency;
  const eventCount = line.occurrences?.length || 0;

  // Check if happening now (simplified - would need full occurrence data)
  const isHappeningNow = false; // TODO: Implement with real occurrence time check

  return (
    <Card
      className="group relative overflow-hidden border-0 bg-gradient-to-br from-background via-background to-background shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        borderRight: `4px solid ${line.color}`,
        boxShadow: `0 4px 6px -1px ${line.color}20, 0 2px 4px -2px ${line.color}10`
      }}
      data-tour={dataTour}
    >
      {/* Animated color gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${line.color}08 0%, ${line.color}03 50%, transparent 100%)`
        }}
      />

      {/* Decorative glow from color */}
      <div
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-30 transition-all duration-500 group-hover:opacity-50 group-hover:scale-150"
        style={{ backgroundColor: line.color }}
      />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Color indicator circle */}
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                style={{ backgroundColor: line.color }}
              />
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                style={{ backgroundColor: line.color }}
              >
                <div className="h-6 w-6 rounded-full bg-background/20 backdrop-blur-sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="text-xl font-bold leading-tight tracking-tight truncate"
                style={{ color: line.color }}
              >
                {line.name}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("lines.updated")} {formatDate(line.updatedAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg opacity-60 transition-all hover:opacity-100 hover:bg-primary/10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit className="ml-2 h-4 w-4" />
                {t("lines.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewLine} className="cursor-pointer">
                <Eye className="ml-2 h-4 w-4" />
                {t("lines.viewLinePage")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4 pt-0">
        {/* Schedule info with icons */}
        <div className="space-y-3 rounded-lg bg-muted/30 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">{t("lines.days")}:</span>
              <span className="mr-2 font-medium">{daysText}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <span className="font-medium">
                {line.startTime} - {line.endTime}
                {line.endTime <= line.startTime && (
                  <span className="mr-1 text-xs text-muted-foreground">(+1)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Badges with better styling */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm">
            {frequencyText}
          </Badge>
          {isHappeningNow && (
            <Badge className="animate-pulse bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md border-0">
              {t("lines.happeningNow")}
            </Badge>
          )}
        </div>

        {/* Event summary with gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 backdrop-blur-sm border border-primary/10">
          <div className="relative z-10">
            <p className="text-sm font-bold text-foreground">
              {eventCount} {eventCount === 1 ? t("lines.event") : t("lines.events")}
            </p>
          </div>
          <div className="absolute inset-0 opacity-5" style={{ backgroundColor: line.color }} />
        </div>
      </CardContent>

      <CardFooter className="relative z-10 gap-2 pt-4">
        <Button
          variant="default"
          className="flex-1 bg-gradient-to-r from-primary to-primary/90 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
          onClick={onViewLine}
        >
          {t("lines.linePage")}
        </Button>
        <Button
          variant="outline"
          className="border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
          onClick={onViewEvents}
          disabled={eventCount === 0}
        >
          {t("lines.viewEvents")}
        </Button>
      </CardFooter>
    </Card>
  );
});
