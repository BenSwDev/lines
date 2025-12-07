"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import {
  getLineReservationSettings,
  updateLineReservationSettings
} from "../actions/lineReservationSettingsActions";
import type { LineReservationSettingsInput } from "../schemas/lineReservationSettingsSchemas";
import { Link2, Clock, Settings2 } from "lucide-react";

// Helper to get RTL-aware classes
const getRTLClasses = (dir: "ltr" | "rtl") => ({
  flexReverse: dir === "rtl" ? "flex-row-reverse" : "",
  spaceX: dir === "rtl" ? "space-x-reverse" : "",
  iconMargin: dir === "rtl" ? "ml-2" : "mr-2",
  justifyEnd: dir === "rtl" ? "justify-start" : "justify-end",
  textAlign: dir === "rtl" ? "text-right" : "text-left"
});

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
];

type LineReservationSettingsProps = {
  lineId: string;
  venueId: string;
};

export function LineReservationSettings({ lineId }: LineReservationSettingsProps) {
  const { toast } = useToast();
  const { t, dir } = useTranslations();
  const rtlClasses = getRTLClasses(dir);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Form state
  const [allowPersonalLink, setAllowPersonalLink] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [manageWaitlist, setManageWaitlist] = useState(false);
  const [daySchedules, setDaySchedules] = useState<
    Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      intervalMinutes: number | null;
      customerMessage: string | null;
    }>
  >([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getLineReservationSettings(lineId);
      if (result.success) {
        const data = result.data;
        if (!data) return;
        setIsAvailable(true);
        setAllowPersonalLink(data.allowPersonalLink);
        setRequireApproval(data.requireApproval);
        setManageWaitlist(data.manageWaitlist);
        setDaySchedules(
          data.daySchedules.map((ds) => ({
            dayOfWeek: ds.dayOfWeek,
            startTime: ds.startTime,
            endTime: ds.endTime,
            intervalMinutes: ds.intervalMinutes,
            customerMessage: ds.customerMessage
          }))
        );
      } else {
        setIsAvailable(false);
        if (result.error !== "This line is excluded from reservations") {
          toast({
            title: t("errors.generic"),
            description: result.error,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      setIsAvailable(false);
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const input: LineReservationSettingsInput = {
        allowPersonalLink,
        requireApproval,
        manageWaitlist,
        daySchedules: daySchedules.filter(
          (ds) => ds.startTime && ds.endTime && ds.startTime < ds.endTime
        )
      };

      const result = await updateLineReservationSettings(lineId, input);

      if (result.success) {
        toast({
          title: t("success.detailsUpdated"),
          description: t("reservations.settingsUpdated")
        });
        await loadData();
      } else {
        toast({
          title: t("errors.generic"),
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateDaySchedule = (
    dayOfWeek: number,
    field: "startTime" | "endTime" | "intervalMinutes" | "customerMessage",
    value: string | number | null
  ) => {
    setDaySchedules((prev) => {
      const existing = prev.find((ds) => ds.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map((ds) => (ds.dayOfWeek === dayOfWeek ? { ...ds, [field]: value } : ds));
      } else {
        return [
          ...prev,
          {
            dayOfWeek,
            startTime: field === "startTime" ? (value as string) : "",
            endTime: field === "endTime" ? (value as string) : "",
            intervalMinutes: field === "intervalMinutes" ? (value as number | null) : null,
            customerMessage: field === "customerMessage" ? (value as string | null) : null
          }
        ];
      }
    });
  };

  const getDaySchedule = (dayOfWeek: number) => {
    return (
      daySchedules.find((ds) => ds.dayOfWeek === dayOfWeek) || {
        dayOfWeek,
        startTime: "",
        endTime: "",
        intervalMinutes: null,
        customerMessage: null
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
      </div>
    );
  }

  if (!isAvailable) {
    return null; // Don't show settings if line is excluded or reservations not enabled
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Link Settings */}
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-primary/60">
              <Link2 className="h-5 w-5 text-primary-foreground" />
            </div>
            {t("reservations.personalLinkSettings")}
          </CardTitle>
          <CardDescription>{t("reservations.personalLinkSettingsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6">
          <div className={`flex items-center ${rtlClasses.flexReverse} justify-between`}>
            <div className={`space-y-0.5 ${rtlClasses.textAlign}`}>
              <Label htmlFor="allowPersonalLink" className="text-base">
                {t("reservations.allowPersonalLink")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("reservations.allowPersonalLinkDescription")}
              </p>
            </div>
            <Switch
              id="allowPersonalLink"
              checked={allowPersonalLink}
              onCheckedChange={(checked) => {
                setAllowPersonalLink(checked);
                if (!checked) {
                  setRequireApproval(false);
                }
              }}
            />
          </div>

          {allowPersonalLink && (
            <div className={`flex items-center ${rtlClasses.flexReverse} justify-between`}>
              <div className={`space-y-0.5 ${rtlClasses.textAlign}`}>
                <Label htmlFor="requireApproval" className="text-base">
                  {t("reservations.requireApproval")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("reservations.requireApprovalDescription")}
                </p>
              </div>
              <Switch
                id="requireApproval"
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
              />
            </div>
          )}

          <div className={`flex items-center ${rtlClasses.flexReverse} justify-between`}>
            <div className={`space-y-0.5 ${rtlClasses.textAlign}`}>
              <Label htmlFor="manageWaitlist" className="text-base">
                {t("reservations.manageWaitlist")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("reservations.manageWaitlistDescription")}
              </p>
            </div>
            <Switch
              id="manageWaitlist"
              checked={manageWaitlist}
              onCheckedChange={setManageWaitlist}
            />
          </div>
        </CardContent>
      </Card>

      {/* Day Schedules */}
      {allowPersonalLink && (
        <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/40 to-primary/20">
                <Clock className="h-5 w-5 text-primary-foreground" />
              </div>
              {t("reservations.daySchedules")}
            </CardTitle>
            <CardDescription>{t("reservations.daySchedulesDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            {DAYS_OF_WEEK.map((day) => {
              const schedule = getDaySchedule(day.value);
              return (
                <div key={day.value} className="space-y-4 rounded-lg border p-4">
                  <div className={`flex items-center justify-between ${rtlClasses.textAlign}`}>
                    <Label className={`text-base font-semibold ${rtlClasses.textAlign}`}>
                      {day.label}
                    </Label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={`space-y-2 ${rtlClasses.textAlign}`}>
                      <Label htmlFor={`startTime-${day.value}`} className="text-sm">
                        {t("reservations.startTime")}
                      </Label>
                      <Input
                        id={`startTime-${day.value}`}
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateDaySchedule(day.value, "startTime", e.target.value)}
                        dir="ltr"
                        className={rtlClasses.textAlign}
                      />
                    </div>
                    <div className={`space-y-2 ${rtlClasses.textAlign}`}>
                      <Label htmlFor={`endTime-${day.value}`} className="text-sm">
                        {t("reservations.endTime")}
                      </Label>
                      <Input
                        id={`endTime-${day.value}`}
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateDaySchedule(day.value, "endTime", e.target.value)}
                        dir="ltr"
                        className={rtlClasses.textAlign}
                      />
                    </div>
                    <div className={`space-y-2 ${rtlClasses.textAlign}`}>
                      <Label htmlFor={`interval-${day.value}`} className="text-sm">
                        {t("reservations.intervalMinutes")} ({t("reservations.optional")})
                      </Label>
                      <Input
                        id={`interval-${day.value}`}
                        type="number"
                        min="1"
                        placeholder="30"
                        value={schedule.intervalMinutes || ""}
                        onChange={(e) =>
                          updateDaySchedule(
                            day.value,
                            "intervalMinutes",
                            e.target.value ? parseInt(e.target.value, 10) : null
                          )
                        }
                        dir="ltr"
                        className={rtlClasses.textAlign}
                      />
                    </div>
                    <div className={`space-y-2 md:col-span-2 ${rtlClasses.textAlign}`}>
                      <Label htmlFor={`message-${day.value}`} className="text-sm">
                        {t("reservations.customerMessage")} ({t("reservations.optional")})
                      </Label>
                      <Textarea
                        id={`message-${day.value}`}
                        placeholder={t("reservations.customerMessagePlaceholder")}
                        value={schedule.customerMessage || ""}
                        onChange={(e) =>
                          updateDaySchedule(day.value, "customerMessage", e.target.value || null)
                        }
                        rows={2}
                        dir={dir}
                        className={rtlClasses.textAlign}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className={`flex ${rtlClasses.justifyEnd}`}>
        <Button type="submit" disabled={isSaving} size="lg" className={rtlClasses.flexReverse}>
          {isSaving ? (
            <>
              <Clock className={`${rtlClasses.iconMargin} h-4 w-4 animate-spin`} />
              {t("common.saving")}
            </>
          ) : (
            <>
              <Settings2 className={`${rtlClasses.iconMargin} h-4 w-4`} />
              {t("common.save")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
