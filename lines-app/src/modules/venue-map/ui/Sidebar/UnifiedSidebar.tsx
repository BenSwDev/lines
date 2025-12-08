/**
 * Unified Sidebar Component
 * Smart sidebar that adapts to context (List, Layers, Filters)
 * "Canvas במרכז, Sidebar חכם שמשתנה לפי הקשר"
 */

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Layers, Filter } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { ListTab } from "./ListTab";
import { LayersTab } from "./LayersTab";
import { FiltersTab } from "./FiltersTab";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { motion } from "framer-motion";

interface UnifiedSidebarProps {
  elements: FloorPlanElement[];
  selectedElementId: string | null;
  selectedElementIds: Set<string>;
  onSelectElement: (id: string) => void;
  onAddTable: () => void;
  onAddZone: () => void;
  onAddArea: () => void;
  onDeleteElement: (id: string) => void;
  onEditElement: (element: FloorPlanElement) => void;
  onBulkAction?: (action: string, elementIds: string[]) => void;
  layers: {
    zones: { visible: boolean; locked: boolean };
    tables: { visible: boolean; locked: boolean };
    specialAreas: { visible: boolean; locked: boolean };
  };
  onToggleLayerVisibility: (layer: "zones" | "tables" | "specialAreas") => void;
  onToggleLayerLock: (layer: "zones" | "tables" | "specialAreas") => void;
  filters?: {
    type?: string[];
    zone?: string[];
    color?: string[];
  };
  onFilterChange?: (filters: UnifiedSidebarProps["filters"]) => void;
  className?: string;
}

export function UnifiedSidebar({
  elements,
  selectedElementId,
  selectedElementIds,
  onSelectElement,
  onAddTable,
  onAddZone,
  onAddArea,
  onDeleteElement,
  onEditElement,
  onBulkAction,
  layers,
  onToggleLayerVisibility,
  onToggleLayerLock,
  filters,
  onFilterChange,
  className = ""
}: UnifiedSidebarProps) {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<"list" | "layers" | "filters">("list");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col h-full bg-card border-r ${className}`}
    >
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            {t("floorPlan.list") || "רשימה"}
          </TabsTrigger>
          <TabsTrigger value="layers" className="gap-2">
            <Layers className="h-4 w-4" />
            {t("floorPlan.layers") || "שכבות"}
          </TabsTrigger>
          <TabsTrigger value="filters" className="gap-2">
            <Filter className="h-4 w-4" />
            {t("floorPlan.filters") || "סינון"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="flex-1 overflow-y-auto m-0 p-0">
          <ListTab
            elements={elements}
            selectedElementId={selectedElementId}
            selectedElementIds={selectedElementIds}
            onSelectElement={onSelectElement}
            onAddTable={onAddTable}
            onAddZone={onAddZone}
            onAddArea={onAddArea}
            onDeleteElement={onDeleteElement}
            onEditElement={onEditElement}
            onBulkAction={onBulkAction}
          />
        </TabsContent>

        <TabsContent value="layers" className="flex-1 overflow-y-auto m-0 p-0">
          <LayersTab
            elements={elements}
            layers={layers}
            onToggleVisibility={onToggleLayerVisibility}
            onToggleLock={onToggleLayerLock}
            onSelectElement={onSelectElement}
            selectedElementId={selectedElementId}
          />
        </TabsContent>

        <TabsContent value="filters" className="flex-1 overflow-y-auto m-0 p-0">
          <FiltersTab
            elements={elements}
            filters={filters}
            onFilterChange={onFilterChange}
            onSelectElement={onSelectElement}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
