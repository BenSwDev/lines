/**
 * Hierarchical Sidebar Component
 * Tree structure showing zones with their children (tables/bars)
 * Clean, focused CRUD interface
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  MapPin,
  ChefHat,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  Filter
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "../../types";
import { cn } from "@/lib/utils";
import { useElementHierarchy } from "../../hooks/useElementHierarchy";

interface HierarchicalSidebarProps {
  elements: FloorPlanElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onAddTable: () => void;
  onAddZone: () => void;
  onAddBar: () => void;
  onDeleteElement: (id: string) => void;
  onSaveElement: (id: string, updates: Partial<FloorPlanElement>) => void;
  onEditClick?: (element: FloorPlanElement) => void;
}

export function HierarchicalSidebar({
  elements,
  selectedElementId,
  onSelectElement,
  onAddTable,
  onAddZone,
  onAddBar,
  onDeleteElement,
  onSaveElement,
  onEditClick
}: HierarchicalSidebarProps) {
  const { t } = useTranslations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSeats, setEditSeats] = useState("");
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    showTables: true,
    showBars: true,
    showZones: true
  });

  const hierarchy = useElementHierarchy(elements);

  const handleStartEdit = (element: FloorPlanElement) => {
    setEditingId(element.id);
    setEditName(element.name);
    setEditSeats(element.seats?.toString() || "4");
    onSelectElement(element.id);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const element = elements.find((e) => e.id === editingId);
      if (element) {
        const updates: Partial<FloorPlanElement> = {
          name: editName.trim() || element.name
        };
        if (element.type === "table") {
          updates.seats = parseInt(editSeats) || 4;
        }
        onSaveElement(editingId, updates);
        setEditingId(null);
        setEditName("");
        setEditSeats("");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditSeats("");
  };

  const toggleZone = (zoneId: string) => {
    setExpandedZones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(zoneId)) {
        newSet.delete(zoneId);
      } else {
        newSet.add(zoneId);
      }
      return newSet;
    });
  };

  const getElementIcon = (element: FloorPlanElement) => {
    if (element.type === "table" && element.tableType === "bar") {
      return <ChefHat className="h-4 w-4" />;
    }
    if (element.type === "table") {
      return <Table className="h-4 w-4" />;
    }
    if (element.type === "zone") {
      return <MapPin className="h-4 w-4" />;
    }
    return <ChefHat className="h-4 w-4" />;
  };

  const getElementInfo = (element: FloorPlanElement) => {
    if (element.type === "table") {
      return `${element.seats || 4} ${t("common.seats") || "מושבים"}`;
    }
    if (element.type === "zone") {
      const children = hierarchy.zoneHierarchy.find((h) => h.zone.id === element.id)?.children || [];
      return `${children.length} ${t("floorPlan.elements") || "אלמנטים"}`;
    }
    return "";
  };

  const renderElement = (element: FloorPlanElement, level = 0) => {
    const isSelected = selectedElementId === element.id;
    const isEditing = editingId === element.id;

    return (
      <Card
        key={element.id}
        className={cn(
          "p-3 cursor-pointer transition-all hover:shadow-sm",
          isSelected && "ring-2 ring-primary bg-primary/5",
          level > 0 && "ml-4"
        )}
        onClick={() => !isEditing && onSelectElement(element.id)}
      >
        {isEditing ? (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("common.name") || "שם"}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            {element.type === "table" && (
              <div className="space-y-1">
                <Label className="text-xs">{t("floorPlan.seats") || "מושבים"}</Label>
                <Input
                  type="number"
                  value={editSeats}
                  onChange={(e) => setEditSeats(e.target.value)}
                  className="h-8 text-sm"
                  min="1"
                  max="20"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} className="flex-1 h-7">
                <Save className="h-3 w-3 mr-1" />
                {t("common.save") || "שמור"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getElementIcon(element)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{element.name}</p>
                {getElementInfo(element) && (
                  <p className="text-xs text-muted-foreground">{getElementInfo(element)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEditClick) {
                    onEditClick(element);
                  } else {
                    handleStartEdit(element);
                  }
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteElement(element.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const filteredHierarchy = hierarchy.zoneHierarchy.filter((h) => {
    if (!filters.showZones) return false;
    const hasVisibleChildren = h.children.some((child) => {
      if (child.type === "table" && child.tableType === "bar") {
        return filters.showBars;
      }
      if (child.type === "table") {
        return filters.showTables;
      }
      return true;
    });
    return hasVisibleChildren || h.children.length === 0;
  });

  const filteredUnassigned = hierarchy.unassignedElements.filter((element) => {
    if (element.type === "table" && element.tableType === "bar") {
      return filters.showBars;
    }
    if (element.type === "table") {
      return filters.showTables;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Add Buttons */}
      <div className="p-4 border-b space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="default"
            className="flex-col gap-1 h-auto py-3"
            onClick={onAddTable}
          >
            <Table className="h-5 w-5" />
            <span className="text-xs">{t("floorPlan.table") || "שולחן"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-col gap-1 h-auto py-3"
            onClick={onAddBar}
          >
            <ChefHat className="h-5 w-5" />
            <span className="text-xs">{t("floorPlan.bar") || "בר"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-col gap-1 h-auto py-3"
            onClick={onAddZone}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">{t("floorPlan.zone") || "אזור"}</span>
          </Button>
        </div>

        {/* Filter Toggle */}
        <Button
          size="sm"
          variant="ghost"
          className="w-full gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          {t("floorPlan.filters") || "סינון"}
        </Button>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-2 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="filter-tables"
                checked={filters.showTables}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, showTables: e.target.checked }))
                }
                className="h-4 w-4"
              />
              <Label htmlFor="filter-tables" className="text-sm cursor-pointer">
                {t("floorPlan.tables") || "שולחנות"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="filter-bars"
                checked={filters.showBars}
                onChange={(e) => setFilters((prev) => ({ ...prev, showBars: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="filter-bars" className="text-sm cursor-pointer">
                {t("floorPlan.bars") || "ברים"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="filter-zones"
                checked={filters.showZones}
                onChange={(e) => setFilters((prev) => ({ ...prev, showZones: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="filter-zones" className="text-sm cursor-pointer">
                {t("floorPlan.zones") || "אזורים"}
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Elements List - Hierarchical */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {elements.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">{t("floorPlan.noElements") || "אין אלמנטים עדיין"}</p>
            <p className="text-xs mt-2">
              {t("floorPlan.addElementsHint") ||
                "לחץ כאן להוספת איזורים ברים ושולחנות"}
            </p>
          </div>
        ) : (
          <>
            {/* Zones with Children */}
            {filteredHierarchy.map(({ zone, children }) => {
              const isExpanded = expandedZones.has(zone.id);
              const visibleChildren = children.filter((child) => {
                if (child.type === "table" && child.tableType === "bar") {
                  return filters.showBars;
                }
                if (child.type === "table") {
                  return filters.showTables;
                }
                return true;
              });

              return (
                <div key={zone.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleZone(zone.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    {renderElement(zone, 0)}
                  </div>
                  {isExpanded && visibleChildren.length > 0 && (
                    <div className="space-y-1 ml-6">
                      {visibleChildren.map((child) => renderElement(child, 1))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned Elements */}
            {filteredUnassigned.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground px-2">
                  {t("floorPlan.unassigned") || "לא משויכים לאזור"} ({filteredUnassigned.length})
                </h3>
                <div className="space-y-1">
                  {filteredUnassigned.map((element) => renderElement(element, 0))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

