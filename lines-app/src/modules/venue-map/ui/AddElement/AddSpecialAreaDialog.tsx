/**
 * Add Special Area Dialog Component
 * Dialog to add a special area (restroom, entrance, exit) with shape, icon, color
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTranslations } from "@/core/i18n/provider";
import type { SpecialAreaType, ElementShape } from "../../types";

interface AddSpecialAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    areaType: SpecialAreaType;
    shape: ElementShape;
    color: string;
    icon?: string;
  }) => void;
  defaultName?: string;
}

const AREA_TYPES: { value: SpecialAreaType; label: string }[] = [
  { value: "restroom", label: "שירותים" },
  { value: "entrance", label: "כניסה" },
  { value: "exit", label: "יציאה" },
  { value: "kitchen", label: "מטבח" },
  { value: "storage", label: "אחסון" },
  { value: "other", label: "אחר" }
];

const SHAPES: { value: ElementShape; label: string }[] = [
  { value: "rectangle", label: "מלבן" },
  { value: "circle", label: "עיגול" },
  { value: "triangle", label: "משולש" },
  { value: "square", label: "ריבוע" }
];

export function AddSpecialAreaDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultName = ""
}: AddSpecialAreaDialogProps) {
  const { t } = useTranslations();
  const [name, setName] = useState(defaultName);
  const [areaType, setAreaType] = useState<SpecialAreaType>("restroom");
  const [shape, setShape] = useState<ElementShape>("rectangle");
  const [color, setColor] = useState("#F59E0B");
  const [icon, setIcon] = useState("");

  const handleConfirm = () => {
    if (!name.trim()) {
      return;
    }
    onConfirm({
      name: name.trim(),
      areaType,
      shape,
      color,
      icon: icon.trim() || undefined
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("floorPlan.addSpecialArea") || "הוסף אזור מיוחד"}</DialogTitle>
          <DialogDescription>
            {t("floorPlan.configureSpecialArea") || "הגדר את פרטי האזור המיוחד"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="area-name">{t("floorPlan.areaName") || "שם האזור"}</Label>
            <Input
              id="area-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("floorPlan.areaNamePlaceholder") || "לדוגמה: שירותים"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area-type">{t("floorPlan.areaType") || "סוג אזור"}</Label>
            <Select value={areaType} onValueChange={(v) => setAreaType(v as SpecialAreaType)}>
              <SelectTrigger id="area-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AREA_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="area-shape">{t("floorPlan.areaShape") || "צורה"}</Label>
            <Select value={shape} onValueChange={(v) => setShape(v as ElementShape)}>
              <SelectTrigger id="area-shape">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHAPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="area-color">{t("floorPlan.areaColor") || "צבע"}</Label>
            <div className="flex gap-2">
              <Input
                id="area-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#F59E0B"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="area-icon">
              {t("floorPlan.areaIcon") || "אייקון"} ({t("floorPlan.optional") || "אופציונלי"})
            </Label>
            <Input
              id="area-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder={t("floorPlan.iconPlaceholder") || "שם אייקון (אופציונלי)"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel") || "ביטול"}
          </Button>
          <Button onClick={handleConfirm} disabled={!name.trim()}>
            {t("common.add") || "הוסף"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

