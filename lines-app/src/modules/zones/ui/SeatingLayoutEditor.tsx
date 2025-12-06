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
import { DEFAULT_LAYOUT_DATA } from "../utils/layoutUtils";
import { ElementConfigDialog } from "./ElementConfigDialog";
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
  
  // New state for improved flow
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Position | null>(null);
  const [drawEnd, setDrawEnd] = useState<Position | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [pendingElement, setPendingElement] = useState<{
    element: ZoneVisual | TableVisual | VenueAreaVisual;
    type: "zone" | "table" | "area";
  } | null>(null);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(true);

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

  // Initialize layout - always ensure valid layoutData exists
  useEffect(() => {
    if (initialLayout) {
      // Normalize ensures layoutData always exists
      setLayout(initialLayout);
    } else {
      // Reset to default if no initial layout
      setLayout(null);
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
    setZoom,
    updateLayout,
    pushToHistory
  ]);

  // Snap to grid helper
  const snapToGrid = useCallback(
    (value: number): number => {
      if (!showGrid) return value;
      return Math.round(value / GRID_SIZE) * GRID_SIZE;
    },
    [showGrid]
  );

  // Create element by drawing (drag to draw)
  const createElementByDrawing = useCallback(
    (start: Position, end: Position) => {
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      const minSize = 20;
      
      if (width < minSize || height < minSize) return;
      
      const position = {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y)
      };
      
      // Collapse canvas when drawing
      setIsCanvasExpanded(false);
      
      if (toolMode === "zone") {
        const newZone: ZoneVisual = {
          id: `zone-${Date.now()}`,
          name: `אזור ${layout.zones.length + 1}`,
          color: "#3b82f6",
          position,
          dimensions: { width, height },
          rotation: 0,
          shape: "rectangle"
        };
        setPendingElement({ element: newZone, type: "zone" });
        setConfigDialogOpen(true);
      } else if (toolMode === "table") {
        const newTable: TableVisual = {
          id: `table-${Date.now()}`,
          name: `שולחן ${layout.tables.length + 1}`,
          seats: 4,
          position,
          dimensions: { width, height },
          rotation: 0,
          shape: "rectangle",
          tableType: "table",
          zoneId: ""
        };
        setPendingElement({ element: newTable, type: "table" });
        setConfigDialogOpen(true);
      } else if (toolMode === "entrance" || toolMode === "exit") {
        const newArea: VenueAreaVisual = {
          id: `area-${Date.now()}`,
          name: toolMode === "entrance" ? "כניסה" : "יציאה",
          areaType: toolMode === "entrance" ? "entrance" : "exit",
          position,
          dimensions: { width, height },
          rotation: 0,
          shape: "rectangle",
          icon: "door-open",
          color: toolMode === "entrance" ? "#10b981" : "#ef4444"
        };
        setPendingElement({ element: newArea, type: "area" });
        setConfigDialogOpen(true);
      } else if (toolMode === "area") {
        const newArea: VenueAreaVisual = {
          id: `area-${Date.now()}`,
          name: getAreaTypeLabel(selectedAreaType),
          areaType: selectedAreaType,
          position,
          dimensions: { width, height },
          rotation: 0,
          shape: "rectangle",
          icon: getAreaIcon(selectedAreaType),
          color: getAreaColor(selectedAreaType)
        };
        setPendingElement({ element: newArea, type: "area" });
        setConfigDialogOpen(true);
      }
    },
    [toolMode, layout, selectedAreaType]
  );
  
  // Handle config dialog save
  const handleConfigSave = useCallback(
    (config: Partial<ZoneVisual | TableVisual | VenueAreaVisual>) => {
      if (!pendingElement) return;
      
      const updatedElement = { ...pendingElement.element, ...config };
      
      if (pendingElement.type === "zone") {
        updateLayout((prev) => ({
          ...prev,
          zones: [...prev.zones, updatedElement as ZoneVisual]
        }));
        selectElement(updatedElement.id);
      } else if (pendingElement.type === "table") {
        updateLayout((prev) => ({
          ...prev,
          tables: [...prev.tables, updatedElement as TableVisual]
        }));
        selectElement(updatedElement.id);
      } else if (pendingElement.type === "area") {
        updateLayout((prev) => ({
          ...prev,
          areas: [...prev.areas, updatedElement as VenueAreaVisual]
        }));
        selectElement(updatedElement.id);
      }
      
      pushToHistory();
      setToolMode("select");
      setPendingElement(null);
      setConfigDialogOpen(false);
      setIsCanvasExpanded(true);
    },
    [pendingElement, updateLayout, selectElement, pushToHistory, setToolMode]
  );


  // Handle drawing start
  const handleDrawingStart = useCallback(
    (e: { evt: { button: number }; target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }) => {
      if (viewMode === "view" || isPanning || toolMode === "select") return;
      if (e.evt.button !== 0) return; // Only left mouse button
      
      const stage = e.target.getStage();
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (!point) return;
      
      const canvasPoint = {
        x: snapToGrid((point.x - panOffset.x) / zoom),
        y: snapToGrid((point.y - panOffset.y) / zoom)
      };
      
      setIsDrawing(true);
      setDrawStart(canvasPoint);
      setDrawEnd(canvasPoint);
    },
    [viewMode, isPanning, toolMode, zoom, panOffset, snapToGrid]
  );
  
  // Handle drawing move
  const handleDrawingMove = useCallback(
    (e: { target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }) => {
      if (!isDrawing || !drawStart) return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (!point) return;
      
      const canvasPoint = {
        x: snapToGrid((point.x - panOffset.x) / zoom),
        y: snapToGrid((point.y - panOffset.y) / zoom)
      };
      
      setDrawEnd(canvasPoint);
    },
    [isDrawing, drawStart, zoom, panOffset, snapToGrid]
  );
  
  // Handle drawing end
  const handleDrawingEnd = useCallback(() => {
      if (!isDrawing || !drawStart || !drawEnd) return;
      
      createElementByDrawing(drawStart, drawEnd);
      
      setIsDrawing(false);
      setDrawStart(null);
      setDrawEnd(null);
    },
    [isDrawing, drawStart, drawEnd, createElementByDrawing]
  );
  
  // Handle stage click (for selection only)
  const handleStageClick = useCallback(
    (e: { target: { getStage: () => { getPointerPosition: () => { x: number; y: number } | null } | null } }) => {
      if (viewMode === "view" || isPanning || isDrawing) return;

      const stage = e.target.getStage();
      const clickedOnEmpty = stage && (e.target as unknown) === stage;
      if (clickedOnEmpty) {
        selectElement(null);
      }
    },
    [viewMode, isPanning, isDrawing, selectElement]
  );

  // Check if point is inside zone
  const isPointInZone = useCallback(
    (point: Position, zone: ZoneVisual): boolean => {
      const { position, dimensions } = zone;
      return (
        point.x >= position.x &&
        point.x <= position.x + dimensions.width &&
        point.y >= position.y &&
        point.y <= position.y + dimensions.height
      );
    },
    []
  );

  // Calculate zone bounds from tables
  const calculateZoneBounds = useCallback(
    (zoneId: string, tables: TableVisual[]): { minX: number; minY: number; maxX: number; maxY: number } | null => {
      const zoneTables = tables.filter((t) => t.zoneId === zoneId);
      if (zoneTables.length === 0) return null;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      zoneTables.forEach((table) => {
        minX = Math.min(minX, table.position.x);
        minY = Math.min(minY, table.position.y);
        maxX = Math.max(maxX, table.position.x + table.dimensions.width);
        maxY = Math.max(maxY, table.position.y + table.dimensions.height);
      });

      // Add padding
      const padding = 20;
      return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding
      };
    },
    []
  );

  // Handle element drag
  const handleElementDrag = useCallback(
    (elementId: string, newPosition: Position) => {
      updateLayout((prev) => {
        // Check if it's a table being dragged
        const table = prev.tables.find((t) => t.id === elementId);
        if (table) {
          // Check if table is inside any zone
          let newZoneId = table.zoneId || "";
          for (const zone of prev.zones) {
            const tableCenter = {
              x: newPosition.x + table.dimensions.width / 2,
              y: newPosition.y + table.dimensions.height / 2
            };
            if (isPointInZone(tableCenter, zone)) {
              newZoneId = zone.id;
              break;
            }
          }

          // If table left all zones, remove zoneId
          let foundZone = false;
          for (const zone of prev.zones) {
            const tableCenter = {
              x: newPosition.x + table.dimensions.width / 2,
              y: newPosition.y + table.dimensions.height / 2
            };
            if (isPointInZone(tableCenter, zone)) {
              foundZone = true;
              break;
            }
          }
          if (!foundZone) {
            newZoneId = "";
          }

          return {
            ...prev,
            tables: prev.tables.map((t) =>
              t.id === elementId ? { ...t, position: newPosition, zoneId: newZoneId } : t
            )
          };
        }

        // For zones and areas, just update position
        return {
          ...prev,
          zones: prev.zones.map((z) =>
            z.id === elementId ? { ...z, position: newPosition } : z
          ),
          areas: prev.areas.map((a) =>
            a.id === elementId ? { ...a, position: newPosition } : a
          )
        };
      });
    },
    [updateLayout, isPointInZone]
  );

  // Handle element drag end - auto-resize zones
  const handleElementDragEnd = useCallback(() => {
    updateLayout((prev) => {
      // Auto-resize zones to fit their tables
      const updatedZones = prev.zones.map((zone) => {
        const bounds = calculateZoneBounds(zone.id, prev.tables);
        if (!bounds) return zone;

        return {
          ...zone,
          position: {
            x: bounds.minX,
            y: bounds.minY
          },
          dimensions: {
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY
          }
        };
      });

      return {
        ...prev,
        zones: updatedZones
      };
    });
    pushToHistory();
  }, [updateLayout, calculateZoneBounds, pushToHistory]);

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
    setZoom,
    updateLayout,
    pushToHistory,
    handleDelete
  ]);

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
    if (!showGrid || viewMode === "view") return null;
    // layoutData is guaranteed to exist after normalization
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

  // Render zones with enhanced visuals
  const renderZones = () => {
    return layout.zones.map((zone) => {
      const isSelected = selectedElementId === zone.id;
      const zoneTables = layout.tables.filter((t) => t.zoneId === zone.id);
      const hasTables = zoneTables.length > 0;
      
      // Enhanced visual properties
      const fillPattern = zone.color;
      const strokeColor = isSelected ? "#3b82f6" : zone.color;
      const strokeWidth = isSelected ? 4 : 2;
      const shadowBlur = isSelected ? 10 : 5;
      const shadowOpacity = isSelected ? 0.4 : 0.2;
      
      const baseProps = {
        x: zone.position.x,
        y: zone.position.y,
        width: zone.dimensions.width,
        height: zone.dimensions.height,
        fill: fillPattern,
        opacity: hasTables ? 0.15 : 0.2,
        stroke: strokeColor,
        strokeWidth,
        dash: isSelected ? [8, 4] : undefined,
        shadowBlur,
        shadowColor: strokeColor,
        shadowOpacity,
        shadowOffset: { x: 2, y: 2 },
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
          <Group key={zone.id}>
            <Circle
              {...baseProps}
              radius={radius}
              x={zone.position.x + zone.dimensions.width / 2}
              y={zone.position.y + zone.dimensions.height / 2}
            />
            <Text
              x={zone.position.x + zone.dimensions.width / 2}
              y={zone.position.y + zone.dimensions.height / 2}
              text={zone.name}
              fontSize={14}
              fontFamily="Arial"
              fill={zone.color}
              fontWeight="bold"
              align="center"
              verticalAlign="middle"
              listening={false}
              offsetY={6}
              shadowBlur={2}
              shadowColor="rgba(0,0,0,0.3)"
            />
            {hasTables && (
              <Text
                x={zone.position.x + zone.dimensions.width / 2}
                y={zone.position.y + zone.dimensions.height / 2 + 20}
                text={`${zoneTables.length} שולחנות`}
                fontSize={11}
                fontFamily="Arial"
                fill={zone.color}
                opacity={0.7}
                align="center"
                verticalAlign="middle"
                listening={false}
                offsetY={6}
              />
            )}
          </Group>
        );
      }

      return (
        <Group key={zone.id}>
          <Rect {...baseProps} cornerRadius={zone.shape === "square" ? 0 : 8} />
          {/* Gradient overlay effect - using opacity gradient */}
          <Rect
            x={zone.position.x}
            y={zone.position.y}
            width={zone.dimensions.width}
            height={zone.dimensions.height}
            fill={zone.color}
            cornerRadius={zone.shape === "square" ? 0 : 8}
            listening={false}
            opacity={0.08}
          />
          <Text
            x={zone.position.x + 12}
            y={zone.position.y + 12}
            text={zone.name}
            fontSize={15}
            fontFamily="Arial"
            fill={zone.color}
            fontWeight="bold"
            listening={false}
            shadowBlur={3}
            shadowColor="rgba(0,0,0,0.3)"
          />
          {hasTables && (
            <Text
              x={zone.position.x + 12}
              y={zone.position.y + 30}
              text={`${zoneTables.length} שולחנות`}
              fontSize={11}
              fontFamily="Arial"
              fill={zone.color}
              opacity={0.8}
              listening={false}
            />
          )}
        </Group>
      );
    });
  };

  // Render tables with enhanced visuals and zone detection
  const renderTables = () => {
    return layout.tables.map((table) => {
      const isSelected = selectedElementId === table.id;
      const zone = layout.zones.find((z) => z.id === table.zoneId);
      const color = zone?.color || "#6b7280";
      const isInZone = !!zone;

      // Enhanced visual properties
      const fillColor = isInZone ? color : "#6b7280";
      const strokeColor = isSelected ? "#3b82f6" : isInZone ? color : "#9ca3af";
      const strokeWidth = isSelected ? 4 : isInZone ? 2.5 : 2;
      const shadowBlur = isSelected ? 8 : isInZone ? 5 : 3;
      const shadowOpacity = isSelected ? 0.4 : isInZone ? 0.3 : 0.2;

      const baseProps = {
        x: table.position.x,
        y: table.position.y,
        width: table.dimensions.width,
        height: table.dimensions.height,
        fill: fillColor,
        opacity: isInZone ? 0.75 : 0.6,
        stroke: strokeColor,
        strokeWidth,
        shadowBlur,
        shadowColor: strokeColor,
        shadowOpacity,
        shadowOffset: { x: 1, y: 1 },
        draggable: viewMode === "edit",
        onDragMove: (e: { target: { x: () => number; y: () => number } }) => {
          const newPos = {
            x: snapToGrid(e.target.x()),
            y: snapToGrid(e.target.y())
          };
          handleElementDrag(table.id, newPos);
        },
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

  // Render areas with enhanced visuals
  const renderAreas = () => {
    return layout.areas.map((area) => {
      const isSelected = selectedElementId === area.id;
      const areaColor = area.color || "#9ca3af";
      
      // Enhanced visual properties
      const strokeColor = isSelected ? "#3b82f6" : areaColor;
      const strokeWidth = isSelected ? 4 : 2.5;
      const shadowBlur = isSelected ? 10 : 6;
      const shadowOpacity = isSelected ? 0.4 : 0.3;

      return (
        <Group key={area.id}>
          <Rect
            x={area.position.x}
            y={area.position.y}
            width={area.dimensions.width}
            height={area.dimensions.height}
            fill={areaColor}
            opacity={0.35}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            dash={isSelected ? [8, 4] : [4, 4]}
            cornerRadius={6}
            shadowBlur={shadowBlur}
            shadowColor={strokeColor}
            shadowOpacity={shadowOpacity}
            shadowOffset={{ x: 2, y: 2 }}
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
          {/* Gradient overlay - using opacity gradient */}
          <Rect
            x={area.position.x}
            y={area.position.y}
            width={area.dimensions.width}
            height={area.dimensions.height}
            fill={areaColor}
            cornerRadius={6}
            listening={false}
            opacity={0.15}
          />
          <Text
            x={area.position.x + area.dimensions.width / 2}
            y={area.position.y + area.dimensions.height / 2}
            text={area.name}
            fontSize={13}
            fontFamily="Arial"
            fill="white"
            fontWeight="bold"
            align="center"
            verticalAlign="middle"
            listening={false}
            offsetY={6}
            shadowBlur={3}
            shadowColor="rgba(0,0,0,0.5)"
          />
        </Group>
      );
    });
  };

  // Always use layoutData from store (guaranteed to exist after normalization)
  const canvasWidth = layout.layoutData.width;
  const canvasHeight = layout.layoutData.height;

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div
        className="flex flex-col gap-4"
        animate={{
          height: isCanvasExpanded ? "calc(100vh - 200px)" : "calc(100vh - 400px)"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
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

          {/* Center: Element Type Dropdown */}
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

              <Select
                value={toolMode === "select" ? "select" : toolMode}
                onValueChange={(v) => {
                  if (v === "select") {
                    setToolMode("select");
                  } else if (v === "zone") {
                    setToolMode("zone");
                  } else if (v === "table") {
                    setToolMode("table");
                  } else if (v === "entrance") {
                    setToolMode("entrance");
                  } else if (v === "exit") {
                    setToolMode("exit");
                  } else if (v === "area") {
                    setToolMode("area");
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="בחר סוג אלמנט" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zone">
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      <span>אזור</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="table">
                    <div className="flex items-center gap-2">
                      <RectangleHorizontal className="h-4 w-4" />
                      <span>שולחן</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="entrance">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4" />
                      <span>כניסה</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="exit">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 rotate-180" />
                      <span>יציאה</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>אזור מיוחד</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {toolMode === "area" && (
                <Select
                  value={selectedAreaType}
                  onValueChange={(v) => setSelectedAreaType(v as AreaType)}
                >
                  <SelectTrigger className="w-[150px]">
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
              )}
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

        {/* Canvas Container - Takes almost full page */}
        <motion.div
          ref={containerRef}
          className="relative flex-1 overflow-hidden rounded-lg border-2 border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 shadow-xl"
          animate={{
            minHeight: isCanvasExpanded ? "calc(100vh - 300px)" : "400px"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Stage
            ref={stageRef}
            width={containerRef.current?.clientWidth || canvasWidth}
            height={containerRef.current?.clientHeight || canvasHeight}
            onMouseDown={(e) => {
              if (e.evt.ctrlKey || e.evt.metaKey) {
                handlePanStart(e);
              } else if (toolMode !== "select") {
                handleDrawingStart(e);
              }
            }}
            onMouseMove={(e) => {
              if (isPanning) {
                handlePanMove(e);
              } else if (isDrawing) {
                handleDrawingMove(e);
              }
            }}
            onMouseUp={() => {
              if (isPanning) {
                handlePanEnd();
              } else if (isDrawing) {
                handleDrawingEnd();
              }
            }}
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
                fill={layout.layoutData.backgroundColor || DEFAULT_LAYOUT_DATA.backgroundColor}
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
              
              {/* Drawing preview */}
              {isDrawing && drawStart && drawEnd && (
                <Rect
                  x={Math.min(drawStart.x, drawEnd.x)}
                  y={Math.min(drawStart.y, drawEnd.y)}
                  width={Math.abs(drawEnd.x - drawStart.x)}
                  height={Math.abs(drawEnd.y - drawStart.y)}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dash={[5, 5]}
                  listening={false}
                />
              )}
            </Layer>
          </Stage>
          
          {/* Element Config Dialog */}
          {pendingElement && (
            <ElementConfigDialog
              open={configDialogOpen}
              onClose={() => {
                setConfigDialogOpen(false);
                setPendingElement(null);
                setIsCanvasExpanded(true);
                setToolMode("select");
              }}
              onSave={handleConfigSave}
              element={pendingElement.element}
              elementType={pendingElement.type}
            />
          )}
          
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
        </motion.div>

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
      </motion.div>
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
