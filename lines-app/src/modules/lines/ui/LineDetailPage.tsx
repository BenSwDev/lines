"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Edit,
  ArrowLeft,
  ArrowRight,
  Map,
  Users,
  DollarSign,
  Settings
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { Line, LineOccurrence } from "@prisma/client";
import { LineReservationSettings } from "./LineReservationSettings";
import { getFloorPlans } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { updateLine } from "../actions/updateLine";
import type { FloorPlanListItem } from "@/modules/floor-plan-editor/types";

type LineDetailPageProps = {
  line: Line;
  occurrences?: LineOccurrence[];
  venueId: string;
};

export function LineDetailPage({ line, venueId }: LineDetailPageProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const [floorPlans, setFloorPlans] = useState<FloorPlanListItem[]>([]);
  const [selectedFloorPlanId, setSelectedFloorPlanId] = useState<string | null>(
    line.floorPlanId || null
  );
  const [isLoadingFloorPlans, setIsLoadingFloorPlans] = useState(false);
  const [isUpdatingFloorPlan, setIsUpdatingFloorPlan] = useState(false);

  const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const daysText = line.days.map((d) => DAYS_HEBREW[d]).join(", ");

  // Load floor plans
  useEffect(() => {
    async function loadFloorPlans() {
      setIsLoadingFloorPlans(true);
      try {
        const result = await getFloorPlans(venueId);
        if (result.success && result.data) {
          setFloorPlans(result.data);
        }
      } finally {
        setIsLoadingFloorPlans(false);
      }
    }
    loadFloorPlans();
  }, [venueId]);

  const handleFloorPlanChange = async (floorPlanId: string | null) => {
    setIsUpdatingFloorPlan(true);
    try {
      const result = await updateLine(venueId, line.id, {
        floorPlanId: floorPlanId || null
      });
      if (result.success) {
        setSelectedFloorPlanId(floorPlanId);
        router.refresh();
      }
    } finally {
      setIsUpdatingFloorPlan(false);
    }
  };

  const selectedFloorPlan = floorPlans.find((fp) => fp.id === selectedFloorPlanId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/venues/${venueId}/lines`)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {line.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {daysText} • {line.startTime}-{line.endTime}
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/venues/${venueId}/lines?edit=${line.id}`)}
          className="bg-gradient-to-r from-primary to-primary/90 shadow-md hover:shadow-lg"
        >
          <Edit className="ml-2 h-4 w-4" />
          עריכה
        </Button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
          {/* Decorative glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl" />

          <CardHeader className="relative z-10 pb-2">
            <p className="text-sm font-medium text-muted-foreground">תדירות</p>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-xl font-bold text-foreground">{line.frequency}</p>
          </CardContent>
        </Card>
      </div>


      {/* Floor Plan & Seating Arrangement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {t("lines.floorPlan", { defaultValue: "מפה וסידור הושבה" })}
          </h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              {t("lines.selectFloorPlan", { defaultValue: "בחר מפה" })}
            </CardTitle>
            <CardDescription>
              {t("lines.floorPlanDescription", {
                defaultValue: "המפה קובעת את סידור ההושבה עבור הליין"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedFloorPlanId || "none"}
              onValueChange={(value) => handleFloorPlanChange(value === "none" ? null : value)}
              disabled={isLoadingFloorPlans || isUpdatingFloorPlan}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("lines.selectFloorPlanPlaceholder", { defaultValue: "בחר מפה" })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("lines.noFloorPlan", { defaultValue: "ללא מפה" })}
                </SelectItem>
                {floorPlans.map((fp) => (
                  <SelectItem key={fp.id} value={fp.id}>
                    {fp.name}
                    {fp.isDefault && (
                      <Badge variant="outline" className="mr-2">
                        {t("common.default", { defaultValue: "ברירת מחדל" })}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedFloorPlan && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {selectedFloorPlan._count.zones} {t("lines.zones", { defaultValue: "איזורים" })}
                    , {selectedFloorPlan._count.venueAreas}{" "}
                    {t("lines.specialAreas", { defaultValue: "אזורים מיוחדים" })}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/venues/${venueId}/settings/structure/${selectedFloorPlan.id}`)
                  }
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t("lines.editSeatingArrangement", { defaultValue: "ערוך סידור הושבה" })}
                </Button>
              </div>
            )}

            {!selectedFloorPlan && (
              <div className="text-sm text-muted-foreground">
                {t("lines.noFloorPlanSelected", {
                  defaultValue: "לא נבחרה מפה. בחר מפה כדי לנהל סידור הושבה ומינימום הזמנה."
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staffing & Minimum Order Quick Access */}
        {selectedFloorPlan && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() =>
                router.push(
                  `/venues/${venueId}/settings/structure/${selectedFloorPlan.id}?mode=staffing`
                )
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  {t("lines.staffing", { defaultValue: "סידור עבודה" })}
                </CardTitle>
                <CardDescription>
                  {t("lines.staffingDescription", {
                    defaultValue: "נהל סידור עבודה ספציפי לליין זה"
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {t("lines.manageStaffing", { defaultValue: "נהל סידור עבודה" })}
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() =>
                router.push(
                  `/venues/${venueId}/settings/structure/${selectedFloorPlan.id}?mode=minimum-order`
                )
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  {t("lines.minimumOrder", { defaultValue: "מינימום הזמנה" })}
                </CardTitle>
                <CardDescription>
                  {t("lines.minimumOrderDescription", {
                    defaultValue: "נהל מינימום הזמנה ספציפי לליין זה"
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {t("lines.manageMinimumOrder", { defaultValue: "נהל מינימום הזמנה" })}
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Line Reservation Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">הגדרות הזמנות</h2>
        <LineReservationSettings lineId={line.id} venueId={venueId} />
      </div>
    </div>
  );
}
