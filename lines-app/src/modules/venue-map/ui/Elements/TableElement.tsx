/**
 * Table Element Component
 * Renders table elements on the canvas
 */

"use client";

import { memo } from "react";
import { Users } from "lucide-react";
import type { FloorPlanElement } from "../../types";
import { AREA_TYPE_COLORS } from "../../config/floorPlanDesignTokens";

interface TableElementProps {
  element: FloorPlanElement;
  isSelected: boolean;
  isInteractive: boolean;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClick?: (e?: React.MouseEvent) => void;
  onEdit?: () => void;
  allElements?: FloorPlanElement[];
  isSearchMatch?: boolean;
  viewMode?: "minimal" | "detailed";
}

export const TableElement = memo(function TableElement({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  allElements = [],
  isSearchMatch = false,
  viewMode = "detailed"
}: TableElementProps) {
  // Find parent zone
  const parentZone = element.zoneId
    ? allElements.find((el) => el.id === element.zoneId && el.type === "zone")
    : null;

  // Determine border color
  let borderColor = isSelected ? "#3B82F6" : "rgba(0,0,0,0.3)";
  if (parentZone) {
    borderColor = parentZone.color || "#3B82F6";
  }

  // Base style
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation}deg)`,
    transformOrigin: "center center",
    cursor: isInteractive ? (isSelected ? "move" : "grab") : "default",
    border: `2px solid ${borderColor}`,
    backgroundColor: parentZone
      ? `${parentZone.color || AREA_TYPE_COLORS.zone}20`
      : isSelected
        ? "rgba(59, 130, 246, 0.15)"
        : AREA_TYPE_COLORS.table,
    zIndex: 10,
    boxShadow: isSelected
      ? "0 4px 12px rgba(59, 130, 246, 0.3)"
      : parentZone
        ? `0 2px 8px ${parentZone.color || "#3B82F6"}40`
        : "0 2px 4px rgba(0,0,0,0.1)",
    outline: isSearchMatch && !isSelected ? "2px solid #F59E0B" : undefined,
    outlineOffset: isSearchMatch && !isSelected ? "2px" : undefined,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    transition: isSelected ? "none" : "all 0.2s ease"
  };

  // Circle shape
  if (element.shape === "circle") {
    return (
      <div
        style={{
          ...baseStyle,
          borderRadius: "50%"
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onDoubleClick={onDoubleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onMouseDown?.(e as unknown as React.MouseEvent);
          }
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            onDoubleClick?.(e as unknown as React.MouseEvent);
          }
        }}
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-label={`Table: ${element.name} - ${element.seats || 0} seats${parentZone ? ` in zone ${parentZone.name}` : ""}`}
        aria-pressed={isSelected}
        aria-disabled={!isInteractive}
      >
        {viewMode === "detailed" && (
          <div className="pointer-events-none text-center px-1 absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-semibold text-sm truncate w-full">{element.name}</div>
            {element.seats && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {element.seats}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Rectangle shape (default)
  return (
    <div
      style={baseStyle}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onMouseDown?.(e as unknown as React.MouseEvent);
        }
        if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          onDoubleClick?.(e as unknown as React.MouseEvent);
        }
      }}
      role="button"
      tabIndex={isInteractive ? 0 : -1}
      aria-label={`Table: ${element.name} - ${element.seats || 0} seats${parentZone ? ` in zone ${parentZone.name}` : ""}`}
      aria-pressed={isSelected}
      aria-disabled={!isInteractive}
    >
      <div className="pointer-events-none text-center px-1 absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-semibold text-sm truncate w-full">{element.name}</div>
        {element.seats && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {element.seats}
          </div>
        )}
      </div>
    </div>
  );
});
