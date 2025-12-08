"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Search, Clock } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { Line } from "@prisma/client";

type LinesSidebarProps = {
  lines: Line[];
  selectedLineId: string | null;
  onLineSelect: (lineId: string | null) => void;
  onCreateLine: () => void;
};

export function LinesSidebar({
  lines,
  selectedLineId,
  onLineSelect,
  onCreateLine
}: LinesSidebarProps) {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLines = lines.filter((line) =>
    line.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 border-l bg-background overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div>
          <h3 className="font-semibold text-lg">
            {t("lines.title", { defaultValue: "ליינים" })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lines.length} {lines.length === 1 ? "ליין" : "ליינים"}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("lines.searchLines", { defaultValue: "חפש ליינים..." })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 h-9"
          />
        </div>

        {/* Create Button */}
        <Button onClick={onCreateLine} className="w-full" size="sm">
          <Plus className="ml-2 h-4 w-4" />
          {t("lines.createLine", { defaultValue: "צור ליין חדש" })}
        </Button>
      </div>

      {/* Lines List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLines.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {searchQuery
              ? t("lines.noLinesFound", { defaultValue: "לא נמצאו ליינים" })
              : t("lines.noLinesYet", { defaultValue: "אין ליינים עדיין" })}
          </div>
        ) : (
          filteredLines.map((line) => {
            const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
            const daysText = line.days.map((d) => DAYS_HEBREW[d]).join(", ");

            return (
              <button
                key={line.id}
                onClick={() => onLineSelect(line.id)}
                className={cn(
                  "w-full text-right p-3 rounded-lg transition-colors",
                  "hover:bg-muted",
                  selectedLineId === line.id && "bg-muted ring-2 ring-primary"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="font-medium text-sm truncate">{line.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{daysText}</span>
                  <span>•</span>
                  <span>
                    {line.startTime} - {line.endTime}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

