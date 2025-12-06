"use client";

/**
 * Professional Seating Layout Editor
 * World-class interactive floor plan editor with advanced features
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Group, Line } from "react-konva";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
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
  Check,
  Undo,
  Redo,
  MousePointer2,
  Maximize2,
  HelpCircle,
  Info,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useLayoutStore } from "../store/layoutStore";
import type {
  VenueLayout,
  ZoneVisual,
  TableVisual,
  VenueAreaVisual,
  AreaType,
  Position
} from "../types";

type SeatingLayoutEditorProps = {
  venueId: string;
  initialLayout?: VenueLayout;
  onSave: (layout: VenueLayout) => Promise<void>;
  onGenerateZones: (layout: VenueLayout) => Promise<void>;
};

const GRID_SIZE = 20;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

export function SeatingLayoutEditor({
  initialLayout,
  onSave,
  onGenerateZones
}: SeatingLayoutEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedAreaType, setSelectedAreaType] = useState<AreaType>("kitchen");

  const {
    layout,
    selectedElementId,
    toolMode,
    viewMode,
    zoom,
    showGrid,
    panOffset,
    isSaving: storeIsSaving,
    error,
    setLayout,
    updateLayout,
    selectElement,
    setToolMode,
    setViewMode,
    setZoom,
    toggleGrid,
    setPanOffset,
    setIsSaving: setStoreIsSaving,
    setError,
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useLayoutStore();

  // Initialize layout
  useEffect(() => {
    if (initialLayout) {
      setLayout(initialLayout);
    }
  }, [initialLayout, setLayout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === "view") return;

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) redo();
      }

      // Delete: Remove selected element
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        handleDelete();
      }

      // Escape: Deselect
      if (e.key === "Escape") {
        selectElement(null);
        setToolMode("select");
      }

      // V: Select tool
      if (e.key === "v" && !e.ctrlKey && !e.metaKey) {
        setToolMode("select");
      }

      // Z: Zone tool
      if (e.key === "z" && !e.ctrlKey && !e.metaKey) {
        setToolMode("zone");
      }

      // T: Table tool
      if (e.key === "t" && !e.ctrlKey && !e.metaKey) {
        setToolMode("table");
      }

      // G: Toggle grid
      if (e.key === "g" && !e.ctrlKey && !e.metaKey) {
        toggleGrid();
      }

      // +/-: Zoom
      if (e.key === "+" || e.key === "=") {
        setZoom(zoom + ZOOM_STEP);
      }
      if (e.key === "-") {
        setZoom(zoom - ZOOM_STEP);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    viewMode,
    selectedElementId,
    zoom,
    canUndo,
    canRedo,
    undo,
    redo,
    selectElement,
    setToolMode,
    toggleGrid,
    setZoom
  ]);

  // Snap to grid helper
  const snapToGrid = useCallback(
    (value: number): number => {
      if (!showGrid) return value;
      return Math.round(value / GRID_SIZE) * GRID_SIZE;
    },
    [showGrid]
  );

  // Create element at point
  const createElementAtPoint = useCallback(
    (point: Position) => {
      if (toolMode === "zone") {
        const newZone: ZoneVisual = {
          id: `zone-${Date.now()}`,
          name: `אזור ${layout.zones.length + 1}`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
          position: point,
          dimensions: { width: 200, height: 150 },
          rotation: 0,
          shape: "rectangle"
        };
        updateLayout((prev) => ({
          ...prev,
          zones: [...prev.zones, newZone]
        }));
        selectElement(newZone.id);
        pushToHistory();
        setToolMode("select");
      } else if (toolMode === "table") {
        const newTable: TableVisual = {
          id: `table-${Date.now()}`,
          name: `שולחן ${layout.tables.length + 1}`,
          seats: 4,
          position: point,
          dimensions: { width: 80, height: 80 },
          rotation: 0,
          shape: "rectangle",
          tableType: "table",
          zoneId: ""
        };
        updateLayout((prev) => ({
          ...prev,
          tables: [...prev.tables, newTable]
        }));
        selectElement(newTable.id);
        pushToHistory();
        setToolMode("select");
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
        updateLayout((prev) => ({
          ...prev,
          areas: [...prev.areas, newArea]
        }));
        selectElement(newArea.id);
        pushToHistory();
        setToolMode("select");
      } else if (toolMode === "area") {
        const newArea: VenueAreaVisual = {
          id: `area-${Date.now()}`,
          name: getAreaTypeLabel(selectedAreaType),
          areaType: selectedAreaType,
          position: point,
          dimensions: { width: 150, height: 150 },
          rotation: 0,
          shape: "rectangle",
          icon: getAreaIcon(selectedAreaType),
          color: getAreaColor(selectedAreaType)
        };
        updateLayout((prev) => ({
          ...prev,
          areas: [...prev.areas, newArea]
        }));
        selectElement(newArea.id);
        pushToHistory();
        setToolMode("select");
      }
    },
    [toolMode, layout, selectedAreaType, updateLayout, selectElement, pushToHistory, setToolMode]
  );

  // Get mouse position relative to stage
  const getStagePoint = useCallback(
    (e: { target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }): Position => {
      const stage = e.target.getStage();
      if (!stage) return { x: 0, y: 0 };
      const point = stage.getPointerPosition();
      if (!point) return { x: 0, y: 0 };
      return {
        x: snapToGrid((point.x - panOffset.x) / zoom),
        y: snapToGrid((point.y - panOffset.y) / zoom)
      };
    },
    [zoom, panOffset, snapToGrid]
  );

  // Handle stage click
  const handleStageClick = useCallback(
    (e: { target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }) => {
      if (viewMode === "view" || isPanning) return;

      // Check if clicked on stage (not on an element) - in Konva, if target is stage, getStage() returns the stage itself
      const stage = e.target.getStage();
      const clickedOnEmpty = stage && (e.target as unknown) === stage;
      if (clickedOnEmpty) {
        selectElement(null);

        // Create new element based on tool mode
        const point = getStagePoint(e);
        createElementAtPoint(point);
      }
    },
    [viewMode, isPanning, getStagePoint, selectElement, createElementAtPoint]
  );

  // Handle element drag
  const handleElementDrag = useCallback(
    (elementId: string, newPosition: Position) => {
      updateLayout((prev) => ({
        ...prev,
        zones: prev.zones.map((z) =>
          z.id === elementId ? { ...z, position: newPosition } : z
        ),
        tables: prev.tables.map((t) =>
          t.id === elementId ? { ...t, position: newPosition } : t
        ),
        areas: prev.areas.map((a) =>
          a.id === elementId ? { ...a, position: newPosition } : a
        )
      }));
    },
    [updateLayout]
  );

  // Handle element drag end
  const handleElementDragEnd = useCallback(() => {
    pushToHistory();
  }, [pushToHistory]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!selectedElementId) return;
    updateLayout((prev) => ({
      ...prev,
      zones: prev.zones.filter((z) => z.id !== selectedElementId),
      tables: prev.tables.filter((t) => t.id !== selectedElementId),
      areas: prev.areas.filter((a) => a.id !== selectedElementId)
    }));
    selectElement(null);
    pushToHistory();
  }, [selectedElementId, updateLayout, selectElement, pushToHistory]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setStoreIsSaving(true);

    try {
      await onSave(layout);
      pushToHistory();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "שגיאה בשמירה";
      setSaveError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
      setStoreIsSaving(false);
    }
  };

  // Handle generate
  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveError(null);

    try {
      await onGenerateZones(layout);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "שגיאה ביצירת המבנה";
      setSaveError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle pan start
  const handlePanStart = useCallback((e: { evt: { button: number; ctrlKey: boolean }; target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }) => {
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.ctrlKey)) {
      setIsPanning(true);
      const stage = e.target.getStage();
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (!point) return;
      setPanStart({ x: point.x - panOffset.x, y: point.y - panOffset.y });
    }
  }, [panOffset]);

  // Handle pan move
  const handlePanMove = useCallback(
    (e: { target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }) => {
      if (isPanning && panStart) {
        const stage = e.target.getStage();
        if (!stage) return;
        const point = stage.getPointerPosition();
        if (!point) return;
        setPanOffset({
          x: point.x - panStart.x,
          y: point.y - panStart.y
        });
      }
    },
    [isPanning, panStart, setPanOffset]
  );

  // Handle pan end
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  // Render grid
  const renderGrid = () => {
    if (!showGrid || viewMode === "view" || !layout?.layoutData) return null;
    const { width, height } = layout.layoutData;
    const lines = [];

    for (let x = 0; x <= width; x += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.3}
          listening={false}
        />
      );
    }

    for (let y = 0; y <= height; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.3}
          listening={false}
        />
      );
    }

    return <Group>{lines}</Group>;
  };

  // Render zones
  const renderZones = () => {
    return layout.zones.map((zone) => {
      const isSelected = selectedElementId === zone.id;
      const baseProps = {
        x: zone.position.x,
        y: zone.position.y,
        width: zone.dimensions.width,
        height: zone.dimensions.height,
        fill: zone.color,
        opacity: 0.2,
        stroke: isSelected ? "#3b82f6" : zone.color,
        strokeWidth: isSelected ? 3 : 2,
        dash: isSelected ? [5, 5] : undefined,
        draggable: viewMode === "edit",
        onDragEnd: (e: { target: { x: () => number; y: () => number } }) => {
          const newPos = {
            x: snapToGrid(e.target.x()),
            y: snapToGrid(e.target.y())
          };
          handleElementDrag(zone.id, newPos);
          handleElementDragEnd();
        },
        onClick: () => selectElement(zone.id),
        onTap: () => selectElement(zone.id)
      };

      if (zone.shape === "circle") {
        const radius = Math.min(zone.dimensions.width, zone.dimensions.height) / 2;
        return (
          <Circle
            key={zone.id}
            {...baseProps}
            radius={radius}
            x={zone.position.x + zone.dimensions.width / 2}
            y={zone.position.y + zone.dimensions.height / 2}
          />
        );
      }

      return (
        <Group key={zone.id}>
          <Rect {...baseProps} cornerRadius={zone.shape === "square" ? 0 : 4} />
          <Text
            x={zone.position.x + 10}
            y={zone.position.y + 10}
            text={zone.name}
            fontSize={14}
            fontFamily="Arial"
            fill={zone.color}
            fontWeight="bold"
            listening={false}
          />
        </Group>
      );
    });
  };

  // Render tables
  const renderTables = () => {
    return layout.tables.map((table) => {
      const isSelected = selectedElementId === table.id;
      const zone = layout.zones.find((z) => z.id === table.zoneId);
      const color = zone?.color || "#6b7280";

      const baseProps = {
        x: table.position.x,
        y: table.position.y,
        width: table.dimensions.width,
        height: table.dimensions.height,
        fill: color,
        opacity: 0.7,
        stroke: isSelected ? "#3b82f6" : color,
        strokeWidth: isSelected ? 3 : 2,
        draggable: viewMode === "edit",
        onDragEnd: (e: { target: { x: () => number; y: () => number } }) => {
          const newPos = {
            x: snapToGrid(e.target.x()),
            y: snapToGrid(e.target.y())
          };
          handleElementDrag(table.id, newPos);
          handleElementDragEnd();
        },
        onClick: () => selectElement(table.id),
        onTap: () => selectElement(table.id)
      };

      if (table.shape === "circle") {
        const radius = Math.min(table.dimensions.width, table.dimensions.height) / 2;
        return (
          <Group key={table.id}>
            <Circle
              {...baseProps}
              radius={radius}
              x={table.position.x + table.dimensions.width / 2}
              y={table.position.y + table.dimensions.height / 2}
            />
            <Text
              x={table.position.x + table.dimensions.width / 2}
              y={table.position.y + table.dimensions.height / 2}
              text={table.name}
              fontSize={12}
              fontFamily="Arial"
              fill="white"
              fontWeight="bold"
              align="center"
              verticalAlign="middle"
              listening={false}
              offsetX={table.name.length * 3}
              offsetY={6}
            />
          </Group>
        );
      }

      return (
        <Group key={table.id}>
          <Rect {...baseProps} cornerRadius={table.shape === "square" ? 0 : 4} />
          <Text
            x={table.position.x + table.dimensions.width / 2}
            y={table.position.y + table.dimensions.height / 2}
            text={table.name}
            fontSize={12}
            fontFamily="Arial"
            fill="white"
            fontWeight="bold"
            align="center"
            verticalAlign="middle"
            listening={false}
            offsetX={table.name.length * 3}
            offsetY={6}
          />
        </Group>
      );
    });
  };

  // Render areas
  const renderAreas = () => {
    return layout.areas.map((area) => {
      const isSelected = selectedElementId === area.id;
      return (
        <Group key={area.id}>
          <Rect
            x={area.position.x}
            y={area.position.y}
            width={area.dimensions.width}
            height={area.dimensions.height}
            fill={area.color || "#9ca3af"}
            opacity={0.4}
            stroke={isSelected ? "#3b82f6" : area.color || "#6b7280"}
            strokeWidth={isSelected ? 3 : 2}
            dash={isSelected ? [5, 5] : undefined}
            cornerRadius={4}
            draggable={viewMode === "edit"}
            onDragEnd={(e: { target: { x: () => number; y: () => number } }) => {
              const newPos = {
                x: snapToGrid(e.target.x()),
                y: snapToGrid(e.target.y())
              };
              handleElementDrag(area.id, newPos);
              handleElementDragEnd();
            }}
            onClick={() => selectElement(area.id)}
            onTap={() => selectElement(area.id)}
          />
          <Text
            x={area.position.x + area.dimensions.width / 2}
            y={area.position.y + area.dimensions.height / 2}
            text={area.name}
            fontSize={12}
            fontFamily="Arial"
            fill="currentColor"
            fontWeight="semibold"
            align="center"
            verticalAlign="middle"
            listening={false}
            offsetX={area.name.length * 3}
            offsetY={6}
          />
        </Group>
      );
    });
  };

  const canvasWidth = layout?.layoutData?.width || 1600;
  const canvasHeight = layout?.layoutData?.height || 1200;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-200px)] flex-col gap-4">
        {/* Professional Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-lg border-2 border-border/50 bg-gradient-to-br from-card via-card to-muted/20 p-4 shadow-lg backdrop-blur-sm"
        >
          {/* Left: Mode Toggle */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "edit" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("edit")}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    עריכה
                  </Button>
                </TooltipTrigger>
                <TooltipContent>מצב עריכה (E)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "view" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("view")}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    תצוגה
                  </Button>
                </TooltipTrigger>
                <TooltipContent>מצב תצוגה בלבד</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6" />

            {/* Undo/Redo */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo()}
                    className="gap-2"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ביטול (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo()}
                    className="gap-2"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>חזרה (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Center: Tools */}
          {viewMode === "edit" && (
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolMode === "select" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setToolMode("select")}
                      className="gap-2"
                    >
                      <MousePointer2 className="h-4 w-4" />
                      בחירה
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>כלי בחירה (V)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolMode === "zone" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setToolMode("zone")}
                      className="gap-2"
                    >
                      <Square className="h-4 w-4" />
                      אזור
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>הוסף אזור (Z)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setToolMode("table")}
                      className="gap-2"
                    >
                      <RectangleHorizontal className="h-4 w-4" />
                      שולחן
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>הוסף שולחן (T)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolMode === "entrance" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setToolMode("entrance")}
                      className="gap-2"
                    >
                      <DoorOpen className="h-4 w-4" />
                      כניסה
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>הוסף כניסה</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolMode === "exit" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setToolMode("exit")}
                      className="gap-2"
                    >
                      <DoorOpen className="h-4 w-4 rotate-180" />
                      יציאה
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>הוסף יציאה</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={toolMode === "area" ? "default" : "outline"} size="sm" className="gap-2">
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
                        <SelectItem value="dj_booth">עמדת דיג׳יי</SelectItem>
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
            </div>
          )}

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 rounded-lg border bg-background/50 p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
                      disabled={zoom <= MIN_ZOOM}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>הקטן (-)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="secondary" className="min-w-[60px] justify-center font-mono">
                {Math.round(zoom * 100)}%
              </Badge>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
                      disabled={zoom >= MAX_ZOOM}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>הגדל (+)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>איפוס זום (100%)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Grid Toggle */}
            {viewMode === "edit" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showGrid ? "default" : "outline"}
                      size="sm"
                      onClick={toggleGrid}
                      className="gap-2"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>הצג/הסתר רשת (G)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Delete */}
            {viewMode === "edit" && selectedElementId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>מחק (Delete)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Help */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHelp(!showHelp)}
                    className="gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>עזרה וקיצורי מקשים</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Save */}
            {viewMode === "edit" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving || storeIsSaving}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isSaving || storeIsSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      שמור
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>שמור שינויים (Ctrl+S)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Generate */}
            {viewMode === "edit" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      צור מבנה
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>צור אזורים ושולחנות מה-Layout</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {(saveError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-3"
            >
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{saveError || error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSaveError(null);
                    setError(null);
                  }}
                  className="mr-auto h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Panel */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-lg border bg-muted/50 p-4"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">קיצורי מקשים</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">V</kbd> - בחירה</li>
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">Z</kbd> - אזור</li>
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">T</kbd> - שולחן</li>
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">G</kbd> - רשת</li>
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">Delete</kbd> - מחק</li>
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">Esc</kbd> - בטל בחירה</li>
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">Ctrl+Z</kbd> - ביטול</li>
                    <li><kbd className="px-1.5 py-0.5 bg-background border rounded">Ctrl+Shift+Z</kbd> - חזרה</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">פעולות</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>גרור אלמנטים כדי להזיז אותם</li>
                    <li>לחץ על קנבס ריק כדי להוסיף אלמנט</li>
                    <li>לחץ על אלמנט כדי לבחור אותו</li>
                    <li>Ctrl + גרירה = הזזת קנבס</li>
                    <li>גלגל עכבר = זום</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden rounded-lg border-2 border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 shadow-xl"
        >
          <Stage
            ref={stageRef}
            width={containerRef.current?.clientWidth || canvasWidth}
            height={containerRef.current?.clientHeight || canvasHeight}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onWheel={(e: { evt: { preventDefault: () => void; deltaY: number }; target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }) => {
              e.evt.preventDefault();
              const scaleBy = 1.1;
              const stage = e.target.getStage();
              if (!stage) return;
              
              const oldScale = zoom;
              const pointer = stage.getPointerPosition();

              if (!pointer) return;

              const mousePointTo = {
                x: (pointer.x - panOffset.x) / oldScale,
                y: (pointer.y - panOffset.y) / oldScale
              };

              const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
              const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

              setZoom(clampedScale);
              setPanOffset({
                x: pointer.x - mousePointTo.x * clampedScale,
                y: pointer.y - mousePointTo.y * clampedScale
              });
            }}
            onClick={handleStageClick}
            style={{ cursor: isPanning ? "grabbing" : toolMode === "select" ? "default" : "crosshair" }}
          >
            <Layer
              x={panOffset.x}
              y={panOffset.y}
              scaleX={zoom}
              scaleY={zoom}
            >
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={layout?.layoutData?.backgroundColor || "#f8f9fa"}
                listening={false}
              />

              {/* Grid */}
              {renderGrid()}

              {/* Zones */}
              {renderZones()}

              {/* Tables */}
              {renderTables()}

              {/* Areas */}
              {renderAreas()}
            </Layer>
          </Stage>

          {/* Canvas Info Overlay */}
          <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {layout.zones.length} אזורים
              </Badge>
              <Badge variant="outline">
                {layout.tables.length} שולחנות
              </Badge>
              <Badge variant="outline">
                {layout.areas.length} אזורים מיוחדים
              </Badge>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <AnimatePresence>
          {selectedElementId && viewMode === "edit" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      מאפיינים
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectElement(null)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PropertiesPanel
                    element={getSelectedElement()}
                    onUpdate={(updates) => {
                      updateLayout((prev) => ({
                        ...prev,
                        zones: prev.zones.map((z) =>
                          z.id === selectedElementId ? { ...z, ...updates } : z
                        ),
                        tables: prev.tables.map((t) =>
                          t.id === selectedElementId ? { ...t, ...updates } : t
                        ),
                        areas: prev.areas.map((a) =>
                          a.id === selectedElementId ? { ...a, ...updates } : a
                        )
                      }));
                      pushToHistory();
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );

  function getSelectedElement() {
    if (!selectedElementId) return null;
    return (
      layout.zones.find((z) => z.id === selectedElementId) ||
      layout.tables.find((t) => t.id === selectedElementId) ||
      layout.areas.find((a) => a.id === selectedElementId) ||
      null
    );
  }
}

function PropertiesPanel({
  element,
  onUpdate
}: {
  element: ZoneVisual | TableVisual | VenueAreaVisual | null;
  onUpdate: (updates: Partial<ZoneVisual | TableVisual | VenueAreaVisual>) => void;
}) {
  if (!element) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="element-name">שם</Label>
          <Input
            id="element-name"
            value={"name" in element ? element.name : ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="הכנס שם..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="element-x">מיקום X</Label>
          <Input
            id="element-x"
            type="number"
            value={element.position.x}
            onChange={(e) =>
              onUpdate({ position: { ...element.position, x: Number(e.target.value) } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="element-y">מיקום Y</Label>
          <Input
            id="element-y"
            type="number"
            value={element.position.y}
            onChange={(e) =>
              onUpdate({ position: { ...element.position, y: Number(e.target.value) } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="element-width">רוחב</Label>
          <Input
            id="element-width"
            type="number"
            min="10"
            value={element.dimensions.width}
            onChange={(e) =>
              onUpdate({ dimensions: { ...element.dimensions, width: Number(e.target.value) } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="element-height">גובה</Label>
          <Input
            id="element-height"
            type="number"
            min="10"
            value={element.dimensions.height}
            onChange={(e) =>
              onUpdate({ dimensions: { ...element.dimensions, height: Number(e.target.value) } })
            }
          />
        </div>

        {"seats" in element && (
          <div className="space-y-2">
            <Label htmlFor="element-seats">מקומות ישיבה</Label>
            <Input
              id="element-seats"
              type="number"
              min="0"
              value={element.seats || ""}
              onChange={(e) => onUpdate({ seats: Number(e.target.value) || undefined })}
            />
          </div>
        )}

        {"color" in element && element.color && (
          <div className="space-y-2">
            <Label htmlFor="element-color">צבע</Label>
            <div className="flex gap-2">
              <Input
                id="element-color"
                type="color"
                value={element.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={element.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                placeholder="#000000"
                className="flex-1 font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions - exported for use in component
export function getAreaTypeLabel(type: AreaType): string {
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

export function getAreaIcon(type: AreaType): string {
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

export function getAreaColor(type: AreaType): string {
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
