/**
 * Simple Sidebar Component
 * Clean, focused CRUD interface for managing map elements
 * Only essential features: List, Add, Edit, Delete
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
  X,
  Save
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { cn } from "@/lib/utils";

interface SimpleSidebarProps {
  elements: FloorPlanElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onAddTable: () => void;
  onAddZone: () => void;
  onAddBar: () => void;
  onDeleteElement: (id: string) => void;
  onSaveElement: (id: string, updates: Partial<FloorPlanElement>) => void;
}

export function SimpleSidebar({
  elements,
  selectedElementId,
  onSelectElement,
  onAddTable,
  onAddZone,
  onAddBar,
  onDeleteElement,
  onSaveElement
}: SimpleSidebarProps) {
  const { t } = useTranslations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSeats, setEditSeats] = useState("");

  const selectedElement = selectedElementId
    ? elements.find((e) => e.id === selectedElementId)
    : null;

  const tables = elements.filter((e) => e.type === "table");
  const zones = elements.filter((e) => e.type === "zone");
  const bars = elements.filter((e) => e.type === "table" && e.tableType === "bar");

  const handleStartEdit = (element: FloorPlanElement) => {
    setEditingId(element.id);
    setEditName(element.name);
    setEditSeats(element.seats?.toString() || "4");
    onSelectElement(element.id);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const updates: Partial<FloorPlanElement> = {
        name: editName.trim() || selectedElement?.name
      };
      if (selectedElement?.type === "table") {
        updates.seats = parseInt(editSeats) || 4;
      }
      onSaveElement(editingId, updates);
      setEditingId(null);
      setEditName("");
      setEditSeats("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditSeats("");
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
      const tablesInZone = elements.filter(
        (e) => e.zoneId === element.id && e.type === "table"
      ).length;
      return `${tablesInZone} ${t("floorPlan.tables") || "שולחנות"}`;
    }
    return "";
  };

  const renderElementList = (
    title: string,
    items: FloorPlanElement[]
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground px-2">
          {title} ({items.length})
        </h3>
        <div className="space-y-1">
          {items.map((element) => {
            const isSelected = selectedElementId === element.id;
            const isEditing = editingId === element.id;

            return (
              <Card
                key={element.id}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:shadow-sm",
                  isSelected && "ring-2 ring-primary bg-primary/5"
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
                        <Label className="text-xs">
                          {t("floorPlan.seats") || "מושבים"}
                        </Label>
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
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="flex-1 h-7"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {t("common.save") || "שמור"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-7"
                      >
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
                          <p className="text-xs text-muted-foreground">
                            {getElementInfo(element)}
                          </p>
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
                          handleStartEdit(element);
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
          })}
        </div>
      </div>
    );
  };

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
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {elements.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">{t("floorPlan.noElements") || "אין אלמנטים עדיין"}</p>
            <p className="text-xs mt-2">
              {t("floorPlan.addElementsHint") || "לחץ על הכפתורים למעלה כדי להוסיף"}
            </p>
          </div>
        ) : (
          <>
            {renderElementList(
              t("floorPlan.tables") || "שולחנות",
              tables.filter((t) => t.tableType !== "bar")
            )}
            {renderElementList(
              t("floorPlan.bars") || "ברים",
              bars
            )}
            {renderElementList(
              t("floorPlan.zones") || "אזורים",
              zones
            )}
          </>
        )}
      </div>
    </div>
  );
}

