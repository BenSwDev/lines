/**
 * Progressive Disclosure Component
 * Shows UI elements progressively based on user level
 */

"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProgressiveDisclosureProps {
  level: 1 | 2 | 3;
  currentLevel: number;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function ProgressiveDisclosure({
  level,
  currentLevel,
  title,
  children,
  defaultOpen = false,
  className = ""
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || level <= currentLevel);

  // Hide if level is too high
  if (level > currentLevel) return null;

  // Auto-show if level matches
  const shouldShow = level <= currentLevel;

  if (!shouldShow) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {level > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <span>{title}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )}
      {(isOpen || level === 1) && <div>{children}</div>}
    </div>
  );
}
