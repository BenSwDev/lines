"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { FormField, Input } from "@/shared/ui/FormField";

export interface CreateVenueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateVenueDialog({
  isOpen,
  onClose,
  onCreate,
}: CreateVenueDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("שם המקום הוא שדה חובה");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate(name.trim());
      setName("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת המקום");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="יצירת מקום חדש" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="שם המקום" required error={error}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הכנס שם מקום..."
            error={!!error}
            disabled={isSubmitting}
            autoFocus
          />
        </FormField>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "שומר..." : "יצירה"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
