"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function StatCard({ icon: Icon, value, label, trend, onClick, className }: StatCardProps) {
  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={cn("transition-all group", className)}
    >
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground truncate">{label}</div>
          {trend && (
            <div
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}% {trend.label}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
