/**
 * Mobile Element Menu Component
 * Context menu for elements on mobile (swipe actions)
 */

"use client";

import { ReactNode } from "react";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Copy } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

interface MobileElementMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementName: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  children?: ReactNode;
}

export function MobileElementMenu({
  open,
  onOpenChange,
  elementName,
  onEdit,
  onDelete,
  onDuplicate,
  children
}: MobileElementMenuProps) {
  const { t } = useTranslations();

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      action();
      onOpenChange(false);
    }
  };

  return (
    <MobileBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={elementName}
      description={t("floorPlan.elementActions") || "פעולות על האלמנט"}
    >
      <div className="space-y-2">
        {onEdit && (
          <Button
            variant="outline"
            className="w-full justify-start h-14"
            onClick={() => handleAction(onEdit)}
          >
            <Pencil className="h-5 w-5 mr-2" />
            {t("common.edit") || "ערוך"}
          </Button>
        )}

        {onDuplicate && (
          <Button
            variant="outline"
            className="w-full justify-start h-14"
            onClick={() => handleAction(onDuplicate)}
          >
            <Copy className="h-5 w-5 mr-2" />
            {t("common.duplicate") || "שכפל"}
          </Button>
        )}

        {onDelete && (
          <Button
            variant="destructive"
            className="w-full justify-start h-14"
            onClick={() => handleAction(onDelete)}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            {t("common.delete") || "מחק"}
          </Button>
        )}

        {children}
      </div>
    </MobileBottomSheet>
  );
}
