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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className="group relative cursor-pointer overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl"
          onClick={() => router.push(`/venues/${venueId}/menus`)}
        >
          {/* Decorative glow */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              {t("settings.menus")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("settings.menusDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10">
              {t("common.open")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="group relative cursor-pointer overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl"
          onClick={() => router.push(`/venues/${venueId}/zones`)}
        >
          {/* Decorative glow */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-primary/60">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              {t("settings.seating")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("settings.seatingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10">
              {t("common.open")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
