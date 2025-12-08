"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, FileText, Users, DollarSign, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/core/i18n/provider";
import { FloorPlanViewer } from "./viewer/FloorPlanViewer";
import { ContentEditor } from "./modes/ContentEditor";
import { StaffingEditor } from "./modes/StaffingEditor";
import { MinimumOrderEditor } from "./modes/MinimumOrderEditor";
import { StructureBuilder } from "./modes/StructureBuilder";
import {
  createZone,
  createTable,
  createVenueArea,
  deleteZone,
  deleteTable,
  deleteVenueArea
} from "../actions/floorPlanActions";
import type { EditorMode, FloorPlanWithDetails, Zone, Table } from "../types";

interface FloorPlanEditorProps {
  venueId: string;
  floorPlan: FloorPlanWithDetails;
  roles?: { id: string; name: string; color: string }[];
}

export function FloorPlanEditor({ venueId, floorPlan, roles = [] }: FloorPlanEditorProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [mode, setMode] = useState<EditorMode>("view");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<"zone" | "table" | "area" | null>(
    null
  );

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

  const handleElementAdd = async (
    type: "zone" | "table" | "area",
    data: unknown
  ): Promise<void> => {
    try {
      if (type === "zone") {
        const result = await createZone(data);
        if (result.success && result.data) {
          router.refresh();
        }
      } else if (type === "table") {
        // Need zoneId for table - should be passed in data
        const result = await createTable(data);
        if (result.success && result.data) {
          router.refresh();
        }
      } else if (type === "area") {
        const result = await createVenueArea(data);
        if (result.success && result.data) {
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error adding element:", error);
    }
  };

  const handleElementDelete = async (
    id: string,
    type: "zone" | "table" | "area"
  ): Promise<void> => {
    try {
      if (type === "zone") {
        await deleteZone(id);
      } else if (type === "table") {
        await deleteTable(id);
      } else if (type === "area") {
        await deleteVenueArea(id);
      }
      router.refresh();
    } catch (error) {
      console.error("Error deleting element:", error);
    }
  };

  const tabs = [
    {
      id: "view",
      label: t("floorPlan.generalStructure", { defaultValue: "מבנה מקום כללי" }),
      icon: Eye
    },
    { id: "content", label: t("floorPlan.contentMode", { defaultValue: "תכולה" }), icon: FileText },
    {
      id: "staffing",
      label: t("floorPlan.staffingMode", { defaultValue: "סידור עבודה" }),
      icon: Users
    },
    {
      id: "minimum-order",
      label: t("floorPlan.minimumOrderMode", { defaultValue: "מינימום" }),
      icon: DollarSign
    }
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
            {floorPlan.description && (
              <p className="text-sm text-muted-foreground">{floorPlan.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLocked && (
            <span className="text-sm text-muted-foreground">
              🔒 {t("floorPlan.locked", { defaultValue: "נעול" })}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleBack}>
            <Settings className="h-4 w-4 mr-2" />
            {t("floorPlan.settings", { defaultValue: "הגדרות" })}
          </Button>
        </div>
      </div>

      {/* Locked Warning */}
      {isLocked && (
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
            <span>🔒</span>
            <span>
              {t("floorPlan.lockedViewOnly", {
                defaultValue:
                  "המפה נעולה - ניתן לצפות בלבד. כדי לערוך, יש לבטל את הנעילה בהגדרות המפה."
              })}
            </span>
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
        <div className="flex-1 flex overflow-hidden flex-row-reverse">
          {/* Sidebar - Right side for Hebrew */}
          <div className="w-80 border-r bg-background overflow-y-auto">
            <TabsContent value="view" className="m-0">
              <StructureBuilder
                floorPlan={floorPlan}
                venueId={venueId}
                selectedElementId={selectedElementId}
                selectedElementType={selectedElementType}
                onElementSelect={handleElementSelect}
                onElementAdd={handleElementAdd}
                onElementDelete={handleElementDelete}
                canEdit={canEdit}
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
                  <p>
                    {t("floorPlan.lockedCannotEdit", {
                      defaultValue: "המפה נעולה - לא ניתן לערוך"
                    })}
                  </p>
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
                  <p>
                    {t("floorPlan.lockedCannotEdit", {
                      defaultValue: "המפה נעולה - לא ניתן לערוך"
                    })}
                  </p>
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
                  <p>
                    {t("floorPlan.lockedCannotEdit", {
                      defaultValue: "המפה נעולה - לא ניתן לערוך"
                    })}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 p-4 overflow-auto bg-muted/30">
            <TabsContent value="view" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                onElementDelete={handleElementDelete}
                mode="view"
                canEdit={canEdit}
              />
            </TabsContent>
            <TabsContent value="content" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                mode="content"
                canEdit={canEdit}
              />
            </TabsContent>
            <TabsContent value="staffing" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                mode="staffing"
                canEdit={canEdit}
              />
            </TabsContent>
            <TabsContent value="minimum-order" className="m-0 h-full">
              <FloorPlanViewer
                floorPlan={floorPlan}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                mode="minimum-order"
                canEdit={canEdit}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export default FloorPlanEditor;
