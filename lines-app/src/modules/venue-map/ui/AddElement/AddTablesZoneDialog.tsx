/**
 * Add Tables Zone Dialog Component
 * Dialog to add a tables zone with name, color, number of tables, minimum order
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
import { useTranslations } from "@/core/i18n/provider";

interface AddTablesZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    color: string;
    tableCount: number;
    zoneMinimumPrice?: number;
    sameSeatsForAll?: boolean;
    seatsPerTable?: number;
  }) => void;
  defaultName?: string;
  defaultColor?: string;
}

export function AddTablesZoneDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultName = "",
  defaultColor = "#3B82F6"
}: AddTablesZoneDialogProps) {
  const { t } = useTranslations();
  const [name, setName] = useState(defaultName);
  const [color, setColor] = useState(defaultColor);
  const [tableCount, setTableCount] = useState(1);
  const [zoneMinimumPrice, setZoneMinimumPrice] = useState<number | undefined>(undefined);
  const [sameSeatsForAll, setSameSeatsForAll] = useState(true);
  const [seatsPerTable, setSeatsPerTable] = useState(4);

  const handleConfirm = () => {
    if (!name.trim()) {
      return;
    }
    onConfirm({
      name: name.trim(),
      color,
      tableCount: Math.max(1, tableCount),
      zoneMinimumPrice: zoneMinimumPrice && zoneMinimumPrice > 0 ? zoneMinimumPrice : undefined,
      sameSeatsForAll,
      seatsPerTable: sameSeatsForAll ? seatsPerTable : undefined
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("floorPlan.addTablesZone") || "הוסף איזור שולחנות"}</DialogTitle>
          <DialogDescription>
            {t("floorPlan.configureTablesZone") || "הגדר את פרטי איזור השולחנות"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zone-name">{t("floorPlan.zoneName") || "שם האיזור"}</Label>
            <Input
              id="zone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("floorPlan.zoneNamePlaceholder") || "לדוגמה: איזור VIP"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zone-color">{t("floorPlan.zoneColor") || "צבע האיזור"}</Label>
            <div className="flex gap-2">
              <Input
                id="zone-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="table-count">
              {t("floorPlan.tableCount") || "כמות שולחנות"} (מינימום 1)
            </Label>
            <Input
              id="table-count"
              type="number"
              min={1}
              value={tableCount}
              onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zone-min-price">
              {t("floorPlan.zoneMinimumPrice") || "מינימום הזמנה לאיזור"} (₪)
            </Label>
            <Input
              id="zone-min-price"
              type="number"
              min={0}
              value={zoneMinimumPrice || ""}
              onChange={(e) =>
                setZoneMinimumPrice(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder={t("floorPlan.optional") || "אופציונלי"}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="same-seats"
                checked={sameSeatsForAll}
                onChange={(e) => setSameSeatsForAll(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="same-seats" className="cursor-pointer">
                {t("floorPlan.sameSeatsForAll") || "אותו מספר מושבים לכל השולחנות"}
              </Label>
            </div>
            {sameSeatsForAll && (
              <Input
                type="number"
                min={1}
                value={seatsPerTable}
                onChange={(e) => setSeatsPerTable(Math.max(1, parseInt(e.target.value) || 4))}
                placeholder={t("floorPlan.seatsPerTable") || "מושבים לכל שולחן"}
              />
            )}
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

