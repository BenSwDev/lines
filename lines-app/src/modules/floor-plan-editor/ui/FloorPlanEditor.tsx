"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, FileText, Users, DollarSign, Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FloorPlanViewer } from "./viewer/FloorPlanViewer";
import { ContentEditor } from "./modes/ContentEditor";
import { StaffingEditor } from "./modes/StaffingEditor";
import { MinimumOrderEditor } from "./modes/MinimumOrderEditor";
import type { EditorMode, FloorPlanWithDetails, Zone, Table } from "../types";

interface FloorPlanEditorProps {
  venueId: string;
  floorPlan: FloorPlanWithDetails;
  roles?: { id: string; name: string; color: string }[];
}

export function FloorPlanEditor({ venueId, floorPlan, roles = [] }: FloorPlanEditorProps) {
  const router = useRouter();
  const [mode, setMode] = useState<EditorMode>("view");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<"zone" | "table" | "area" | null>(
    null
  );
  const [isSaving] = useState(false);

  // Check if floor plan is locked - only allow editing in view mode if locked
  const isLocked = floorPlan.isLocked;
  const canEdit = !isLocked;

  const handleBack = () => {
    router.push(`/venues/${venueId}/settings/structure`);
  };

  const handleElementSelect = useCallback(
    (id: string | null, type: "zone" | "table" | "area" | null) => {
      setSelectedElementId(id);
      setSelectedElementType(type);
    },
    []
  );

  const getSelectedZone = (): Zone | null => {
    if (!selectedElementId || selectedElementType !== "zone") return null;
    return floorPlan.zones.find((z) => z.id === selectedElementId) ?? null;
  };

  const getSelectedTable = (): Table | null => {
    if (!selectedElementId || selectedElementType !== "table") return null;
    for (const zone of floorPlan.zones) {
      const table = zone.tables.find((t) => t.id === selectedElementId);
      if (table) return table;
    }
    return null;
  };

  const tabs = [
    { id: "view", label: "מבנה מקום כללי", icon: Eye },
    { id: "content", label: "תכולה", icon: FileText },
    { id: "staffing", label: "סידור עבודה", icon: Users },
    { id: "minimum-order", label: "מינימום", icon: DollarSign }
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{floorPlan.name}</h1>
            <p className="text-sm text-muted-foreground">{floorPlan.description || "אין תיאור"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            הגדרות
          </Button>
          <Button size="sm" className="gap-2" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "שומר..." : "שמור"}
          </Button>
        </div>
      </div>

      {/* Locked Warning */}
      {isLocked && (
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
            <span>🔒</span>
            <span>המפה נעולה - ניתן לצפות בלבד. כדי לערוך, יש לבטל את הנעילה בהגדרות המפה.</span>
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => {
          // If locked, only allow view mode
          if (isLocked && v !== "view") {
            return;
          }
          setMode(v as EditorMode);
        }}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-6">
          <TabsList className="h-12 bg-transparent gap-4">
            {tabs.map((tab) => {
              const isDisabled = isLocked && tab.id !== "view";
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={isDisabled}
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                    "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                    "rounded-none px-4 gap-2",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Canvas */}
          <div className="flex-1 p-4 overflow-auto bg-muted/30">
            <TabsContent value="view" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                mode="view"
              />
            </TabsContent>
            <TabsContent value="content" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                mode="content"
              />
            </TabsContent>
            <TabsContent value="staffing" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                mode="staffing"
              />
            </TabsContent>
            <TabsContent value="minimum-order" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                mode="minimum-order"
              />
            </TabsContent>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-background overflow-y-auto">
            <TabsContent value="view" className="m-0">
              <ViewSidebar
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                selectedElementType={selectedElementType}
                onElementSelect={handleElementSelect}
              />
            </TabsContent>
            <TabsContent value="content" className="m-0">
              {canEdit ? (
                <ContentEditor
                  selectedZone={getSelectedZone()}
                  selectedTable={getSelectedTable()}
                  floorPlan={floorPlan}
                  onElementSelect={handleElementSelect}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>המפה נעולה - לא ניתן לערוך</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="staffing" className="m-0">
              {canEdit ? (
                <StaffingEditor
                  selectedZone={getSelectedZone()}
                  selectedTable={getSelectedTable()}
                  floorPlan={floorPlan}
                  roles={roles}
                  onElementSelect={handleElementSelect}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>המפה נעולה - לא ניתן לערוך</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="minimum-order" className="m-0">
              {canEdit ? (
                <MinimumOrderEditor
                  selectedZone={getSelectedZone()}
                  selectedTable={getSelectedTable()}
                  floorPlan={floorPlan}
                  onElementSelect={handleElementSelect}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>המפה נעולה - לא ניתן לערוך</p>
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

// View Mode Sidebar
interface ViewSidebarProps {
  floorPlan: FloorPlanWithDetails;
  selectedElementId: string | null;
  selectedElementType: "zone" | "table" | "area" | null;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

function ViewSidebar({
  floorPlan,
  selectedElementId,
  selectedElementType,
  onElementSelect
}: ViewSidebarProps) {
  const [filters, setFilters] = useState({
    showZones: true,
    showTables: true,
    showBars: true,
    showAreas: true
  });

  // Calculate stats
  const totalZones = floorPlan.zones.length;
  const totalTables = floorPlan.zones.reduce((acc, z) => acc + z.tables.length, 0);
  const totalSeats = floorPlan.zones.reduce(
    (acc, z) => acc + z.tables.reduce((acc2, table) => acc2 + (table.seats ?? 0), 0),
    0
  );
  const barCount = floorPlan.venueAreas.filter((a) => a.areaType === "bar").length;

  return (
    <div className="p-4 space-y-6">
      {/* Stats Summary */}
      <div className="space-y-2">
        <h3 className="font-semibold">📊 סיכום</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{totalZones}</div>
            <div className="text-muted-foreground">איזורים</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{totalTables}</div>
            <div className="text-muted-foreground">שולחנות</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{totalSeats}</div>
            <div className="text-muted-foreground">מושבים</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{barCount}</div>
            <div className="text-muted-foreground">ברים</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <h3 className="font-semibold">🔍 סינון תצוגה</h3>
        <div className="space-y-2">
          {[
            { key: "showZones", label: "איזורים" },
            { key: "showTables", label: "שולחנות" },
            { key: "showBars", label: "ברים" },
            { key: "showAreas", label: "אזורים מיוחדים" }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Element List */}
      <div className="space-y-2">
        <h3 className="font-semibold">📋 אלמנטים</h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
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
                  <span className="text-muted-foreground ml-auto">({zone.tables.length})</span>
                </div>
              </button>
              {/* Tables under zone */}
              <div className="ml-4 space-y-0.5">
                {zone.tables.map((table) => (
                  <button
                    key={table.id}
                    className={cn(
                      "w-full text-left p-1.5 rounded text-xs hover:bg-muted/50 transition-colors",
                      selectedElementId === table.id &&
                        selectedElementType === "table" &&
                        "bg-muted ring-1 ring-primary"
                    )}
                    onClick={() => onElementSelect(table.id, "table")}
                  >
                    <span>{table.name}</span>
                    {table.seats && (
                      <span className="text-muted-foreground ml-1">({table.seats} מושבים)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FloorPlanEditor;
