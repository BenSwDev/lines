/**
 * Layers Tab Component
 * Shows layers like Photoshop with visibility and lock controls
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Unlock, Table, MapPin, ChefHat } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { cn } from "@/lib/utils";

interface LayersTabProps {
  elements: FloorPlanElement[];
  layers: {
    zones: { visible: boolean; locked: boolean };
    tables: { visible: boolean; locked: boolean };
    specialAreas: { visible: boolean; locked: boolean };
  };
  onToggleVisibility: (layer: "zones" | "tables" | "specialAreas") => void;
  onToggleLock: (layer: "zones" | "tables" | "specialAreas") => void;
  onSelectElement: (id: string) => void;
  selectedElementId: string | null;
}

export function LayersTab({
  elements,
  layers,
  onToggleVisibility,
  onToggleLock,
  onSelectElement,
  selectedElementId
}: LayersTabProps) {
  const { t } = useTranslations();

  const tables = elements.filter((e) => e.type === "table");
  const zones = elements.filter((e) => e.type === "zone");
  const areas = elements.filter((e) => e.type === "specialArea");

  const LayerGroup = ({
    title,
    icon: Icon,
    elements: groupElements,
    layer,
    visible,
    locked
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    elements: FloorPlanElement[];
    layer: "zones" | "tables" | "specialAreas";
    visible: boolean;
    locked: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">({groupElements.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onToggleVisibility(layer)}
            title={visible ? t("floorPlan.hide") || "הסתר" : t("floorPlan.show") || "הצג"}
          >
            {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onToggleLock(layer)}
            title={locked ? t("floorPlan.unlock") || "פתח" : t("floorPlan.lock") || "נעל"}
          >
            {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {visible && (
        <div className="space-y-1 pl-4">
          {groupElements.map((element) => (
            <Card
              key={element.id}
              className={cn(
                "p-2 cursor-pointer transition-all hover:bg-muted",
                selectedElementId === element.id && "ring-2 ring-primary bg-primary/10"
              )}
              onClick={() => onSelectElement(element.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: element.color || "#3B82F6" }}
                  />
                  <span className="text-sm truncate">{element.name}</span>
                </div>
                {element.zoneId && (
                  <span className="text-xs text-muted-foreground truncate ml-2">
                    {elements.find((e) => e.id === element.zoneId)?.name || ""}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">{t("floorPlan.layers") || "שכבות"}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {t("floorPlan.layersDescription") || "נהל את השכבות של המפה"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <LayerGroup
          title={t("floorPlan.tables") || "שולחנות"}
          icon={Table}
          elements={tables}
          layer="tables"
          visible={layers.tables.visible}
          locked={layers.tables.locked}
        />

        <LayerGroup
          title={t("floorPlan.zones") || "אזורים"}
          icon={MapPin}
          elements={zones}
          layer="zones"
          visible={layers.zones.visible}
          locked={layers.zones.locked}
        />

        <LayerGroup
          title={t("floorPlan.areas") || "אזורים מיוחדים"}
          icon={ChefHat}
          elements={areas}
          layer="specialAreas"
          visible={layers.specialAreas.visible}
          locked={layers.specialAreas.locked}
        />
      </div>
    </div>
  );
}
