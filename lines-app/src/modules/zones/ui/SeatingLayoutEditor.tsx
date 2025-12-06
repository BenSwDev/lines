"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Move,
  Square,
  RectangleHorizontal,
  DoorOpen,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Save,
  Eye,
  Edit,
  Trash2,
  Settings,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  VenueLayout,
  ZoneVisual,
  TableVisual,
  VenueAreaVisual,
  AreaType,
  TableType,
  ShapeType
} from "../types";

type SeatingLayoutEditorProps = {
  venueId: string;
  initialLayout?: VenueLayout;
  onSave: (layout: VenueLayout) => Promise<void>;
  onGenerateZones: (layout: VenueLayout) => Promise<void>;
};

type ToolMode = "select" | "zone" | "table" | "area" | "entrance" | "exit";

const DEFAULT_CANVAS_SIZE = { width: 1200, height: 800 };
const GRID_SIZE = 20;

export function SeatingLayoutEditor({
  initialLayout,
  onSave,
  onGenerateZones
}: SeatingLayoutEditorProps) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [viewMode, setViewMode] = useState<"edit" | "view">("edit");
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  // Layout state
  const [layout, setLayout] = useState<VenueLayout>(
    initialLayout || {
      layoutData: {
        width: DEFAULT_CANVAS_SIZE.width,
        height: DEFAULT_CANVAS_SIZE.height,
        scale: 1,
        gridSize: GRID_SIZE,
        showGrid: true,
        backgroundColor: "#f8f9fa"
      },
      zones: [],
      tables: [],
      areas: []
    }
  );

  // Tool settings
  const [selectedAreaType, setSelectedAreaType] = useState<AreaType>("kitchen");
  const [selectedTableType] = useState<TableType>("table");
  const [selectedShape] = useState<ShapeType>("rectangle");

  // Snap to grid helper
  const snapToGrid = useCallback(
    (value: number): number => {
      if (!showGrid) return value;
      return Math.round(value / GRID_SIZE) * GRID_SIZE;
    },
    [showGrid]
  );

  // Get mouse position relative to SVG
  const getSVGPoint = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const point = canvasRef.current.createSVGPoint();
      point.x = (e.clientX - rect.left) / zoom;
      point.y = (e.clientY - rect.top) / zoom;
      return {
        x: snapToGrid(point.x),
        y: snapToGrid(point.y)
      };
    },
    [zoom, snapToGrid]
  );

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (viewMode === "view") return;

      const point = getSVGPoint(e);
      const target = e.target as HTMLElement;

      // If clicking on an element, select it
      if (target.dataset.elementId) {
        setSelectedElement(target.dataset.elementId);
        setToolMode("select");
        return;
      }

      // If clicking on canvas, create new element based on tool mode
      if (toolMode === "zone") {
        const newZone: ZoneVisual = {
          id: `zone-${Date.now()}`,
          name: `אזור ${layout.zones.length + 1}`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          position: point,
          dimensions: { width: 200, height: 150 },
          rotation: 0,
          shape: selectedShape
        };
        setLayout((prev) => ({
          ...prev,
          zones: [...prev.zones, newZone]
        }));
        setSelectedElement(newZone.id);
      } else if (toolMode === "table") {
        const size =
          selectedTableType === "bar" ? { width: 300, height: 60 } : { width: 80, height: 80 };
        const newTable: TableVisual = {
          id: `table-${Date.now()}`,
          name: `שולחן ${layout.tables.length + 1}`,
          seats: 4,
          position: point,
          dimensions: size,
          rotation: 0,
          shape: selectedShape === "circle" ? "circle" : "rectangle",
          tableType: selectedTableType,
          zoneId: ""
        };
        setLayout((prev) => ({
          ...prev,
          tables: [...prev.tables, newTable]
        }));
        setSelectedElement(newTable.id);
      } else if (toolMode === "entrance" || toolMode === "exit") {
        const newArea: VenueAreaVisual = {
          id: `area-${Date.now()}`,
          name: toolMode === "entrance" ? "כניסה" : "יציאה",
          areaType: toolMode === "entrance" ? "entrance" : "exit",
          position: point,
          dimensions: { width: 100, height: 40 },
          rotation: 0,
          shape: "rectangle",
          icon: "door-open",
          color: toolMode === "entrance" ? "#10b981" : "#ef4444"
        };
        setLayout((prev) => ({
          ...prev,
          areas: [...prev.areas, newArea]
        }));
        setSelectedElement(newArea.id);
      } else if (toolMode === "area") {
        const newArea: VenueAreaVisual = {
          id: `area-${Date.now()}`,
          name: getAreaTypeLabel(selectedAreaType),
          areaType: selectedAreaType,
          position: point,
          dimensions: { width: 150, height: 150 },
          rotation: 0,
          shape: selectedShape,
          icon: getAreaIcon(selectedAreaType),
          color: getAreaColor(selectedAreaType)
        };
        setLayout((prev) => ({
          ...prev,
          areas: [...prev.areas, newArea]
        }));
        setSelectedElement(newArea.id);
      }

      setToolMode("select");
    },
    [toolMode, layout, selectedShape, selectedTableType, selectedAreaType, getSVGPoint, viewMode]
  );

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (viewMode === "view") return;
      const point = getSVGPoint(e);
      setDragStart(point);
      setIsDragging(true);
    },
    [getSVGPoint, viewMode]
  );

  // Handle drag
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging || !dragStart || viewMode === "view") return;

      const point = getSVGPoint(e);
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;

      if (selectedElement) {
        setLayout((prev) => ({
          ...prev,
          zones: prev.zones.map((z) =>
            z.id === selectedElement
              ? { ...z, position: { x: z.position.x + dx, y: z.position.y + dy } }
              : z
          ),
          tables: prev.tables.map((t) =>
            t.id === selectedElement
              ? { ...t, position: { x: t.position.x + dx, y: t.position.y + dy } }
              : t
          ),
          areas: prev.areas.map((a) =>
            a.id === selectedElement
              ? { ...a, position: { x: a.position.x + dx, y: a.position.y + dy } }
              : a
          )
        }));
        setDragStart(point);
      }
    },
    [isDragging, dragStart, selectedElement, getSVGPoint, viewMode]
  );

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Delete selected element
  const handleDelete = useCallback(() => {
    if (!selectedElement) return;
    setLayout((prev) => ({
      ...prev,
      zones: prev.zones.filter((z) => z.id !== selectedElement),
      tables: prev.tables.filter((t) => t.id !== selectedElement),
      areas: prev.areas.filter((a) => a.id !== selectedElement)
    }));
    setSelectedElement(null);
  }, [selectedElement]);

  // Render grid
  const renderGrid = () => {
    if (!showGrid || viewMode === "view") return null;
    const { width, height } = layout.layoutData;
    const lines = [];
    for (let x = 0; x <= width; x += GRID_SIZE) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }
    for (let y = 0; y <= height; y += GRID_SIZE) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }
    return <g>{lines}</g>;
  };

  // Render zones
  const renderZones = () => {
    return layout.zones.map((zone) => {
      const isSelected = selectedElement === zone.id;
      const baseProps = {
        x: zone.position.x,
        y: zone.position.y,
        width: zone.dimensions.width,
        height: zone.dimensions.height,
        fill: zone.color,
        fillOpacity: 0.2,
        stroke: zone.color,
        strokeWidth: isSelected ? 3 : 2,
        strokeDasharray: isSelected ? "5,5" : "none",
        "data-element-id": zone.id,
        className: "cursor-move",
        style: {
          transform: zone.rotation ? `rotate(${zone.rotation}deg)` : undefined,
          transformOrigin: `${zone.position.x + zone.dimensions.width / 2}px ${zone.position.y + zone.dimensions.height / 2}px`
        }
      };

      if (zone.shape === "circle") {
        const radius = Math.min(zone.dimensions.width, zone.dimensions.height) / 2;
        return (
          <circle
            key={zone.id}
            {...baseProps}
            cx={zone.position.x + zone.dimensions.width / 2}
            cy={zone.position.y + zone.dimensions.height / 2}
            r={radius}
          />
        );
      }

      return <rect key={zone.id} {...baseProps} rx={zone.shape === "square" ? 0 : 4} />;
    });
  };

  // Render tables
  const renderTables = () => {
    return layout.tables.map((table) => {
      const isSelected = selectedElement === table.id;
      const zone = layout.zones.find((z) => z.id === table.zoneId);
      const color = zone?.color || "#6b7280";

      const baseProps = {
        x: table.position.x,
        y: table.position.y,
        width: table.dimensions.width,
        height: table.dimensions.height,
        fill: color,
        fillOpacity: 0.6,
        stroke: isSelected ? "#3b82f6" : color,
        strokeWidth: isSelected ? 3 : 2,
        "data-element-id": table.id,
        className: "cursor-move",
        style: {
          transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
          transformOrigin: `${table.position.x + table.dimensions.width / 2}px ${table.position.y + table.dimensions.height / 2}px`
        }
      };

      if (table.shape === "circle") {
        const radius = Math.min(table.dimensions.width, table.dimensions.height) / 2;
        return (
          <g key={table.id}>
            <circle
              {...baseProps}
              cx={table.position.x + table.dimensions.width / 2}
              cy={table.position.y + table.dimensions.height / 2}
              r={radius}
            />
            <text
              x={table.position.x + table.dimensions.width / 2}
              y={table.position.y + table.dimensions.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-bold fill-white pointer-events-none"
            >
              {table.name}
            </text>
          </g>
        );
      }

      return (
        <g key={table.id}>
          <rect {...baseProps} rx={table.shape === "square" ? 0 : 4} />
          <text
            x={table.position.x + table.dimensions.width / 2}
            y={table.position.y + table.dimensions.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-bold fill-white pointer-events-none"
          >
            {table.name}
          </text>
        </g>
      );
    });
  };

  // Render areas
  const renderAreas = () => {
    return layout.areas.map((area) => {
      const isSelected = selectedElement === area.id;
      return (
        <g key={area.id}>
          <rect
            x={area.position.x}
            y={area.position.y}
            width={area.dimensions.width}
            height={area.dimensions.height}
            fill={area.color || "#9ca3af"}
            fillOpacity={0.4}
            stroke={isSelected ? "#3b82f6" : area.color || "#6b7280"}
            strokeWidth={isSelected ? 3 : 2}
            strokeDasharray={isSelected ? "5,5" : "none"}
            rx={4}
            data-element-id={area.id}
            className="cursor-move"
          />
          <text
            x={area.position.x + area.dimensions.width / 2}
            y={area.position.y + area.dimensions.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-semibold fill-foreground pointer-events-none"
          >
            {area.name.replace("'", "&apos;")}
          </text>
        </g>
      );
    });
  };

  const handleSave = async () => {
    await onSave(layout);
  };

  const handleGenerate = async () => {
    await onGenerateZones(layout);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("edit")}
          >
            <Edit className="h-4 w-4" />
            עריכה
          </Button>
          <Button
            variant={viewMode === "view" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("view")}
          >
            <Eye className="h-4 w-4" />
            תצוגה
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "edit" && (
            <>
              <Button
                variant={toolMode === "select" ? "default" : "outline"}
                size="sm"
                onClick={() => setToolMode("select")}
              >
                <Move className="h-4 w-4" />
                בחירה
              </Button>
              <Button
                variant={toolMode === "zone" ? "default" : "outline"}
                size="sm"
                onClick={() => setToolMode("zone")}
              >
                <Square className="h-4 w-4" />
                אזור
              </Button>
              <Button
                variant={toolMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setToolMode("table")}
              >
                <RectangleHorizontal className="h-4 w-4" />
                שולחן
              </Button>
              <Button
                variant={toolMode === "entrance" ? "default" : "outline"}
                size="sm"
                onClick={() => setToolMode("entrance")}
              >
                <DoorOpen className="h-4 w-4" />
                כניסה
              </Button>
              <Button
                variant={toolMode === "exit" ? "default" : "outline"}
                size="sm"
                onClick={() => setToolMode("exit")}
              >
                <DoorOpen className="h-4 w-4 rotate-180" />
                יציאה
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={toolMode === "area" ? "default" : "outline"} size="sm">
                    <Settings className="h-4 w-4" />
                    אזורים
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-3">
                    <Label>סוג אזור</Label>
                    <Select
                      value={selectedAreaType}
                      onValueChange={(v) => setSelectedAreaType(v as AreaType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kitchen">מטבח</SelectItem>
                        <SelectItem value="restroom">שירותים</SelectItem>
                        <SelectItem value="dj_booth">{`עמדת דיג'יי`}</SelectItem>
                        <SelectItem value="stage">במה</SelectItem>
                        <SelectItem value="storage">מחסן</SelectItem>
                        <SelectItem value="bar">בר</SelectItem>
                        <SelectItem value="dance_floor">רחבת ריקודים</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="outdoor">חוץ</SelectItem>
                        <SelectItem value="other">אחר</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={() => setToolMode("area")}>
                      הוסף אזור
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}

          <div className="flex items-center gap-2 border-r pr-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {viewMode === "edit" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                <Grid3x3 className={cn("h-4 w-4", showGrid && "text-primary")} />
              </Button>
              {selectedElement && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
                שמור
              </Button>
              <Button variant="default" size="sm" onClick={handleGenerate}>
                <Check className="h-4 w-4" />
                צור מבנה
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto rounded-lg border bg-muted/20">
        <svg
          ref={canvasRef}
          width={layout.layoutData.width * zoom}
          height={layout.layoutData.height * zoom}
          viewBox={`0 0 ${layout.layoutData.width} ${layout.layoutData.height}`}
          className="cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ backgroundColor: layout.layoutData.backgroundColor }}
        >
          {renderGrid()}
          {renderZones()}
          {renderTables()}
          {renderAreas()}
        </svg>
      </div>

      {/* Properties Panel */}
      {selectedElement && viewMode === "edit" && (
        <Card className="p-4">
          <PropertiesPanel
            element={getSelectedElement()}
            layout={layout}
            onUpdate={(updates) => {
              setLayout((prev) => ({
                ...prev,
                zones: prev.zones.map((z) => (z.id === selectedElement ? { ...z, ...updates } : z)),
                tables: prev.tables.map((t) =>
                  t.id === selectedElement ? { ...t, ...updates } : t
                ),
                areas: prev.areas.map((a) => (a.id === selectedElement ? { ...a, ...updates } : a))
              }));
            }}
          />
        </Card>
      )}
    </div>
  );

  function getSelectedElement() {
    if (!selectedElement) return null;
    return (
      layout.zones.find((z) => z.id === selectedElement) ||
      layout.tables.find((t) => t.id === selectedElement) ||
      layout.areas.find((a) => a.id === selectedElement) ||
      null
    );
  }
}

function PropertiesPanel({
  element,
  onUpdate
}: {
  element: ZoneVisual | TableVisual | VenueAreaVisual | null;
  layout: VenueLayout;
  onUpdate: (updates: Partial<ZoneVisual | TableVisual | VenueAreaVisual>) => void;
}) {
  if (!element) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">מאפיינים</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>שם</Label>
          <Input
            value={"name" in element ? element.name : ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>X</Label>
          <Input
            type="number"
            value={element.position.x}
            onChange={(e) =>
              onUpdate({ position: { ...element.position, x: Number(e.target.value) } })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Y</Label>
          <Input
            type="number"
            value={element.position.y}
            onChange={(e) =>
              onUpdate({ position: { ...element.position, y: Number(e.target.value) } })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>רוחב</Label>
          <Input
            type="number"
            value={element.dimensions.width}
            onChange={(e) =>
              onUpdate({ dimensions: { ...element.dimensions, width: Number(e.target.value) } })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>גובה</Label>
          <Input
            type="number"
            value={element.dimensions.height}
            onChange={(e) =>
              onUpdate({ dimensions: { ...element.dimensions, height: Number(e.target.value) } })
            }
          />
        </div>
        {"seats" in element && (
          <div className="space-y-2">
            <Label>מקומות ישיבה</Label>
            <Input
              type="number"
              value={element.seats || ""}
              onChange={(e) => onUpdate({ seats: Number(e.target.value) })}
            />
          </div>
        )}
        {"color" in element && element.color && (
          <div className="space-y-2">
            <Label>צבע</Label>
            <Input
              type="color"
              value={element.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getAreaTypeLabel(type: AreaType): string {
  const labels: Record<AreaType, string> = {
    entrance: "כניסה",
    exit: "יציאה",
    kitchen: "מטבח",
    restroom: "שירותים",
    dj_booth: "עמדת דיג׳יי",
    stage: "במה",
    storage: "מחסן",
    bar: "בר",
    counter: "דלפק",
    vip: "VIP",
    dance_floor: "רחבת ריקודים",
    outdoor: "חוץ",
    other: "אחר"
  };
  return labels[type] || type;
}

function getAreaIcon(type: AreaType): string {
  const icons: Record<AreaType, string> = {
    entrance: "door-open",
    exit: "door-open",
    kitchen: "utensils-crossed",
    restroom: "wifi",
    dj_booth: "music",
    stage: "music",
    storage: "box",
    bar: "glass-water",
    counter: "rectangle-horizontal",
    vip: "crown",
    dance_floor: "music",
    outdoor: "sun",
    other: "square"
  };
  return icons[type] || "square";
}

function getAreaColor(type: AreaType): string {
  const colors: Record<AreaType, string> = {
    entrance: "#10b981",
    exit: "#ef4444",
    kitchen: "#f59e0b",
    restroom: "#3b82f6",
    dj_booth: "#8b5cf6",
    stage: "#ec4899",
    storage: "#6b7280",
    bar: "#14b8a6",
    counter: "#6366f1",
    vip: "#fbbf24",
    dance_floor: "#a855f7",
    outdoor: "#22c55e",
    other: "#9ca3af"
  };
  return colors[type] || "#9ca3af";
}
