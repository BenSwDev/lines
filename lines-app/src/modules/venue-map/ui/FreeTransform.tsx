/**
 * Free Transform Component
 * Provides Photoshop-like transform controls with 8 handles + rotation
 */

import React, { useCallback } from "react";
import type { FloorPlanElement } from "./FloorPlanEditorV2";

export type TransformHandle =
  | "nw" // North-west (top-left)
  | "n" // North (top-center)
  | "ne" // North-east (top-right)
  | "e" // East (right-center)
  | "se" // South-east (bottom-right)
  | "s" // South (bottom-center)
  | "sw" // South-west (bottom-left)
  | "w" // West (left-center)
  | "rotate"; // Rotation handle

interface FreeTransformProps {
  element: FloorPlanElement;
  isSelected: boolean;
  onResizeStart: (e: React.MouseEvent, handle: TransformHandle) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  scale?: number; // Zoom scale
}

const HANDLE_SIZE = 10; // Increased from 8 for better interactivity
const HANDLE_OFFSET = -HANDLE_SIZE / 2; // Center handles on corners/edges
const ROTATE_HANDLE_OFFSET = 35; // Distance from top edge for rotation handle
const ROTATE_CIRCLE_RADIUS = 20; // Radius of rotation indicator circle

export function FreeTransform({
  element,
  isSelected,
  onResizeStart,
  onRotateStart,
  scale = 1
}: FreeTransformProps) {
  const handleSize = HANDLE_SIZE / scale;
  const handleOffset = HANDLE_OFFSET / scale;
  const rotateOffset = ROTATE_HANDLE_OFFSET / scale;

  const getHandlePosition = useCallback(
    (handle: TransformHandle): { left: string; top: string; cursor?: string } => {
      const w = element.width;
      const h = element.height;
      const offset = handleOffset;

      switch (handle) {
        case "nw":
          return { left: `${offset}px`, top: `${offset}px`, cursor: "nwse-resize" };
        case "n":
          return { left: `${w / 2 + offset}px`, top: `${offset}px`, cursor: "ns-resize" };
        case "ne":
          return { left: `${w + offset}px`, top: `${offset}px`, cursor: "nesw-resize" };
        case "e":
          return { left: `${w + offset}px`, top: `${h / 2 + offset}px`, cursor: "ew-resize" };
        case "se":
          return { left: `${w + offset}px`, top: `${h + offset}px`, cursor: "nwse-resize" };
        case "s":
          return { left: `${w / 2 + offset}px`, top: `${h + offset}px`, cursor: "ns-resize" };
        case "sw":
          return { left: `${offset}px`, top: `${h + offset}px`, cursor: "nesw-resize" };
        case "w":
          return { left: `${offset}px`, top: `${h / 2 + offset}px`, cursor: "ew-resize" };
        case "rotate":
          return {
            left: `${w / 2 + offset}px`,
            top: `${-rotateOffset + offset}px`,
            cursor: "grab"
          };
        default:
          return { left: "0px", top: "0px" };
      }
    },
    [element.width, element.height, handleOffset, rotateOffset]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: TransformHandle) => {
      e.stopPropagation();
      e.preventDefault();
      if (handle === "rotate") {
        onRotateStart(e);
      } else {
        onResizeStart(e, handle);
      }
    },
    [onResizeStart, onRotateStart]
  );

  if (!isSelected) return null;

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    backgroundColor: "#3B82F6",
    border: "2px solid white",
    borderRadius: "50%",
    cursor: "nwse-resize",
    zIndex: 1000,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transition: "all 0.1s ease",
    userSelect: "none"
  };

  const edgeHandleStyle: React.CSSProperties = {
    ...handleStyle,
    cursor: "ns-resize"
  };

  const rotation = element.rotation || 0;

  // Calculate element center for rotation handle positioning
  const centerX = element.width / 2;
  const centerY = element.height / 2;
  const rotationHandleY = -rotateOffset;

  // Rotation indicator circle center (above the element)
  const rotationCircleCenterY = rotationHandleY - ROTATE_CIRCLE_RADIUS / 2;

  return (
    <>
      {/* Corner handles - positioned exactly on corners */}
      {(["nw", "ne", "se", "sw"] as TransformHandle[]).map((handle) => {
        const pos = getHandlePosition(handle);
        return (
          <div
            key={handle}
            style={{
              ...handleStyle,
              left: pos.left,
              top: pos.top,
              cursor: pos.cursor || "nwse-resize",
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${centerX}px ${centerY}px`
            }}
            onMouseDown={(e) => handleMouseDown(e, handle)}
          />
        );
      })}

      {/* Edge handles - positioned exactly on edges */}
      {(["n", "e", "s", "w"] as TransformHandle[]).map((handle) => {
        const pos = getHandlePosition(handle);
        return (
          <div
            key={handle}
            style={{
              ...edgeHandleStyle,
              left: pos.left,
              top: pos.top,
              cursor: pos.cursor || "ns-resize",
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${centerX}px ${centerY}px`
            }}
            onMouseDown={(e) => handleMouseDown(e, handle)}
          />
        );
      })}

      {/* Rotation indicator circle - like Word, shows rotation area */}
      <div
        style={{
          position: "absolute",
          left: `${centerX - ROTATE_CIRCLE_RADIUS}px`,
          top: `${rotationCircleCenterY - ROTATE_CIRCLE_RADIUS}px`,
          width: `${ROTATE_CIRCLE_RADIUS * 2}px`,
          height: `${ROTATE_CIRCLE_RADIUS * 2}px`,
          borderRadius: "50%",
          border: "2px dashed #10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          pointerEvents: "none",
          zIndex: 998,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${centerX}px ${centerY}px`
        }}
      />

      {/* Rotation line - connects element to rotation handle */}
      <div
        style={{
          position: "absolute",
          left: `${centerX - 1}px`,
          top: "0px",
          width: "2px",
          height: `${rotateOffset}px`,
          backgroundColor: "#10B981",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 997,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${centerX}px ${centerY}px`
        }}
      />

      {/* Rotation handle - prominent, clear it's for rotation */}
      <div
        style={{
          position: "absolute",
          left: `${centerX + handleOffset}px`,
          top: `${rotationHandleY + handleOffset}px`,
          width: `${handleSize * 1.5}px`,
          height: `${handleSize * 1.5}px`,
          backgroundColor: "#10B981",
          border: "3px solid white",
          borderRadius: "50%",
          cursor: "grab",
          zIndex: 1001,
          boxShadow: "0 3px 6px rgba(0,0,0,0.3), 0 0 0 2px rgba(16, 185, 129, 0.3)",
          transition: "all 0.15s ease",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${centerX}px ${centerY}px`
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRotateStart(e);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.cursor = "grabbing";
          e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1.15)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = "grab";
          e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1)`;
        }}
      >
        {/* Rotation icon indicator */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>
      </div>
    </>
  );
}
