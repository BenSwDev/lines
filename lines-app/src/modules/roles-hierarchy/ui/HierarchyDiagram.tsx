"use client";

import { useState, useMemo } from "react";
import { User } from "lucide-react";
import type { HierarchyNode } from "../types";

type HierarchyDiagramProps = {
  hierarchy: HierarchyNode[];
  onNodeClick?: (node: HierarchyNode) => void;
  selectedNodeId?: string | null;
};

type PositionedNode = HierarchyNode & {
  x: number;
  y: number;
  level: number;
  indexInLevel: number;
};

const NODE_WIDTH = 160;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 200;
const VERTICAL_SPACING = 150;
const LEVEL_HEIGHT = NODE_HEIGHT + VERTICAL_SPACING;

export function HierarchyDiagram({
  hierarchy,
  onNodeClick,
  selectedNodeId
}: HierarchyDiagramProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Calculate positions for all nodes
  const positionedNodes = useMemo(() => {
    const nodes: PositionedNode[] = [];
    const levelCounts = new Map<number, number>();

    // First pass: calculate levels and counts
    const calculateLevels = (node: HierarchyNode, level: number = 0) => {
      const count = levelCounts.get(level) || 0;
      levelCounts.set(level, count + 1);

      node.children.forEach((child) => {
        calculateLevels(child, level + 1);
      });
    };

    hierarchy.forEach((node) => calculateLevels(node, 0));

    // Second pass: assign positions
    const levelIndices = new Map<number, number>();

    const assignPositions = (node: HierarchyNode, level: number = 0) => {
      const index = levelIndices.get(level) || 0;
      const count = levelCounts.get(level) || 1;

      // Calculate x position (centered for the level)
      const totalWidth = (count - 1) * HORIZONTAL_SPACING;
      const startX = -totalWidth / 2;
      const x = startX + index * HORIZONTAL_SPACING;
      const y = level * LEVEL_HEIGHT;

      const positioned: PositionedNode = {
        ...node,
        x,
        y,
        level,
        indexInLevel: index
      };

      nodes.push(positioned);
      levelIndices.set(level, index + 1);

      // Process children
      node.children.forEach((child) => {
        assignPositions(child, level + 1);
      });
    };

    hierarchy.forEach((node) => assignPositions(node, 0));

    return nodes;
  }, [hierarchy]);

  // Calculate connections between nodes
  const connections = useMemo(() => {
    const conns: Array<{ from: PositionedNode; to: PositionedNode }> = [];

    positionedNodes.forEach((node) => {
      node.children.forEach((child) => {
        const childNode = positionedNodes.find((n) => n.id === child.id);
        if (childNode) {
          conns.push({ from: node, to: childNode });
        }
      });
    });

    return conns;
  }, [positionedNodes]);

  // Calculate SVG dimensions
  const svgDimensions = useMemo(() => {
    if (positionedNodes.length === 0) {
      return { width: 800, height: 600 };
    }

    const maxX = Math.max(...positionedNodes.map((n) => n.x)) + NODE_WIDTH / 2;
    const minX = Math.min(...positionedNodes.map((n) => n.x)) - NODE_WIDTH / 2;
    const maxY = Math.max(...positionedNodes.map((n) => n.y)) + NODE_HEIGHT / 2;
    const minY = Math.min(...positionedNodes.map((n) => n.y)) - NODE_HEIGHT / 2;

    const width = Math.max(800, maxX - minX + 200);
    const height = Math.max(600, maxY - minY + 200);

    return { width, height, minX, minY };
  }, [positionedNodes]);

  const renderNode = (node: PositionedNode) => {
    const isSelected = selectedNodeId === node.id;
    const isHovered = hoveredNodeId === node.id;
    const isManagement = node.data?.isManagementRole;

    // Adjust position relative to SVG center
    const adjustedX = node.x + svgDimensions.width / 2;
    const adjustedY = node.y + 100;

    return (
      <g
        key={node.id}
        transform={`translate(${adjustedX}, ${adjustedY})`}
        className="cursor-pointer"
        onClick={() => onNodeClick?.(node)}
        onMouseEnter={() => setHoveredNodeId(node.id)}
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        {/* Node rectangle */}
        <rect
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          x={-NODE_WIDTH / 2}
          y={-NODE_HEIGHT / 2}
          rx={12}
          fill={node.color}
          fillOpacity={isSelected || isHovered ? 0.9 : 0.7}
          stroke={isSelected ? "#000" : isHovered ? node.color : "transparent"}
          strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
          className="transition-all duration-200"
          style={{
            filter: isHovered ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : undefined
          }}
        />

        {/* Icon/Content */}
        <g transform="translate(0, -20)">
          {node.icon ? (
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="32"
              fill="white"
            >
              {node.icon}
            </text>
          ) : (
            <g>
              <circle r="16" fill="white" fillOpacity={0.9} />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="20"
                fill={node.color}
              >
                👤
              </text>
            </g>
          )}
        </g>

        {/* Name */}
        <text
          x="0"
          y="25"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="600"
          fill="white"
          className="pointer-events-none"
        >
          {node.name}
        </text>

        {/* Management badge */}
        {isManagement && (
          <g transform="translate(0, 40)">
            <rect x={-30} y={-8} width={60} height={16} rx={8} fill="rgba(255,255,255,0.3)" />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="600"
              fill="white"
            >
              ניהול
            </text>
          </g>
        )}
      </g>
    );
  };

  const renderConnection = (conn: { from: PositionedNode; to: PositionedNode }) => {
    const fromX = conn.from.x + svgDimensions.width / 2;
    const fromY = conn.from.y + 100;
    const toX = conn.to.x + svgDimensions.width / 2;
    const toY = conn.to.y + 100;

    // Calculate connection points (top of child, bottom of parent)
    const startY = fromY + NODE_HEIGHT / 2;
    const endY = toY - NODE_HEIGHT / 2;

    return (
      <line
        key={`${conn.from.id}-${conn.to.id}`}
        x1={fromX}
        y1={startY}
        x2={toX}
        y2={endY}
        stroke="#94a3b8"
        strokeWidth={2}
        className="pointer-events-none"
      />
    );
  };

  if (positionedNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-lg">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">אין היררכיה עדיין</h3>
          <p className="text-sm text-muted-foreground">צור תפקידים כדי לראות את ההיררכיה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto bg-muted/30 rounded-lg p-8">
      <svg
        width={svgDimensions.width}
        height={svgDimensions.height}
        className="mx-auto"
        style={{ minHeight: "600px" }}
      >
        {/* Connections (drawn first, so they appear behind nodes) */}
        <g>{connections.map(renderConnection)}</g>

        {/* Nodes (drawn on top) */}
        <g>{positionedNodes.map(renderNode)}</g>
      </svg>
    </div>
  );
}
