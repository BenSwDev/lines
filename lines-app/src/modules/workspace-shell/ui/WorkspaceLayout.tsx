"use client";

import React from "react";
import { SidebarNav, type SidebarNavItem } from "@/shared/layout/SidebarNav";
import { TopBar } from "@/shared/layout/TopBar";
import type { Venue } from "@prisma/client";

export interface WorkspaceLayoutProps {
  venue: Venue;
  children: React.ReactNode;
}

export function WorkspaceLayout({ venue, children }: WorkspaceLayoutProps) {
  const navItems: SidebarNavItem[] = [
    {
      id: "info",
      label: "פרטי מקום",
      href: `/venues/${venue.id}/info`,
    },
    {
      id: "settings",
      label: "הגדרות מקום",
      href: `/venues/${venue.id}/settings`,
    },
    {
      id: "lines",
      label: "ליינים",
      href: `/venues/${venue.id}/lines`,
    },
    {
      id: "calendar",
      label: "לוח שנה",
      href: `/venues/${venue.id}/calendar`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <TopBar
        title={venue.name}
        backLink={{
          href: "/",
          label: "חזרה לבית",
        }}
      />
      
      <div className="flex">
        <SidebarNav items={navItems} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

