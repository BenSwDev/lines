"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VenueList } from "./VenueList";
import { CreateVenueDialog } from "./CreateVenueDialog";
import { listVenues } from "../actions/listVenues";
import { createVenue } from "../actions/createVenue";
import { deleteVenue } from "../actions/deleteVenue";
import { Button } from "@/shared/ui/Button";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";
import type { Venue } from "@prisma/client";

export function VenuesHomePage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVenues = async () => {
    setIsLoading(true);
    setError(null);
    const result = await listVenues();

    if (result.success && "data" in result) {
      setVenues(result.data || []);
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      setError(errorMsg ? translateError(errorMsg, t) : t("errors.loadingVenues"));
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
      // Auto-navigate to new venue
      router.push(`/venues/${result.data.id}`);
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      setError(errorMsg ? translateError(errorMsg, t) : t("errors.creatingVenue"));
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteVenue(id);

    if (result.success) {
      setVenues((prev) => prev.filter((v) => v.id !== id));
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      setError(errorMsg ? translateError(errorMsg, t) : t("errors.deletingVenue"));
    }
  };

  const handleSelectVenue = (venueId: string) => {
    router.push(`/venues/${venueId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">המקומות שלי</h1>
              <p className="mt-1 text-sm text-gray-400">נהל את כל המקומות העסקיים שלך במקום אחד</p>
            </div>
            <Button variant="primary" size="lg" onClick={() => setIsCreateOpen(true)}>
              + צור מקום חדש
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 text-4xl">⏳</div>
              <p className="text-gray-400">טוען מקומות...</p>
            </div>
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
              <div className="mb-4 text-6xl">🏢</div>
              <h2 className="mb-2 text-2xl font-semibold">אין מקומות עדיין</h2>
              <p className="mb-6 text-gray-400">התחל על ידי יצירת המקום העסקי הראשון שלך</p>
              <Button variant="primary" size="lg" onClick={() => setIsCreateOpen(true)}>
                + צור מקום ראשון
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {venues.length} {venues.length === 1 ? t("venues.venue") : t("venues.venues")}
              </p>
            </div>
            <VenueList venues={venues} onSelect={handleSelectVenue} onDelete={handleDelete} />
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateVenueDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
