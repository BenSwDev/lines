"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, List, Layers, Plus, ArrowRight, Clock } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { lineRepository } from "@/core/db";
import { getFloorPlans } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import type { Venue } from "@prisma/client";
import type { Line } from "@prisma/client";

interface VenueDashboardProps {
  venue: Venue;
}

export function VenueDashboard({ venue }: VenueDashboardProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [floorPlansCount, setFloorPlansCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load lines
        const venueLines = await lineRepository.findByVenueId(venue.id);
        setLines(venueLines);

        // Load floor plans count
        const floorPlansResult = await getFloorPlans(venue.id);
        if (floorPlansResult.success && floorPlansResult.data) {
          setFloorPlansCount(floorPlansResult.data.length);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [venue.id]);

  // Get today's active lines
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const activeLinesToday = lines.filter((line) => line.days.includes(dayOfWeek));

  // Get upcoming occurrences (next 7 days)
  const upcomingLines = lines.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
        <p className="text-muted-foreground">
          {t("workspace.dashboardDescription", {
            defaultValue: "סקירה כללית של הפעילות וההגדרות"
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("workspace.lines", { defaultValue: "ליינים" })}
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lines.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeLinesToday.length > 0
                ? `${activeLinesToday.length} פעילים היום`
                : "אין ליינים פעילים היום"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("workspace.floorPlans", { defaultValue: "מפות" })}
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{floorPlansCount}</div>
            <p className="text-xs text-muted-foreground">מפות מוגדרות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("workspace.activeToday", { defaultValue: "פעילים היום" })}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLinesToday.length}</div>
            <p className="text-xs text-muted-foreground">ליינים פעילים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("workspace.totalEvents", { defaultValue: 'סה"כ אירועים' })}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lines.reduce((sum, line) => sum + (line.days.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">אירועים שבועיים</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(`/venues/${venue.id}/lines`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              {t("workspace.manageLines", { defaultValue: "נהל ליינים" })}
            </CardTitle>
            <CardDescription>
              {t("workspace.manageLinesDescription", {
                defaultValue: "צור וערוך ליינים ואירועים"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/venues/${venue.id}/lines`}>
                {t("common.open", { defaultValue: "פתח" })}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(`/venues/${venue.id}/calendar`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("workspace.calendar", { defaultValue: "לוח שנה" })}
            </CardTitle>
            <CardDescription>
              {t("workspace.calendarDescription", {
                defaultValue: "צפה בכל האירועים והליינים"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/venues/${venue.id}/calendar`}>
                {t("common.open", { defaultValue: "פתח" })}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(`/venues/${venue.id}/settings/structure`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t("workspace.manageFloorPlans", { defaultValue: "נהל מפות" })}
            </CardTitle>
            <CardDescription>
              {t("workspace.manageFloorPlansDescription", {
                defaultValue: "צור וערוך מפות מקום"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/venues/${venue.id}/settings/structure`}>
                {t("common.open", { defaultValue: "פתח" })}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Lines Today */}
      {activeLinesToday.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("workspace.activeLinesToday", { defaultValue: "ליינים פעילים היום" })}
            </CardTitle>
            <CardDescription>
              {t("workspace.activeLinesTodayDescription", {
                defaultValue: "ליינים שפועלים היום"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeLinesToday.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/venues/${venue.id}/lines/${line.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" style={{ borderColor: line.color, color: line.color }}>
                      {line.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {line.startTime} - {line.endTime}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Lines */}
      {upcomingLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("workspace.recentLines", { defaultValue: "ליינים אחרונים" })}</CardTitle>
            <CardDescription>
              {t("workspace.recentLinesDescription", {
                defaultValue: "ליינים שנוצרו לאחרונה"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingLines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/venues/${venue.id}/lines/${line.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" style={{ borderColor: line.color, color: line.color }}>
                      {line.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {line.days.length} ימים בשבוע
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            {lines.length > 5 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href={`/venues/${venue.id}/lines`}>
                  {t("workspace.viewAllLines", { defaultValue: "צפה בכל הליינים" })}
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && lines.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("workspace.noLinesYet", { defaultValue: "אין ליינים עדיין" })}</CardTitle>
            <CardDescription>
              {t("workspace.noLinesYetDescription", {
                defaultValue: "צור ליין ראשון כדי להתחיל"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/venues/${venue.id}/lines`}>
                <Plus className="h-4 w-4 mr-2" />
                {t("workspace.createFirstLine", { defaultValue: "צור ליין ראשון" })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
