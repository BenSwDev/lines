/**
 * Edit Panel Component
 * Clean editing interface with save/cancel and navigation
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save, X, Copy } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "../../types";

interface EditPanelProps {
  element: FloorPlanElement | null;
  allElements: FloorPlanElement[];
  onSave: (updates: Partial<FloorPlanElement>) => void;
  onCancel: () => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  canNavigateNext?: boolean;
  canNavigatePrevious?: boolean;
  onDuplicate?: (element: FloorPlanElement) => void;
}

export function EditPanel({
  element,
  allElements,
  onSave,
  onCancel,
  onNavigateNext,
  onNavigatePrevious,
  canNavigateNext = false,
  canNavigatePrevious = false,
  onDuplicate
}: EditPanelProps) {
  const { t } = useTranslations();
  const [name, setName] = useState("");
  const [seats, setSeats] = useState("");
  const [description, setDescription] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (element) {
      setName(element.name || "");
      setSeats(element.seats?.toString() || "4");
      setDescription(element.description || "");
      setHasChanges(false);
    }
  }, [element]);

  const handleChange = () => {
    if (!element) return;
    const nameChanged = name !== element.name;
    const seatsChanged = seats !== (element.seats?.toString() || "4");
    const descChanged = description !== (element.description || "");
    setHasChanges(nameChanged || seatsChanged || descChanged);
  };

  useEffect(() => {
    handleChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, seats, description, element]);

  const handleSave = () => {
    if (!element || !hasChanges) return;

    const updates: Partial<FloorPlanElement> = {
      name: name.trim() || element.name
    };

    if (element.type === "table") {
      updates.seats = parseInt(seats) || 4;
    }

    if (element.type === "zone") {
      updates.description = description.trim() || null;
    }

    onSave(updates);
    setHasChanges(false);
  };

  if (!element) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">{t("floorPlan.selectElement") || "בחר אלמנט לעריכה"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{t("floorPlan.editElement") || "ערוך אלמנט"}</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground truncate">{element.name}</p>
      </div>

      {/* Navigation */}
      {(canNavigateNext || canNavigatePrevious) && (
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigatePrevious}
            disabled={!canNavigatePrevious}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.previous") || "הקודם"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {allElements.findIndex((e) => e.id === element.id) + 1} / {allElements.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateNext}
            disabled={!canNavigateNext}
            className="gap-1"
          >
            {t("common.next") || "הבא"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="edit-name">{t("common.name") || "שם"}</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              handleChange();
            }}
            placeholder={t("floorPlan.elementName") || "שם האובייקט"}
          />
        </div>

        {/* Seats (for tables) */}
        {element.type === "table" && (
          <div className="space-y-2">
            <Label htmlFor="edit-seats">{t("floorPlan.seats") || "מושבים"}</Label>
            <Input
              id="edit-seats"
              type="number"
              min="1"
              max="50"
              value={seats}
              onChange={(e) => {
                setSeats(e.target.value);
                handleChange();
              }}
            />
          </div>
        )}

        {/* Description (for zones) */}
        {element.type === "zone" && (
          <div className="space-y-2">
            <Label htmlFor="edit-description">{t("common.description") || "תיאור"}</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                handleChange();
              }}
              placeholder={t("floorPlan.zoneDescription") || "תיאור האזור"}
              rows={3}
            />
          </div>
        )}

        {/* Element Info */}
        <Card className="p-3 bg-muted/50">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("floorPlan.type") || "סוג"}:</span>
              <span className="font-medium">
                {element.type === "table"
                  ? element.tableType === "bar"
                    ? t("floorPlan.bar") || "בר"
                    : t("floorPlan.table") || "שולחן"
                  : element.type === "zone"
                    ? t("floorPlan.zone") || "אזור"
                    : element.name}
              </span>
            </div>
            {element.zoneId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("floorPlan.inZone") || "באזור"}:</span>
                <span className="font-medium">
                  {allElements.find((e) => e.id === element.zoneId)?.name || "-"}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button onClick={handleSave} disabled={!hasChanges} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {t("common.save") || "שמור"}
        </Button>
        {onDuplicate && element.type === "specialArea" && (
          <Button
            variant="outline"
            onClick={() => {
              if (element) {
                onDuplicate(element);
              }
            }}
            className="w-full gap-2"
          >
            <Copy className="h-4 w-4" />
            {t("common.duplicate") || "שכפל"}
          </Button>
        )}
        <Button variant="outline" onClick={onCancel} className="w-full">
          {t("common.cancel") || "ביטול"}
        </Button>
      </div>
    </div>
  );
}

