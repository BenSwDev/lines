"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MapPin, ArrowRight } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

export function VenueSettingsTab() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslations();
  const venueId = params.venueId as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => router.push(`/venues/${venueId}/settings/menus`)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("settings.menus")}
            </CardTitle>
            <CardDescription>
              {t("settings.menusDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between">
              {t("common.open")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => router.push(`/venues/${venueId}/settings/zones`)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("settings.seating")}
            </CardTitle>
            <CardDescription>
              {t("settings.seatingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between">
              {t("common.open")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
