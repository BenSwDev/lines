/**
 * Properties Panel Component
 * Context-aware panel that shows different content based on selection
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Save, X, Palette } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PropertiesPanelProps {
  selectedElement: FloorPlanElement | null;
  selectedElements: FloorPlanElement[];
  onSave: (updates: Partial<FloorPlanElement>) => void;
  onDelete: (id: string) => void;
  onBulkAction?: (action: string, elementIds: string[]) => void;
  onCancel: () => void;
}

const COLOR_PALETTE = [
  { name: "כחול", value: "#3B82F6" },
  { name: "ירוק", value: "#10B981" },
  { name: "צהוב", value: "#F59E0B" },
  { name: "אדום", value: "#EF4444" },
  { name: "סגול", value: "#8B5CF6" }
];

export function PropertiesPanel({
  selectedElement,
  selectedElements,
  onSave,
  onDelete,
  onBulkAction,
  onCancel
}: PropertiesPanelProps) {
  const { t } = useTranslations();
  const [name, setName] = useState("");
  const [seats, setSeats] = useState("4");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].value);

  useEffect(() => {
    if (selectedElement) {
      setName(selectedElement.name);
      setSeats(selectedElement.seats?.toString() || "4");
      setSelectedColor(selectedElement.color || COLOR_PALETTE[0].value);
    }
  }, [selectedElement]);

  const handleSave = () => {
    if (selectedElement) {
      onSave({
        name: name.trim() || selectedElement.name,
        seats: selectedElement.type === "table" ? parseInt(seats) || 4 : undefined,
        color: selectedColor
      });
    }
  };

  // Context 1: Nothing Selected
  if (!selectedElement && selectedElements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center text-muted-foreground"
      >
        <p className="text-sm">{t("floorPlan.selectElement") || "בחר אלמנט לעריכה"}</p>
      </motion.div>
    );
  }

  // Context 2: Single Element Selected
  if (selectedElement && selectedElements.length <= 1) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-full"
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{t("floorPlan.editElement") || "ערוך אלמנט"}</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{selectedElement.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="prop-name">{t("common.name") || "שם"}</Label>
            <Input
              id="prop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("floorPlan.elementName") || "שם האובייקט"}
            />
          </div>

          {/* Seats Field (only for tables) */}
          {selectedElement.type === "table" && (
            <div className="space-y-2">
              <Label htmlFor="prop-seats">{t("floorPlan.seats") || "מושבים"}</Label>
              <Input
                id="prop-seats"
                type="number"
                min="1"
                max="20"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                placeholder="4"
              />
            </div>
          )}

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>{t("floorPlan.color") || "צבע"}</Label>
            <div className="flex gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === color.value
                      ? "border-primary scale-110 ring-2 ring-primary/20"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t space-y-2">
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {t("common.save") || "שמור"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => selectedElement && onDelete(selectedElement.id)}
            className="w-full gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete") || "מחק"}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Context 3: Multiple Elements Selected
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">
          {t("floorPlan.multipleSelected") || "נבחרו"} {selectedElements.length}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("floorPlan.bulkActionsDescription") || "פעולות על כל האלמנטים הנבחרים"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Bulk Actions */}
        <div className="space-y-2">
          <Label>{t("floorPlan.actions") || "פעולות"}</Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() =>
                onBulkAction?.(
                  "changeColor",
                  selectedElements.map((e) => e.id)
                )
              }
            >
              <Palette className="h-4 w-4" />
              {t("floorPlan.changeColor") || "שנה צבע לכולם"}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() =>
                onBulkAction?.(
                  "moveToZone",
                  selectedElements.map((e) => e.id)
                )
              }
            >
              {t("floorPlan.moveToZone") || "העבר לאזור..."}
            </Button>
          </div>
        </div>

        {/* Selected Elements List */}
        <div className="space-y-2">
          <Label>{t("floorPlan.selectedElements") || "אלמנטים נבחרים"}</Label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {selectedElements.map((element) => (
              <Card key={element.id} className="p-2">
                <p className="text-sm truncate">{element.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="destructive"
          onClick={() =>
            onBulkAction?.(
              "delete",
              selectedElements.map((e) => e.id)
            )
          }
          className="w-full gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {t("floorPlan.deleteAll") || "מחק הכל"}
        </Button>
      </div>
    </motion.div>
  );
}
