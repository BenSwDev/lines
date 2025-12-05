import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Lines App",
  description: "Venue management system"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body>{children}</body>
    </html>
  );
}
