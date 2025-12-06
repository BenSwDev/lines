/**
 * Bulk Operations Utilities
 * Provides operations for multiple selected elements
 */

export interface ElementBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AlignmentType = "left" | "right" | "center" | "top" | "bottom" | "middle";
export type DistributionType = "horizontal" | "vertical" | "both";

/**
 * Align multiple elements
 */
export function alignElements(
  elements: ElementBounds[],
  alignment: AlignmentType
): Map<string, { x: number; y: number }> {
  if (elements.length === 0) return new Map();

  const positions = new Map<string, { x: number; y: number }>();

  switch (alignment) {
    case "left": {
      const minX = Math.min(...elements.map((e) => e.x));
      elements.forEach((el) => {
        positions.set(el.id, { x: minX, y: el.y });
      });
      break;
    }
    case "right": {
      const maxX = Math.max(...elements.map((e) => e.x + e.width));
      elements.forEach((el) => {
        positions.set(el.id, { x: maxX - el.width, y: el.y });
      });
      break;
    }
    case "center": {
      const centerX = elements.reduce((sum, e) => sum + e.x + e.width / 2, 0) / elements.length;
      elements.forEach((el) => {
        positions.set(el.id, { x: centerX - el.width / 2, y: el.y });
      });
      break;
    }
    case "top": {
      const minY = Math.min(...elements.map((e) => e.y));
      elements.forEach((el) => {
        positions.set(el.id, { x: el.x, y: minY });
      });
      break;
    }
    case "bottom": {
      const maxY = Math.max(...elements.map((e) => e.y + e.height));
      elements.forEach((el) => {
        positions.set(el.id, { x: el.x, y: maxY - el.height });
      });
      break;
    }
    case "middle": {
      const centerY = elements.reduce((sum, e) => sum + e.y + e.height / 2, 0) / elements.length;
      elements.forEach((el) => {
        positions.set(el.id, { x: el.x, y: centerY - el.height / 2 });
      });
      break;
    }
  }

  return positions;
}

/**
 * Distribute elements evenly
 */
export function distributeElements(
  elements: ElementBounds[],
  distribution: DistributionType
): Map<string, { x: number; y: number }> {
  if (elements.length < 3) return new Map(); // Need at least 3 elements to distribute

  const positions = new Map<string, { x: number; y: number }>();

  // Sort elements by position
  const sortedX = [...elements].sort((a, b) => a.x - b.x);
  const sortedY = [...elements].sort((a, b) => a.y - b.y);

  if (distribution === "horizontal" || distribution === "both") {
    const minX = sortedX[0].x;
    const maxX = sortedX[sortedX.length - 1].x + sortedX[sortedX.length - 1].width;
    const totalWidth = maxX - minX;
    const spacing = totalWidth / (sortedX.length - 1);

    sortedX.forEach((el, index) => {
      const currentPos = positions.get(el.id) || { x: el.x, y: el.y };
      positions.set(el.id, {
        x: minX + spacing * index - el.width / 2 + sortedX[0].width / 2,
        y: currentPos.y
      });
    });
  }

  if (distribution === "vertical" || distribution === "both") {
    const minY = sortedY[0].y;
    const maxY = sortedY[sortedY.length - 1].y + sortedY[sortedY.length - 1].height;
    const totalHeight = maxY - minY;
    const spacing = totalHeight / (sortedY.length - 1);

    sortedY.forEach((el, index) => {
      const currentPos = positions.get(el.id) || { x: el.x, y: el.y };
      positions.set(el.id, {
        x: currentPos.x,
        y: minY + spacing * index - el.height / 2 + sortedY[0].height / 2
      });
    });
  }

  return positions;
}

/**
 * Resize all elements to same size
 */
export function resizeToSameSize(
  elements: ElementBounds[],
  targetWidth?: number,
  targetHeight?: number
): Map<string, { width: number; height: number }> {
  if (elements.length === 0) return new Map();

  const sizes = new Map<string, { width: number; height: number }>();

  // If no target size specified, use the size of the first element
  const width = targetWidth ?? elements[0].width;
  const height = targetHeight ?? elements[0].height;

  elements.forEach((el) => {
    sizes.set(el.id, { width, height });
  });

  return sizes;
}

/**
 * Get bounding box of multiple elements
 */
export function getBoundingBox(elements: ElementBounds[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...elements.map((e) => e.x));
  const minY = Math.min(...elements.map((e) => e.y));
  const maxX = Math.max(...elements.map((e) => e.x + e.width));
  const maxY = Math.max(...elements.map((e) => e.y + e.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

