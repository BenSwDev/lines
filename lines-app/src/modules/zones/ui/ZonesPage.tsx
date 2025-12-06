"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { FloorPlanEditor, type TableItem } from "@/modules/venue-settings/ui/FloorPlanEditor";
import { loadVenueTables } from "@/modules/venue-settings/actions/floorPlanActions";
import { useToast } from "@/hooks/use-toast";
import { translateError } from "@/utils/translateError";

type ZonesPageProps = {
  venueId: string;
  venueName: string;
};

export function ZonesPage({ venueId, venueName }: ZonesPageProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const { toast } = useToast();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await loadVenueTables(venueId);
      if (result.success && "data" in result) {
        setTables(result.data || []);
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        toast({
          title: t("errors.generic"),
          description: errorMsg ? translateError(errorMsg, t) : t("errors.loadingVenues"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/venues/${venueId}/info`)}
            className="mb-2"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.seating")} - {venueName}
          </h1>
          <p className="text-muted-foreground">{t("floorPlan.title")}</p>
        </div>
      </div>

      <FloorPlanEditor venueId={venueId} initialTables={tables} />
    </div>
  );
}
