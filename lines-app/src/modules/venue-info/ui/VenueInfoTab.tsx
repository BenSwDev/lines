"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Textarea } from "@/shared/ui/FormField";
import { getVenueDetails } from "../actions/getVenueDetails";
import { updateVenueDetails } from "../actions/updateVenueDetails";
import type { Venue } from "@prisma/client";

export interface VenueInfoTabProps {
  venue: Venue;
}

export function VenueInfoTab({ venue }: VenueInfoTabProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue.id]);

  const loadDetails = async () => {
    setIsLoading(true);
    const result = await getVenueDetails(venue.id);
    
    if (result.success && result.data) {
      setPhone(result.data.phone || "");
      setEmail(result.data.email || "");
      setAddress(result.data.address || "");
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveStatus("idle");
    setIsSaving(true);

    try {
      const result = await updateVenueDetails(venue.id, {
        phone,
        email,
        address,
      });

      if (result.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setError(result.error || "שגיאה בשמירה");
        setSaveStatus("error");
      }
    } catch {
      setError("שגיאה לא צפויה");
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">טוען...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטי מקום</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <FormField label="שם המקום">
            <Input value={venue.name} disabled />
          </FormField>

          <FormField label="טלפון" hint="לדוגמה: 050-1234567">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="הכנס מספר טלפון..."
              disabled={isSaving}
            />
          </FormField>

          <FormField label="אימייל">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="הכנס כתובת אימייל..."
              disabled={isSaving}
            />
          </FormField>

          <FormField label="כתובת">
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="רחוב, מספר, עיר..."
              rows={3}
              disabled={isSaving}
            />
          </FormField>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving
                ? "שומר..."
                : saveStatus === "success"
                ? "✓ נשמר"
                : "שמור שינויים"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

