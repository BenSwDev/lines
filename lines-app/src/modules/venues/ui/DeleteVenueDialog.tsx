"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { deleteVenue } from "../actions/deleteVenue";
import type { Venue } from "@prisma/client";

export interface DeleteVenueDialogProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteVenueDialog({ venue, isOpen, onClose, onSuccess }: DeleteVenueDialogProps) {
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
        setError(result.error || "שגיאה במחיקת המקום");
      }
    } catch {
      setError("שגיאה לא צפויה");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="מחיקת מקום" size="md">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-200">
            האם אתה בטוח שברצונך למחוק את <strong>&quot;{venue?.name}&quot;</strong>?
          </p>
          <p className="text-sm text-yellow-500">
            ⚠️ כל הנתונים הקשורים למקום זה יימחקו לצמיתות (ליינים, אירועים, תפריטים, אזורים
            ושולחנות).
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isDeleting}>
            ביטול
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "מוחק..." : "מחק לצמיתות"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
