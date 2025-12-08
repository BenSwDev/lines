/**
 * Zone Element Component
 * Renders zone elements on the canvas
 */

"use client";

import { memo } from "react";
import type { FloorPlanElement } from "../FloorPlanEditorV2";

interface ZoneElementProps {
  element: FloorPlanElement;
  isSelected: boolean;
  isInteractive: boolean;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClick?: (e?: React.MouseEvent) => void;
  onEdit?: () => void;
  allElements?: FloorPlanElement[];
  isSearchMatch?: boolean;
}

export const ZoneElement = memo(function ZoneElement({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  isSearchMatch = false
}: ZoneElementProps) {
  const borderColor = element.color || "#3B82F6";

  // Base style for zones
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation}deg)`,
    transformOrigin: "center center",
    cursor: isInteractive ? (isSelected ? "move" : "grab") : "default",
    border: `2px dashed ${borderColor}`,
    backgroundColor: "transparent",
    zIndex: 1, // Zones always have lower z-index
    boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
    outline: isSearchMatch && !isSelected ? "2px solid #F59E0B" : undefined,
    outlineOffset: isSearchMatch && !isSelected ? "2px" : undefined,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    transition: isSelected ? "none" : "all 0.2s ease"
  };

  // Polygon shape
  if (element.shape === "polygon" && element.polygonPoints) {
    const points = element.polygonPoints
      .map(
        (p) =>
          `${(p.x / 100) * element.width + element.x},${(p.y / 100) * element.height + element.y}`
      )
      .join(" ");

    return (
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: isInteractive ? "all" : "none",
          zIndex: 1
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        <polygon
          points={points}
          fill="transparent"
          stroke={borderColor}
          strokeWidth="2"
          strokeDasharray="5,5"
          style={{
            cursor: isInteractive ? (isSelected ? "move" : "grab") : "default"
          }}
        />
        {isSelected && (
          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.1)"
            stroke={borderColor}
            strokeWidth="3"
          />
        )}
      </svg>
    );
  }

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
        aria-label={`Zone: ${element.name}${element.description ? ` - ${element.description}` : ""}`}
        aria-pressed={isSelected}
        aria-disabled={!isInteractive}
      >
        <div className="pointer-events-none text-center px-2 absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-semibold text-sm truncate w-full">{element.name}</div>
          {element.description && (
            <div className="text-xs text-muted-foreground truncate w-full">
              {element.description}
            </div>
          )}
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
      aria-label={`Zone: ${element.name}${element.description ? ` - ${element.description}` : ""}`}
      aria-pressed={isSelected}
      aria-disabled={!isInteractive}
    >
      <div className="pointer-events-none text-center px-2 absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-semibold text-sm truncate w-full">{element.name}</div>
        {element.description && (
          <div className="text-xs text-muted-foreground truncate w-full">{element.description}</div>
        )}
      </div>
    </div>
  );
});
