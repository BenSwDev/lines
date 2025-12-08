/**
 * View Controls Component
 * Controls for filtering and viewing elements (show/hide tables, zones, bars)
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Grid, Layout, Filter } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { ViewState } from "../../types";
import { cn } from "@/lib/utils";

interface ViewControlsProps {
  viewState: ViewState;
  onViewStateChange: (updates: Partial<ViewState>) => void;
  className?: string;
}

export function ViewControls({
  viewState,
  onViewStateChange,
  className
}: ViewControlsProps) {
  const { t } = useTranslations();

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <h3 className="font-semibold text-sm">{t("floorPlan.filters") || "סינון והצגה"}</h3>
      </div>

      {/* Visibility Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-tables" className="text-sm cursor-pointer flex items-center gap-2">
            {viewState.showTables ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            {t("floorPlan.tables") || "שולחנות"}
          </Label>
          <input
            type="checkbox"
            id="show-tables"
            checked={viewState.showTables}
            onChange={(e) =>
              onViewStateChange({ showTables: e.target.checked })
            }
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-bars" className="text-sm cursor-pointer flex items-center gap-2">
            {viewState.showBars ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            {t("floorPlan.bars") || "ברים"}
          </Label>
          <input
            type="checkbox"
            id="show-bars"
            checked={viewState.showBars}
            onChange={(e) => onViewStateChange({ showBars: e.target.checked })}
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-zones" className="text-sm cursor-pointer flex items-center gap-2">
            {viewState.showZones ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            {t("floorPlan.zones") || "אזורים"}
          </Label>
          <input
            type="checkbox"
            id="show-zones"
            checked={viewState.showZones}
            onChange={(e) => onViewStateChange({ showZones: e.target.checked })}
            className="h-4 w-4"
          />
        </div>
      </div>

      {/* Grid Toggle */}
      <div className="pt-3 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-grid" className="text-sm cursor-pointer flex items-center gap-2">
            <Grid className="h-4 w-4" />
            {t("floorPlan.grid") || "רשת"}
          </Label>
          <input
            type="checkbox"
            id="show-grid"
            checked={viewState.showGrid}
            onChange={(e) => onViewStateChange({ showGrid: e.target.checked })}
            className="h-4 w-4"
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="pt-3 border-t">
        <Label className="text-sm font-medium mb-2 block">
          {t("floorPlan.viewMode") || "מצב הצגה"}
        </Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewState.viewMode === "minimal" ? "default" : "outline"}
            onClick={() => onViewStateChange({ viewMode: "minimal" })}
            className="flex-1"
          >
            <Layout className="h-3 w-3 mr-1" />
            {t("floorPlan.minimal") || "מינימליסטי"}
          </Button>
          <Button
            size="sm"
            variant={viewState.viewMode === "detailed" ? "default" : "outline"}
            onClick={() => onViewStateChange({ viewMode: "detailed" })}
            className="flex-1"
          >
            <Layout className="h-3 w-3 mr-1" />
            {t("floorPlan.detailed") || "מפורט"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

