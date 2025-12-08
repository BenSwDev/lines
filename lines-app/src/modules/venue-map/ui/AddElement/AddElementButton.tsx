/**
 * Add Element Button Component
 * Single button to add any element type with dialog selection
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { AddElementDialog } from "./AddElementDialog";

interface AddElementButtonProps {
  onAddTable?: () => void;
  onAddBar?: () => void;
  onAddZone?: () => void;
  onAddSpecialArea?: () => void;
}

export function AddElementButton({
  onAddTable,
  onAddBar,
  onAddZone,
  onAddSpecialArea
}: AddElementButtonProps) {
  const { t } = useTranslations();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        variant="default"
        className="w-full h-20 flex flex-col gap-2 items-center justify-center"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm font-semibold">
          {t("floorPlan.clickToAddElements") || "לחץ כאן להוספת איזורים ברים ושולחנות"}
        </span>
      </Button>

      <AddElementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddTable={onAddTable}
        onAddBar={onAddBar}
        onAddZone={onAddZone}
        onAddSpecialArea={onAddSpecialArea}
      />
    </>
  );
}

