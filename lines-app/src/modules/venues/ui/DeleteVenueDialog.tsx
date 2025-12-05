"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/components/ui/button";
import { deleteVenue } from "../actions/deleteVenue";
import { useTranslations } from "@/core/i18n/provider";
import { translateError } from "@/utils/translateError";
import type { Venue } from "@prisma/client";

export interface DeleteVenueDialogProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteVenueDialog({ venue, isOpen, onClose, onSuccess }: DeleteVenueDialogProps) {
  const { t } = useTranslations();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!venue) return;

    setError("");
    setIsDeleting(true);

    try {
      const result = await deleteVenue(venue.id);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        setError(errorMsg ? translateError(errorMsg, t) : t("errors.deletingVenue"));
      }
    } catch {
      setError(t("errors.unexpected"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("venues.deleteDialogTitle")} size="md">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-200">{t("venues.deleteConfirm", { name: venue?.name || "" })}</p>
          <p className="text-sm text-yellow-500">⚠️ {t("venues.deleteWarning")}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isDeleting}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            loading={isDeleting}
          >
            {isDeleting ? t("venues.deleting") : t("venues.deleteButton")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
