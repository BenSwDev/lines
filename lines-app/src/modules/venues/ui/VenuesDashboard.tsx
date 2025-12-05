"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VenueGrid } from "./VenueGrid";
import { CreateVenueDialog } from "./CreateVenueDialog";
import { listVenues } from "../actions/listVenues";
import { createVenue } from "../actions/createVenue";
import { deleteVenue } from "../actions/deleteVenue";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Venue } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

export function VenuesDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadVenues = async () => {
    setIsLoading(true);
    const result = await listVenues();

    if (result.success) {
      setVenues(result.data || []);
    } else {
      toast({
        title: "שגיאה",
        description: result.error || "שגיאה בטעינת המקומות",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (name: string) => {
    const result = await createVenue({ name });

    if (result.success && result.data) {
      setVenues((prev) => [result.data!, ...prev]);
      setIsCreateOpen(false);
      toast({
        title: "הצלחה!",
        description: `המקום "${name}" נוצר בהצלחה`
      });
      // Auto-navigate to new venue
      router.push(`/venues/${result.data.id}/info`);
    } else {
      toast({
        title: "שגיאה",
        description: result.error || "שגיאה ביצירת המקום",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteVenue(id);

    if (result.success) {
      setVenues((prev) => prev.filter((v) => v.id !== id));
      toast({
        title: "הצלחה",
        description: "המקום נמחק בהצלחה"
      });
    } else {
      toast({
        title: "שגיאה",
        description: result.error || "שגיאה במחיקת המקום",
        variant: "destructive"
      });
    }
  };

  const handleSelect = (venueId: string) => {
    router.push(`/venues/${venueId}/info`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">טוען מקומות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">המקומות שלי</h1>
          <p className="text-muted-foreground">נהל את כל המקומות העסקיים שלך במקום אחד</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="lg">
          <Plus className="ml-2 h-5 w-5" />
          צור מקום חדש
        </Button>
      </div>

      {/* Stats */}
      {venues.length > 0 && (
        <div className="flex gap-4">
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{venues.length}</div>
              <div className="text-sm text-muted-foreground">
                {venues.length === 1 ? "מקום" : "מקומות"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Venues Grid or Empty State */}
      <VenueGrid
        venues={venues}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onCreate={() => setIsCreateOpen(true)}
      />

      {/* Create Dialog */}
      <CreateVenueDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
