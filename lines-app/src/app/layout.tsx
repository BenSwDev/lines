import type { ReactNode } from "react";
import { I18nProvider } from "@/core/i18n/provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata = {
  title: "Lines - ניהול אירועים חוזרים",
  description: "מערכת מתקדמת לניהול אירועים חוזרים ולוח שנה לעסקים"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body className="min-h-screen antialiased">
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
