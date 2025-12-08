"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, FileText, Users, DollarSign, Save, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
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
  deleteVenueArea,
  updateFloorPlan
} from "../actions/floorPlanActions";
import type { EditorMode, FloorPlanWithDetails, Zone, Table } from "../types";

interface FloorPlanEditorProps {
  venueId: string;
  floorPlan: FloorPlanWithDetails;
  roles?: {
    id: string;
    name: string;
    color: string;
    canManage?: boolean;
    requiresStaffing?: boolean;
  }[];
}

export function FloorPlanEditor({ venueId, floorPlan, roles = [] }: FloorPlanEditorProps) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<EditorMode>("view");

  // Check for mode in URL query params
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode && ["view", "content", "staffing", "minimum-order"].includes(urlMode)) {
      setMode(urlMode as EditorMode);
    }
  }, [searchParams]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<"zone" | "table" | "area" | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [floorPlanName, setFloorPlanName] = useState(floorPlan.name);
  const [isSavingName, setIsSavingName] = useState(false);

  // Check if floor plan is locked - only allow editing in view mode if locked
  const isLocked = floorPlan.isLocked;
  const canEdit = !isLocked;

  const handleBack = () => {
    router.push(`/venues/${venueId}/settings/structure`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Refresh to save all current state
      router.refresh();
      // Small delay to show saving state
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditName = () => {
    if (!canEdit) return;
    setIsEditingName(true);
    setFloorPlanName(floorPlan.name);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setFloorPlanName(floorPlan.name);
  };

  const handleSaveName = async () => {
    if (!floorPlanName.trim()) {
      setFloorPlanName(floorPlan.name);
      setIsEditingName(false);
      return;
    }

    if (floorPlanName === floorPlan.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const result = await updateFloorPlan({
        id: floorPlan.id,
        name: floorPlanName.trim()
      });
      if (result.success) {
        toast({
          title: t("success.detailsUpdated", { defaultValue: "עודכן בהצלחה" }),
          description: t("floorPlan.nameUpdated", { defaultValue: "שם המפה עודכן בהצלחה" })
        });
        setIsEditingName(false);
        router.refresh();
      } else {
        toast({
          title: t("errors.generic", { defaultValue: "שגיאה" }),
          description: result.error || t("errors.savingData", { defaultValue: "שגיאה בשמירה" }),
          variant: "destructive"
        });
        setFloorPlanName(floorPlan.name);
        setIsEditingName(false);
      }
    } catch (error) {
      toast({
        title: t("errors.generic", { defaultValue: "שגיאה" }),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
      setFloorPlanName(floorPlan.name);
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
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
      let result;
      if (type === "zone") {
        result = await createZone(data);
      } else if (type === "table") {
        result = await createTable(data);
      } else if (type === "area") {
        result = await createVenueArea(data);
      } else {
        return;
      }

      if (result?.success) {
        toast({
          title: t("success.created", { defaultValue: "נוצר בהצלחה" }),
          description: t(`floorPlan.${type}Created`, {
            defaultValue: `${type === "zone" ? "איזור" : type === "table" ? "שולחן" : "אזור"} נוצר בהצלחה`
          })
        });
          router.refresh();
      } else {
        toast({
          title: t("errors.generic", { defaultValue: "שגיאה" }),
          description: result?.error || t("errors.creating", { defaultValue: "שגיאה ביצירה" }),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic", { defaultValue: "שגיאה" }),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    }
  };

  const handleElementDelete = async (
    id: string,
    type: "zone" | "table" | "area"
  ): Promise<void> => {
    try {
      let result;
      if (type === "zone") {
        result = await deleteZone(id);
      } else if (type === "table") {
        result = await deleteTable(id);
      } else if (type === "area") {
        result = await deleteVenueArea(id);
      } else {
        return;
      }

      if (result?.success) {
        toast({
          title: t("success.deleted", { defaultValue: "נמחק בהצלחה" }),
          description: t(`floorPlan.${type}Deleted`, {
            defaultValue: `${type === "zone" ? "איזור" : type === "table" ? "שולחן" : "אזור"} נמחק בהצלחה`
          })
        });
      router.refresh();
      } else {
        toast({
          title: t("errors.generic", { defaultValue: "שגיאה" }),
          description: result?.error || t("errors.deleting", { defaultValue: "שגיאה במחיקה" }),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic", { defaultValue: "שגיאה" }),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    }
  };

  const tabs = [
    {
      id: "view",
      label: t("floorPlan.generalStructure", { defaultValue: "מבנה מקום כללי" }),
      icon: Eye
    },
    {
      id: "content",
      label: t("floorPlan.contentMode", { defaultValue: "סידור הושבה" }),
      icon: FileText
    },
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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={floorPlanName}
                  onChange={(e) => setFloorPlanName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveName();
                    } else if (e.key === "Escape") {
                      handleCancelEditName();
                    }
                  }}
                  disabled={isSavingName}
                  className="text-xl font-semibold h-9"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveName}
                  disabled={isSavingName || !floorPlanName.trim()}
                  className="h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEditName}
                  disabled={isSavingName}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl font-semibold">{floorPlan.name}</h1>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartEditName}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
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
          {canEdit && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t("floorPlan.saving") : t("floorPlan.save")}
            </Button>
          )}
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
        <div className="flex-1 flex overflow-hidden flex-row-reverse min-h-0">
          {/* Sidebar - Right side for Hebrew - Fixed width, no expansion */}
          <div className="w-80 border-r bg-background overflow-y-auto flex-shrink-0">
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
                  venueId={venueId}
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
                  venueId={venueId}
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
          <div className="flex-1 p-4 overflow-auto bg-muted/30 min-w-0">
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
