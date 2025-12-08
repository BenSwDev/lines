/**
 * Context-Aware Sidebar Component
 * Wrapper that switches between List/Layers/Filters and Properties based on selection
 */

"use client";

import { useMemo } from "react";
import { UnifiedSidebar } from "./UnifiedSidebar";
import { PropertiesPanel } from "./PropertiesPanel";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { AnimatePresence } from "framer-motion";

interface ContextAwareSidebarProps {
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
  onSaveElement: (updates: Partial<FloorPlanElement>) => void;
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
  onFilterChange?: (filters: ContextAwareSidebarProps["filters"]) => void;
  className?: string;
}

export function ContextAwareSidebar(props: ContextAwareSidebarProps) {
  const {
    elements,
    selectedElementId,
    selectedElementIds,
    onSaveElement,
    onBulkAction,
    onDeleteElement
  } = props;

  // Determine context
  const context = useMemo(() => {
    if (selectedElementIds.size > 1) {
      return "multiple";
    }
    if (selectedElementId) {
      return "single";
    }
    return "none";
  }, [selectedElementId, selectedElementIds.size]);

  const selectedElement = useMemo(() => {
    if (selectedElementId) {
      return elements.find((e) => e.id === selectedElementId) || null;
    }
    return null;
  }, [elements, selectedElementId]);

  const selectedElements = useMemo(() => {
    return elements.filter((e) => selectedElementIds.has(e.id));
  }, [elements, selectedElementIds]);

  // Show Properties Panel when something is selected
  if (context === "single" || context === "multiple") {
    return (
      <AnimatePresence mode="wait">
        <PropertiesPanel
          key="properties"
          selectedElement={selectedElement}
          selectedElements={selectedElements}
          onSave={onSaveElement}
          onDelete={onDeleteElement}
          onBulkAction={onBulkAction}
          onCancel={() => props.onSelectElement("")}
        />
      </AnimatePresence>
    );
  }

  // Show Unified Sidebar when nothing is selected
  return (
    <AnimatePresence mode="wait">
      <UnifiedSidebar key="sidebar" {...props} />
    </AnimatePresence>
  );
}
