/**
 * Mobile Toolbar Component
 * Bottom sheet toolbar for mobile devices
 */

"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sparkles, Plus, Save, Minimize2, Maximize2, Undo2, Redo2, Wand2 } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileToolbarProps {
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  onTemplateClick: () => void;
  onAddElementClick: () => void;
  onSaveClick: () => void;
  isSaving?: boolean;
  tablesCount?: number;
  totalCapacity?: number;
  validationWarningsCount?: number;
  onAutoFix?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function MobileToolbar({
  simpleMode,
  onToggleSimpleMode,
  onTemplateClick,
  onAddElementClick,
  onSaveClick,
  isSaving = false,
  tablesCount = 0,
  totalCapacity = 0,
  validationWarningsCount = 0,
  onAutoFix,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: MobileToolbarProps) {
  const { t } = useTranslations();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button - Always visible */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
        <Button
          onClick={onSaveClick}
          disabled={isSaving}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          aria-label={t("common.save")}
        >
          <Save className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Sheet Toolbar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 h-12 px-6 rounded-full shadow-lg"
            size="lg"
          >
            {simpleMode ? (
              <>
                <Plus className="h-5 w-5 mr-2" />
                {t("floorPlan.addElement") || "הוסף"}
              </>
            ) : (
              <>
                <Maximize2 className="h-5 w-5 mr-2" />
                {t("floorPlan.tools") || "כלים"}
              </>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh]">
          <div className="flex flex-col h-full">
            {/* Simple Mode */}
            {simpleMode ? (
              <div className="flex flex-col gap-4 p-4">
                <h3 className="text-lg font-semibold">
                  {t("floorPlan.quickActions") || "פעולות מהירות"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      onTemplateClick();
                      setSheetOpen(false);
                    }}
                    className="h-20 flex-col gap-2"
                    variant="outline"
                  >
                    <Sparkles className="h-6 w-6" />
                    <span className="text-sm">
                      {t("floorPlan.templates") || "תבניות"}
                    </span>
                  </Button>
                  <Button
                    onClick={() => {
                      onAddElementClick();
                      setSheetOpen(false);
                    }}
                    className="h-20 flex-col gap-2"
                    variant="outline"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">
                      {t("floorPlan.addElement") || "הוסף"}
                    </span>
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    onToggleSimpleMode();
                    setSheetOpen(false);
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  {t("floorPlan.advancedMode") || "מצב מתקדם"}
                </Button>
              </div>
            ) : (
              /* Advanced Mode */
              <div className="flex flex-col gap-4 p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold">
                  {t("floorPlan.tools") || "כלים"}
                </h3>
                
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      onTemplateClick();
                      setSheetOpen(false);
                    }}
                    className="h-20 flex-col gap-2"
                    variant="outline"
                  >
                    <Sparkles className="h-6 w-6" />
                    <span className="text-sm">
                      {t("floorPlan.templates") || "תבניות"}
                    </span>
                  </Button>
                  <Button
                    onClick={() => {
                      onAddElementClick();
                      setSheetOpen(false);
                    }}
                    className="h-20 flex-col gap-2"
                    variant="outline"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">
                      {t("floorPlan.addElement") || "הוסף"}
                    </span>
                  </Button>
                </div>

                {/* History */}
                {(onUndo || onRedo) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={onUndo}
                      disabled={!canUndo}
                      variant="outline"
                      className="flex-1"
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      {t("common.undo") || "בטל"}
                    </Button>
                    <Button
                      onClick={onRedo}
                      disabled={!canRedo}
                      variant="outline"
                      className="flex-1"
                    >
                      <Redo2 className="h-4 w-4 mr-2" />
                      {t("common.redo") || "חזור"}
                    </Button>
                  </div>
                )}

                {/* Auto Fix */}
                {onAutoFix && validationWarningsCount > 0 && (
                  <Button
                    onClick={() => {
                      onAutoFix();
                      setSheetOpen(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {t("floorPlan.autoFix") || "תיקון אוטומטי"} ({validationWarningsCount})
                  </Button>
                )}

                {/* Stats */}
                <div className="text-sm text-muted-foreground pt-4 border-t">
                  <div>
                    {tablesCount} {t("floorPlan.tables") || "שולחנות"}
                  </div>
                  <div>
                    {totalCapacity} {t("common.seats") || "מושבים"}
                  </div>
                </div>

                {/* Toggle Simple Mode */}
                <Button
                  onClick={() => {
                    onToggleSimpleMode();
                    setSheetOpen(false);
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  <Minimize2 className="h-4 w-4 mr-2" />
                  {t("floorPlan.simpleMode") || "מצב פשוט"}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

