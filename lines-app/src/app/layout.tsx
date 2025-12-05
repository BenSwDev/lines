import type { ReactNode } from "react";
import { I18nProvider } from "@/core/i18n/provider";
import "./globals.css";

export const metadata = {
  title: "Lines App",
  description: "Venue management system"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
