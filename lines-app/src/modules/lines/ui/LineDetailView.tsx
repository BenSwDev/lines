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
  ArrowRight
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { getLine } from "../actions/getLine";
import { getFloorPlans } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { updateLine } from "../actions/updateLine";
import { LineReservationSettings } from "./LineReservationSettings";
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
        floorPlanId: floorPlanId || null
      });
      if (result.success) {
        setSelectedFloorPlanId(floorPlanId);
        loadLineData();
      }
    } finally {
      setIsUpdatingFloorPlan(false);
    }
  };

  if (isLoading || !line) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const DAYS_HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const daysText = line.days.map((d) => DAYS_HEBREW[d]).join(", ");
  const selectedFloorPlan = floorPlans.find((fp) => fp.id === selectedFloorPlanId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="h-10 w-10">
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            {t("lines.overview", { defaultValue: "סקירה" })}
          </TabsTrigger>
          <TabsTrigger value="events">
            {t("lines.events", { defaultValue: "אירועים" })}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {t("lines.settings", { defaultValue: "הגדרות" })}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm font-medium text-muted-foreground">תדירות</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{line.frequency}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm font-medium text-muted-foreground">אירועים</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{occurrences.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Floor Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                {t("lines.floorPlan", { defaultValue: "מפה וסידור הושבה" })}
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
              disabled={isUpdatingFloorPlan}
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
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4 mt-6">
          {occurrences.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="אין אירועים עדיין"
              description="האירועים יופיעו כאן לאחר יצירתם"
            />
          ) : (
            <div className="space-y-2">
              {occurrences.map((occurrence) => (
                <Card
                  key={occurrence.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    router.push(`/venues/${venueId}/events/${line.id}/${occurrence.id}`)
                  }
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-lg border-2"
                        style={{ backgroundColor: line.color }}
                      />
                      <div>
                        <span className="font-bold text-lg">
                          {occurrence.title || occurrence.date}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {occurrence.date} • {occurrence.startTime}-{occurrence.endTime}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
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

