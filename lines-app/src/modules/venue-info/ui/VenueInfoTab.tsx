"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Building2, Loader2, Save } from "lucide-react";
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
  const [currency, setCurrency] = useState<"ILS" | "USD" | "GBP" | "EUR">("ILS");
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
      setCurrency((result.data.currency as "ILS" | "USD" | "GBP" | "EUR") || "ILS");
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const sanitizedPhone = phone.trim() ? sanitizePhone(phone.trim()) : null;
      const sanitizedEmail = email.trim() ? sanitizeEmail(email.trim()) : null;
      const sanitizedAddress = address.trim() ? sanitizeText(address.trim()) : null;

      const result = await updateVenueDetails(venue.id, {
        phone: sanitizedPhone,
        email: sanitizedEmail,
        address: sanitizedAddress,
        currency: currency
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
      <div className="space-y-4">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("venueInfo.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("venueInfo.subtitle")}</p>
        </div>
      </div>

      {/* Venue Name - Compact */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">שם המקום</Label>
              <p className="text-lg font-semibold">{venue.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details - Grid Layout */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">פרטי קשר</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  עדכן את פרטי הקשר של המקום
                </p>
              </div>
              <Button type="submit" disabled={isSaving} size="sm">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    שומר...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    שמור
                  </>
                )}
              </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
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
                  className="h-9"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm">
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
                  className="h-9"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                מטבע תשלום
              </Label>
                <Select
                  value={currency}
                  onValueChange={(value) => setCurrency(value as "ILS" | "USD" | "GBP" | "EUR")}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">₪ שקל ישראלי (ILS)</SelectItem>
                  <SelectItem value="USD">$ דולר אמריקאי (USD)</SelectItem>
                  <SelectItem value="GBP">£ לירה שטרלינג (GBP)</SelectItem>
                  <SelectItem value="EUR">€ יורו (EUR)</SelectItem>
                </SelectContent>
              </Select>
              </div>

              {/* Address - Full Width */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  {t("venueInfo.addressLabel")}
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("venueInfo.addressPlaceholder")}
                  rows={2}
                  disabled={isSaving}
                  className="resize-none"
                />
              </div>
            </div>
        </CardContent>
      </Card>
      </form>
    </div>
  );
}
