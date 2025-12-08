"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { Line } from "@prisma/client";

type LinesHeaderProps = {
  lines: Line[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateLine: () => void;
};

export function LinesHeader({
  lines,
  searchQuery,
  onSearchChange,
  onCreateLine
}: LinesHeaderProps) {
  const { t } = useTranslations();
  const filteredCount = lines.filter((line) =>
    line.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).length;

  return (
    <div className="sticky top-0 z-10 w-full border-b bg-gradient-to-b from-background via-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: Title and Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("lines.title", { defaultValue: "ליינים" })}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {filteredCount} {filteredCount === 1 ? "ליין" : "ליינים"}
                  </Badge>
                  {lines.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {t("lines.totalLines", { count: lines.length.toString() }) ||
                        `סה"כ ${lines.length}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Search and Actions */}
          <div className="flex flex-1 items-center gap-3 md:max-w-md md:ml-auto">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("lines.searchLines", { defaultValue: "חפש ליינים..." })}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 pr-9 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={onCreateLine}
              size="lg"
              className="h-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="ml-2 h-4 w-4" />
              {t("lines.createLine", { defaultValue: "צור ליין חדש" })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
