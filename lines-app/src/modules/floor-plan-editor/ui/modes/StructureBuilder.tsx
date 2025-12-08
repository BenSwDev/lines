"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
  const [activeTool, setActiveTool] = useState<"zone" | "bar" | "area" | null>(null);
  const [newElementName, setNewElementName] = useState("");

  // Zone types
  const zoneTypes = [
    { id: "seating", label: "איזור שולחנות", icon: "🪑", color: "#3B82F6" },
    { id: "vip", label: "VIP", icon: "⭐", color: "#F59E0B" }
  ];

  // Venue area types (special areas - no settings)
  const areaTypes = [
    { id: "bar", label: "בר", icon: "🍸", color: "#10B981" },
    { id: "entrance", label: "כניסה", icon: "🚪", color: "#6B7280" },
    { id: "restroom", label: "שירותים", icon: "🚻", color: "#8B5CF6" },
    { id: "kitchen", label: "מטבח", icon: "👨‍🍳", color: "#EF4444" },
    { id: "stage", label: "במה", icon: "🎤", color: "#EC4899" },
    { id: "dj_booth", label: "די ג'יי", icon: "🎧", color: "#6366F1" },
    { id: "storage", label: "מחסן", icon: "📦", color: "#78716C" }
  ];

  const handleAddZone = async (zoneType: (typeof zoneTypes)[0]) => {
    const name = newElementName.trim() || `${zoneType.label} 1`;
    await onElementAdd("zone", {
      floorPlanId: floorPlan.id,
      venueId,
      name,
      color: zoneType.color,
      positionX: 100,
      positionY: 100,
      width: 200,
      height: 150
    });

    setNewElementName("");
    setActiveTool(null);
  };

  const handleAddArea = async (areaType: (typeof areaTypes)[0]) => {
    await onElementAdd("area", {
      floorPlanId: floorPlan.id,
      venueId,
      areaType: areaType.id,
      name: newElementName || areaType.label,
      positionX: 100,
      positionY: 100,
      width: 150,
      height: 150,
      color: areaType.color,
      icon: areaType.icon
    });

    setNewElementName("");
    setActiveTool(null);
  };

  const handleDelete = async () => {
    if (!selectedElementId || !selectedElementType) return;
    await onElementDelete(selectedElementId, selectedElementType);
    onElementSelect(null, null);
  };

  if (!canEdit) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>המפה נעולה - לא ניתן לערוך</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Add Elements Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">➕ הוסף אלמנטים</h3>

        {/* Zones */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">איזורים</Label>
          <div className="grid grid-cols-2 gap-2">
            {zoneTypes.map((zoneType) => (
              <Button
                key={zoneType.id}
                variant={activeTool === zoneType.id ? "default" : "outline"}
                size="sm"
                className="gap-2 justify-start"
                onClick={() => {
                  setActiveTool(activeTool === zoneType.id ? null : (zoneType.id as "zone"));
                  setNewElementName("");
                }}
              >
                <span>{zoneType.icon}</span>
                <span className="text-xs">{zoneType.label}</span>
              </Button>
            ))}
          </div>
          {activeTool === "zone" && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <Input
                placeholder="שם האיזור"
                value={newElementName}
                onChange={(e) => setNewElementName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && zoneTypes[0]) {
                    handleAddZone(zoneTypes[0]);
                  }
                }}
              />
              <Button size="sm" className="w-full" onClick={() => handleAddZone(zoneTypes[0])}>
                הוסף איזור
              </Button>
            </div>
          )}
        </div>

        {/* Special Areas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">איזורים מיוחדים</Label>
          <div className="grid grid-cols-2 gap-2">
            {areaTypes.map((areaType) => (
              <Button
                key={areaType.id}
                variant={activeTool === areaType.id ? "default" : "outline"}
                size="sm"
                className="gap-2 justify-start"
                onClick={() => {
                  setActiveTool(
                    activeTool === areaType.id ? null : (areaType.id as "bar" | "area")
                  );
                  setNewElementName(areaType.label);
                }}
              >
                <span>{areaType.icon}</span>
                <span className="text-xs">{areaType.label}</span>
              </Button>
            ))}
          </div>
          {activeTool && areaTypes.find((a) => a.id === activeTool) && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <Input
                placeholder="שם האיזור"
                value={newElementName}
                onChange={(e) => setNewElementName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const areaType = areaTypes.find((a) => a.id === activeTool);
                    if (areaType) handleAddArea(areaType);
                  }
                }}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  const areaType = areaTypes.find((a) => a.id === activeTool);
                  if (areaType) handleAddArea(areaType);
                }}
              >
                הוסף איזור מיוחד
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Element Info */}
      {selectedElementId && selectedElementType && (
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {selectedElementType === "zone" && "איזור נבחר"}
              {selectedElementType === "table" && "שולחן נבחר"}
              {selectedElementType === "area" && "איזור מיוחד נבחר"}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
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
          <p className="text-xs text-muted-foreground">💡 גרור, שנה גודל וסובב ישירות במפה</p>
        </div>
      )}

      {/* Elements List */}
      <div className="space-y-2">
        <h3 className="font-semibold">📋 אלמנטים במפה</h3>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {/* Zones */}
          {floorPlan.zones.map((zone) => (
            <div key={zone.id}>
              <button
                className={cn(
                  "w-full text-left p-2 rounded-lg text-sm hover:bg-muted transition-colors",
                  selectedElementId === zone.id &&
                    selectedElementType === "zone" &&
                    "bg-muted ring-2 ring-primary"
                )}
                onClick={() => onElementSelect(zone.id, "zone")}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                  <span className="font-medium">{zone.name}</span>
                  <span className="text-muted-foreground ml-auto">
                    ({zone.tables.length} שולחנות)
                  </span>
                </div>
              </button>
              {/* Add table button for zone */}
              {selectedElementId === zone.id && selectedElementType === "zone" && (
                <button
                  className="w-full text-left p-1.5 pl-8 text-xs text-primary hover:bg-primary/10 rounded"
                  onClick={async () => {
                    await onElementAdd("table", {
                      zoneId: zone.id,
                      name: `שולחן ${zone.tables.length + 1}`,
                      seats: 4,
                      positionX: 50,
                      positionY: 50,
                      width: 40,
                      height: 40
                    });
                  }}
                >
                  + הוסף שולחן
                </button>
              )}
            </div>
          ))}

          {/* Special Areas */}
          {floorPlan.venueAreas.map((area) => (
            <button
              key={area.id}
              className={cn(
                "w-full text-left p-2 rounded-lg text-sm hover:bg-muted transition-colors",
                selectedElementId === area.id &&
                  selectedElementType === "area" &&
                  "bg-muted ring-2 ring-primary"
              )}
              onClick={() => onElementSelect(area.id, "area")}
            >
              <div className="flex items-center gap-2">
                <span>{area.icon || "📍"}</span>
                <span className="font-medium">{area.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
