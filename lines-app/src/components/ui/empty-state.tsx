"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, HelpCircle } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  helpLink?: {
    label: string;
    href: string;
  };
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  helpLink,
  className,
  children
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in duration-300",
        className
      )}
    >
      {Icon && (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-transform hover:scale-110">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      )}
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {children}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
        {helpLink && (
          <Link
            href={helpLink.href}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            {helpLink.label}
          </Link>
        )}
      </div>
    </div>
  );
}
