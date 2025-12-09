"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LinesHeader } from "./LinesHeader";
import { WeeklyScheduleView } from "./WeeklyScheduleView";
import { CreateLineDialog } from "./CreateLineDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { listLines } from "../actions/listLines";
import { getVenueDetails } from "@/modules/venue-info/actions/getVenueDetails";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";
import type { Line } from "@prisma/client";

export function LinesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslations();
  const venueId = params.venueId as string;

  const [lines, setLines] = useState<Line[]>([]);
  const [filteredLines, setFilteredLines] = useState<Line[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [weekStartDay, setWeekStartDay] = useState<0 | 1>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = lines.filter((line) =>
        line.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLines(filtered);
    } else {
      setFilteredLines(lines);
    }
  }, [searchQuery, lines]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [linesResult, venueDetailsResult] = await Promise.all([
        listLines(venueId),
        getVenueDetails(venueId)
      ]);

      if (linesResult.success && "data" in linesResult) {
        const loadedLines = linesResult.data || [];
        setLines(loadedLines);
        setFilteredLines(loadedLines);
      } else {
        const errorMsg = !linesResult.success && "error" in linesResult ? linesResult.error : null;
        toast({
          title: t("errors.generic"),
          description: errorMsg ? translateError(errorMsg, t) : t("errors.loadingLines"),
          variant: "destructive"
        });
      }

      if (venueDetailsResult.success && venueDetailsResult.data) {
        setWeekStartDay((venueDetailsResult.data.weekStartDay as 0 | 1) ?? 0);
      }
    } catch {
      // Error already handled by toast in the if/else blocks above
      // No need to log here as it's a client component
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineSelect = (lineId: string | null) => {
    if (lineId) {
      // Navigate to line detail page
      router.push(`/venues/${venueId}/lines/${lineId}`);
    }
  };

  const handleCreateLine = () => {
    setEditingLine(null);
    setIsCreateOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b bg-background p-6">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <LinesHeader
        lines={lines}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateLine={handleCreateLine}
      />

      {/* Main Content - Full Width - Always show schedule, Sheet overlays it */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-6">
          <WeeklyScheduleView
            lines={filteredLines}
            weekStartDay={weekStartDay}
            onLineClick={handleLineSelect}
          />
        </div>
      </div>

      {/* Create/Edit Sheet - Opens from side, overlays schedule */}
      <CreateLineDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingLine(null);
        }}
        venueId={venueId}
        onSuccess={() => {
          loadData();
          setEditingLine(null);
          setIsCreateOpen(false);
        }}
        existingLine={editingLine}
      />
    </div>
  );
}
