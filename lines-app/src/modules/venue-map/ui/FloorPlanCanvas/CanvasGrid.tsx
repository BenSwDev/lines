/**
 * Canvas Grid Component
 * Renders adaptive grid overlay on canvas
 */

"use client";

import { useMemo } from "react";
import { useGridSize, useDevice } from "../../hooks";

interface CanvasGridProps {
  zoom: number;
  showGrid?: boolean;
  className?: string;
  opacity?: number;
}

export function CanvasGrid({
  zoom,
  showGrid = true,
  className = "",
  opacity = 0.05
}: CanvasGridProps) {
  const gridSize = useGridSize();
  const device = useDevice();

  // Adaptive grid based on zoom and device
  const gridConfig = useMemo(() => {
    const adjustedGridSize = Math.max(gridSize / zoom, 5); // Minimum 5px grid

    // Adjust opacity based on zoom level
    let gridOpacity = opacity;
    if (zoom < 0.5) {
      gridOpacity = opacity * 0.5; // Lighter grid when zoomed out
    } else if (zoom > 2) {
      gridOpacity = opacity * 1.5; // Darker grid when zoomed in
    }

    // Adjust grid visibility based on device
    if (device.isMobile && zoom < 0.3) {
      return null; // Hide grid on mobile when very zoomed out
    }

    return {
      size: adjustedGridSize,
      opacity: Math.min(gridOpacity, 0.2) // Cap at 20% opacity
    };
  }, [zoom, gridSize, opacity, device.isMobile]);

  if (!showGrid || !gridConfig) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,${gridConfig.opacity}) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,${gridConfig.opacity}) 1px, transparent 1px)`,
        backgroundSize: `${gridConfig.size}px ${gridConfig.size}px`,
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
        transition: "opacity 0.2s ease"
      }}
      aria-hidden="true"
    />
  );
}

