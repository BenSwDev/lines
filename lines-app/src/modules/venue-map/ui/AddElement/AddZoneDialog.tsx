/**
 * Add Zone Dialog Component
 * Dialog to add a zone (tables zone / bar zone / special area)
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Table, ChefHat, Building2 } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

export type ZoneType = "tables_zone" | "bar_zone" | "special_area";

interface AddZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (type: ZoneType) => void;
}

export function AddZoneDialog({ open, onOpenChange, onConfirm }: AddZoneDialogProps) {
  const { t } = useTranslations();
  const [selectedType, setSelectedType] = useState<ZoneType>("tables_zone");

  const handleConfirm = () => {
    onConfirm(selectedType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("floorPlan.addZone") || "הוסף איזור"}</DialogTitle>
          <DialogDescription>
            {t("floorPlan.selectZoneType") || "בחר סוג איזור להוספה"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <div
            className={cn(
              "flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
              selectedType === "tables_zone" && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedType("tables_zone")}
          >
            <input
              type="radio"
              checked={selectedType === "tables_zone"}
              onChange={() => setSelectedType("tables_zone")}
              className="h-4 w-4"
            />
            <Label className="flex-1 cursor-pointer flex items-center gap-2">
              <Table className="h-5 w-5" />
              <span>{t("floorPlan.tablesZone") || "איזור שולחנות"}</span>
            </Label>
          </div>
          <div
            className={cn(
              "flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
              selectedType === "bar_zone" && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedType("bar_zone")}
          >
            <input
              type="radio"
              checked={selectedType === "bar_zone"}
              onChange={() => setSelectedType("bar_zone")}
              className="h-4 w-4"
            />
            <Label className="flex-1 cursor-pointer flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              <span>{t("floorPlan.barZone") || "איזור בר"}</span>
            </Label>
          </div>
          <div
            className={cn(
              "flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
              selectedType === "special_area" && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedType("special_area")}
          >
            <input
              type="radio"
              checked={selectedType === "special_area"}
              onChange={() => setSelectedType("special_area")}
              className="h-4 w-4"
            />
            <Label className="flex-1 cursor-pointer flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span>{t("floorPlan.specialArea") || "איזור מיוחד"}</span>
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel") || "ביטול"}
          </Button>
          <Button onClick={handleConfirm}>{t("common.continue") || "המשך"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

