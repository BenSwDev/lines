/**
 * Add Bar Dialog Component
 * Dialog to add a bar with name, number of people, optional table number
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

interface AddBarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    seats: number;
    tableNumber?: number;
  }) => void;
  defaultName?: string;
}

export function AddBarDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultName = ""
}: AddBarDialogProps) {
  const { t } = useTranslations();
  const [name, setName] = useState(defaultName);
  const [seats, setSeats] = useState(0);
  const [tableNumber, setTableNumber] = useState<number | undefined>(undefined);

  const handleConfirm = () => {
    if (!name.trim()) {
      return;
    }
    onConfirm({
      name: name.trim(),
      seats: Math.max(0, seats),
      tableNumber: tableNumber && tableNumber > 0 ? tableNumber : undefined
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("floorPlan.addBar") || "הוסף בר"}</DialogTitle>
          <DialogDescription>
            {t("floorPlan.configureBar") || "הגדר את פרטי הבר"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bar-name">{t("floorPlan.barName") || "שם הבר"}</Label>
            <Input
              id="bar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("floorPlan.barNamePlaceholder") || "לדוגמה: בר ראשי"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar-seats">{t("floorPlan.barSeats") || "כמות אנשים"}</Label>
            <Input
              id="bar-seats"
              type="number"
              min={0}
              value={seats}
              onChange={(e) => setSeats(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar-number">
              {t("floorPlan.tableNumber") || "מספר בר"} ({t("floorPlan.optional") || "אופציונלי"})
            </Label>
            <Input
              id="bar-number"
              type="number"
              min={1}
              value={tableNumber || ""}
              onChange={(e) =>
                setTableNumber(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder={t("floorPlan.optional") || "אופציונלי"}
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

