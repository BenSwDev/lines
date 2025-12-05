"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Locale = "he" | "en";
type Translations = Record<string, unknown>;

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("he");
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    // Load translations
    import(`../../../messages/${locale}.json`).then((module) => {
      setTranslations(module.default);
    });

    // Update HTML attributes
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";

    // Save to localStorage
    localStorage.setItem("locale", locale);
  }, [locale]);

  useEffect(() => {
    // Load saved locale
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && (saved === "he" || saved === "en")) {
      setLocaleState(saved);
    }
  }, []);

  const t = (key: string, params?: Record<string, string>): string => {
    // If key looks like a translation key (contains dots), try to translate it
    // Otherwise, return as-is (for backward compatibility)
    if (!key.includes(".")) {
      return key;
    }

    const keys = key.split(".");
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation missing
      }
    }

    let result = String(value);

    // Replace params
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(`{${paramKey}}`, paramValue);
      });
    }

    return result;
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>{children}</I18nContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslations must be used within I18nProvider");
  }
  return context;
}

export function useLocale() {
  const { locale, setLocale } = useTranslations();
  return { locale, setLocale };
}
