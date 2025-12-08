/**
 * Hook for managing element transform (resize and rotation)
 * Handles resize with 8 handles and rotation
 */

import { useState, useRef, useCallback } from "react";
import type { FloorPlanElement } from "../types";
import { GRID_SIZE } from "../types";
import type { TransformHandle } from "../ui/FreeTransform";

interface UseTransformReturn {
  isResizing: boolean;
  isRotating: boolean;
  resizeHandle: TransformHandle | null;
  draggedElement: FloorPlanElement | null;
  startResize: (
    element: FloorPlanElement,
    handle: TransformHandle,
    mouseX: number,
    mouseY: number
  ) => void;
  startRotate: (
    element: FloorPlanElement,
    mouseX: number,
    mouseY: number
  ) => void;
  handleResize: (
    mouseX: number,
    mouseY: number
  ) => Partial<FloorPlanElement> | null;
  handleRotate: (
    mouseX: number,
    mouseY: number
  ) => Partial<FloorPlanElement> | null;
  endTransform: () => void;
}

export function useTransform(): UseTransformReturn {
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<TransformHandle | null>(null);
  const [draggedElement, setDraggedElement] = useState<FloorPlanElement | null>(null);

  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    elementX: number;
    elementY: number;
    elementWidth: number;
    elementHeight: number;
  } | null>(null);

  const rotateStartRef = useRef<{
    angle: number;
    centerX: number;
    centerY: number;
    startAngle: number;
  } | null>(null);

  const startRotate = useCallback(
    (element: FloorPlanElement, mouseX: number, mouseY: number) => {
      setIsRotating(true);
      setDraggedElement(element);

      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      rotateStartRef.current = {
        angle: element.rotation,
        centerX,
        centerY,
        startAngle
      };
    },
    []
  );

  const startResize = useCallback(
    (
      element: FloorPlanElement,
      handle: TransformHandle,
      mouseX: number,
      mouseY: number
    ) => {
      if (handle === "rotate") {
        startRotate(element, mouseX, mouseY);
        return;
      }

      setIsResizing(true);
      setResizeHandle(handle);
      setDraggedElement(element);

      resizeStartRef.current = {
        mouseX,
        mouseY,
        width: element.width,
        height: element.height,
        elementX: element.x,
        elementY: element.y,
        elementWidth: element.width,
        elementHeight: element.height
      };
    },
    [startRotate]
  );

  const handleResize = useCallback(
    (mouseX: number, mouseY: number): Partial<FloorPlanElement> | null => {
      if (!isResizing || !resizeHandle || !draggedElement || !resizeStartRef.current) {
        return null;
      }

      const start = resizeStartRef.current;
      const deltaX = mouseX - start.mouseX;
      const deltaY = mouseY - start.mouseY;

      let newWidth = start.elementWidth;
      let newHeight = start.elementHeight;
      let newX = start.elementX;
      let newY = start.elementY;

      // Handle corner resizing
      if (resizeHandle === "se") {
        // Southeast - bottom right
        newWidth = Math.max(20, start.elementWidth + deltaX);
        newHeight = Math.max(20, start.elementHeight + deltaY);
      } else if (resizeHandle === "sw") {
        // Southwest - bottom left
        newWidth = Math.max(20, start.elementWidth - deltaX);
        newHeight = Math.max(20, start.elementHeight + deltaY);
        newX = start.elementX + deltaX;
      } else if (resizeHandle === "ne") {
        // Northeast - top right
        newWidth = Math.max(20, start.elementWidth + deltaX);
        newHeight = Math.max(20, start.elementHeight - deltaY);
        newY = start.elementY + deltaY;
      } else if (resizeHandle === "nw") {
        // Northwest - top left
        newWidth = Math.max(20, start.elementWidth - deltaX);
        newHeight = Math.max(20, start.elementHeight - deltaY);
        newX = start.elementX + deltaX;
        newY = start.elementY + deltaY;
      }
      // Handle edge resizing
      else if (resizeHandle === "n") {
        // North - top edge
        newHeight = Math.max(20, start.elementHeight - deltaY);
        newY = start.elementY + deltaY;
      } else if (resizeHandle === "s") {
        // South - bottom edge
        newHeight = Math.max(20, start.elementHeight + deltaY);
      } else if (resizeHandle === "e") {
        // East - right edge
        newWidth = Math.max(20, start.elementWidth + deltaX);
      } else if (resizeHandle === "w") {
        // West - left edge
        newWidth = Math.max(20, start.elementWidth - deltaX);
        newX = start.elementX + deltaX;
      }

      // Snap to grid
      newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
      newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE;
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

      // Ensure minimum size
      if (newWidth < GRID_SIZE) newWidth = GRID_SIZE;
      if (newHeight < GRID_SIZE) newHeight = GRID_SIZE;

      return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      };
    },
    [isResizing, resizeHandle, draggedElement]
  );

  const handleRotate = useCallback(
    (mouseX: number, mouseY: number): Partial<FloorPlanElement> | null => {
      if (!isRotating || !draggedElement || !rotateStartRef.current) {
        return null;
      }

      const start = rotateStartRef.current;
      const dx = mouseX - start.centerX;
      const dy = mouseY - start.centerY;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const angleDelta = currentAngle - start.startAngle;
      const normalizedAngle = (((start.angle + angleDelta) % 360) + 360) % 360;

      return {
        rotation: normalizedAngle
      };
    },
    [isRotating, draggedElement]
  );

  const endTransform = useCallback(() => {
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
    setDraggedElement(null);
    resizeStartRef.current = null;
    rotateStartRef.current = null;
  }, []);

  return {
    isResizing,
    isRotating,
    resizeHandle,
    draggedElement,
    startResize,
    startRotate,
    handleResize,
    handleRotate,
    endTransform
  };
}
