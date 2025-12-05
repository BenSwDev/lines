"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MenusSection } from "./MenusSection";
import { ZonesSection } from "./ZonesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MapPin } from "lucide-react";

export function VenueSettingsTab() {
  const params = useParams();
  const venueId = params.venueId as string;

  const [menus, setMenus] = useState<unknown[]>([]);
  const [zones, setZones] = useState<unknown[]>([]);

  const loadData = () => {
    // TODO: Load actual data
    setMenus([]);
    setZones([]);
  };

  useEffect(() => {
    loadData();
  }, [venueId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">הגדרות המקום</h1>
        <p className="text-muted-foreground">
          נהל תפריטים, אזורי ישיבה ושולחנות
        </p>
      </div>

      <Tabs defaultValue="menus" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="menus" className="gap-2">
            <FileText className="h-4 w-4" />
            תפריטים
          </TabsTrigger>
          <TabsTrigger value="zones" className="gap-2">
            <MapPin className="h-4 w-4" />
            אזורים ושולחנות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menus" className="mt-6">
          <MenusSection
            venueId={venueId}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            menus={menus as any}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="zones" className="mt-6">
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
