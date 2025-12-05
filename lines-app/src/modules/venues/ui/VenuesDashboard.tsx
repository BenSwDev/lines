"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VenueGrid } from "./VenueGrid";
import { CreateVenueDialog } from "./CreateVenueDialog";
import { listVenues } from "../actions/listVenues";
import { createVenue } from "../actions/createVenue";
import { deleteVenue } from "../actions/deleteVenue";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import type { Venue } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";
import { PageHeader } from "@/shared/layout/PageHeader";
import { StatCard } from "@/shared/patterns/StatCard";

export function VenuesDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const handleCreate = async (name: string) => {
    const result = await createVenue({ name });

    if (result.success && "data" in result && result.data) {
      setVenues((prev) => [result.data, ...prev]);
      setIsCreateOpen(false);
      toast({
        title: t("success.venueCreated"),
        description: t("success.venueCreated")
      });
      // Auto-navigate to new venue
      router.push(`/venues/${result.data.id}/info`);
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
      <PageHeader
        title={t("venues.title")}
        description={t("venues.subtitle")}
        action={
          <Button onClick={() => setIsCreateOpen(true)} size="lg">
            <Plus className="ml-2 h-5 w-5" />
            {t("venues.createVenue")}
          </Button>
        }
      />

      {/* Stats */}
      {venues.length > 0 && (
        <div className="flex gap-4">
          <StatCard
            icon={Building2}
            value={venues.length}
            label={venues.length === 1 ? t("venues.venue") : t("venues.venues")}
          />
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
