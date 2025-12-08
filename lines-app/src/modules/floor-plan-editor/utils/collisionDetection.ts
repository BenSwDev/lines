/**
 * Collision Detection for Floor Plan Elements
 * Checks if rectangles overlap or touch
 */

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Check if two rectangles overlap or touch
 * @param rect1 First rectangle
 * @param rect2 Second rectangle
 * @returns true if rectangles overlap or touch
 */
export function doRectanglesCollide(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Check if a rectangle collides with any existing rectangles
 * @param newRect The new rectangle to check
 * @param existingRects Array of existing rectangles
 * @param excludeId Optional ID to exclude from collision check (for updating existing element)
 * @returns true if collision detected
 */
export function checkRectangleCollision(
  newRect: Rectangle,
  existingRects: Array<Rectangle & { id?: string }>,
  excludeId?: string
): boolean {
  for (const existing of existingRects) {
    if (excludeId && existing.id === excludeId) continue;
    if (doRectanglesCollide(newRect, existing)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate how many tables can fit in a zone
 * @param zoneWidth Zone width
 * @param zoneHeight Zone height
 * @param tableWidth Table width (default 60)
 * @param tableHeight Table height (default 60)
 * @param spacing Spacing between tables (default 10)
 * @returns Object with counts and positions
 */
export function calculateTableLayout(
  zoneWidth: number,
  zoneHeight: number,
  tableWidth: number = 60,
  tableHeight: number = 60,
  spacing: number = 10
): { count: number; positions: Array<{ x: number; y: number }> } {
  const cols = Math.floor((zoneWidth - spacing) / (tableWidth + spacing));
  const rows = Math.floor((zoneHeight - spacing) / (tableHeight + spacing));
  const count = cols * rows;

  const positions: Array<{ x: number; y: number }> = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: spacing + col * (tableWidth + spacing),
        y: spacing + row * (tableHeight + spacing)
      });
    }
  }

  return { count, positions };
}

