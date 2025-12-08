/**
 * Quick Add Dialog Component
 * Simple 3-button dialog for adding elements quickly
 * "גאוני כמה שזה פשוט" - 3 דקות למפה מושלמת
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, MapPin, ChefHat } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useDevice } from "../hooks";

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTable: () => void;
  onAddZone: () => void;
  onAddArea: () => void;
  onBulkAddTables?: () => void;
}

export function QuickAddDialog({
  open,
  onOpenChange,
  onAddTable,
  onAddZone,
  onAddArea,
  onBulkAddTables
}: QuickAddDialogProps) {
  const { t } = useTranslations();
  const device = useDevice();

  const handleAddTable = () => {
    onAddTable();
    onOpenChange(false);
  };

  const handleAddZone = () => {
    onAddZone();
    onOpenChange(false);
  };

  const handleAddArea = () => {
    onAddArea();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t("floorPlan.addElement") || "הוסף אובייקט"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("floorPlan.quickAddDescription") || "בחר מה תרצה להוסיף למפה"}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex gap-4 ${device.isMobile ? "flex-col" : "flex-row justify-center"} py-4`}
        >
          {/* Table Button */}
          <Button
            size="lg"
            variant="default"
            className="flex-1 flex-col gap-3 h-auto py-6 px-8"
            onClick={handleAddTable}
          >
            <Table className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold text-base">{t("floorPlan.table") || "שולחן"}</div>
              <div className="text-xs opacity-80 mt-1">
                {t("floorPlan.defaultSeats") || "4 מושבים"}
              </div>
            </div>
          </Button>

          {/* Zone Button */}
          <Button
            size="lg"
            variant="outline"
            className="flex-1 flex-col gap-3 h-auto py-6 px-8"
            onClick={handleAddZone}
          >
            <MapPin className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold text-base">{t("floorPlan.zone") || "אזור"}</div>
              <div className="text-xs opacity-80 mt-1">
                {t("floorPlan.defaultZone") || "אזור שולחנות"}
              </div>
            </div>
          </Button>

          {/* Area Button */}
          <Button
            size="lg"
            variant="outline"
            className="flex-1 flex-col gap-3 h-auto py-6 px-8"
            onClick={handleAddArea}
          >
            <ChefHat className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold text-base">{t("floorPlan.area") || "מטבח/שירותים"}</div>
              <div className="text-xs opacity-80 mt-1">{t("floorPlan.defaultArea") || "מטבח"}</div>
            </div>
          </Button>
        </div>

        {/* Bulk Add Option */}
        {onBulkAddTables && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => {
                onBulkAddTables();
                onOpenChange(false);
              }}
            >
              <Table className="h-5 w-5" />
              {t("floorPlan.bulkAddTables") || "הוסף 5 שולחנות בבת אחת"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
