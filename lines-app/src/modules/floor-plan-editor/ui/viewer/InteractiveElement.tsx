"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/core/i18n/provider";
import { updateElementPosition } from "../../actions/floorPlanActions";

interface InteractiveElementProps {
  id: string;
  type: "zone" | "table" | "area";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  isSelected: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function InteractiveElement({
  id,
  type,
  x,
  y,
  width,
  height,
  rotation = 0,
  isSelected,
  canEdit,
  onSelect,
  onDelete,
  children,
  className,
  style
}: InteractiveElementProps) {
  const { t } = useTranslations();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentPos, setCurrentPos] = useState({ x, y });
  const [currentSize, setCurrentSize] = useState({ width, height });
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const rotateStartRef = useRef({ angle: 0, centerX: 0, centerY: 0 });

  // Update local state when props change
  useEffect(() => {
    setCurrentPos({ x, y });
    setCurrentSize({ width, height });
    setCurrentRotation(rotation);
  }, [x, y, width, height, rotation]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!canEdit || !isSelected) return;

      const rect = elementRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const elementX = rect.left;
      const elementY = rect.top;

      // Check if clicking on resize handle (bottom-right corner)
      const handleSize = 12;
      const isOnResizeHandle =
        startX >= elementX + rect.width - handleSize &&
        startX <= elementX + rect.width &&
        startY >= elementY + rect.height - handleSize &&
        startY <= elementY + rect.height;

      // Check if clicking on rotate handle (top-center)
      const isOnRotateHandle =
        startX >= elementX + rect.width / 2 - handleSize / 2 &&
        startX <= elementX + rect.width / 2 + handleSize / 2 &&
        startY >= elementY - 20 &&
        startY <= elementY - 10;

      if (isOnResizeHandle) {
        setIsResizing(true);
        resizeStartRef.current = {
          width: currentSize.width,
          height: currentSize.height,
          x: startX,
          y: startY
        };
      } else if (isOnRotateHandle) {
        setIsRotating(true);
        const centerX = elementX + rect.width / 2;
        const centerY = elementY + rect.height / 2;
        const angle = Math.atan2(startY - centerY, startX - centerX);
        rotateStartRef.current = {
          angle: currentRotation - (angle * 180) / Math.PI,
          centerX,
          centerY
        };
      } else {
        setIsDragging(true);
        dragStartRef.current = {
          x: startX - currentPos.x,
          y: startY - currentPos.y
        };
      }

      e.preventDefault();
      e.stopPropagation();
    },
    [canEdit, isSelected, currentPos, currentSize, currentRotation]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canEdit) return;

      if (isDragging) {
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setCurrentPos({ x: Math.max(0, newX), y: Math.max(0, newY) });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        setCurrentSize({
          width: Math.max(50, resizeStartRef.current.width + deltaX),
          height: Math.max(50, resizeStartRef.current.height + deltaY)
        });
      } else if (isRotating) {
        const angle = Math.atan2(
          e.clientY - rotateStartRef.current.centerY,
          e.clientX - rotateStartRef.current.centerX
        );
        const newRotation = rotateStartRef.current.angle + (angle * 180) / Math.PI;
        setCurrentRotation(newRotation % 360);
      }
    },
    [canEdit, isDragging, isResizing, isRotating]
  );

  const handleMouseUp = useCallback(async () => {
    if (!canEdit) return;

    if (isDragging || isResizing || isRotating) {
      // Save changes
      await updateElementPosition({
        type,
        id,
        positionX: currentPos.x,
        positionY: currentPos.y,
        width: currentSize.width,
        height: currentSize.height,
        rotation: type !== "zone" ? currentRotation : undefined
      });
    }

    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  }, [
    canEdit,
    isDragging,
    isResizing,
    isRotating,
    type,
    id,
    currentPos,
    currentSize,
    currentRotation
  ]);

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete();
      }
    },
    [onDelete]
  );

  return (
    <div
      ref={elementRef}
      className={cn("absolute transition-all", isSelected && canEdit && "cursor-move", className)}
      style={{
        left: currentPos.x,
        top: currentPos.y,
        width: currentSize.width,
        height: currentSize.height,
        transform: `rotate(${currentRotation}deg)`,
        transformOrigin: "center center",
        ...style
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {children}

      {/* Selection Handles */}
      {isSelected && canEdit && (
        <>
          {/* Delete Button */}
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 z-50"
            onClick={handleDelete}
            title={t("common.delete", { defaultValue: "מחק" })}
          >
            <X className="h-3 w-3" />
          </button>

          {/* Resize Handle (bottom-right) */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-nwse-resize z-50"
            style={{
              transform: `translate(50%, 50%) rotate(${-currentRotation}deg)`,
              transformOrigin: "center center"
            }}
          />

          {/* Rotate Handle (top-center) */}
          {type !== "zone" && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex items-center justify-center cursor-grab z-50"
              style={{
                transform: `translate(-50%, -100%) rotate(${-currentRotation}deg)`,
                transformOrigin: "center center"
              }}
            >
              <div className="w-6 h-6 bg-primary border-2 border-white rounded-full flex items-center justify-center">
                <RotateCw className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
