/**
 * Lazy Element Renderer
 * Lazy loads elements that are not in viewport
 */

"use client";

import { memo, useRef } from "react";
import { useIntersectionObserver } from "../../utils/performance";
import { ElementRenderer } from "./ElementRenderer";
import type { FloorPlanElement } from "../FloorPlanEditorV2";

interface LazyElementRendererProps {
  element: FloorPlanElement;
  isSelected: boolean;
  isInteractive: boolean;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClick?: (e?: React.MouseEvent) => void;
  onEdit?: () => void;
  allElements?: FloorPlanElement[];
  isSearchMatch?: boolean;
  threshold?: number; // Distance from viewport to start loading
}

export const LazyElementRenderer = memo(function LazyElementRenderer({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  onEdit,
  allElements = [],
  isSearchMatch = false,
  threshold = 500 // Load elements 500px before they enter viewport
}: LazyElementRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(containerRef, {
    rootMargin: `${threshold}px`,
    threshold: 0
  });

  // Always render selected or search-matched elements
  if (isSelected || isSearchMatch) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`
        }}
      >
        <ElementRenderer
          element={element}
          isSelected={isSelected}
          isInteractive={isInteractive}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
          onEdit={onEdit}
          allElements={allElements}
          isSearchMatch={isSearchMatch}
        />
      </div>
    );
  }

  // Lazy load: only render when in viewport
  if (!isIntersecting) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          backgroundColor: "transparent"
        }}
        aria-label={element.name}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`
      }}
    >
      <ElementRenderer
        element={element}
        isSelected={isSelected}
        isInteractive={isInteractive}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onEdit={onEdit}
        allElements={allElements}
        isSearchMatch={isSearchMatch}
      />
    </div>
  );
});
