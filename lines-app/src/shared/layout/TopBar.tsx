import React from "react";
import Link from "next/link";

export interface TopBarProps {
  title?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
  className?: string;
}

export function TopBar({ title, logo, actions, backLink, className = "" }: TopBarProps) {
  return (
    <header className={`bg-gray-800 border-b border-gray-700 ${className}`}>
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {backLink && (
            <Link
              href={backLink.href}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{backLink.label}</span>
            </Link>
          )}

          {logo && <div className="flex-shrink-0">{logo}</div>}
          
          {title && <h1 className="text-xl font-semibold text-gray-100">{title}</h1>}
        </div>

        {/* Right side */}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

