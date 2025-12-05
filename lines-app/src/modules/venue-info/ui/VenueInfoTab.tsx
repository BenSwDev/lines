"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Building2, Loader2 } from "lucide-react";
import { getVenueDetails } from "../actions/getVenueDetails";
import { updateVenueDetails } from "../actions/updateVenueDetails";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/core/security";
import { translateError } from "@/utils/translateError";
import type { Venue } from "@prisma/client";

export interface VenueInfoTabProps {
  venue: Venue;
}

export function VenueInfoTab({ venue }: VenueInfoTabProps) {
  const { toast } = useToast();
  const { t } = useTranslations();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);

    try {
      // Sanitize inputs before sending
      const sanitizedPhone = phone.trim() ? sanitizePhone(phone.trim()) : null;
      const sanitizedEmail = email.trim() ? sanitizeEmail(email.trim()) : null;
      const sanitizedAddress = address.trim() ? sanitizeText(address.trim()) : null;

      const result = await updateVenueDetails(venue.id, {
        phone: sanitizedPhone,
        email: sanitizedEmail,
        address: sanitizedAddress
      });

      if (result.success) {
        toast({
          title: t("success.detailsUpdated"),
          description: t("success.detailsUpdated")
        });
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        toast({
          title: t("errors.generic"),
          description: errorMsg ? translateError(errorMsg, t) : t("errors.savingData"),
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: t("errors.generic"),
        description: err instanceof Error ? err.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-5 w-96 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {t("venueInfo.title")}
        </h1>
        <p className="text-muted-foreground">{t("venueInfo.subtitle")}</p>
      </div>

      {/* Venue Name Card (Read-only) */}
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
        {/* Decorative glow */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            {t("venueInfo.venueName")}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-4 text-xl font-bold text-foreground shadow-sm">
            {venue.name}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("venueInfo.venueNameReadOnly")}</p>
        </CardContent>
      </Card>

      {/* Contact Details Card */}
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
        {/* Decorative glow */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <CardHeader className="relative z-10">
          <CardTitle className="text-xl">{t("venueInfo.contactDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t("venueInfo.phoneLabel")}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("venueInfo.phonePlaceholder")}
                disabled={isSaving}
                className="text-base"
                aria-label={t("venueInfo.phoneAriaLabel")}
                aria-required="false"
              />
              <p className="text-xs text-muted-foreground">{t("venueInfo.phoneDescription")}</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("venueInfo.emailLabel")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("venueInfo.emailPlaceholder")}
                disabled={isSaving}
                className="text-base"
                aria-label={t("venueInfo.emailAriaLabel")}
                aria-required="false"
              />
              <p className="text-xs text-muted-foreground">{t("venueInfo.emailDescription")}</p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("venueInfo.addressLabel")}
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("venueInfo.addressPlaceholder")}
                rows={3}
                disabled={isSaving}
                className="text-base resize-none"
                aria-label={t("venueInfo.addressAriaLabel")}
                aria-required="false"
              />
              <p className="text-xs text-muted-foreground">{t("venueInfo.addressDescription")}</p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSaving}
              size="lg"
              className="w-full"
              aria-label={isSaving ? t("venueInfo.savingAriaLabel") : t("venueInfo.saveAriaLabel")}
              aria-busy={isSaving}
            >
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSaving ? t("venueInfo.saving") : t("venueInfo.saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
