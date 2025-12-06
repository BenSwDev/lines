/**
 * Alignment Guides System
 * Detects and displays alignment guides when dragging elements
 */

export interface AlignmentGuide {
  type: "vertical" | "horizontal";
  position: number;
  elements: string[]; // IDs of aligned elements
}

export interface ElementBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const SNAP_THRESHOLD = 5; // pixels

/**
 * Calculate bounds for an element
 */
export function calculateBounds(
  x: number,
  y: number,
  width: number,
  height: number
): ElementBounds {
  return {
    id: "",
    x,
    y,
    width,
    height,
    centerX: x + width / 2,
    centerY: y + height / 2,
    left: x,
    right: x + width,
    top: y,
    bottom: y + height
  };
}

/**
 * Find alignment guides for a moving element
 */
export function findAlignmentGuides(
  movingElement: ElementBounds,
  otherElements: ElementBounds[],
  threshold: number = SNAP_THRESHOLD
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];

  for (const element of otherElements) {
    // Vertical alignments (same X positions)
    if (Math.abs(movingElement.left - element.left) < threshold) {
      guides.push({
        type: "vertical",
        position: element.left,
        elements: [element.id]
      });
    }
    if (Math.abs(movingElement.centerX - element.centerX) < threshold) {
      guides.push({
        type: "vertical",
        position: element.centerX,
        elements: [element.id]
      });
    }
    if (Math.abs(movingElement.right - element.right) < threshold) {
      guides.push({
        type: "vertical",
        position: element.right,
        elements: [element.id]
      });
    }

    // Horizontal alignments (same Y positions)
    if (Math.abs(movingElement.top - element.top) < threshold) {
      guides.push({
        type: "horizontal",
        position: element.top,
        elements: [element.id]
      });
    }
    if (Math.abs(movingElement.centerY - element.centerY) < threshold) {
      guides.push({
        type: "horizontal",
        position: element.centerY,
        elements: [element.id]
      });
    }
    if (Math.abs(movingElement.bottom - element.bottom) < threshold) {
      guides.push({
        type: "horizontal",
        position: element.bottom,
        elements: [element.id]
      });
    }
  }

  // Remove duplicates and merge guides at same position
  const mergedGuides = new Map<string, AlignmentGuide>();
  for (const guide of guides) {
    const key = `${guide.type}-${Math.round(guide.position)}`;
    const existing = mergedGuides.get(key);
    if (existing) {
      existing.elements = [...new Set([...existing.elements, ...guide.elements])];
    } else {
      mergedGuides.set(key, { ...guide });
    }
  }

  return Array.from(mergedGuides.values());
}

/**
 * Snap element to nearest guide
 */
export function snapToGuides(
  element: ElementBounds,
  guides: AlignmentGuide[]
): { x: number; y: number } {
  let newX = element.x;
  let newY = element.y;

  for (const guide of guides) {
    if (guide.type === "vertical") {
      const distance = Math.abs(element.x - guide.position);
      if (distance < SNAP_THRESHOLD) {
        newX = guide.position;
      }
      const distanceCenter = Math.abs(element.centerX - guide.position);
      if (distanceCenter < SNAP_THRESHOLD) {
        newX = guide.position - element.width / 2;
      }
      const distanceRight = Math.abs(element.right - guide.position);
      if (distanceRight < SNAP_THRESHOLD) {
        newX = guide.position - element.width;
      }
    } else {
      const distance = Math.abs(element.y - guide.position);
      if (distance < SNAP_THRESHOLD) {
        newY = guide.position;
      }
      const distanceCenter = Math.abs(element.centerY - guide.position);
      if (distanceCenter < SNAP_THRESHOLD) {
        newY = guide.position - element.height / 2;
      }
      const distanceBottom = Math.abs(element.bottom - guide.position);
      if (distanceBottom < SNAP_THRESHOLD) {
        newY = guide.position - element.height;
      }
    }
  }

  return { x: newX, y: newY };
}

