"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LineCard } from "./LineCard";
import { CreateLineDialog } from "./CreateLineDialog";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, List } from "lucide-react";
import { listLines } from "../actions/listLines";
import { getLine } from "../actions/getLine";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";
import type { Line } from "@prisma/client";

export function LinesTab() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslations();
  const venueId = params.venueId as string;

  const [lines, setLines] = useState<Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);

  const loadLines = async () => {
    setIsLoading(true);
    const result = await listLines(venueId);

    if (result.success && "data" in result) {
      setLines(result.data || []);
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: t("errors.generic"),
        description: errorMsg ? translateError(errorMsg, t) : t("errors.loadingLines"),
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  // Handle edit query parameter
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      handleEditLine(editId);
      // Remove query param from URL
      router.replace(`/venues/${venueId}/lines`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleViewLine = (lineId: string) => {
    router.push(`/venues/${venueId}/lines/${lineId}`);
  };

  const handleViewEvents = (lineId: string) => {
    // Navigate to first event of this line
    router.push(`/venues/${venueId}/lines/${lineId}#events`);
  };

  const handleEditLine = async (lineId: string) => {
    const result = await getLine(venueId, lineId);
    if (result.success && "data" in result && result.data) {
      setEditingLine(result.data);
      setIsCreateOpen(true);
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: t("errors.generic"),
        description: errorMsg ? translateError(errorMsg, t) : t("errors.loadingLine"),
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ליינים</h1>
          <p className="text-muted-foreground">נהל אירועים חוזרים עם לוחות זמנים וצבעים</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="lg">
          <Plus className="ml-2 h-5 w-5" />
          צור ליין חדש
        </Button>
      </div>

      {/* Stats */}
      {lines.length > 0 && (
        <div className="flex gap-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{lines.length}</div>
                <div className="text-xs text-muted-foreground">
                  {lines.length === 1 ? "ליין" : "ליינים"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lines Grid or Empty */}
      {lines.length === 0 ? (
        <EmptyState
          icon={List}
          title="אין ליינים עדיין"
          description="צור את הליין הראשון שלך כדי להתחיל לנהל אירועים חוזרים"
          action={{
            label: "צור ליין ראשון",
            onClick: () => setIsCreateOpen(true)
          }}
          className="min-h-[400px]"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both"
              }}
            >
              <LineCard
                line={line}
                onEdit={() => handleEditLine(line.id)}
                onViewEvents={() => handleViewEvents(line.id)}
                onViewLine={() => handleViewLine(line.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <CreateLineDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingLine(null);
        }}
        venueId={venueId}
        onSuccess={() => {
          loadLines();
          setEditingLine(null);
        }}
        existingLine={editingLine}
      />
    </div>
  );
}
