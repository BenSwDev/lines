/**
 * Hook for managing drag and drop functionality
 * Handles element dragging with zone containment
 */

import { useState, useRef, useCallback } from "react";
import type { FloorPlanElement } from "../types";
import { GRID_SIZE } from "../types";

interface UseDragAndDropReturn {
  isDragging: boolean;
  draggedElement: FloorPlanElement | null;
  startDrag: (
    element: FloorPlanElement,
    mouseX: number,
    mouseY: number,
    selectedIds: Set<string>,
    allElements: FloorPlanElement[]
  ) => void;
  handleDrag: (
    mouseX: number,
    mouseY: number,
    selectedIds: Set<string>,
    allElements: FloorPlanElement[]
  ) => FloorPlanElement[];
  endDrag: () => void;
}

export function useDragAndDrop(): UseDragAndDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState<FloorPlanElement | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragElementsStartPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const relativePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const startDrag = useCallback(
    (
      element: FloorPlanElement,
      mouseX: number,
      mouseY: number,
      selectedIds: Set<string>,
      allElements: FloorPlanElement[]
    ) => {
      dragStartPosRef.current = { x: mouseX, y: mouseY };
      setIsDragging(true);
      setDraggedElement(element);

      // Store initial positions of all selected elements
      const movingZones = allElements.filter(
        (el) => selectedIds.has(el.id) && el.type === "zone"
      );
      const containedElementIds = new Set<string>();
      const elementToZoneMap = new Map<string, string>();

      movingZones.forEach((zone) => {
        allElements.forEach((el) => {
          if (el.zoneId === zone.id && !selectedIds.has(el.id)) {
            containedElementIds.add(el.id);
            elementToZoneMap.set(el.id, zone.id);
          }
        });
      });

      const allMovingIds = new Set([...selectedIds, ...containedElementIds]);

      dragElementsStartPosRef.current.clear();
      relativePositionsRef.current.clear();

      allMovingIds.forEach((id) => {
        const el = allElements.find((e) => e.id === id);
        if (el) {
          dragElementsStartPosRef.current.set(id, { x: el.x, y: el.y });

          const zoneId = elementToZoneMap.get(id);
          if (zoneId) {
            const zone = allElements.find((e) => e.id === zoneId);
            if (zone) {
              relativePositionsRef.current.set(id, {
                x: el.x - zone.x,
                y: el.y - zone.y
              });
            }
          }
        }
      });
    },
    []
  );

  const handleDrag = useCallback(
    (
      mouseX: number,
      mouseY: number,
      selectedIds: Set<string>,
      allElements: FloorPlanElement[]
    ): FloorPlanElement[] => {
      if (!dragStartPosRef.current) return allElements;

      const deltaX = mouseX - dragStartPosRef.current.x;
      const deltaY = mouseY - dragStartPosRef.current.y;

      // Check if we're moving a zone - if so, move all contained elements too
      const movingZones = allElements.filter(
        (el) => selectedIds.has(el.id) && el.type === "zone"
      );
      const containedElementIds = new Set<string>();
      movingZones.forEach((zone) => {
        allElements.forEach((el) => {
          if (el.zoneId === zone.id && !selectedIds.has(el.id)) {
            containedElementIds.add(el.id);
          }
        });
      });

      const allMovingIds = new Set([...selectedIds, ...containedElementIds]);

      return allElements.map((el) => {
        if (allMovingIds.has(el.id)) {
          const startPos = dragElementsStartPosRef.current.get(el.id);
          if (!startPos) return el;

          // Check if this is a contained element (has relative position stored)
          const relativePos = relativePositionsRef.current.get(el.id);

          if (relativePos) {
            // This is a contained element - move it relative to its parent zone
            const parentZone = movingZones.find((z) => el.zoneId === z.id);
            if (parentZone) {
              const zoneStartPos = dragElementsStartPosRef.current.get(parentZone.id);
              if (zoneStartPos) {
                // Calculate new zone position
                const newZoneX = zoneStartPos.x + deltaX;
                const newZoneY = zoneStartPos.y + deltaY;

                // Apply relative position
                let newX = newZoneX + relativePos.x;
                let newY = newZoneY + relativePos.y;

                // Snap to grid
                newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

                return {
                  ...el,
                  x: newX,
                  y: newY
                };
              }
            }
          }

          // For directly selected elements (including zones), use their start position
          let newX = startPos.x + deltaX;
          let newY = startPos.y + deltaY;

          // Snap to grid
          newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

          return {
            ...el,
            x: newX,
            y: newY
          };
        }
        return el;
      });
    },
    []
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDraggedElement(null);
    dragStartPosRef.current = null;
    dragElementsStartPosRef.current.clear();
    relativePositionsRef.current.clear();
  }, []);

  return {
    isDragging,
    draggedElement,
    startDrag,
    handleDrag,
    endDrag
  };
}

