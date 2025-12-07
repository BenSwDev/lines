"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import {
  getReservationSettings,
  updateReservationSettings,
  getVenueLines
} from "../actions/reservationSettingsActions";
import type { ReservationSettingsInput } from "../types";
import { Settings2, Calendar, FileText, List, Save } from "lucide-react";
import { ReservationFormBuilder } from "./ReservationFormBuilder";
import { ReservationFormPreview } from "./ReservationFormPreview";
import { ReservationFormDesigner } from "./ReservationFormDesigner";
import type { ReservationFormFieldInput, ReservationFormDesignInput } from "../types";

type Line = {
  id: string;
  name: string;
};

const DAYS_OF_WEEK = [
  { value: 0, label: "ראשון", short: "א" },
  { value: 1, label: "שני", short: "ב" },
  { value: 2, label: "שלישי", short: "ג" },
  { value: 3, label: "רביעי", short: "ד" },
  { value: 4, label: "חמישי", short: "ה" },
  { value: 5, label: "שישי", short: "ו" },
  { value: 6, label: "שבת", short: "ש" }
];

export function ReservationSettingsTab() {
  const params = useParams();
  const venueId = params.venueId as string;
  const { toast } = useToast();
  const { t, dir } = useTranslations();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [acceptsReservations, setAcceptsReservations] = useState(false);
  const [allowPersonalLink, setAllowPersonalLink] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [manualRegistrationOnly, setManualRegistrationOnly] = useState(true);
  const [manageWaitlist, setManageWaitlist] = useState(false);
  const [excludedLineIds, setExcludedLineIds] = useState<string[]>([]);
  const [daySchedules, setDaySchedules] = useState<
    Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      intervalMinutes: number | null;
      customerMessage: string | null;
    }>
  >([]);
  const [formFields, setFormFields] = useState<ReservationFormFieldInput[]>([]);
  const [formDesign, setFormDesign] = useState<ReservationFormDesignInput | undefined>(undefined);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const settingsResult = await getReservationSettings(venueId);
      if (settingsResult.success) {
        const data = settingsResult.data;
        setAcceptsReservations(data.acceptsReservations);
        setAllowPersonalLink(data.allowPersonalLink);
        setRequireApproval(data.requireApproval);
        setManualRegistrationOnly(data.manualRegistrationOnly);
        setManageWaitlist(data.manageWaitlist);
        setExcludedLineIds(data.excludedLines.map((el) => el.lineId));
            setDaySchedules(
              data.daySchedules.map((ds) => ({
                dayOfWeek: ds.dayOfWeek,
                startTime: ds.startTime,
                endTime: ds.endTime,
                intervalMinutes: ds.intervalMinutes,
                customerMessage: ds.customerMessage
              }))
            );
            setFormFields(
              data.formFields.map((ff) => ({
                id: ff.id,
                fieldType: ff.fieldType as ReservationFormFieldInput["fieldType"],
                fieldKey: ff.fieldKey,
                label: ff.label,
                placeholder: ff.placeholder,
                isRequired: ff.isRequired,
                isEnabled: ff.isEnabled,
                order: ff.order,
                validationRules: ff.validationRules as ReservationFormFieldInput["validationRules"],
                options: ff.options as ReservationFormFieldInput["options"]
              }))
            );
            if (data.formDesign) {
              setFormDesign({
                primaryColor: data.formDesign.primaryColor,
                secondaryColor: data.formDesign.secondaryColor,
                backgroundColor: data.formDesign.backgroundColor,
                textColor: data.formDesign.textColor,
                buttonColor: data.formDesign.buttonColor,
                buttonTextColor: data.formDesign.buttonTextColor,
                borderRadius: data.formDesign.borderRadius,
                fontFamily: data.formDesign.fontFamily,
                headerText: data.formDesign.headerText,
                footerText: data.formDesign.footerText,
                logoUrl: data.formDesign.logoUrl
              });
            }
          }

      const linesResult = await getVenueLines(venueId);
      if (linesResult.success) {
        setLines(linesResult.data);
      }
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const input: ReservationSettingsInput = {
        acceptsReservations,
        allowPersonalLink,
        requireApproval,
        manualRegistrationOnly,
        manageWaitlist,
        excludedLineIds,
        daySchedules: daySchedules.filter(
          (ds) => ds.startTime && ds.endTime && ds.startTime < ds.endTime
        ),
        formFields: formFields.length > 0 ? formFields : undefined,
        formDesign: formDesign
      };

      const result = await updateReservationSettings(venueId, input);

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

  const toggleLineExclusion = (lineId: string) => {
    setExcludedLineIds((prev) =>
      prev.includes(lineId) ? prev.filter((id) => id !== lineId) : [...prev, lineId]
    );
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
      <div className="space-y-4">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("reservations.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("reservations.subtitle")}</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving || !acceptsReservations} size="sm">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? t("common.saving") : t("common.save")}
        </Button>
      </div>

      {/* Main Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="acceptsReservations" className="text-base font-medium">
                {t("reservations.acceptsReservations")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("reservations.acceptsReservationsDescription")}
              </p>
            </div>
            <Switch
              id="acceptsReservations"
              checked={acceptsReservations}
              onCheckedChange={setAcceptsReservations}
            />
          </div>
        </CardContent>
      </Card>

      {!acceptsReservations && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              הפעל הזמנות כדי לראות את כל ההגדרות
            </p>
          </CardContent>
        </Card>
      )}

      {acceptsReservations && (
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Settings2 className="h-4 w-4" />
              כללי
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              לוחות זמנים
            </TabsTrigger>
            <TabsTrigger value="forms" className="gap-2">
              <FileText className="h-4 w-4" />
              טפסים
            </TabsTrigger>
            <TabsTrigger value="lines" className="gap-2">
              <List className="h-4 w-4" />
              ליינים
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">הגדרות אישיות</CardTitle>
                <CardDescription>הגדר לינקים אישיים ואישורים</CardDescription>
          </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowPersonalLink" className="text-sm font-medium">
                  {t("reservations.allowPersonalLink")}
                </Label>
                    <p className="text-xs text-muted-foreground">
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
                    setManualRegistrationOnly(true);
                  } else {
                    setManualRegistrationOnly(false);
                  }
                }}
              />
            </div>

            {allowPersonalLink && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireApproval" className="text-sm font-medium">
                    {t("reservations.requireApproval")}
                  </Label>
                      <p className="text-xs text-muted-foreground">
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="manageWaitlist" className="text-sm font-medium">
                      {t("reservations.manageWaitlist")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
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
          </TabsContent>

          {/* Day Schedules Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {!allowPersonalLink ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-sm text-muted-foreground">
                    הפעל לינקים אישיים כדי להגדיר לוחות זמנים
                  </p>
          </CardContent>
        </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">לוחות זמנים יומיים</CardTitle>
                  <CardDescription>הגדר מתי אפשר להזמין בכל יום</CardDescription>
          </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
            {DAYS_OF_WEEK.map((day) => {
              const schedule = getDaySchedule(day.value);
                      const hasSchedule = schedule.startTime && schedule.endTime;
              return (
                        <AccordionItem key={day.value} value={`day-${day.value}`}>
                          <AccordionTrigger className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{day.label}</span>
                              {hasSchedule && (
                                <span className="text-xs text-muted-foreground">
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                              )}
                  </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid gap-3 pt-2 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`startTime-${day.value}`} className="text-xs">
                                  שעת התחלה
                      </Label>
                      <Input
                        id={`startTime-${day.value}`}
                        type="time"
                        value={schedule.startTime}
                                  onChange={(e) =>
                                    updateDaySchedule(day.value, "startTime", e.target.value)
                                  }
                                  className="h-9"
                        dir="ltr"
                      />
                    </div>
                              <div className="space-y-2">
                                <Label htmlFor={`endTime-${day.value}`} className="text-xs">
                                  שעת סיום
                      </Label>
                      <Input
                        id={`endTime-${day.value}`}
                        type="time"
                        value={schedule.endTime}
                                  onChange={(e) =>
                                    updateDaySchedule(day.value, "endTime", e.target.value)
                                  }
                                  className="h-9"
                        dir="ltr"
                      />
                    </div>
                              <div className="space-y-2">
                                <Label htmlFor={`interval-${day.value}`} className="text-xs">
                                  מרווח (דקות) - אופציונלי
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
                                  className="h-9"
                        dir="ltr"
                      />
                    </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`message-${day.value}`} className="text-xs">
                                  הודעה ללקוח - אופציונלי
                      </Label>
                      <Textarea
                        id={`message-${day.value}`}
                                  placeholder="הודעה שתוצג ללקוח ביום זה"
                        value={schedule.customerMessage || ""}
                        onChange={(e) =>
                                    updateDaySchedule(
                                      day.value,
                                      "customerMessage",
                                      e.target.value || null
                                    )
                        }
                        rows={2}
                        dir={dir}
                      />
                    </div>
                  </div>
                          </AccordionContent>
                        </AccordionItem>
              );
            })}
                  </Accordion>
          </CardContent>
        </Card>
      )}
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
          <ReservationFormBuilder
            fields={formFields}
            onChange={setFormFields}
            onPreview={() => setShowPreview(true)}
          />
            <ReservationFormDesigner design={formDesign} onChange={setFormDesign} />
          </TabsContent>

          {/* Lines Tab */}
          <TabsContent value="lines" className="space-y-4">
            {lines.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-sm text-muted-foreground">
                    אין ליינים במקום זה
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ליינים לא כוללים בהזמנות</CardTitle>
                  <CardDescription>בחר ליינים שלא יופיעו בהזמנות</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lines.map((line) => (
                      <div key={line.id} className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor={`line-${line.id}`} className="cursor-pointer text-sm font-medium">
                          {line.name}
                        </Label>
                        <Switch
                          id={`line-${line.id}`}
                          checked={excludedLineIds.includes(line.id)}
                          onCheckedChange={() => toggleLineExclusion(line.id)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Preview Dialog */}
      {showPreview && (
        <ReservationFormPreview
          fields={formFields}
          design={formDesign}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
