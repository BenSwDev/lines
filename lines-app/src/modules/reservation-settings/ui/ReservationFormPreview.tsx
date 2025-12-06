"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import Image from "next/image";
import type { ReservationFormFieldInput, ReservationFormDesignInput } from "../types";

interface ReservationFormPreviewProps {
  fields: ReservationFormFieldInput[];
  design?: ReservationFormDesignInput;
  onClose: () => void;
}

export function ReservationFormPreview({ fields, design, onClose }: ReservationFormPreviewProps) {
  const { t, dir } = useTranslations();

  const enabledFields = fields.filter((f) => f.isEnabled).sort((a, b) => a.order - b.order);

  const getRTLClasses = (dir: "ltr" | "rtl") => ({
    textAlign: dir === "rtl" ? "text-right" : "text-left"
  });

  const rtlClasses = getRTLClasses(dir);

  const formStyle: React.CSSProperties = {
    backgroundColor: design?.backgroundColor || "#FFFFFF",
    color: design?.textColor || "#000000",
    borderRadius: design?.borderRadius || "8px",
    fontFamily: design?.fontFamily || undefined
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: design?.buttonColor || design?.primaryColor || "#3B82F6",
    color: design?.buttonTextColor || "#FFFFFF",
    borderRadius: design?.borderRadius || "8px"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={formStyle}>
        <CardHeader className="relative">
          <div className={`flex items-center ${dir === "rtl" ? "flex-row-reverse" : ""} justify-between`}>
            <div>
              <CardTitle className={rtlClasses.textAlign}>
                {design?.headerText || t("reservations.formPreview.title")}
              </CardTitle>
              {design?.logoUrl && (
                <div className="relative h-12 w-32 mt-2">
                  <Image src={design.logoUrl} alt="Logo" fill className="object-contain" />
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {enabledFields.length === 0 ? (
            <div className={`text-center py-8 text-muted-foreground ${rtlClasses.textAlign}`}>
              {t("reservations.formPreview.noFields")}
            </div>
          ) : (
            enabledFields.map((field, index) => (
              <div key={index} className={`space-y-2 ${rtlClasses.textAlign}`}>
                <Label>
                  {field.label}
                  {field.isRequired && <span className="text-destructive mr-1">*</span>}
                </Label>
                {field.fieldType === "textarea" ? (
                  <Textarea
                    placeholder={field.placeholder || ""}
                    dir={dir}
                    style={{ color: design?.textColor || "#000000" }}
                  />
                ) : field.fieldType === "select" ? (
                  <Select>
                    <SelectTrigger style={{ color: design?.textColor || "#000000" }}>
                      <SelectValue placeholder={field.placeholder || ""} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option, optIndex) => (
                        <SelectItem key={optIndex} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.fieldType === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`preview-${index}`} />
                    <Label htmlFor={`preview-${index}`} className="cursor-pointer">
                      {field.placeholder || field.label}
                    </Label>
                  </div>
                ) : (
                  <Input
                    type={
                      field.fieldType === "email"
                        ? "email"
                        : field.fieldType === "phone"
                          ? "tel"
                          : field.fieldType === "date"
                            ? "date"
                            : field.fieldType === "time"
                              ? "time"
                              : field.fieldType === "number"
                                ? "number"
                                : "text"
                    }
                    placeholder={field.placeholder || ""}
                    dir={field.fieldType === "email" || field.fieldType === "phone" || field.fieldType === "date" || field.fieldType === "time" || field.fieldType === "number" ? "ltr" : dir}
                    style={{ color: design?.textColor || "#000000" }}
                  />
                )}
              </div>
            ))
          )}
          <div className="flex justify-end pt-4">
            <Button style={buttonStyle}>
              {t("reservations.formPreview.submit")}
            </Button>
          </div>
          {design?.footerText && (
            <div className={`text-sm text-muted-foreground mt-4 ${rtlClasses.textAlign}`}>
              {design.footerText}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

