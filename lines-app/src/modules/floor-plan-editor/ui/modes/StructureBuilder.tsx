"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanWithDetails } from "../../types";

interface StructureBuilderProps {
  floorPlan: FloorPlanWithDetails;
  venueId: string;
  selectedElementId: string | null;
  selectedElementType: "zone" | "table" | "area" | null;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
  onElementAdd: (type: "zone" | "table" | "area", data: unknown) => Promise<void>;
  onElementDelete: (id: string, type: "zone" | "table" | "area") => Promise<void>;
  canEdit: boolean;
}

export function StructureBuilder({
  floorPlan,
  venueId,
  selectedElementId,
  selectedElementType,
  onElementSelect,
  onElementAdd,
  onElementDelete,
  canEdit
}: StructureBuilderProps) {
  const { t } = useTranslations();
  const [addingType, setAddingType] = useState<"zone" | "area" | null>(null);
  const [newName, setNewName] = useState("");

  const zoneTypes = [
    {
      id: "seating",
      label: t("floorPlan.seatingZone", { defaultValue: "איזור שולחנות" }),
      icon: "🪑",
      color: "#3B82F6"
    },
    { id: "vip", label: "VIP", icon: "⭐", color: "#F59E0B" }
  ];

  const areaTypes = [
    { id: "bar", label: t("floorPlan.bar", { defaultValue: "בר" }), icon: "🍸", color: "#10B981" },
    {
      id: "entrance",
      label: t("floorPlan.entrance", { defaultValue: "כניסה" }),
      icon: "🚪",
      color: "#6B7280"
    },
    {
      id: "restroom",
      label: t("floorPlan.restroom", { defaultValue: "שירותים" }),
      icon: "🚻",
      color: "#8B7280"
    },
    {
      id: "kitchen",
      label: t("floorPlan.kitchen", { defaultValue: "מטבח" }),
      icon: "👨‍🍳",
      color: "#EF4444"
    },
    {
      id: "stage",
      label: t("floorPlan.stage", { defaultValue: "במה" }),
      icon: "🎤",
      color: "#EC4899"
    },
    {
      id: "dj_booth",
      label: t("floorPlan.djBooth", { defaultValue: "די ג'יי" }),
      icon: "🎧",
      color: "#6366F1"
    },
    {
      id: "storage",
      label: t("floorPlan.storage", { defaultValue: "מחסן" }),
      icon: "📦",
      color: "#78716C"
    }
  ];

  const handleAdd = async () => {
    if (!addingType || !newName.trim()) return;

    if (addingType === "zone") {
      const zoneType = zoneTypes[0];
      await onElementAdd("zone", {
        floorPlanId: floorPlan.id,
        venueId,
        name: newName.trim(),
        color: zoneType.color,
        positionX: 100,
        positionY: 100,
        width: 200,
        height: 150
      });
    } else {
      const areaType = areaTypes.find((a) => a.id === addingType);
      if (areaType) {
        await onElementAdd("area", {
          floorPlanId: floorPlan.id,
          venueId,
          areaType: areaType.id,
          name: newName.trim(),
          positionX: 100,
          positionY: 100,
          width: 150,
          height: 150,
          color: areaType.color,
          icon: areaType.icon
        });
      }
    }

    setNewName("");
    setAddingType(null);
  };

  const handleDelete = async () => {
    if (!selectedElementId || !selectedElementType) return;
    await onElementDelete(selectedElementId, selectedElementType);
    onElementSelect(null, null);
  };

  if (!canEdit) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{t("floorPlan.lockedCannotEdit", { defaultValue: "המפה נעולה - לא ניתן לערוך" })}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Add Button - Single Action */}
      {!addingType && (
        <Button className="w-full gap-2" onClick={() => setAddingType("zone")}>
          <Plus className="h-4 w-4" />
          {t("floorPlan.addZone", { defaultValue: "הוסף איזור" })}
        </Button>
      )}

      {/* Add Zone Form */}
      {addingType === "zone" && (
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <Input
            placeholder={t("floorPlan.zoneNamePlaceholder", { defaultValue: "שם האיזור" })}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleAdd}>
              {t("common.save", { defaultValue: "שמור" })}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAddingType(null);
                setNewName("");
              }}
            >
              {t("common.cancel", { defaultValue: "ביטול" })}
            </Button>
          </div>
        </div>
      )}

      {/* Add Area Button */}
      {!addingType && (
        <Button variant="outline" className="w-full gap-2" onClick={() => setAddingType("area")}>
          <Plus className="h-4 w-4" />
          {t("floorPlan.addSpecialArea", { defaultValue: "הוסף איזור מיוחד" })}
        </Button>
      )}

      {/* Add Area Form */}
      {addingType === "area" && (
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-2 mb-2">
            {areaTypes.map((areaType) => (
              <Button
                key={areaType.id}
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  setNewName(areaType.label);
                  const handleAddArea = async () => {
                    await onElementAdd("area", {
                      floorPlanId: floorPlan.id,
                      venueId,
                      areaType: areaType.id,
                      name: areaType.label,
                      positionX: 100,
                      positionY: 100,
                      width: 150,
                      height: 150,
                      color: areaType.color,
                      icon: areaType.icon
                    });
                    setNewName("");
                    setAddingType(null);
                  };
                  handleAddArea();
                }}
              >
                <span>{areaType.icon}</span>
                <span className="text-xs">{areaType.label}</span>
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              setAddingType(null);
              setNewName("");
            }}
          >
            {t("common.cancel", { defaultValue: "ביטול" })}
          </Button>
        </div>
      )}

      {/* Selected Element */}
      {selectedElementId && selectedElementType && (
        <div className="p-3 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedElementType === "zone" &&
                t("floorPlan.selectedZone", { defaultValue: "איזור נבחר" })}
              {selectedElementType === "table" &&
                t("floorPlan.selectedTable", { defaultValue: "שולחן נבחר" })}
              {selectedElementType === "area" &&
                t("floorPlan.selectedArea", { defaultValue: "איזור מיוחד נבחר" })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedElementType === "zone" &&
              floorPlan.zones.find((z) => z.id === selectedElementId)?.name}
            {selectedElementType === "table" &&
              (() => {
                for (const zone of floorPlan.zones) {
                  const table = zone.tables.find((t) => t.id === selectedElementId);
                  if (table) return table.name;
                }
                return "";
              })()}
            {selectedElementType === "area" &&
              floorPlan.venueAreas.find((a) => a.id === selectedElementId)?.name}
          </p>
        </div>
      )}

      {/* Elements List - Compact */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-muted-foreground px-2">
          {t("floorPlan.elements", { defaultValue: "אלמנטים" })}
        </h4>
        <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
          {floorPlan.zones.map((zone) => (
            <button
              key={zone.id}
              className={cn(
                "w-full text-right p-1.5 rounded text-xs hover:bg-muted transition-colors",
                selectedElementId === zone.id &&
                  selectedElementType === "zone" &&
                  "bg-muted ring-1 ring-primary"
              )}
              onClick={() => onElementSelect(zone.id, "zone")}
            >
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-muted-foreground text-[10px]">({zone.tables.length})</span>
                <span className="font-medium truncate">{zone.name}</span>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: zone.color }}
                />
              </div>
            </button>
          ))}
          {floorPlan.venueAreas.map((area) => (
            <button
              key={area.id}
              className={cn(
                "w-full text-right p-1.5 rounded text-xs hover:bg-muted transition-colors",
                selectedElementId === area.id &&
                  selectedElementType === "area" &&
                  "bg-muted ring-1 ring-primary"
              )}
              onClick={() => onElementSelect(area.id, "area")}
            >
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-medium truncate">{area.name}</span>
                <span>{area.icon || "📍"}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Table to Selected Zone */}
      {selectedElementId && selectedElementType === "zone" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1 text-xs"
          onClick={async () => {
            const zone = floorPlan.zones.find((z) => z.id === selectedElementId);
            if (zone) {
              await onElementAdd("table", {
                zoneId: zone.id,
                name:
                  t("floorPlan.table", { defaultValue: "שולחן" }) + ` ${zone.tables.length + 1}`,
                seats: 4,
                positionX: 50,
                positionY: 50,
                width: 40,
                height: 40
              });
            }
          }}
        >
          <Plus className="h-3 w-3" />
          {t("floorPlan.addTable", { defaultValue: "הוסף שולחן" })}
        </Button>
      )}
    </div>
  );
}
