"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LineCard } from "./LineCard";
import { CreateLineDialog } from "./CreateLineDialog";
import { Button } from "@/components/ui/button";
import { Plus, List } from "lucide-react";
import { listLines } from "../actions/listLines";
import { useToast } from "@/hooks/use-toast";
import type { Line } from "@prisma/client";

export function LinesTab() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const venueId = params.venueId as string;

  const [lines, setLines] = useState<Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadLines = async () => {
    setIsLoading(true);
    const result = await listLines(venueId);

    if (result.success) {
      setLines(result.data || []);
    } else {
      toast({
        title: "שגיאה",
        description: result.error || "שגיאה בטעינת הליינים",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const handleViewLine = (lineId: string) => {
    router.push(`/venues/${venueId}/lines/${lineId}`);
  };

  const handleViewEvents = (lineId: string) => {
    // Navigate to first event of this line
    router.push(`/venues/${venueId}/lines/${lineId}#events`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-muted"></div>
            <div className="h-5 w-64 animate-pulse rounded bg-muted"></div>
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted"></div>
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
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md space-y-6 rounded-lg border border-dashed p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <List className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">אין ליינים עדיין</h3>
              <p className="text-muted-foreground">
                צור את הליין הראשון שלך כדי להתחיל לנהל אירועים חוזרים
              </p>
            </div>
            <Button size="lg" onClick={() => setIsCreateOpen(true)}>
              <Plus className="ml-2 h-5 w-5" />
              צור ליין ראשון
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lines.map((line) => (
            <LineCard
              key={line.id}
              line={line}
              onEdit={() => setIsCreateOpen(true)} // TODO: Edit with data
              onViewEvents={() => handleViewEvents(line.id)}
              onViewLine={() => handleViewLine(line.id)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateLineDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        venueId={venueId}
        onSuccess={loadLines}
      />
    </div>
  );
}
