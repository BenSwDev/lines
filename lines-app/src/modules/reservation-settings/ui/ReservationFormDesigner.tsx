"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Palette } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { ReservationFormDesignInput } from "../types";

interface ReservationFormDesignerProps {
  design: ReservationFormDesignInput | undefined;
  onChange: (design: ReservationFormDesignInput) => void;
}

export function ReservationFormDesigner({ design, onChange }: ReservationFormDesignerProps) {
  const { t, dir } = useTranslations();

  const getRTLClasses = (dir: "ltr" | "rtl") => ({
    flexReverse: dir === "rtl" ? "flex-row-reverse" : "",
    textAlign: dir === "rtl" ? "text-right" : "text-left"
  });

  const rtlClasses = getRTLClasses(dir);

  const currentDesign: ReservationFormDesignInput = {
    primaryColor: design?.primaryColor || "#3B82F6",
    secondaryColor: design?.secondaryColor || null,
    backgroundColor: design?.backgroundColor || "#FFFFFF",
    textColor: design?.textColor || "#000000",
    buttonColor: design?.buttonColor || null,
    buttonTextColor: design?.buttonTextColor || null,
    borderRadius: design?.borderRadius || "8px",
    fontFamily: design?.fontFamily || null,
    headerText: design?.headerText || null,
    footerText: design?.footerText || null,
    logoUrl: design?.logoUrl || null
  };

  const updateDesign = (updates: Partial<ReservationFormDesignInput>) => {
    onChange({ ...currentDesign, ...updates });
  };

  return (
    <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/40 to-primary/20">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          {t("reservations.formDesigner.title")}
        </CardTitle>
        <CardDescription>{t("reservations.formDesigner.description")}</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className={`space-y-2 ${rtlClasses.textAlign}`}>
            <Label>{t("reservations.formDesigner.primaryColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={currentDesign.primaryColor}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="w-20"
              />
              <Input
                type="text"
                value={currentDesign.primaryColor}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div className={`space-y-2 ${rtlClasses.textAlign}`}>
            <Label>{t("reservations.formDesigner.backgroundColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={currentDesign.backgroundColor}
                onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
                className="w-20"
              />
              <Input
                type="text"
                value={currentDesign.backgroundColor}
                onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          <div className={`space-y-2 ${rtlClasses.textAlign}`}>
            <Label>{t("reservations.formDesigner.textColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={currentDesign.textColor}
                onChange={(e) => updateDesign({ textColor: e.target.value })}
                className="w-20"
              />
              <Input
                type="text"
                value={currentDesign.textColor}
                onChange={(e) => updateDesign({ textColor: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>
          <div className={`space-y-2 ${rtlClasses.textAlign}`}>
            <Label>{t("reservations.formDesigner.buttonColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={currentDesign.buttonColor || "#3B82F6"}
                onChange={(e) => updateDesign({ buttonColor: e.target.value || null })}
                className="w-20"
              />
              <Input
                type="text"
                value={currentDesign.buttonColor || ""}
                onChange={(e) => updateDesign({ buttonColor: e.target.value || null })}
                placeholder={t("reservations.formDesigner.usePrimary")}
              />
            </div>
          </div>
          <div className={`space-y-2 ${rtlClasses.textAlign}`}>
            <Label>{t("reservations.formDesigner.borderRadius")}</Label>
            <Input
              type="text"
              value={currentDesign.borderRadius}
              onChange={(e) => updateDesign({ borderRadius: e.target.value })}
              placeholder="8px"
            />
          </div>
          <div className={`space-y-2 ${rtlClasses.textAlign}`}>
            <Label>{t("reservations.formDesigner.fontFamily")}</Label>
            <Input
              type="text"
              value={currentDesign.fontFamily || ""}
              onChange={(e) => updateDesign({ fontFamily: e.target.value || null })}
              placeholder="Arial, sans-serif"
            />
          </div>
        </div>
        <div className={`space-y-2 ${rtlClasses.textAlign}`}>
          <Label>{t("reservations.formDesigner.headerText")}</Label>
          <Input
            type="text"
            value={currentDesign.headerText || ""}
            onChange={(e) => updateDesign({ headerText: e.target.value || null })}
            placeholder={t("reservations.formDesigner.headerTextPlaceholder")}
          />
        </div>
        <div className={`space-y-2 ${rtlClasses.textAlign}`}>
          <Label>{t("reservations.formDesigner.footerText")}</Label>
          <Textarea
            value={currentDesign.footerText || ""}
            onChange={(e) => updateDesign({ footerText: e.target.value || null })}
            placeholder={t("reservations.formDesigner.footerTextPlaceholder")}
            rows={2}
            dir={dir}
          />
        </div>
        <div className={`space-y-2 ${rtlClasses.textAlign}`}>
          <Label>{t("reservations.formDesigner.logoUrl")}</Label>
          <Input
            type="url"
            value={currentDesign.logoUrl || ""}
            onChange={(e) => updateDesign({ logoUrl: e.target.value || null })}
            placeholder="https://example.com/logo.png"
            dir="ltr"
          />
        </div>
      </CardContent>
    </Card>
  );
}

