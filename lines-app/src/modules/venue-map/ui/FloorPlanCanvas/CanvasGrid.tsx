/**
 * Canvas Grid Component
 * Renders grid overlay on canvas
 */

"use client";

import { useGridSize } from "../../hooks";

interface CanvasGridProps {
  zoom: number;
  showGrid?: boolean;
  className?: string;
}

export function CanvasGrid({ zoom, showGrid = true, className = "" }: CanvasGridProps) {
  const gridSize = useGridSize();

  if (!showGrid) return null;

  const adjustedGridSize = gridSize / zoom;

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`,
        backgroundSize: `${adjustedGridSize}px ${adjustedGridSize}px`,
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0"
      }}
      aria-hidden="true"
    />
  );
}

