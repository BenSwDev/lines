"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
  title?: string;
  onNavigate?: (item: SidebarNavItem) => void;
}

export function SidebarNav({ items, title, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="p-4 space-y-2">
      {title && <h2 className="px-3 text-lg font-semibold text-gray-100 mb-4">{title}</h2>}

      {items.map((item) => {
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => onNavigate?.(item)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

