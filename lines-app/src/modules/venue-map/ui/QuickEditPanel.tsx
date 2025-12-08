/**
 * Quick Edit Panel Component
 * Simple inline editing panel with only 3 fields: name, seats, color
 * "גאוני כמה שזה פשוט" - עריכה מהירה ופשוטה
 */

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Check } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "./FloorPlanEditorV2";

interface QuickEditPanelProps {
  element: FloorPlanElement;
  onSave: (updates: Partial<FloorPlanElement>) => void;
  onCancel: () => void;
  position?: { x: number; y: number };
  className?: string;
}

// Predefined color palette - simple and beautiful
const COLOR_PALETTE = [
  { name: "כחול", value: "#3B82F6", bg: "bg-blue-500" },
  { name: "ירוק", value: "#10B981", bg: "bg-green-500" },
  { name: "צהוב", value: "#F59E0B", bg: "bg-yellow-500" },
  { name: "אדום", value: "#EF4444", bg: "bg-red-500" },
  { name: "סגול", value: "#8B5CF6", bg: "bg-purple-500" }
];

export function QuickEditPanel({
  element,
  onSave,
  onCancel,
  position,
  className = ""
}: QuickEditPanelProps) {
  const { t } = useTranslations();
  const [name, setName] = useState(element.name);
  const [seats, setSeats] = useState(element.seats?.toString() || "4");
  const [selectedColor, setSelectedColor] = useState(element.color || COLOR_PALETTE[0].value);

  useEffect(() => {
    setName(element.name);
    setSeats(element.seats?.toString() || "4");
    setSelectedColor(element.color || COLOR_PALETTE[0].value);
  }, [element]);

  const handleSave = () => {
    const updates: Partial<FloorPlanElement> = {
      name: name.trim() || element.name,
      seats: parseInt(seats) || 4,
      color: selectedColor
    };
    onSave(updates);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const panelStyle = position
    ? {
        position: "fixed" as const,
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000
      }
    : {};

  return (
    <Card
      className={`p-4 shadow-lg min-w-[280px] ${className}`}
      style={panelStyle}
      onKeyDown={handleKeyDown}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{t("floorPlan.quickEdit") || "עריכה מהירה"}</h3>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="quick-edit-name">{t("common.name") || "שם"}</Label>
          <Input
            id="quick-edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("floorPlan.elementName") || "שם האובייקט"}
            autoFocus
          />
        </div>

        {/* Seats Field (only for tables) */}
        {element.type === "table" && (
          <div className="space-y-2">
            <Label htmlFor="quick-edit-seats">{t("floorPlan.seats") || "מושבים"}</Label>
            <Input
              id="quick-edit-seats"
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
                } ${color.bg}`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {t("common.cancel") || "ביטול"}
          </Button>
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            {t("common.save") || "שמור"}
          </Button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-muted-foreground text-center">
          {t("floorPlan.quickEditHint") || "Ctrl+Enter לשמירה, Esc לביטול"}
        </p>
      </div>
    </Card>
  );
}
