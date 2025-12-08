/**
 * Feedback Toast Component
 * Enhanced toast notifications with animations
 */

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FeedbackType = "success" | "error" | "info" | "warning";

interface FeedbackToastProps {
  type: FeedbackType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export function FeedbackToast({
  type,
  message,
  description,
  duration = 3000,
  onClose,
  className = ""
}: FeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertCircle
  };

  const colors = {
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200"
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 min-w-[300px] max-w-md rounded-lg border p-4 shadow-lg transition-all duration-300",
        colors[type],
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {description && <p className="text-sm mt-1 opacity-90">{description}</p>}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
