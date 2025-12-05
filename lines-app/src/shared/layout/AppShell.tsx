import React from "react";

export interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function AppShell({ children, header, sidebar, className = "" }: AppShellProps) {
  return (
    <div className={`min-h-screen bg-gray-900 text-gray-100 ${className}`}>
      {header && <div className="sticky top-0 z-10">{header}</div>}

      <div className="flex">
        {sidebar && (
          <aside className="w-64 min-h-screen border-l border-gray-800 bg-gray-900 sticky top-0">
            {sidebar}
          </aside>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
