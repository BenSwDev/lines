"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Map,
  Settings,
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { getLine } from "../actions/getLine";
import { getFloorPlans } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { updateLine } from "../actions/updateLine";
import { LineReservationSettings } from "./LineReservationSettings";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { translateError } from "@/utils/translateError";
import type { Line, LineOccurrence } from "@prisma/client";
import type { FloorPlanListItem } from "@/modules/floor-plan-editor/types";

type LineDetailViewProps = {
  lineId: string;
  venueId: string;
  onBack: () => void;
};

export function LineDetailView({ lineId, venueId, onBack }: LineDetailViewProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const { toast } = useToast();
  const [line, setLine] = useState<Line | null>(null);
  const [occurrences, setOccurrences] = useState<LineOccurrence[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlanListItem[]>([]);
  const [selectedFloorPlanId, setSelectedFloorPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingFloorPlan, setIsUpdatingFloorPlan] = useState(false);

  useEffect(() => {
    loadLineData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId, venueId]);

  const loadLineData = async () => {
    setIsLoading(true);
    try {
      const [lineResult, floorPlansResult] = await Promise.all([
        getLine(venueId, lineId),
        getFloorPlans(venueId)
      ]);

      if (lineResult.success && "data" in lineResult && lineResult.data) {
        const lineData = lineResult.data as Line & { occurrences?: LineOccurrence[] };
        setLine(lineData);
        setSelectedFloorPlanId(lineData.floorPlanId || null);

        // Occurrences are included in line data from lineRepository.findById
        if (lineData.occurrences) {
          setOccurrences(lineData.occurrences);
        }
      }

      if (floorPlansResult.success && floorPlansResult.data) {
        setFloorPlans(floorPlansResult.data);
      }
    } catch (error) {
      console.error("Error loading line:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFloorPlanChange = async (floorPlanId: string | null) => {
    setIsUpdatingFloorPlan(true);
    try {
      const result = await updateLine(venueId, lineId, {
        floorPlanId: floorPlanId === "none" ? null : floorPlanId
      });
      if (result.success) {
        setSelectedFloorPlanId(floorPlanId === "none" ? null : floorPlanId);
        loadLineData();
        toast({
          title: t("success.detailsUpdated", { defaultValue: "עודכן בהצלחה" }),
          description: t("lines.floorPlanUpdated", {
            defaultValue: "המפה קושרה לליין בהצלחה"
          })
        });
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        toast({
          title: t("errors.generic"),
          description: errorMsg ? translateError(errorMsg, t) : t("errors.updatingLine"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating floor plan:", error);
      toast({
        title: t("errors.generic"),
        description: t("errors.updatingLine"),
        variant: "destructive"
      });
    } finally {
      setIsUpdatingFloorPlan(false);
    }
  };

  if (isLoading || !line) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-muted" />
        <div className="h-96 rounded-lg bg-muted" />
      </div>
    );
  }

  const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const daysText = line.days.map((d) => DAYS_HEBREW[d]).join(", ");
  const selectedFloorPlan = floorPlans.find((fp) => fp.id === selectedFloorPlanId);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-6">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-10 w-10 hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-xl shadow-lg ring-2 ring-background"
                style={{ backgroundColor: line.color }}
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {line.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{daysText}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {line.startTime} - {line.endTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/venues/${venueId}/lines?edit=${line.id}`)}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Edit className="ml-2 h-4 w-4" />
            {t("common.edit", { defaultValue: "עריכה" })}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all"
          >
            {t("lines.overview", { defaultValue: "סקירה" })}
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all"
          >
            {t("lines.events", { defaultValue: "אירועים" })}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all"
          >
            {t("lines.settings", { defaultValue: "הגדרות" })}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  תדירות
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {line.frequency === "weekly"
                    ? t("lines.weekly", { defaultValue: "שבועי" })
                    : line.frequency === "monthly"
                      ? t("lines.monthly", { defaultValue: "חודשי" })
                      : line.frequency === "oneTime"
                        ? t("lines.oneTime", { defaultValue: "פעם אחת" })
                        : t("lines.variable", { defaultValue: "משתנה" })}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  אירועים
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {occurrences.length}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Map className="h-4 w-4" />
                  מפה
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {selectedFloorPlan ? "✓" : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Floor Plan Card */}
          <Card className="overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                {t("lines.floorPlan", { defaultValue: "מפה וסידור הושבה" })}
              </CardTitle>
              <CardDescription>
                {t("lines.floorPlanDescription", {
                  defaultValue: "המפה קובעת את סידור ההושבה עבור הליין"
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <Select
                value={selectedFloorPlanId || "none"}
                onValueChange={(value) => handleFloorPlanChange(value === "none" ? null : value)}
                disabled={isUpdatingFloorPlan}
              >
                <SelectTrigger className="h-11 bg-background/50 backdrop-blur-sm">
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
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary" className="font-medium">
                      {selectedFloorPlan._count.zones}{" "}
                      {t("lines.zones", { defaultValue: "איזורים" })}
                    </Badge>
                    <Badge variant="secondary" className="font-medium">
                      {selectedFloorPlan._count.venueAreas}{" "}
                      {t("lines.specialAreas", { defaultValue: "אזורים מיוחדים" })}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-11 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border-primary/20 hover:border-primary/40 transition-all"
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
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {t("lines.noFloorPlanSelected", {
                    defaultValue: "לא נבחרה מפה. בחר מפה כדי לנהל סידור הושבה ומינימום הזמנה."
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4 mt-6">
          {occurrences.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12">
                <EmptyState
                  icon={Calendar}
                  title="אין אירועים עדיין"
                  description="האירועים יופיעו כאן לאחר יצירתם"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {occurrences.map((occurrence, idx) => (
                <Card
                  key={occurrence.id}
                  className={cn(
                    "cursor-pointer overflow-hidden border-2 transition-all duration-300",
                    "hover:border-primary/50 hover:shadow-xl hover:scale-[1.02]",
                    "bg-gradient-to-br from-card via-card to-card/95",
                    "group"
                  )}
                  style={{
                    animationDelay: `${idx * 50}ms`
                  }}
                  onClick={() =>
                    router.push(`/venues/${venueId}/events/${line.id}/${occurrence.id}`)
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/10 transition-all duration-500 pointer-events-none" />
                  <CardContent className="flex items-center justify-between p-5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-14 w-14 rounded-xl shadow-lg ring-2 ring-background transition-transform group-hover:scale-110"
                        style={{ backgroundColor: line.color }}
                      />
                      <div>
                        <span className="font-bold text-lg block mb-1">
                          {occurrence.title || occurrence.date}
                        </span>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{occurrence.date}</span>
                          <span>•</span>
                          <span>
                            {occurrence.startTime} - {occurrence.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <LineReservationSettings lineId={line.id} venueId={venueId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
