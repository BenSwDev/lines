/**
 * Responsive Dialog Component
 * Adapts dialog to device type (mobile: bottom sheet, desktop: modal)
 */

"use client";

import { ReactNode } from "react";
import { useDevice } from "../../hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { MobileBottomSheet } from "../Mobile/MobileBottomSheet";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className = "",
  contentClassName = ""
}: ResponsiveDialogProps) {
  const device = useDevice();

  // Mobile: Use bottom sheet
  if (device.isMobile) {
    return (
      <MobileBottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        showCloseButton={showCloseButton}
        className={className}
      >
        {children}
        {footer && <div className="mt-6 pt-6 border-t">{footer}</div>}
      </MobileBottomSheet>
    );
  }

  // Desktop/Tablet: Use modal dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className={className}>{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
