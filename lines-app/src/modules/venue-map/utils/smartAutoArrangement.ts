/**
 * Smart Auto-Arrangement Utility
 * Automatically arranges elements in a grid pattern
 */

import type { FloorPlanElement } from "../types";
import { GRID_SIZE } from "../types";

export interface ArrangementOptions {
  startX?: number;
  startY?: number;
  columns?: number;
  spacing?: number;
  center?: boolean;
}

/**
 * Arrange elements in a grid pattern
 */
export function arrangeInGrid(
  elements: FloorPlanElement[],
  options: ArrangementOptions = {}
): FloorPlanElement[] {
  const {
    startX = 1000,
    startY = 1000,
    columns = 3,
    spacing = GRID_SIZE * 2,
    center = true
  } = options;

  if (elements.length === 0) return elements;

  // Calculate grid dimensions
  const rows = Math.ceil(elements.length / columns);
  const totalWidth = columns * (elements[0]?.width || 80) + (columns - 1) * spacing;
  const totalHeight = rows * (elements[0]?.height || 80) + (rows - 1) * spacing;

  // Center offset
  const offsetX = center ? -totalWidth / 2 : 0;
  const offsetY = center ? -totalHeight / 2 : 0;

  return elements.map((element, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;

    const elementWidth = element.width || 80;
    const elementHeight = element.height || 80;

    const x = startX + offsetX + col * (elementWidth + spacing);
    const y = startY + offsetY + row * (elementHeight + spacing);

    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    return {
      ...element,
      x: snappedX,
      y: snappedY
    };
  });
}

/**
 * Arrange elements around a zone
 */
export function arrangeAroundZone(
  elements: FloorPlanElement[],
  zone: FloorPlanElement
): FloorPlanElement[] {
  if (elements.length === 0) return elements;

  const zoneCenterX = zone.x + (zone.width || 200) / 2;
  const zoneCenterY = zone.y + (zone.height || 200) / 2;

  // Arrange in a circle around the zone center
  const radius = Math.max(zone.width || 200, zone.height || 200) / 2 + GRID_SIZE * 4;
  const angleStep = (2 * Math.PI) / elements.length;

  return elements.map((element, index) => {
    const angle = index * angleStep;
    const x = zoneCenterX + Math.cos(angle) * radius - (element.width || 80) / 2;
    const y = zoneCenterY + Math.sin(angle) * radius - (element.height || 80) / 2;

    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    return {
      ...element,
      x: snappedX,
      y: snappedY
    };
  });
}

/**
 * Check for collisions between elements
 */
export function hasCollision(element1: FloorPlanElement, element2: FloorPlanElement): boolean {
  return (
    element1.x < element2.x + (element2.width || 0) &&
    element1.x + (element1.width || 0) > element2.x &&
    element1.y < element2.y + (element2.height || 0) &&
    element1.y + (element1.height || 0) > element2.y
  );
}

/**
 * Find a free position for an element
 */
export function findFreePosition(
  element: FloorPlanElement,
  existingElements: FloorPlanElement[],
  canvasWidth: number = 2000,
  canvasHeight: number = 2000
): { x: number; y: number } {
  const elementWidth = element.width || 80;
  const elementHeight = element.height || 80;

  // Try positions in a spiral pattern
  const maxAttempts = 100;
  let radius = 0;
  let angle = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = 1000 + Math.cos(angle) * radius * GRID_SIZE;
    const y = 1000 + Math.sin(angle) * radius * GRID_SIZE;

    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    // Check bounds
    if (
      snappedX < 0 ||
      snappedY < 0 ||
      snappedX + elementWidth > canvasWidth ||
      snappedY + elementHeight > canvasHeight
    ) {
      angle += Math.PI / 4;
      if (angle >= 2 * Math.PI) {
        angle = 0;
        radius++;
      }
      continue;
    }

    // Check collisions
    const testElement = { ...element, x: snappedX, y: snappedY };
    const hasCollisionWithExisting = existingElements.some((existing) =>
      hasCollision(testElement, existing)
    );

    if (!hasCollisionWithExisting) {
      return { x: snappedX, y: snappedY };
    }

    angle += Math.PI / 4;
    if (angle >= 2 * Math.PI) {
      angle = 0;
      radius++;
    }
  }

  // Fallback: return center position
  return {
    x: Math.round(1000 / GRID_SIZE) * GRID_SIZE,
    y: Math.round(1000 / GRID_SIZE) * GRID_SIZE
  };
}
