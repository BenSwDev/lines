/**
 * Special Area Element Component
 * Renders special area elements (entrance, exit, kitchen, etc.)
 */

"use client";

import { memo } from "react";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { AREA_TYPE_COLORS } from "../../config/floorPlanDesignTokens";

interface SpecialAreaElementProps {
  element: FloorPlanElement;
  isSelected: boolean;
  isInteractive: boolean;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClick?: () => void;
  onEdit?: () => void;
  allElements?: FloorPlanElement[];
  isSearchMatch?: boolean;
}

export const SpecialAreaElement = memo(function SpecialAreaElement({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  allElements = [],
  isSearchMatch = false
}: SpecialAreaElementProps) {
  // Find parent zone
  const parentZone = element.zoneId
    ? allElements.find((el) => el.id === element.zoneId && el.type === "zone")
    : null;

  // Determine colors
  const areaColor =
    element.color || AREA_TYPE_COLORS[element.areaType || "other"] || AREA_TYPE_COLORS.other;
  let borderColor = isSelected ? "#3B82F6" : areaColor;
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
      : `${areaColor}33`, // 20% opacity
    zIndex: 10,
    boxShadow: isSelected
      ? "0 4px 12px rgba(59, 130, 246, 0.3)"
      : element.type === "table" && parentZone
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
        role="button"
        tabIndex={0}
        aria-label={`${element.type === "security" ? "Security" : "Special Area"}: ${element.name}`}
      >
        <div className="pointer-events-none text-center px-1 absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-semibold text-sm truncate w-full">{element.name}</div>
        </div>
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
      role="button"
      tabIndex={0}
      aria-label={`${element.type === "security" ? "Security" : "Special Area"}: ${element.name}`}
    >
      <div className="pointer-events-none text-center px-1 absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-semibold text-sm truncate w-full">{element.name}</div>
      </div>
    </div>
  );
});

