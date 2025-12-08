/**
 * Element Renderer Component
 * Main component for rendering floor plan elements
 */

"use client";

import { memo } from "react";
import { TableElement } from "./TableElement";
import { ZoneElement } from "./ZoneElement";
import { SpecialAreaElement } from "./SpecialAreaElement";
import type { FloorPlanElement } from "../../types";

interface ElementRendererProps {
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

export const ElementRenderer = memo(function ElementRenderer({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  onEdit,
  allElements = [],
  isSearchMatch = false,
  viewMode = "detailed"
}: ElementRendererProps) {
  // Render based on element type
  switch (element.type) {
    case "table":
      return (
        <TableElement
          element={element}
          isSelected={isSelected}
          isInteractive={isInteractive}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
          onEdit={onEdit}
          allElements={allElements}
          isSearchMatch={isSearchMatch}
          viewMode={viewMode}
        />
      );

    case "zone":
      return (
        <ZoneElement
          element={element}
          isSelected={isSelected}
          isInteractive={isInteractive}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
          onEdit={onEdit}
          allElements={allElements}
          isSearchMatch={isSearchMatch}
          viewMode={viewMode}
        />
      );

    case "specialArea":
    case "security":
      return (
        <SpecialAreaElement
          element={element}
          isSelected={isSelected}
          isInteractive={isInteractive}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
          onEdit={onEdit}
          allElements={allElements}
          isSearchMatch={isSearchMatch}
          viewMode={viewMode}
        />
      );

    default:
      return null;
  }
});
