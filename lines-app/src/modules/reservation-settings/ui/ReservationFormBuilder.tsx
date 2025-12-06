"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Eye } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { ReservationFormFieldInput } from "../types";

interface ReservationFormBuilderProps {
  fields: ReservationFormFieldInput[];
  onChange: (fields: ReservationFormFieldInput[]) => void;
  onPreview?: () => void;
}

const DEFAULT_FIELDS: Array<Omit<ReservationFormFieldInput, "order">> = [
  { fieldType: "name", fieldKey: "name", label: "שם מלא", placeholder: "הזן שם מלא", isRequired: true, isEnabled: true },
  { fieldType: "email", fieldKey: "email", label: "אימייל", placeholder: "הזן אימייל", isRequired: true, isEnabled: true },
  { fieldType: "phone", fieldKey: "phone", label: "טלפון", placeholder: "הזן מספר טלפון", isRequired: true, isEnabled: true }
];

export function ReservationFormBuilder({ fields, onChange, onPreview }: ReservationFormBuilderProps) {
  const { t, dir } = useTranslations();

  const addField = (fieldType?: ReservationFormFieldInput["fieldType"]) => {
    const newField: ReservationFormFieldInput = fieldType
      ? {
          fieldType,
          fieldKey: fieldType === "custom" ? `custom_${Date.now()}` : fieldType,
          label: fieldType === "custom" ? "שדה מותאם אישית" : DEFAULT_FIELDS.find((f) => f.fieldType === fieldType)?.label || "",
          placeholder: DEFAULT_FIELDS.find((f) => f.fieldType === fieldType)?.placeholder || "",
          isRequired: false,
          isEnabled: true,
          order: fields.length
        }
      : {
          fieldType: "custom",
          fieldKey: `custom_${Date.now()}`,
          label: "שדה מותאם אישית",
          placeholder: "",
          isRequired: false,
          isEnabled: true,
          order: fields.length
        };

    onChange([...fields, newField]);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i }));
    onChange(newFields);
  };

  const updateField = (index: number, updates: Partial<ReservationFormFieldInput>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange(newFields);
  };

  const getRTLClasses = (dir: "ltr" | "rtl") => ({
    flexReverse: dir === "rtl" ? "flex-row-reverse" : "",
    textAlign: dir === "rtl" ? "text-right" : "text-left"
  });

  const rtlClasses = getRTLClasses(dir);

  return (
    <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <CardHeader className="relative z-10">
        <div className={`flex items-center ${rtlClasses.flexReverse} justify-between`}>
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/40 to-primary/20">
                <Plus className="h-5 w-5 text-primary-foreground" />
              </div>
              {t("reservations.formBuilder.title")}
            </CardTitle>
            <CardDescription>{t("reservations.formBuilder.description")}</CardDescription>
          </div>
          {onPreview && (
            <Button variant="outline" size="sm" onClick={onPreview} className="gap-2">
              <Eye className="h-4 w-4" />
              {t("reservations.formBuilder.preview")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField("name")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("reservations.formBuilder.addName")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField("email")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("reservations.formBuilder.addEmail")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField("phone")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("reservations.formBuilder.addPhone")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("reservations.formBuilder.addCustom")}
          </Button>
        </div>

        {/* Fields List */}
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className={`text-center py-8 text-muted-foreground ${rtlClasses.textAlign}`}>
              {t("reservations.formBuilder.noFields")}
            </div>
          ) : (
            fields.map((field, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className={`flex items-center ${rtlClasses.flexReverse} gap-3`}>
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`space-y-2 ${rtlClasses.textAlign}`}>
                        <Label>{t("reservations.formBuilder.fieldType")}</Label>
                        <Select
                          value={field.fieldType}
                          onValueChange={(value) =>
                            updateField(index, {
                              fieldType: value as ReservationFormFieldInput["fieldType"],
                              fieldKey: value === "custom" ? `custom_${Date.now()}` : value
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">{t("reservations.formBuilder.types.name")}</SelectItem>
                            <SelectItem value="email">{t("reservations.formBuilder.types.email")}</SelectItem>
                            <SelectItem value="phone">{t("reservations.formBuilder.types.phone")}</SelectItem>
                            <SelectItem value="date">{t("reservations.formBuilder.types.date")}</SelectItem>
                            <SelectItem value="time">{t("reservations.formBuilder.types.time")}</SelectItem>
                            <SelectItem value="number">{t("reservations.formBuilder.types.number")}</SelectItem>
                            <SelectItem value="text">{t("reservations.formBuilder.types.text")}</SelectItem>
                            <SelectItem value="textarea">{t("reservations.formBuilder.types.textarea")}</SelectItem>
                            <SelectItem value="select">{t("reservations.formBuilder.types.select")}</SelectItem>
                            <SelectItem value="checkbox">{t("reservations.formBuilder.types.checkbox")}</SelectItem>
                            <SelectItem value="custom">{t("reservations.formBuilder.types.custom")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={`space-y-2 ${rtlClasses.textAlign}`}>
                        <Label>{t("reservations.formBuilder.label")}</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder={t("reservations.formBuilder.labelPlaceholder")}
                        />
                      </div>
                      <div className={`space-y-2 ${rtlClasses.textAlign}`}>
                        <Label>{t("reservations.formBuilder.placeholder")}</Label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(index, { placeholder: e.target.value || null })}
                          placeholder={t("reservations.formBuilder.placeholderPlaceholder")}
                        />
                      </div>
                      <div className={`flex items-center ${rtlClasses.flexReverse} justify-between gap-4`}>
                        <div className={`flex items-center ${rtlClasses.flexReverse} gap-2`}>
                          <Switch
                            checked={field.isRequired}
                            onCheckedChange={(checked) => updateField(index, { isRequired: checked })}
                          />
                          <Label>{t("reservations.formBuilder.required")}</Label>
                        </div>
                        <div className={`flex items-center ${rtlClasses.flexReverse} gap-2`}>
                          <Switch
                            checked={field.isEnabled}
                            onCheckedChange={(checked) => updateField(index, { isEnabled: checked })}
                          />
                          <Label>{t("reservations.formBuilder.enabled")}</Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

