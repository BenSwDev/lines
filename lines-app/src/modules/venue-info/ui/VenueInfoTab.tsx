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
import type { Venue } from "@prisma/client";

export interface VenueInfoTabProps {
  venue: Venue;
}

export function VenueInfoTab({ venue }: VenueInfoTabProps) {
  const { toast } = useToast();
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
      const result = await updateVenueDetails(venue.id, {
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
      });

      if (result.success) {
        toast({
          title: "הצלחה",
          description: "הפרטים עודכנו בהצלחה",
        });
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "שגיאה בשמירת הנתונים",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "שגיאה",
        description: err instanceof Error ? err.message : "שגיאה לא צפויה",
        variant: "destructive",
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">מידע על המקום</h1>
        <p className="text-muted-foreground">
          נהל את פרטי הקשר והמידע של המקום
        </p>
      </div>

      {/* Venue Name Card (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            שם המקום
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted px-4 py-3 text-lg font-medium">
            {venue.name}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            שם המקום לא ניתן לעריכה מכאן
          </p>
        </CardContent>
      </Card>

      {/* Contact Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי קשר</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                טלפון
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05X-XXXXXXX"
                disabled={isSaving}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                מספר הטלפון של המקום לפניות לקוחות
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                אימייל
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={isSaving}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                כתובת האימייל של המקום
              </p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                כתובת
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="רחוב, מספר, עיר"
                rows={3}
                disabled={isSaving}
                className="text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                הכתובת המלאה של המקום
              </p>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isSaving} size="lg" className="w-full">
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isSaving ? "שומר..." : "שמור שינויים"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
