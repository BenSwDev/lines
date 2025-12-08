/**
 * Canvas Viewport Component
 * Manages viewport, zoom, pan, and responsive sizing
 */

"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useDevice, useCanvasSize } from "../../hooks";

interface CanvasViewportProps {
  children: React.ReactNode;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
  minZoom?: number;
  maxZoom?: number;
  showGrid?: boolean;
  backgroundImage?: string;
  backgroundImageOpacity?: number;
  className?: string;
}

export function CanvasViewport({
  children,
  onZoomChange,
  onPanChange,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  minZoom = 0.1,
  maxZoom = 5,
  showGrid = true,
  backgroundImage,
  backgroundImageOpacity = 0.5,
  className = ""
}: CanvasViewportProps) {
  const device = useDevice();
  const canvasSize = useCanvasSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [panOffset, setPanOffset] = useState(initialPan);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  // Update parent on zoom/pan change
  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  useEffect(() => {
    onPanChange?.(panOffset);
  }, [panOffset, onPanChange]);

  // Convert screen coordinates to canvas coordinates (exposed for future use)
  // const screenToCanvas = useCallback(
  //   (screenX: number, screenY: number): { x: number; y: number } => {
  //     if (!containerRef.current) return { x: 0, y: 0 };
  //     const containerRect = containerRef.current.getBoundingClientRect();
  //     const containerX = screenX - containerRect.left;
  //     const containerY = screenY - containerRect.top;
  //     const canvasCenterX = containerRect.width / 2;
  //     const canvasCenterY = containerRect.height / 2;
  //     const relativeX = (containerX - canvasCenterX - panOffset.x) / zoom;
  //     const relativeY = (containerY - canvasCenterY - panOffset.y) / zoom;
  //     const canvasX = relativeX + canvasSize.width / 2;
  //     const canvasY = relativeY + canvasSize.height / 2;
  //     return { x: canvasX, y: canvasY };
  //   },
  //   [zoom, panOffset, canvasSize]
  // );

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, maxZoom));
  }, [maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, minZoom));
  }, [minZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Zoom to fit (will be implemented with elements later)
  // const handleZoomToFit = useCallback(() => {
  //   setZoom(1);
  //   setPanOffset({ x: 0, y: 0 });
  // }, []);

  // Pan functions
  const handlePanStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      panStartRef.current = {
        x: clientX,
        y: clientY,
        offsetX: panOffset.x,
        offsetY: panOffset.y
      };
      setIsPanning(true);
    },
    [panOffset]
  );

  const handlePanMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!panStartRef.current || !isPanning) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - panStartRef.current.x;
      const deltaY = clientY - panStartRef.current.y;

      setPanOffset({
        x: panStartRef.current.offsetX + deltaX,
        y: panStartRef.current.offsetY + deltaY
      });
    },
    [isPanning]
  );

  const handlePanEnd = useCallback(() => {
    panStartRef.current = null;
    setIsPanning(false);
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => {
        const newZoom = prev * delta;
        return Math.max(minZoom, Math.min(newZoom, maxZoom));
      });
    },
    [minZoom, maxZoom]
  );

  // Touch pinch zoom (will be implemented with gesture handlers)
  // const handlePinchZoom = useCallback(
  //   (scale: number) => {
  //     setZoom((prev) => {
  //       const newZoom = prev * scale;
  //       return Math.max(minZoom, Math.min(newZoom, maxZoom));
  //     });
  //   },
  //   [minZoom, maxZoom]
  // );

  // Global mouse/touch handlers
  useEffect(() => {
    if (isPanning) {
      const handleMouseMove = (e: MouseEvent) => handlePanMove(e);
      const handleMouseUp = () => handlePanEnd();
      const handleTouchMove = (e: TouchEvent) => handlePanMove(e);
      const handleTouchEnd = () => handlePanEnd();

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Grid background
  const gridSize = device.isMobile ? 10 : device.isTablet ? 15 : 20;
  const gridBackground = showGrid
    ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
       linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        cursor: isPanning ? "grabbing" : "grab",
        touchAction: "none" // Prevent default touch behaviors
      }}
      onMouseDown={handlePanStart}
      onTouchStart={handlePanStart}
      onWheel={handleWheel}
    >
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute bg-background"
        style={{
          minWidth: `${canvasSize.width}px`,
          minHeight: `${canvasSize.height}px`,
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom})`,
          transformOrigin: "center center",
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : gridBackground,
          backgroundSize: backgroundImage
            ? "contain"
            : `${gridSize / zoom}px ${gridSize / zoom}px`,
          backgroundRepeat: backgroundImage ? "no-repeat" : "repeat",
          backgroundPosition: "center",
          opacity: backgroundImage ? backgroundImageOpacity : 1
        }}
        role="application"
        aria-label="Floor plan canvas"
      >
        {children}
      </div>

      {/* Zoom Controls - Mobile: bottom, Desktop: top-right */}
      <div
        className={`absolute z-50 flex items-center gap-2 ${
          device.isMobile
            ? "bottom-4 left-1/2 -translate-x-1/2"
            : "top-4 right-4"
        }`}
      >
        <button
          onClick={handleZoomOut}
          className="rounded-lg bg-background/90 backdrop-blur-sm border p-2 shadow-lg hover:bg-background transition-colors"
          aria-label="Zoom out"
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>
        <div className="rounded-lg bg-background/90 backdrop-blur-sm border px-3 py-2 text-sm font-medium shadow-lg">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={handleZoomIn}
          className="rounded-lg bg-background/90 backdrop-blur-sm border p-2 shadow-lg hover:bg-background transition-colors"
          aria-label="Zoom in"
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </button>
        {!device.isMobile && (
          <button
            onClick={handleZoomReset}
            className="rounded-lg bg-background/90 backdrop-blur-sm border px-3 py-2 text-xs shadow-lg hover:bg-background transition-colors"
            aria-label="Reset zoom"
            type="button"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

