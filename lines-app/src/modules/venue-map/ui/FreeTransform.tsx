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
const HANDLE_OFFSET = -HANDLE_SIZE / 2;
const ROTATE_HANDLE_OFFSET = 30; // Increased from 25 for better reach

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
          return { left: `${w / 2 + offset}px`, top: `${-rotateOffset + offset}px`, cursor: "grab" };
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

  const rotateHandleStyle: React.CSSProperties = {
    ...handleStyle,
    backgroundColor: "#10B981",
    cursor: "grab",
    width: `${handleSize * 1.2}px`, // Slightly larger for better visibility
    height: `${handleSize * 1.2}px`
  };

  const rotation = element.rotation || 0;
  const transformStyle: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: "center center"
  };

  return (
    <div style={transformStyle}>
      {/* Corner handles */}
      {(["nw", "ne", "se", "sw"] as TransformHandle[]).map((handle) => {
        const pos = getHandlePosition(handle);
        return (
          <div
            key={handle}
            style={{
              ...handleStyle,
              left: pos.left,
              top: pos.top,
              cursor: pos.cursor || "nwse-resize"
            }}
            onMouseDown={(e) => handleMouseDown(e, handle)}
          />
        );
      })}

      {/* Edge handles */}
      {(["n", "e", "s", "w"] as TransformHandle[]).map((handle) => {
        const pos = getHandlePosition(handle);
        return (
          <div
            key={handle}
            style={{
              ...edgeHandleStyle,
              left: pos.left,
              top: pos.top,
              cursor: pos.cursor || "ns-resize"
            }}
            onMouseDown={(e) => handleMouseDown(e, handle)}
          />
        );
      })}

      {/* Rotation handle */}
      <div
        style={{
          ...rotateHandleStyle,
          ...getHandlePosition("rotate")
        }}
        onMouseDown={(e) => handleMouseDown(e, "rotate")}
      />

      {/* Rotation line */}
      <div
        style={{
          position: "absolute",
          left: `${element.width / 2}px`,
          top: "0px",
          width: "2px",
          height: `${rotateOffset}px`,
          backgroundColor: "#10B981",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 999
        }}
      />
    </div>
  );
}
