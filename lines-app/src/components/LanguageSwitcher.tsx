"use client";

import React from "react";
import { useLocale } from "@/core/i18n/provider";
import { Button } from "@/shared/ui/Button";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === "he" ? "en" : "he");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="min-w-[60px]"
      aria-label={locale === "he" ? "Switch to English" : "עבור לעברית"}
    >
      {locale === "he" ? "EN" : "עב"}
    </Button>
  );
}
