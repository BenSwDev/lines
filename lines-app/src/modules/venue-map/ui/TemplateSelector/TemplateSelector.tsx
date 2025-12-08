/**
 * Template Selector Component
 * Select a template (bar, restaurant, club, event hall, empty)
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { UtensilsCrossed, Music, Building2, Square } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

export type TemplateType = "bar" | "restaurant" | "club" | "event_hall" | "empty";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (type: TemplateType) => void;
}

const TEMPLATES: { type: TemplateType; label: string; icon: React.ReactNode }[] = [
  { type: "bar", label: "בר", icon: <UtensilsCrossed className="h-6 w-6" /> },
  { type: "restaurant", label: "מסעדה", icon: <UtensilsCrossed className="h-6 w-6" /> },
  { type: "club", label: "מועדון", icon: <Music className="h-6 w-6" /> },
  { type: "event_hall", label: "אולם אירועים", icon: <Building2 className="h-6 w-6" /> },
  { type: "empty", label: "ריק", icon: <Square className="h-6 w-6" /> }
];

export function TemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate
}: TemplateSelectorProps) {
  const { t } = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("floorPlan.selectTemplate") || "בחר טמפלט"}</DialogTitle>
          <DialogDescription>
            {t("floorPlan.selectTemplateDescription") || "בחר טמפלט התחלתי או התחל מאפס"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {TEMPLATES.map((template) => (
            <Button
              key={template.type}
              variant="outline"
              className="flex flex-col gap-2 h-24"
              onClick={() => {
                onSelectTemplate(template.type);
                onOpenChange(false);
              }}
            >
              {template.icon}
              <span>{template.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

