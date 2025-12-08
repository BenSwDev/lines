"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VenueGrid } from "./VenueGrid";
import { CreateVenueDialog } from "./CreateVenueDialog";
import { listVenues } from "../actions/listVenues";
import { createVenue } from "../actions/createVenue";
import { deleteVenue } from "../actions/deleteVenue";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Venue } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";

export function VenuesDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const shouldStartTour = searchParams.get("startTour") === "true";

  const loadVenues = async () => {
    setIsLoading(true);
    const result = await listVenues();

    if (result.success && "data" in result) {
      setVenues(result.data || []);
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: t("errors.generic"),
        description: errorMsg ? translateError(errorMsg, t) : t("errors.loadingVenues"),
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-start tour if requested and venue exists
  useEffect(() => {
    if (shouldStartTour && !isLoading && venues.length > 0) {
      // Navigate to first venue's lines page with tour parameter
      router.push(`/venues/${venues[0].id}/lines?startTour=true`);
    }
  }, [shouldStartTour, isLoading, venues, router]);

  const handleCreate = async (name: string) => {
    const result = await createVenue({ name });

    if (result.success && "data" in result && result.data) {
      setVenues((prev) => [result.data, ...prev]);
      setIsCreateOpen(false);
      toast({
        title: t("success.venueCreated"),
        description: t("success.venueCreated")
      });
      // Auto-navigate to new venue - if startTour was requested, go to lines page
      if (shouldStartTour) {
        router.push(`/venues/${result.data.id}/lines?startTour=true`);
      } else {
        router.push(`/venues/${result.data.id}`);
      }
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: t("errors.generic"),
        description: errorMsg ? translateError(errorMsg, t) : t("errors.creatingVenue"),
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteVenue(id);

    if (result.success) {
      setVenues((prev) => prev.filter((v) => v.id !== id));
      toast({
        title: t("success.venueDeleted"),
        description: t("success.venueDeleted")
      });
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: t("errors.generic"),
        description: errorMsg ? translateError(errorMsg, t) : t("errors.deletingVenue"),
        variant: "destructive"
      });
    }
  };

  const handleSelect = (venueId: string) => {
    router.push(`/venues/${venueId}`);
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
