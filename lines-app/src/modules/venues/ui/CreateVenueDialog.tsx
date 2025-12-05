"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { FormField, Input } from "@/shared/ui/FormField";
import { createVenue } from "../actions/createVenue";

export interface CreateVenueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateVenueDialog({ isOpen, onClose, onSuccess }: CreateVenueDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createVenue({ name });
      
      if (result.success) {
        setName("");
        onSuccess();
        onClose();
      } else {
        setError(result.error || "שגיאה ביצירת המקום");
      }
    } catch {
      setError("שגיאה לא צפויה");
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
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? "שומר..." : "יצירה"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

