/**
 * Auto Zone Creation Utility
 * Creates zones automatically around tables that are adjacent
 * Supports rectangle/square/snake shapes based on table positions
 */

import type { FloorPlanElement } from "../types";
import { GRID_SIZE } from "../types";

/**
 * Check if two circles (tables) are adjacent (touching or very close)
 */
function areTablesAdjacent(
  table1: FloorPlanElement,
  table2: FloorPlanElement,
  threshold: number = GRID_SIZE * 2
): boolean {
  const center1X = table1.x + table1.width / 2;
  const center1Y = table1.y + table1.height / 2;
  const center2X = table2.x + table2.width / 2;
  const center2Y = table2.y + table2.height / 2;

  const radius1 = table1.width / 2;
  const radius2 = table2.width / 2;
  const distance = Math.sqrt(
    Math.pow(center2X - center1X, 2) + Math.pow(center2Y - center1Y, 2)
  );

  // Tables are adjacent if distance between centers is less than sum of radii + threshold
  return distance <= radius1 + radius2 + threshold;
}

/**
 * Find all groups of adjacent tables
 */
function findAdjacentTableGroups(tables: FloorPlanElement[]): FloorPlanElement[][] {
  const groups: FloorPlanElement[][] = [];
  const processed = new Set<string>();

  tables.forEach((table) => {
    if (processed.has(table.id)) return;

    const group: FloorPlanElement[] = [table];
    processed.add(table.id);

    // Find all tables adjacent to this one (recursively)
    const findAdjacent = (currentTable: FloorPlanElement) => {
      tables.forEach((otherTable) => {
        if (processed.has(otherTable.id)) return;
        if (areTablesAdjacent(currentTable, otherTable)) {
          group.push(otherTable);
          processed.add(otherTable.id);
          findAdjacent(otherTable); // Recursively find adjacent to this one
        }
      });
    };

    findAdjacent(table);
    groups.push(group);
  });

  return groups;
}

/**
 * Calculate bounding box for a group of tables
 * Returns rectangle/square/snake shape based on table positions
 */
function calculateZoneBounds(tables: FloorPlanElement[]): {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rectangle" | "square";
} {
  if (tables.length === 0) {
    return { x: 0, y: 0, width: 200, height: 200, shape: "rectangle" };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  tables.forEach((table) => {
    minX = Math.min(minX, table.x);
    minY = Math.min(minY, table.y);
    maxX = Math.max(maxX, table.x + table.width);
    maxY = Math.max(maxY, table.y + table.height);
  });

  // Add padding
  const padding = GRID_SIZE * 2;
  const x = Math.round((minX - padding) / GRID_SIZE) * GRID_SIZE;
  const y = Math.round((minY - padding) / GRID_SIZE) * GRID_SIZE;
  const width = Math.round((maxX - minX + padding * 2) / GRID_SIZE) * GRID_SIZE;
  const height = Math.round((maxY - minY + padding * 2) / GRID_SIZE) * GRID_SIZE;

  // Determine if it's closer to square or rectangle
  const aspectRatio = width / height;
  const shape: "rectangle" | "square" = aspectRatio > 0.8 && aspectRatio < 1.2 ? "square" : "rectangle";

  return { x, y, width, height, shape };
}

/**
 * Create zones automatically for groups of adjacent tables
 * @param tables Array of table elements
 * @param zoneName Base name for zones
 * @param zoneColor Color for zones
 * @returns Array of zone elements
 */
export function createZonesForAdjacentTables(
  tables: FloorPlanElement[],
  zoneName: string = "איזור שולחנות",
  zoneColor: string = "#3B82F6"
): FloorPlanElement[] {
  const groups = findAdjacentTableGroups(tables);
  const zones: FloorPlanElement[] = [];

  groups.forEach((group, index) => {
    if (group.length === 0) return;

    const bounds = calculateZoneBounds(group);
    const zone: FloorPlanElement = {
      id: `zone-auto-${Date.now()}-${index}`,
      type: "zone",
      name: group.length === 1 ? `${zoneName} ${index + 1}` : `${zoneName} ${index + 1} (${group.length} שולחנות)`,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      rotation: 0,
      shape: bounds.shape,
      color: zoneColor,
      zoneType: "tables_zone"
    };

    zones.push(zone);
  });

  return zones;
}

