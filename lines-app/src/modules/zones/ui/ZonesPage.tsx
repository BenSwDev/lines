"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ZonesSection } from "./ZonesSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

type ZonesPageProps = {
  venueId: string;
  venueName: string;
};

export function ZonesPage({ venueId, venueName }: ZonesPageProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const [zones, setZones] = useState<unknown[]>([]);

  const loadData = () => {
    // TODO: Load actual data
    setZones([]);
  };

  useEffect(() => {
    loadData();
  }, [venueId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/venues/${venueId}/settings`)}
            className="mb-2"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.seating")} - {venueName}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.seatingDescription")}
          </p>
        </div>
      </div>

      <ZonesSection
        venueId={venueId}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        zones={zones as any}
        onRefresh={loadData}
      />
    </div>
  );
}

