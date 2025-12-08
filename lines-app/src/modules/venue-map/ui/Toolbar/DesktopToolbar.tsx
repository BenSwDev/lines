/**
 * Desktop Toolbar Component
 * Full-featured toolbar for desktop/tablet
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Plus,
  Save,
  Minimize2,
  Maximize2,
  Undo2,
  Redo2,
  Wand2,
  AlertCircle
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DesktopToolbarProps {
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
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isTablet?: boolean;
}

export function DesktopToolbar({
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
  canRedo = false,
  isFullscreen = false,
  onToggleFullscreen,
  isTablet = false
}: DesktopToolbarProps) {
  const { t } = useTranslations();

  return (
    <TooltipProvider>
      <div
        className={`flex shrink-0 items-center justify-between rounded-lg border bg-card p-3 shadow-sm gap-3 ${
          isTablet ? "flex-wrap" : ""
        }`}
      >
        {/* Left Side: Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {simpleMode ? (
            /* Simple Mode Toolbar */
            <>
              <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="default"
                      variant="default"
                      className="gap-2"
                      onClick={onTemplateClick}
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("floorPlan.templates") || "התחל עם תבנית"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {t("floorPlan.templates") || "התחל עם תבנית"}
                      </div>
                      <div className="text-xs">בחר תבנית מוכנה או התחל מאפס</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="default"
                      className="gap-2"
                      onClick={onAddElementClick}
                    >
                      <Plus className="h-4 w-4" />
                      {t("floorPlan.addElement") || "הוסף שולחן או אזור"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {t("floorPlan.addElement") || "הוסף שולחן או אזור"}
                      </div>
                      <div className="text-xs">הוסף שולחן, אזור או אובייקט אחר</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button
                variant="outline"
                onClick={onToggleSimpleMode}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                {t("floorPlan.advancedMode") || "מצב מתקדם"}
              </Button>
            </>
          ) : (
            /* Advanced Mode Toolbar */
            <>
              {/* Templates */}
              <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="default"
                      variant="default"
                      className="gap-2"
                      onClick={onTemplateClick}
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("floorPlan.templates") || "תבניות"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {t("floorPlan.templates") || "תבניות"}
                      </div>
                      <div className="text-xs">בחר תבנית מוכנה</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Add Element */}
              <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="default"
                      className="gap-2"
                      onClick={onAddElementClick}
                    >
                      <Plus className="h-4 w-4" />
                      {t("floorPlan.addElement") || "הוסף"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {t("floorPlan.addElement") || "הוסף"}
                      </div>
                      <div className="text-xs">הוסף שולחן, אזור או אובייקט</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* History */}
              {(onUndo || onRedo) && (
                <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onUndo}
                        disabled={!canUndo}
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>{t("common.undo") || "בטל"}</div>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRedo}
                        disabled={!canRedo}
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>{t("common.redo") || "חזור"}</div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Auto Fix */}
              {onAutoFix && validationWarningsCount > 0 && (
                <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onAutoFix}
                        className="gap-2"
                      >
                        <Wand2 className="h-4 w-4" />
                        {t("floorPlan.autoFix") || "תיקון אוטומטי"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {t("floorPlan.autoFix") || "תיקון אוטומטי"}
                        </div>
                        <div className="text-xs">
                          {validationWarningsCount} {t("floorPlan.warnings") || "אזהרות"}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationWarningsCount}
                  </div>
                </div>
              )}

              {/* Toggle Simple Mode */}
              <Button
                variant="outline"
                onClick={onToggleSimpleMode}
                className="gap-2"
              >
                <Minimize2 className="h-4 w-4" />
                {t("floorPlan.simpleMode") || "מצב פשוט"}
              </Button>
            </>
          )}
        </div>

        {/* Right Side: Stats and Save */}
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="text-sm text-muted-foreground hidden md:block">
            {tablesCount} {t("floorPlan.tables") || "שולחנות"} • {totalCapacity}{" "}
            {t("common.seats") || "מושבים"}
          </div>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen
                  ? t("floorPlan.exitFullscreen") || "יציאה ממסך מלא"
                  : t("floorPlan.fullscreen") || "מסך מלא"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onSaveClick}
                disabled={isSaving}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? t("common.loading") : t("common.save")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">{t("floorPlan.saveMap") || "שמירת מפה"}</div>
                <div className="text-xs">
                  {t("floorPlan.saveMapDescription") ||
                    "נשמרים: שולחנות, אזורים, כניסות, יציאות, מטבח, שירותים"}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

