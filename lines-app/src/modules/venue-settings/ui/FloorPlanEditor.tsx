"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Square, Circle, RotateCw, Trash2, Save, Grid } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { saveVenueTables } from "../actions/floorPlanActions";

export type TableShape = "rectangle" | "circle" | "triangle" | "polygon";

export interface TableItem {
  id: string;
  name: string;
  seats?: number | null;
  notes?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shape: TableShape;
  zoneId?: string;
  color?: string;
}

interface FloorPlanEditorProps {
  venueId: string;
  initialTables?: TableItem[];
}

const MIN_TABLE_SIZE = 40;
const MAX_TABLE_SIZE = 200;
const DEFAULT_TABLE_SIZE = 80;

export function FloorPlanEditor({ venueId, initialTables = [] }: FloorPlanEditorProps) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tables, setTables] = useState<TableItem[]>(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Drag state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedTable, setDraggedTable] = useState<TableItem | null>(null);

  // Calculate canvas size to fit container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width - 32, // Account for padding
          height: rect.height - 32
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Add new table
  const handleAddTable = useCallback(() => {
    const centerX = canvasSize.width / 2 - DEFAULT_TABLE_SIZE / 2;
    const centerY = canvasSize.height / 2 - DEFAULT_TABLE_SIZE / 2;

    const newTable: TableItem = {
      id: `table-${Date.now()}`,
      name: `שולחן ${tables.length + 1}`,
      seats: 4,
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      width: DEFAULT_TABLE_SIZE,
      height: DEFAULT_TABLE_SIZE,
      rotation: 0,
      shape: "rectangle"
    };
    setTables([...tables, newTable]);
    setSelectedTableId(newTable.id);
  }, [tables, canvasSize]);

  // Delete table
  const handleDeleteTable = useCallback(
    (id: string) => {
      setTables(tables.filter((t) => t.id !== id));
      if (selectedTableId === id) {
        setSelectedTableId(null);
      }
    },
    [tables, selectedTableId]
  );

  // Mouse down on table
  const handleTableMouseDown = useCallback((e: React.MouseEvent, table: TableItem) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedTableId(table.id);
    setIsDragging(true);
    setDraggedTable(table);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      setDragOffset({
        x: canvasX - table.x,
        y: canvasY - table.y
      });
    }
  }, []);

  // Mouse move - handle dragging
  useEffect(() => {
    if (!isDragging || !draggedTable || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const newX = Math.max(
        0,
        Math.min(canvasSize.width - draggedTable.width, canvasX - dragOffset.x)
      );
      const newY = Math.max(
        0,
        Math.min(canvasSize.height - draggedTable.height, canvasY - dragOffset.y)
      );

      setTables(
        tables.map((t) =>
          t.id === draggedTable.id
            ? {
                ...t,
                x: newX,
                y: newY
              }
            : t
        )
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedTable(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, draggedTable, dragOffset, tables, canvasSize]);

  // Resize handle
  const handleResize = useCallback(
    (e: React.MouseEvent, table: TableItem, corner: "se" | "sw" | "ne" | "nw") => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedTableId(table.id);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = table.width;
      const startHeight = table.height;
      const startXPos = table.x;
      const startYPos = table.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startXPos;
        let newY = startYPos;

        if (corner === "se") {
          newWidth = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startWidth + deltaX));
          newHeight = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startHeight + deltaY));
        } else if (corner === "sw") {
          newWidth = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startWidth - deltaX));
          newHeight = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startHeight + deltaY));
          newX = Math.max(0, Math.min(canvasSize.width - newWidth, startXPos + deltaX));
        } else if (corner === "ne") {
          newWidth = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startWidth + deltaX));
          newHeight = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startHeight - deltaY));
          newY = Math.max(0, Math.min(canvasSize.height - newHeight, startYPos + deltaY));
        } else if (corner === "nw") {
          newWidth = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startWidth - deltaX));
          newHeight = Math.max(MIN_TABLE_SIZE, Math.min(MAX_TABLE_SIZE, startHeight - deltaY));
          newX = Math.max(0, Math.min(canvasSize.width - newWidth, startXPos + deltaX));
          newY = Math.max(0, Math.min(canvasSize.height - newHeight, startYPos + deltaY));
        }

        setTables(
          tables.map((t) =>
            t.id === table.id
              ? {
                  ...t,
                  width: newWidth,
                  height: newHeight,
                  x: newX,
                  y: newY
                }
              : t
          )
        );
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [tables, canvasSize]
  );

  // Change shape
  const handleChangeShape = useCallback(
    (shape: TableShape) => {
      if (!selectedTableId) return;
      setTables(
        tables.map((t) =>
          t.id === selectedTableId
            ? {
                ...t,
                shape,
                // For circle/square, make width = height
                ...(shape === "circle" ? { height: t.width } : {})
              }
            : t
        )
      );
    },
    [selectedTableId, tables]
  );

  // Rotate
  const handleRotate = useCallback(() => {
    if (!selectedTableId) return;
    setTables(
      tables.map((t) =>
        t.id === selectedTableId
          ? {
              ...t,
              rotation: (t.rotation + 15) % 360
            }
          : t
      )
    );
  }, [selectedTableId, tables]);

  // Save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await saveVenueTables(venueId, tables);
      if (result.success) {
        toast({
          title: t("success.detailsUpdated"),
          description: t("success.detailsUpdated")
        });
      } else {
        throw new Error(result.error || t("errors.savingData"));
      }
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : t("errors.savingData"),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [tables, venueId, toast, t]);

  // Click canvas to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedTableId(null);
    }
  }, []);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  return (
    <div className="flex h-[calc(100vh-250px)] flex-col gap-4">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button onClick={handleAddTable} size="sm">
            <Plus className="ml-2 h-4 w-4" />
            {t("floorPlan.addTable")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? "bg-primary/10" : ""}
          >
            <Grid className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {tables.length} {t("floorPlan.tables")}
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="ml-2 h-4 w-4" />
            {isSaving ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Canvas */}
        <Card ref={containerRef} className="relative flex-1 overflow-hidden p-4">
          <div
            ref={canvasRef}
            className="relative h-full w-full cursor-crosshair bg-gradient-to-br from-muted/20 to-muted/40"
            style={{
              width: `${canvasSize.width || 800}px`,
              height: `${canvasSize.height || 600}px`,
              backgroundImage: showGrid
                ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
                : undefined,
              backgroundSize: "20px 20px"
            }}
            onClick={handleCanvasClick}
          >
            {/* Tables */}
            {tables.map((table) => (
              <TableElement
                key={table.id}
                table={table}
                isSelected={selectedTableId === table.id}
                onMouseDown={(e) => handleTableMouseDown(e, table)}
                onResize={(e, corner) => handleResize(e, table, corner)}
                onDelete={() => handleDeleteTable(table.id)}
              />
            ))}
          </div>
        </Card>

        {/* Properties Panel */}
        {selectedTable && (
          <Card className="w-80 shrink-0 overflow-y-auto">
            <div className="space-y-4 p-4">
              <h3 className="font-semibold">{t("floorPlan.edit")}</h3>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("validation.tableNameRequired")}</label>
                <input
                  type="text"
                  value={selectedTable.name}
                  onChange={(e) =>
                    setTables(
                      tables.map((t) =>
                        t.id === selectedTableId ? { ...t, name: e.target.value } : t
                      )
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Seats */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("common.seats")}</label>
                <input
                  type="number"
                  min="1"
                  value={selectedTable.seats || ""}
                  onChange={(e) =>
                    setTables(
                      tables.map((t) =>
                        t.id === selectedTableId
                          ? { ...t, seats: e.target.value ? parseInt(e.target.value) : null }
                          : t
                      )
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Shape */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("floorPlan.shape")}</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedTable.shape === "rectangle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChangeShape("rectangle")}
                    title="Rectangle"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={selectedTable.shape === "circle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChangeShape("circle")}
                    title="Circle"
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={selectedTable.shape === "triangle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChangeShape("triangle")}
                    title="Triangle"
                  >
                    <Square className="h-4 w-4 rotate-45" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="ml-2 h-4 w-4" />
                  {t("floorPlan.rotate")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTable(selectedTable.id)}
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  {t("floorPlan.delete")}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Table Element Component
interface TableElementProps {
  table: TableItem;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResize: (e: React.MouseEvent, corner: "se" | "sw" | "ne" | "nw") => void;
  onDelete: () => void;
}

function TableElement({ table, isSelected, onMouseDown, onResize }: TableElementProps) {
  const getShapeStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${table.x}px`,
      top: `${table.y}px`,
      width: `${table.width}px`,
      height: `${table.height}px`,
      transform: `rotate(${table.rotation}deg)`,
      transformOrigin: "center center",
      cursor: isSelected ? "move" : "grab",
      border: isSelected ? "2px solid #3B82F6" : "2px solid rgba(0,0,0,0.3)",
      backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.95)",
      boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      transition: isSelected ? "none" : "all 0.2s ease"
    };

    if (table.shape === "circle") {
      return {
        ...baseStyle,
        borderRadius: "50%"
      };
    }
    if (table.shape === "triangle") {
      // Triangle uses SVG clipPath
      return baseStyle;
    }
    return {
      ...baseStyle,
      borderRadius: "8px"
    };
  };

  return (
    <div style={getShapeStyle()} onMouseDown={onMouseDown} className="group">
      {/* Table Label */}
      <div className="pointer-events-none text-center px-1">
        <div className="text-xs font-semibold truncate">{table.name}</div>
        {table.seats && (
          <div className="text-[10px] text-muted-foreground mt-0.5">{table.seats}</div>
        )}
      </div>

      {/* Resize Handles */}
      {isSelected && (
        <>
          <ResizeHandle
            position="se"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResize(e, "se");
            }}
          />
          <ResizeHandle
            position="sw"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResize(e, "sw");
            }}
          />
          <ResizeHandle
            position="ne"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResize(e, "ne");
            }}
          />
          <ResizeHandle
            position="nw"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResize(e, "nw");
            }}
          />
        </>
      )}
    </div>
  );
}

// Resize Handle Component
interface ResizeHandleProps {
  position: "se" | "sw" | "ne" | "nw";
  onMouseDown: (e: React.MouseEvent) => void;
}

function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
  const getPositionStyle = (): React.CSSProperties => {
    const size = 8;
    const offset = -size / 2;

    switch (position) {
      case "se":
        return {
          bottom: offset,
          right: offset,
          cursor: "nwse-resize"
        };
      case "sw":
        return {
          bottom: offset,
          left: offset,
          cursor: "nesw-resize"
        };
      case "ne":
        return {
          top: offset,
          right: offset,
          cursor: "nesw-resize"
        };
      case "nw":
        return {
          top: offset,
          left: offset,
          cursor: "nwse-resize"
        };
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        width: 8,
        height: 8,
        backgroundColor: "#3B82F6",
        border: "1px solid white",
        borderRadius: "50%",
        zIndex: 10,
        ...getPositionStyle()
      }}
      onMouseDown={onMouseDown}
    />
  );
}
