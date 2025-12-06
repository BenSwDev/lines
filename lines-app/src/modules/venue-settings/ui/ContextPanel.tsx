"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Edit, Trash2, X } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement, SpecialAreaType } from "./FloorPlanEditorV2";
import { AREA_TYPE_COLORS } from "../config/floorPlanDesignTokens";

interface ContextPanelProps {
  element: FloorPlanElement | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onEdit: (element: FloorPlanElement) => void;
  onDelete: (id: string) => void;
  onChange: (element: FloorPlanElement) => void;
  onSave: () => void;
}

export function ContextPanel({
  element,
  onClose,
  onEdit,
  onDelete,
  onChange,
  onSave
}: ContextPanelProps) {
  const { t } = useTranslations();

  if (!element) return null;

  return (
    <div className="w-full">
      <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">
              {element.type === "table"
                ? t("floorPlan.editTable")
                : element.type === "zone"
                  ? t("floorPlan.editZone")
                  : t("floorPlan.editSpecialArea")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="context-name" className="text-xs font-medium">
                {t("floorPlan.name")}
              </Label>
              <Input
                id="context-name"
                value={element.name}
                onChange={(e) => onChange({ ...element, name: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Type-specific fields */}
            {element.type === "table" && (
              <>
                <div>
                  <Label htmlFor="context-seats" className="text-xs font-medium">
                    {t("floorPlan.seats")}
                  </Label>
                  <Input
                    id="context-seats"
                    type="number"
                    min="1"
                    value={element.seats || ""}
                    onChange={(e) =>
                      onChange({
                        ...element,
                        seats: parseInt(e.target.value) || undefined
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="context-table-type" className="text-xs font-medium">
                    {t("floorPlan.tableType")}
                  </Label>
                  <Select
                    value={element.tableType || "table"}
                    onValueChange={(value) =>
                      onChange({ ...element, tableType: value as "table" | "bar" | "counter" })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">{t("floorPlan.table")}</SelectItem>
                      <SelectItem value="bar">{t("floorPlan.bar")}</SelectItem>
                      <SelectItem value="counter">{t("floorPlan.counter")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {element.type === "zone" && (
              <div>
                <Label htmlFor="context-color" className="text-xs font-medium">
                  {t("floorPlan.color")}
                </Label>
                <Input
                  id="context-color"
                  type="color"
                  value={element.color || AREA_TYPE_COLORS.zone}
                  onChange={(e) => onChange({ ...element, color: e.target.value })}
                  className="mt-1 h-10"
                />
              </div>
            )}

            {element.type === "specialArea" && (
              <>
                <div>
                  <Label htmlFor="context-area-type" className="text-xs font-medium">
                    {t("floorPlan.areaType")}
                  </Label>
                  <Select
                    value={element.areaType || "other"}
                    onValueChange={(value) =>
                      onChange({
                        ...element,
                        areaType: value as SpecialAreaType,
                        color: AREA_TYPE_COLORS[value] || AREA_TYPE_COLORS.other
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrance">{t("floorPlan.specialAreas.entrance")}</SelectItem>
                      <SelectItem value="exit">{t("floorPlan.specialAreas.exit")}</SelectItem>
                      <SelectItem value="kitchen">{t("floorPlan.specialAreas.kitchen")}</SelectItem>
                      <SelectItem value="restroom">{t("floorPlan.specialAreas.restroom")}</SelectItem>
                      <SelectItem value="bar">{t("floorPlan.specialAreas.bar")}</SelectItem>
                      <SelectItem value="stage">{t("floorPlan.specialAreas.stage")}</SelectItem>
                      <SelectItem value="storage">{t("floorPlan.specialAreas.storage")}</SelectItem>
                      <SelectItem value="dj_booth">{t("floorPlan.specialAreas.dj_booth")}</SelectItem>
                      <SelectItem value="other">{t("floorPlan.specialAreas.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="context-area-color" className="text-xs font-medium">
                    {t("floorPlan.color")}
                  </Label>
                  <Input
                    id="context-area-color"
                    type="color"
                    value={element.color || AREA_TYPE_COLORS[element.areaType || "other"] || AREA_TYPE_COLORS.other}
                    onChange={(e) => onChange({ ...element, color: e.target.value })}
                    className="mt-1 h-10"
                  />
                </div>
              </>
            )}

            {/* Position & Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="context-x" className="text-xs font-medium">
                  X
                </Label>
                <Input
                  id="context-x"
                  type="number"
                  value={Math.round(element.x)}
                  onChange={(e) =>
                    onChange({ ...element, x: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="context-y" className="text-xs font-medium">
                  Y
                </Label>
                <Input
                  id="context-y"
                  type="number"
                  value={Math.round(element.y)}
                  onChange={(e) =>
                    onChange({ ...element, y: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="context-width" className="text-xs font-medium">
                  {t("floorPlan.width")}
                </Label>
                <Input
                  id="context-width"
                  type="number"
                  min="20"
                  value={Math.round(element.width)}
                  onChange={(e) =>
                    onChange({ ...element, width: parseFloat(e.target.value) || 20 })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="context-height" className="text-xs font-medium">
                  {t("floorPlan.height")}
                </Label>
                <Input
                  id="context-height"
                  type="number"
                  min="20"
                  value={Math.round(element.height)}
                  onChange={(e) =>
                    onChange({ ...element, height: parseFloat(e.target.value) || 20 })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label htmlFor="context-rotation" className="text-xs font-medium">
                {t("floorPlan.rotation")} (°)
              </Label>
              <Input
                id="context-rotation"
                type="number"
                value={Math.round(element.rotation || 0)}
                onChange={(e) =>
                  onChange({ ...element, rotation: parseFloat(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="context-description" className="text-xs font-medium">
                {t("floorPlan.description")}
              </Label>
              <Textarea
                id="context-description"
                value={element.description || ""}
                onChange={(e) => onChange({ ...element, description: e.target.value || null })}
                className="mt-1 min-h-[60px]"
                placeholder={t("floorPlan.description")}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t space-y-2">
            <Button onClick={onSave} className="w-full" size="sm">
              {t("common.save")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit(element)}
                className="flex-1"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t("common.edit")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(element.id)}
                className="flex-1"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
}

