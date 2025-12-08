"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LinesSidebar } from "./LinesSidebar";
import { WeeklyScheduleView } from "./WeeklyScheduleView";
import { LineDetailView } from "./LineDetailView";
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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslations();
  const venueId = params.venueId as string;

  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [weekStartDay, setWeekStartDay] = useState<0 | 1>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  useEffect(() => {
    const lineIdFromUrl = searchParams.get("lineId");
    if (lineIdFromUrl) {
      setSelectedLineId(lineIdFromUrl);
    }
  }, [searchParams]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [linesResult, venueDetailsResult] = await Promise.all([
        listLines(venueId),
        getVenueDetails(venueId)
      ]);

      if (linesResult.success && "data" in linesResult) {
        setLines(linesResult.data || []);
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
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineSelect = (lineId: string | null) => {
    setSelectedLineId(lineId);
    if (lineId) {
      router.push(`/venues/${venueId}/lines?lineId=${lineId}`, { scroll: false });
    } else {
      router.push(`/venues/${venueId}/lines`, { scroll: false });
    }
  };

  const handleCreateLine = () => {
    setEditingLine(null);
    setIsCreateOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-l bg-background p-4 space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedLineId ? (
          <LineDetailView
            lineId={selectedLineId}
            venueId={venueId}
            onBack={() => setSelectedLineId(null)}
          />
        ) : (
          <WeeklyScheduleView
            lines={lines}
            weekStartDay={weekStartDay}
            onLineClick={handleLineSelect}
          />
        )}
      </div>

      {/* Sidebar */}
      <LinesSidebar
        lines={lines}
        selectedLineId={selectedLineId}
        onLineSelect={handleLineSelect}
        onCreateLine={handleCreateLine}
      />

      {/* Create/Edit Dialog */}
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
        }}
        existingLine={editingLine}
      />
    </div>
  );
}

