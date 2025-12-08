/**
 * List Tab Component
 * Shows all elements in a list with quick add buttons
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, MapPin, ChefHat, Trash2, Edit2, CheckSquare, Square } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ListTabProps {
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
}

export function ListTab({
  elements,
  selectedElementId,
  selectedElementIds,
  onSelectElement,
  onAddTable,
  onAddZone,
  onAddArea,
  onDeleteElement,
  onEditElement,
  onBulkAction
}: ListTabProps) {
  const { t } = useTranslations();
  const [bulkMode, setBulkMode] = useState(false);

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    if (bulkMode) {
      // Clear selection when exiting bulk mode
      selectedElementIds.forEach((id) => {
        // Clear selection logic would go here
      });
    }
  };

  const handleToggleSelect = (elementId: string) => {
    if (bulkMode) {
      // Toggle selection in bulk mode
      const newSelection = new Set(selectedElementIds);
      if (newSelection.has(elementId)) {
        newSelection.delete(elementId);
      } else {
        newSelection.add(elementId);
      }
      // Update selection - would need callback
    } else {
      onSelectElement(elementId);
    }
  };

  const getElementIcon = (element: FloorPlanElement) => {
    switch (element.type) {
      case "table":
        return <Table className="h-4 w-4" />;
      case "zone":
        return <MapPin className="h-4 w-4" />;
      case "specialArea":
        return <ChefHat className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
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

  // Group elements by type
  const tables = elements.filter((e) => e.type === "table");
  const zones = elements.filter((e) => e.type === "zone");
  const areas = elements.filter((e) => e.type === "specialArea");

  return (
    <div className="flex flex-col h-full">
      {/* Quick Add Buttons */}
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
            onClick={onAddZone}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">{t("floorPlan.zone") || "אזור"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-col gap-1 h-auto py-3"
            onClick={onAddArea}
          >
            <ChefHat className="h-5 w-5" />
            <span className="text-xs">{t("floorPlan.area") || "מטבח"}</span>
          </Button>
        </div>

        {/* Bulk Mode Toggle */}
        {elements.length > 0 && (
          <Button size="sm" variant="ghost" className="w-full" onClick={handleToggleBulkMode}>
            {bulkMode ? (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                {t("floorPlan.exitBulkMode") || "יציאה ממצב בחירה מרובה"}
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-2" />
                {t("floorPlan.bulkMode") || "בחירה מרובה"}
              </>
            )}
          </Button>
        )}
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
            {/* Tables */}
            {tables.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  {t("floorPlan.tables") || "שולחנות"} ({tables.length})
                </h3>
                <div className="space-y-2">
                  {tables.map((element, index) => (
                    <motion.div
                      key={element.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
                          selectedElementId === element.id && "ring-2 ring-primary",
                          bulkMode && selectedElementIds.has(element.id) && "bg-primary/10"
                        )}
                        onClick={() => handleToggleSelect(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {bulkMode && (
                              <div className="flex-shrink-0">
                                {selectedElementIds.has(element.id) ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            )}
                            {getElementIcon(element)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{element.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {getElementInfo(element)}
                              </p>
                            </div>
                          </div>
                          {!bulkMode && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditElement(element);
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
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Zones */}
            {zones.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  {t("floorPlan.zones") || "אזורים"} ({zones.length})
                </h3>
                <div className="space-y-2">
                  {zones.map((element, index) => (
                    <motion.div
                      key={element.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
                          selectedElementId === element.id && "ring-2 ring-primary",
                          bulkMode && selectedElementIds.has(element.id) && "bg-primary/10"
                        )}
                        onClick={() => handleToggleSelect(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {bulkMode && (
                              <div className="flex-shrink-0">
                                {selectedElementIds.has(element.id) ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            )}
                            {getElementIcon(element)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{element.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {getElementInfo(element)}
                              </p>
                            </div>
                          </div>
                          {!bulkMode && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditElement(element);
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
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Areas */}
            {areas.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  {t("floorPlan.areas") || "אזורים מיוחדים"} ({areas.length})
                </h3>
                <div className="space-y-2">
                  {areas.map((element, index) => (
                    <motion.div
                      key={element.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
                          selectedElementId === element.id && "ring-2 ring-primary",
                          bulkMode && selectedElementIds.has(element.id) && "bg-primary/10"
                        )}
                        onClick={() => handleToggleSelect(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {bulkMode && (
                              <div className="flex-shrink-0">
                                {selectedElementIds.has(element.id) ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            )}
                            {getElementIcon(element)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{element.name}</p>
                            </div>
                          </div>
                          {!bulkMode && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditElement(element);
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
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            <AnimatePresence>
              {bulkMode && selectedElementIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="sticky bottom-0 bg-card border-t p-4 space-y-2"
                >
                  <p className="text-sm font-medium">
                    {selectedElementIds.size} {t("floorPlan.selected") || "נבחרו"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onBulkAction?.("changeColor", Array.from(selectedElementIds))}
                    >
                      {t("floorPlan.changeColor") || "שנה צבע"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onBulkAction?.("delete", Array.from(selectedElementIds))}
                    >
                      {t("common.delete") || "מחק"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
