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
  onScreenToCanvas?: (fn: (x: number, y: number) => { x: number; y: number }) => void;
  elements?: Array<{ x: number; y: number; width: number; height: number }>;
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
  className = "",
  onScreenToCanvas,
  elements
}: CanvasViewportProps) {
  const device = useDevice();
  const canvasSize = useCanvasSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [panOffset, setPanOffset] = useState(initialPan);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(
    null
  );

  // Update parent on zoom/pan change
  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  useEffect(() => {
    onPanChange?.(panOffset);
  }, [panOffset, onPanChange]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerX = screenX - containerRect.left;
      const containerY = screenY - containerRect.top;
      const canvasCenterX = containerRect.width / 2;
      const canvasCenterY = containerRect.height / 2;
      const relativeX = (containerX - canvasCenterX - panOffset.x) / zoom;
      const relativeY = (containerY - canvasCenterY - panOffset.y) / zoom;
      const canvasX = relativeX + canvasSize.width / 2;
      const canvasY = relativeY + canvasSize.height / 2;
      return { x: canvasX, y: canvasY };
    },
    [zoom, panOffset, canvasSize]
  );

  // Expose screenToCanvas for parent components
  useEffect(() => {
    if (onScreenToCanvas) {
      onScreenToCanvas(screenToCanvas);
    }
  }, [screenToCanvas, onScreenToCanvas]);

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

  // Zoom to fit elements
  const handleZoomToFit = useCallback(
    (elements?: Array<{ x: number; y: number; width: number; height: number }>) => {
      if (!elements || elements.length === 0) {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
        return;
      }

      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const padding = 50; // Padding around elements

      // Calculate bounds of all elements
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      elements.forEach((el) => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      });

      const elementsWidth = maxX - minX + padding * 2;
      const elementsHeight = maxY - minY + padding * 2;

      // Calculate zoom to fit
      const zoomX = (containerRect.width - padding * 2) / elementsWidth;
      const zoomY = (containerRect.height - padding * 2) / elementsHeight;
      const newZoom = Math.min(zoomX, zoomY, maxZoom);

      // Center the elements
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      setZoom(newZoom);
      setPanOffset({
        x: containerRect.width / 2 - centerX * newZoom,
        y: containerRect.height / 2 - centerY * newZoom
      });
    },
    [maxZoom]
  );

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

  // Touch pinch zoom handler
  const handlePinchZoom = useCallback(
    (scale: number, centerX: number, centerY: number) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;

      // Calculate new zoom
      const newZoom = Math.max(minZoom, Math.min(zoom * scale, maxZoom));
      const zoomDelta = newZoom / zoom;

      // Adjust pan to zoom towards the pinch center
      const offsetX = centerX - containerCenterX;
      const offsetY = centerY - containerCenterY;

      setZoom(newZoom);
      setPanOffset({
        x: panOffset.x + offsetX * (1 - zoomDelta),
        y: panOffset.y + offsetY * (1 - zoomDelta)
      });
    },
    [zoom, panOffset, minZoom, maxZoom]
  );

  // Expose handlers for external use (via ref)
  const viewportRef = useRef<{
    handlePinchZoom: typeof handlePinchZoom;
    handleZoomToFit: typeof handleZoomToFit;
    screenToCanvas: typeof screenToCanvas;
  } | null>(null);

  useEffect(() => {
    viewportRef.current = {
      handlePinchZoom,
      handleZoomToFit,
      screenToCanvas
    };
  }, [handlePinchZoom, handleZoomToFit, screenToCanvas]);

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
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : gridBackground,
          backgroundSize: backgroundImage ? "contain" : `${gridSize / zoom}px ${gridSize / zoom}px`,
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
          device.isMobile ? "bottom-4 left-1/2 -translate-x-1/2" : "top-4 right-4"
        }`}
      >
        <button
          onClick={handleZoomOut}
          className="rounded-lg bg-background/90 backdrop-blur-sm border p-2 shadow-lg hover:bg-background transition-colors"
          aria-label="Zoom out"
          type="button"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </button>
        {!device.isMobile && (
          <>
            <button
              onClick={handleZoomReset}
              className="rounded-lg bg-background/90 backdrop-blur-sm border px-3 py-2 text-xs shadow-lg hover:bg-background transition-colors"
              aria-label="Reset zoom"
              type="button"
            >
              Reset
            </button>
            {elements && elements.length > 0 && (
              <button
                onClick={() => handleZoomToFit(elements)}
                className="rounded-lg bg-background/90 backdrop-blur-sm border px-3 py-2 text-xs shadow-lg hover:bg-background transition-colors"
                aria-label="Zoom to fit"
                type="button"
              >
                Fit
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
