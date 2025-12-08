"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Music, Building2, Users, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createFloorPlan } from "../actions/floorPlanActions";
import { useTranslations } from "@/core/i18n/provider";

interface FloorPlanTemplateSelectorProps {
  venueId: string;
  onCancel: () => void;
}

type TemplateType = "empty" | "restaurant" | "bar" | "club" | "event-hall";

interface Template {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const getTemplates = (
  t: (key: string, options?: { defaultValue: string }) => string
): Template[] => [
  {
    id: "empty",
    name: t("floorPlan.emptyTemplate", { defaultValue: "מפה ריקה" }),
    description: t("floorPlan.emptyTemplateDescription", { defaultValue: "התחל מאפס" }),
    icon: Sparkles,
    color: "#6B7280"
  },
  {
    id: "restaurant",
    name: t("floorPlan.restaurantTemplate", { defaultValue: "מסעדה" }),
    description: t("floorPlan.restaurantTemplateDescription", {
      defaultValue: "מבנה אופטימלי למסעדה"
    }),
    icon: UtensilsCrossed,
    color: "#10B981"
  },
  {
    id: "bar",
    name: t("floorPlan.barTemplate", { defaultValue: "בר" }),
    description: t("floorPlan.barTemplateDescription", { defaultValue: "מבנה אופטימלי לבר" }),
    icon: Music,
    color: "#3B82F6"
  },
  {
    id: "club",
    name: t("floorPlan.clubTemplate", { defaultValue: "מועדון" }),
    description: t("floorPlan.clubTemplateDescription", { defaultValue: "מבנה אופטימלי למועדון" }),
    icon: Building2,
    color: "#8B5CF6"
  },
  {
    id: "event-hall",
    name: t("floorPlan.eventHallTemplate", { defaultValue: "אולם אירועים" }),
    description: t("floorPlan.eventHallTemplateDescription", {
      defaultValue: "מבנה אופטימלי לאולם אירועים"
    }),
    icon: Users,
    color: "#F59E0B"
  }
];

export function FloorPlanTemplateSelector({ venueId, onCancel }: FloorPlanTemplateSelectorProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const templates = getTemplates(t);

  const handleCreate = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    try {
      const templateData = getTemplateData(selectedTemplate);
      const result = await createFloorPlan({
        venueId,
        name:
          templates.find((tmpl) => tmpl.id === selectedTemplate)?.name ||
          t("floorPlan.newFloorPlan", { defaultValue: "מפה חדשה" }),
        isDefault: false,
        ...templateData
      });

      if (result.success && result.data) {
        router.push(`/venues/${venueId}/settings/structure/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating floor plan:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {t("floorPlan.selectTemplate", { defaultValue: "בחר טמפלט למפה" })}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("floorPlan.selectTemplateDescription", {
                defaultValue: "בחר טמפלט להתחלה או התחל מאפס"
              })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-right hover:shadow-lg",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                      : "border-muted hover:border-primary/50"
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                        isSelected ? "scale-110" : "scale-100"
                      )}
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      <div style={{ color: template.color }}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel", { defaultValue: "ביטול" })}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedTemplate || isCreating}
            className="gap-2"
          >
            {isCreating
              ? t("floorPlan.creating", { defaultValue: "יוצר..." })
              : t("floorPlan.createFloorPlanFromTemplate", { defaultValue: "צור מפה" })}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Template data generators
function getTemplateData(templateType: TemplateType) {
  switch (templateType) {
    case "restaurant":
      return {
        zones: [
          {
            name: "איזור ישיבה ראשי",
            color: "#3B82F6",
            positionX: 100,
            positionY: 100,
            width: 300,
            height: 250,
            tables: Array.from({ length: 8 }, (_, i) => ({
              name: `שולחן ${i + 1}`,
              seats: 4,
              positionX: 50 + (i % 4) * 60,
              positionY: 50 + Math.floor(i / 4) * 70,
              width: 50,
              height: 50
            }))
          },
          {
            name: "איזור VIP",
            color: "#F59E0B",
            positionX: 450,
            positionY: 100,
            width: 200,
            height: 200,
            tables: Array.from({ length: 3 }, (_, i) => ({
              name: `VIP ${i + 1}`,
              seats: 6,
              positionX: 50 + (i % 2) * 80,
              positionY: 50 + Math.floor(i / 2) * 80,
              width: 60,
              height: 60
            }))
          }
        ],
        venueAreas: [
          {
            areaType: "kitchen",
            name: "מטבח",
            positionX: 100,
            positionY: 400,
            width: 200,
            height: 150,
            color: "#EF4444",
            icon: "👨‍🍳"
          },
          {
            areaType: "bar",
            name: "בר",
            positionX: 350,
            positionY: 400,
            width: 150,
            height: 150,
            color: "#10B981",
            icon: "🍸"
          },
          {
            areaType: "entrance",
            name: "כניסה",
            positionX: 550,
            positionY: 50,
            width: 100,
            height: 80,
            color: "#6B7280",
            icon: "🚪"
          }
        ]
      };

    case "bar":
      return {
        zones: [
          {
            name: "איזור ישיבה",
            color: "#3B82F6",
            positionX: 100,
            positionY: 100,
            width: 400,
            height: 300,
            tables: Array.from({ length: 12 }, (_, i) => ({
              name: `שולחן ${i + 1}`,
              seats: 4,
              positionX: 50 + (i % 4) * 80,
              positionY: 50 + Math.floor(i / 4) * 80,
              width: 60,
              height: 60
            }))
          }
        ],
        venueAreas: [
          {
            areaType: "bar",
            name: "בר ראשי",
            positionX: 550,
            positionY: 100,
            width: 200,
            height: 300,
            color: "#10B981",
            icon: "🍸"
          },
          {
            areaType: "dj_booth",
            name: "די ג'יי",
            positionX: 550,
            positionY: 450,
            width: 200,
            height: 100,
            color: "#6366F1",
            icon: "🎧"
          },
          {
            areaType: "entrance",
            name: "כניסה",
            positionX: 100,
            positionY: 50,
            width: 100,
            height: 80,
            color: "#6B7280",
            icon: "🚪"
          }
        ]
      };

    case "club":
      return {
        zones: [
          {
            name: "רחבת ריקודים",
            color: "#8B5CF6",
            positionX: 100,
            positionY: 100,
            width: 500,
            height: 400,
            tables: Array.from({ length: 20 }, (_, i) => ({
              name: `שולחן ${i + 1}`,
              seats: 4,
              positionX: 50 + (i % 5) * 90,
              positionY: 50 + Math.floor(i / 5) * 90,
              width: 70,
              height: 70
            }))
          },
          {
            name: "איזור VIP",
            color: "#F59E0B",
            positionX: 650,
            positionY: 100,
            width: 200,
            height: 300,
            tables: Array.from({ length: 6 }, (_, i) => ({
              name: `VIP ${i + 1}`,
              seats: 6,
              positionX: 50 + (i % 2) * 90,
              positionY: 50 + Math.floor(i / 2) * 90,
              width: 70,
              height: 70
            }))
          }
        ],
        venueAreas: [
          {
            areaType: "bar",
            name: "בר ראשי",
            positionX: 100,
            positionY: 550,
            width: 300,
            height: 150,
            color: "#10B981",
            icon: "🍸"
          },
          {
            areaType: "dj_booth",
            name: "די ג'יי",
            positionX: 450,
            positionY: 550,
            width: 200,
            height: 150,
            color: "#6366F1",
            icon: "🎧"
          },
          {
            areaType: "stage",
            name: "במה",
            positionX: 700,
            positionY: 450,
            width: 150,
            height: 100,
            color: "#EC4899",
            icon: "🎤"
          },
          {
            areaType: "entrance",
            name: "כניסה",
            positionX: 100,
            positionY: 50,
            width: 100,
            height: 80,
            color: "#6B7280",
            icon: "🚪"
          }
        ]
      };

    case "event-hall":
      return {
        zones: [
          {
            name: "אולם ראשי",
            color: "#3B82F6",
            positionX: 100,
            positionY: 100,
            width: 600,
            height: 500,
            tables: Array.from({ length: 30 }, (_, i) => ({
              name: `שולחן ${i + 1}`,
              seats: 8,
              positionX: 50 + (i % 6) * 90,
              positionY: 50 + Math.floor(i / 6) * 100,
              width: 80,
              height: 80
            }))
          },
          {
            name: "איזור VIP",
            color: "#F59E0B",
            positionX: 750,
            positionY: 100,
            width: 200,
            height: 300,
            tables: Array.from({ length: 8 }, (_, i) => ({
              name: `VIP ${i + 1}`,
              seats: 10,
              positionX: 50 + (i % 2) * 100,
              positionY: 50 + Math.floor(i / 2) * 100,
              width: 80,
              height: 80
            }))
          }
        ],
        venueAreas: [
          {
            areaType: "stage",
            name: "במה",
            positionX: 100,
            positionY: 650,
            width: 400,
            height: 150,
            color: "#EC4899",
            icon: "🎤"
          },
          {
            areaType: "kitchen",
            name: "מטבח",
            positionX: 550,
            positionY: 650,
            width: 200,
            height: 150,
            color: "#EF4444",
            icon: "👨‍🍳"
          },
          {
            areaType: "entrance",
            name: "כניסה",
            positionX: 400,
            positionY: 50,
            width: 150,
            height: 80,
            color: "#6B7280",
            icon: "🚪"
          }
        ]
      };

    case "empty":
    default:
      return {
        zones: [],
        venueAreas: []
      };
  }
}
