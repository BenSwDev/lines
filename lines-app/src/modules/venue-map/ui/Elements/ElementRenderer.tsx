/**
 * Element Renderer Component
 * Main component for rendering floor plan elements
 */

"use client";

import { memo } from "react";
import { TableElement } from "./TableElement";
import { ZoneElement } from "./ZoneElement";
import { SpecialAreaElement } from "./SpecialAreaElement";
import type { FloorPlanElement } from "../FloorPlanEditorV2";

interface ElementRendererProps {
  element: FloorPlanElement;
  isSelected: boolean;
  isInteractive: boolean;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClick?: () => void;
  onEdit?: () => void;
  allElements?: FloorPlanElement[];
  isSearchMatch?: boolean;
}

export const ElementRenderer = memo(function ElementRenderer({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  onEdit,
  allElements = [],
  isSearchMatch = false
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
        />
      );

    default:
      return null;
  }
});

