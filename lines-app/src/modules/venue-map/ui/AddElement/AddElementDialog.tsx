/**
 * Add Element Dialog Component
 * Dialog to select element type to add
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, MapPin, ChefHat, Building2 } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

interface AddElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTable?: () => void;
  onAddBar?: () => void;
  onAddZone?: () => void;
  onAddSpecialArea?: () => void;
}

export function AddElementDialog({
  open,
  onOpenChange,
  onAddTable,
  onAddBar,
  onAddZone,
  onAddSpecialArea
}: AddElementDialogProps) {
  const { t } = useTranslations();

  const handleSelect = (type: "table" | "bar" | "zone" | "specialArea") => {
    onOpenChange(false);
    switch (type) {
      case "table":
        onAddTable?.();
        break;
      case "bar":
        onAddBar?.();
        break;
      case "zone":
        onAddZone?.();
        break;
      case "specialArea":
        onAddSpecialArea?.();
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("floorPlan.addElement") || "הוסף אלמנט"}</DialogTitle>
          <DialogDescription>
            {t("floorPlan.selectElementType") || "בחר סוג אלמנט להוספה"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-24"
            onClick={() => handleSelect("table")}
          >
            <Table className="h-6 w-6" />
            <span>{t("floorPlan.table") || "שולחן"}</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-24"
            onClick={() => handleSelect("bar")}
          >
            <ChefHat className="h-6 w-6" />
            <span>{t("floorPlan.bar") || "בר"}</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-24"
            onClick={() => handleSelect("zone")}
          >
            <MapPin className="h-6 w-6" />
            <span>{t("floorPlan.zone") || "אזור"}</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-24"
            onClick={() => handleSelect("specialArea")}
          >
            <Building2 className="h-6 w-6" />
            <span>{t("floorPlan.specialArea") || "אזור מיוחד"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

