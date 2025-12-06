/**
 * Minimap Component
 * Provides a small overview of the entire canvas with viewport indicator
 */

"use client";

import { useRef } from "react";
import type { FloorPlanElement } from "./FloorPlanEditorV2";

interface MinimapProps {
  elements: FloorPlanElement[];
  canvasSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  zoom: number;
  panOffset: { x: number; y: number };
  onViewportChange?: (x: number, y: number) => void;
  scale?: number; // Minimap scale (0.1 = 10% of canvas size)
}

const MINIMAP_SCALE = 0.15; // 15% of canvas size
const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;

export function Minimap({
  elements,
  canvasSize,
  viewportSize,
  zoom,
  panOffset,
  onViewportChange,
  scale = MINIMAP_SCALE
}: MinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);

  // Calculate minimap dimensions
  const minimapWidth = Math.min(MINIMAP_WIDTH, canvasSize.width * scale);
  const minimapHeight = Math.min(MINIMAP_HEIGHT, canvasSize.height * scale);
  const scaleX = minimapWidth / canvasSize.width;
  const scaleY = minimapHeight / canvasSize.height;

  // Calculate viewport rectangle in minimap coordinates
  const viewportX = panOffset.x * scaleX;
  const viewportY = panOffset.y * scaleY;
  const viewportW = (viewportSize.width / zoom) * scaleX;
  const viewportH = (viewportSize.height / zoom) * scaleY;

  const handleMinimapClick = (e: React.MouseEvent) => {
    if (!minimapRef.current || !onViewportChange) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scaleX;
    const y = (e.clientY - rect.top) / scaleY;
    
    // Center viewport on clicked position
    onViewportChange(
      x - viewportSize.width / (2 * zoom),
      y - viewportSize.height / (2 * zoom)
    );
  };

  return (
    <div
      ref={minimapRef}
      className="absolute bottom-4 right-4 z-50 cursor-pointer rounded-lg border-2 border-primary/20 bg-background/95 p-2 shadow-lg backdrop-blur-sm"
      style={{
        width: `${minimapWidth + 16}px`,
        height: `${minimapHeight + 16}px`
      }}
      onClick={handleMinimapClick}
    >
      <div className="relative" style={{ width: `${minimapWidth}px`, height: `${minimapHeight}px` }}>
        {/* Canvas background */}
        <div
          className="absolute inset-0 rounded bg-muted/30"
          style={{
            width: `${minimapWidth}px`,
            height: `${minimapHeight}px`
          }}
        />
        
        {/* Elements */}
        <svg
          className="absolute inset-0"
          style={{ width: `${minimapWidth}px`, height: `${minimapHeight}px` }}
        >
          {elements.map((element) => {
            const x = element.x * scaleX;
            const y = element.y * scaleY;
            const w = element.width * scaleX;
            const h = element.height * scaleY;
            
            return (
              <rect
                key={element.id}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={element.color || "#3B82F6"}
                fillOpacity={0.6}
                stroke="#fff"
                strokeWidth={0.5}
              />
            );
          })}
        </svg>
        
        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-primary"
          style={{
            left: `${viewportX}px`,
            top: `${viewportY}px`,
            width: `${viewportW}px`,
            height: `${viewportH}px`,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            pointerEvents: "none"
          }}
        />
      </div>
    </div>
  );
}

