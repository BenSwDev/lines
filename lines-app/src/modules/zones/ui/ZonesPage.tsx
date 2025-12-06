"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layout, List } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { SeatingLayoutEditor } from "./SeatingLayoutEditor";
import { ZonesSection } from "./ZonesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  loadVenueLayout,
  saveVenueLayout,
  generateZonesFromLayout
} from "../actions/layoutActions";
import type { VenueLayout } from "../types";

type ZonesPageProps = {
  venueId: string;
  venueName: string;
};

export function ZonesPage({ venueId, venueName }: ZonesPageProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const { toast } = useToast();
  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [zones, setZones] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"visual" | "list">("visual");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const layoutResult = await loadVenueLayout(venueId);
      if (layoutResult.success) {
        // Type assertion: we know layoutResult has data when success is true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setLayout((layoutResult as any).data || null);
      } else {
        setLayout(null);
      }
      // TODO: Load zones list
      setZones([]);
    } catch {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הנתונים",
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

  const handleSave = async (savedLayout: VenueLayout) => {
    try {
      const result = await saveVenueLayout(venueId, savedLayout);
      if (result.success) {
        setLayout(savedLayout);
        toast({
          title: "הצלחה",
          description: "המבנה נשמר בהצלחה"
        });
      } else {
        throw new Error(result.error || "שגיאה בשמירה");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "לא ניתן לשמור את המבנה",
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async (generatedLayout: VenueLayout) => {
    try {
      const result = await generateZonesFromLayout(venueId, generatedLayout);
      if (result.success) {
        toast({
          title: "הצלחה",
          description: "המבנה נוצר בהצלחה. עברו לתצוגת הרשימה כדי לראות את האזורים והשולחנות."
        });
        // Reload zones list
        await loadData();
        setViewMode("list");
      } else {
        throw new Error(result.error || "שגיאה ביצירת המבנה");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "לא ניתן ליצור את המבנה",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <p className="text-muted-foreground">
            {viewMode === "visual"
              ? "צור את מבנה המקום שלך באופן ויזואלי"
              : t("settings.seatingDescription")}
          </p>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "visual" | "list")}>
        <TabsList>
          <TabsTrigger value="visual">
            <Layout className="h-4 w-4 ml-2" />
            תצוגה ויזואלית
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 ml-2" />
            תצוגת רשימה
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="mt-4">
          {layout && (
            <SeatingLayoutEditor
              venueId={venueId}
              initialLayout={layout}
              onSave={handleSave}
              onGenerateZones={handleGenerate}
            />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <ZonesSection
            venueId={venueId}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            zones={zones as any}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
