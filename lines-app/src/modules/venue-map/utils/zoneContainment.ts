/**
 * Zone Containment Detection
 * Checks if a table/element is inside a zone boundary
 */

import type { FloorPlanElement, Point } from "../ui/FloorPlanEditorV2";

/**
 * Check if a point is inside a rectangle
 */
function isPointInRectangle(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number; rotation?: number }
): boolean {
  // If rotated, we need to transform the point to the rectangle's local space
  if (rect.rotation && rect.rotation !== 0) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const angle = (-rect.rotation * Math.PI) / 180; // Convert to radians and negate

    // Translate point to origin
    const dx = point.x - centerX;
    const dy = point.y - centerY;

    // Rotate point back
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    // Translate back
    const localX = rotatedX + centerX;
    const localY = rotatedY + centerY;

    // Check if in unrotated rectangle
    return (
      localX >= rect.x &&
      localX <= rect.x + rect.width &&
      localY >= rect.y &&
      localY <= rect.y + rect.height
    );
  }

  // Simple rectangle check for unrotated rectangles
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Check if a point is inside a circle
 */
function isPointInCircle(
  point: { x: number; y: number },
  circle: { x: number; y: number; width: number; height: number }
): boolean {
  const centerX = circle.x + circle.width / 2;
  const centerY = circle.y + circle.height / 2;
  const radius = Math.min(circle.width, circle.height) / 2;

  const dx = point.x - centerX;
  const dy = point.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= radius;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(
  point: { x: number; y: number },
  polygonPoints: Point[],
  bounds: { x: number; y: number; width: number; height: number }
): boolean {
  if (!polygonPoints || polygonPoints.length < 3) return false;

  // Convert normalized polygon points (0-100%) to absolute coordinates
  const absolutePoints = polygonPoints.map((p) => ({
    x: bounds.x + (p.x / 100) * bounds.width,
    y: bounds.y + (p.y / 100) * bounds.height
  }));

  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = absolutePoints.length - 1; i < absolutePoints.length; j = i++) {
    const xi = absolutePoints[i].x;
    const yi = absolutePoints[i].y;
    const xj = absolutePoints[j].x;
    const yj = absolutePoints[j].y;

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Check if an element's center point is inside a zone
 */
export function isElementInZone(element: FloorPlanElement, zone: FloorPlanElement): boolean {
  if (zone.type !== "zone") return false;

  // Calculate element center
  const elementCenter = {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };

  const zoneBounds = {
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    rotation: zone.rotation
  };

  // Check based on zone shape
  if (zone.shape === "circle") {
    return isPointInCircle(elementCenter, zoneBounds);
  } else if (zone.shape === "polygon" && zone.polygonPoints) {
    return isPointInPolygon(elementCenter, zone.polygonPoints, zoneBounds);
  } else {
    // Default to rectangle (rectangle, square)
    return isPointInRectangle(elementCenter, zoneBounds);
  }
}

/**
 * Find which zone contains an element (if any)
 */
export function findContainingZone(
  element: FloorPlanElement,
  zones: FloorPlanElement[]
): FloorPlanElement | null {
  for (const zone of zones) {
    if (zone.type === "zone" && isElementInZone(element, zone)) {
      return zone;
    }
  }
  return null;
}

/**
 * Check if an element is fully contained within a zone
 * (all corners of the element are inside the zone)
 */
export function isElementFullyInZone(element: FloorPlanElement, zone: FloorPlanElement): boolean {
  if (zone.type !== "zone") return false;

  // Check all four corners of the element
  const corners = [
    { x: element.x, y: element.y }, // Top-left
    { x: element.x + element.width, y: element.y }, // Top-right
    { x: element.x, y: element.y + element.height }, // Bottom-left
    { x: element.x + element.width, y: element.y + element.height } // Bottom-right
  ];

  const zoneBounds = {
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    rotation: zone.rotation
  };

  // Check if all corners are inside
  for (const corner of corners) {
    let inside = false;

    if (zone.shape === "circle") {
      inside = isPointInCircle(corner, zoneBounds);
    } else if (zone.shape === "polygon" && zone.polygonPoints) {
      inside = isPointInPolygon(corner, zone.polygonPoints, zoneBounds);
    } else {
      inside = isPointInRectangle(corner, zoneBounds);
    }

    if (!inside) return false;
  }

  return true;
}
