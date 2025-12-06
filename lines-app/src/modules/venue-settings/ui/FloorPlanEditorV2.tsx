"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FLOOR_PLAN_TYPOGRAPHY } from "../config/floorPlanDesignTokens";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Square,
  Trash2,
  Save,
  Grid,
  Layout,
  List,
  MapPin,
  DoorOpen,
  Utensils,
  Circle,
  Hexagon,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Pencil,
  MoreVertical
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { saveVenueTables } from "../actions/floorPlanActions";
import { getAllTemplates } from "../utils/floorPlanTemplates";
import { findContainingZone } from "../utils/zoneContainment";
import { FreeTransform } from "./FreeTransform";
import { ContextPanel } from "./ContextPanel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AREA_TYPE_COLORS } from "../config/floorPlanDesignTokens";

export type ElementShape = "rectangle" | "circle" | "triangle" | "polygon";

export type ElementType = "table" | "zone" | "specialArea" | "security" | "line";

export type MapType = "general" | "tables" | "bars" | "security" | "lines" | "entrances";

export type SpecialAreaType =
  | "entrance"
  | "exit"
  | "kitchen"
  | "restroom"
  | "bar"
  | "stage"
  | "storage"
  | "dj_booth"
  | "other";

export interface Point {
  x: number;
  y: number;
}

export interface FloorPlanElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shape: ElementShape;
  color?: string;
  // Table specific
  seats?: number | null;
  notes?: string | null;
  zoneId?: string;
  tableType?: "table" | "bar" | "counter";
  // Zone specific
  description?: string | null;
  // Special area specific
  areaType?: SpecialAreaType;
  icon?: string;
  // Polygon specific
  polygonPoints?: Point[];
}

interface FloorPlanEditorV2Props {
  venueId: string;
  initialElements?: FloorPlanElement[];
  initialCapacity?: number;
  mapType?: MapType;
}

const DEFAULT_TABLE_SIZE = 80;
const DEFAULT_ZONE_SIZE = 200;
const DEFAULT_AREA_SIZE = 100;
const GRID_SIZE = 20;

export function FloorPlanEditorV2({
  venueId,
  initialElements = [],
  initialCapacity = 0,
  mapType = "general"
}: FloorPlanEditorV2Props) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<FloorPlanElement[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"interactive" | "nonInteractive">("interactive");
  const [venueCapacity, setVenueCapacity] = useState(initialCapacity);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);
  const [currentMapType, setCurrentMapType] = useState<MapType>(mapType);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Polygon drawing mode
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  
  // Fullscreen modal
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  
  // Right panel state (for collapsible panel)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  
  // Context panel state (opens when selecting an element)
  const [contextPanelElement, setContextPanelElement] = useState<FloorPlanElement | null>(null);

  // Drag state
  const [draggedElement, setDraggedElement] = useState<FloorPlanElement | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragElementsStartPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const dragAnimationFrameRef = useRef<number | null>(null);
  
  // Resize state - support all 8 handles
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<"nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w" | null>(null);
  const resizeStartRef = useRef<{ 
    mouseX: number; 
    mouseY: number; 
    width: number; 
    height: number; 
    elementX: number; 
    elementY: number;
    elementWidth: number;
    elementHeight: number;
  } | null>(null);
  const resizeAnimationFrameRef = useRef<number | null>(null);
  
  // Rotate state
  const [isRotating, setIsRotating] = useState(false);
  const rotateStartRef = useRef<{ angle: number; centerX: number; centerY: number; startAngle: number } | null>(null);
  const rotateAnimationFrameRef = useRef<number | null>(null);

  // Calculate canvas size to fit container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width - 32,
          height: rect.height - 32
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Add new element
  const handleAddElement = useCallback(
    (type: ElementType, areaType?: SpecialAreaType) => {
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const size = type === "table" ? DEFAULT_TABLE_SIZE : type === "zone" ? DEFAULT_ZONE_SIZE : type === "security" ? 40 : DEFAULT_AREA_SIZE;

      const newElement: FloorPlanElement = {
        id: `${type}-${Date.now()}`,
        type,
        name:
          type === "table"
            ? `שולחן ${elements.filter((e) => e.type === "table").length + 1}`
            : type === "zone"
              ? `אזור ${elements.filter((e) => e.type === "zone").length + 1}`
              : type === "security"
                ? `אבטחה ${elements.filter((e) => e.type === "security").length + 1}`
                : t(`floorPlan.specialAreas.${areaType || "other"}`),
        x: Math.max(0, centerX - size / 2),
        y: Math.max(0, centerY - size / 2),
        width: size,
        height: size,
        rotation: 0,
        shape: type === "security" ? "circle" : "rectangle",
        color: type === "zone" ? "#3B82F6" : type === "specialArea" ? "#10B981" : type === "security" ? "#EF4444" : undefined,
        seats: type === "table" ? 4 : undefined,
        areaType: type === "specialArea" ? areaType || "other" : undefined
      };

      setElements([...elements, newElement]);
      setSelectedElementId(newElement.id);
    },
    [elements, canvasSize, t]
  );

  // Delete element
  const handleDeleteElement = useCallback(
    (id: string) => {
      setElements(elements.filter((e) => e.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [elements, selectedElementId]
  );

  // Open edit dialog
  const handleEditElement = useCallback(
    (element: FloorPlanElement) => {
      setEditingElement({ ...element });
      setEditDialogOpen(true);
    },
    []
  );

  // Save edited element
  const handleSaveEdit = useCallback(() => {
    if (!editingElement) return;

    setElements(
      elements.map((e) => (e.id === editingElement.id ? editingElement : e))
    );
    setEditDialogOpen(false);
    setEditingElement(null);
  }, [editingElement, elements]);
  
  // Save context panel element
  const handleContextPanelSave = useCallback(() => {
    // Element is already updated via handleContextPanelChange
    // Just close the panel
    setContextPanelElement(null);
  }, []);
  
  // Handle context panel element changes
  const handleContextPanelChange = useCallback((updatedElement: FloorPlanElement) => {
    setContextPanelElement(updatedElement);
    setElements(
      elements.map((e) => (e.id === updatedElement.id ? updatedElement : e))
    );
  }, [elements]);
  
  // Update context panel when selection changes
  useEffect(() => {
    if (selectedElementId && selectedElementIds.size <= 1) {
      const element = elements.find(e => e.id === selectedElementId);
      setContextPanelElement(element || null);
      if (element) {
        setIsRightPanelOpen(true);
      }
    } else if (selectedElementIds.size === 0) {
      setContextPanelElement(null);
    }
  }, [selectedElementId, selectedElementIds, elements]);

  // Mouse down on element
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, element: FloorPlanElement) => {
      if (viewMode === "nonInteractive") return;
      
      // Don't start drag if we're already resizing or rotating
      if (isResizing || isRotating) return;
      
      e.stopPropagation();
      e.preventDefault();
      
      // Multi-select with Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        const newSelection = new Set(selectedElementIds);
        if (newSelection.has(element.id)) {
          newSelection.delete(element.id);
          if (newSelection.size === 0) {
            setSelectedElementId(null);
          } else if (newSelection.size === 1) {
            setSelectedElementId(Array.from(newSelection)[0]);
          }
        } else {
          newSelection.add(element.id);
          setSelectedElementId(element.id);
        }
        setSelectedElementIds(newSelection);
      } else {
        // Single select
        setSelectedElementId(element.id);
        setSelectedElementIds(new Set([element.id]));
      }
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Calculate mouse position relative to canvas (accounting for zoom)
      const mouseX = (e.clientX - rect.left) / zoom;
      const mouseY = (e.clientY - rect.top) / zoom;
      
      // Store drag start position
      dragStartPosRef.current = { x: mouseX, y: mouseY };
      
      // Store initial positions of all selected elements
      const selectedIds = selectedElementIds.size > 0 ? selectedElementIds : new Set([element.id]);
      dragElementsStartPosRef.current.clear();
      selectedIds.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) {
          dragElementsStartPosRef.current.set(id, { x: el.x, y: el.y });
        }
      });
      
      setIsDragging(true);
      setDraggedElement(element);
    },
    [viewMode, selectedElementIds, elements, zoom, isResizing, isRotating]
  );
  
  // Handle canvas mouse down for selection box
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || viewMode !== "interactive" || isDrawingPolygon) return;
      if (e.target !== canvasRef.current) return; // Only on canvas, not on elements
      if (e.button !== 0) return; // Only left mouse button
      
      const rect = canvasRef.current.getBoundingClientRect();
      const startX = (e.clientX - rect.left) / zoom;
      const startY = (e.clientY - rect.top) / zoom;
      
      setIsSelecting(true);
      setSelectionBox({ startX, startY, endX: startX, endY: startY });
      
      // If not Ctrl/Cmd, clear selection
      if (!e.ctrlKey && !e.metaKey) {
        setSelectedElementId(null);
        setSelectedElementIds(new Set());
      }
    },
    [viewMode, isDrawingPolygon, zoom]
  );

  // Handle rotate start
  const handleRotateStart = useCallback(
    (e: React.MouseEvent, element: FloorPlanElement) => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedElementId(element.id);
      setIsRotating(true);
      setDraggedElement(element);
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        // Calculate mouse position relative to canvas (accounting for zoom)
        const mouseX = (e.clientX - rect.left) / zoom;
        const mouseY = (e.clientY - rect.top) / zoom;
        
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        // Calculate initial angle from center to mouse
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const startAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        rotateStartRef.current = {
          angle: element.rotation,
          centerX: centerX,
          centerY: centerY,
          startAngle: startAngle
        };
      }
    },
    [zoom]
  );

  // Handle resize start - support all 8 handles (not rotate)
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, element: FloorPlanElement, handle: "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w" | "rotate") => {
      if (handle === "rotate") {
        handleRotateStart(e, element);
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      
      // Prevent drag when resizing
      setIsDragging(false);
      dragStartPosRef.current = null;
      
      setSelectedElementId(element.id);
      setIsResizing(true);
      setResizeHandle(handle);
      setDraggedElement(element);
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        // Calculate mouse position relative to canvas (accounting for zoom)
        const mouseX = (e.clientX - rect.left) / zoom;
        const mouseY = (e.clientY - rect.top) / zoom;
        
        resizeStartRef.current = {
          mouseX: mouseX,
          mouseY: mouseY,
          width: element.width,
          height: element.height,
          elementX: element.x,
          elementY: element.y,
          elementWidth: element.width,
          elementHeight: element.height
        };
      }
    },
    [handleRotateStart, zoom]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (viewMode === "nonInteractive" || !selectedElementId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedElement = elements.find((el) => el.id === selectedElementId);
      if (!selectedElement) return;

      // Delete key
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDeleteElement(selectedElementId);
        return;
      }

      // Arrow keys for movement
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = showGrid ? GRID_SIZE : (e.shiftKey ? 10 : 1);
        let newX = selectedElement.x;
        let newY = selectedElement.y;

        if (e.key === "ArrowLeft") newX = Math.max(0, selectedElement.x - step);
        if (e.key === "ArrowRight")
          newX = Math.min(canvasSize.width - selectedElement.width, selectedElement.x + step);
        if (e.key === "ArrowUp") newY = Math.max(0, selectedElement.y - step);
        if (e.key === "ArrowDown")
          newY = Math.min(canvasSize.height - selectedElement.height, selectedElement.y + step);

        // Update element position
        const updatedElement = {
          ...selectedElement,
          x: newX,
          y: newY
        };

        // If moving a table, check if it's inside a zone
        let newZoneId: string | undefined = undefined;
        if (updatedElement.type === "table") {
          const zones = elements.filter((el) => el.type === "zone");
          const containingZone = findContainingZone(updatedElement, zones);
          newZoneId = containingZone?.id;
        }

        setElements(
          elements.map((el) =>
            el.id === selectedElementId
              ? {
                  ...updatedElement,
                  zoneId: newZoneId !== undefined ? newZoneId : el.zoneId
                }
              : el
          )
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, elements, canvasSize, viewMode, handleDeleteElement, showGrid]);

  // Mouse move - handle dragging, resizing, and rotating
  useEffect(() => {
    if (viewMode === "nonInteractive") return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const canvasX = (e.clientX - rect.left) / zoom;
      const canvasY = (e.clientY - rect.top) / zoom;
      
      // Handle selection box
      if (isSelecting && selectionBox) {
        setSelectionBox({
          ...selectionBox,
          endX: canvasX,
          endY: canvasY
        });
        return;
      }

      // Handle dragging with requestAnimationFrame for smooth performance
      if (isDragging && draggedElement && dragStartPosRef.current && !isResizing && !isRotating) {
        // Cancel previous animation frame
        if (dragAnimationFrameRef.current !== null) {
          cancelAnimationFrame(dragAnimationFrameRef.current);
        }
        
        // Use requestAnimationFrame for smooth dragging
        dragAnimationFrameRef.current = requestAnimationFrame(() => {
          // Calculate delta from drag start
          const deltaX = canvasX - dragStartPosRef.current!.x;
          const deltaY = canvasY - dragStartPosRef.current!.y;
          
          // Get selected elements
          const selectedIds = selectedElementIds.size > 0 
            ? selectedElementIds 
            : (selectedElementId ? new Set([selectedElementId]) : new Set());
          
          // Update all selected elements
          setElements((prevElements) => {
            return prevElements.map((el) => {
              if (selectedIds.has(el.id)) {
                const startPos = dragElementsStartPosRef.current.get(el.id);
                if (!startPos) return el;
                
                let newX = startPos.x + deltaX;
                let newY = startPos.y + deltaY;
                
                // Snap to grid if enabled
                if (showGrid) {
                  newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                  newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
                }
                
                // Constrain to canvas bounds
                newX = Math.max(0, Math.min(canvasSize.width - el.width, newX));
                newY = Math.max(0, Math.min(canvasSize.height - el.height, newY));
                
                const updatedElement = {
                  ...el,
                  x: newX,
                  y: newY
                };

                // If dragging a table, check if it's inside a zone
                let newZoneId: string | undefined = undefined;
                if (updatedElement.type === "table") {
                  const zones = prevElements.filter((zoneEl) => zoneEl.type === "zone");
                  const containingZone = findContainingZone(updatedElement, zones);
                  newZoneId = containingZone?.id;
                }

                return {
                  ...updatedElement,
                  zoneId: newZoneId !== undefined ? newZoneId : el.zoneId
                };
              }
              return el;
            });
          });
          
          // Update dragged element for visual feedback
          const startPos = dragElementsStartPosRef.current.get(draggedElement.id);
          if (startPos) {
            let newX = startPos.x + deltaX;
            let newY = startPos.y + deltaY;
            
            if (showGrid) {
              newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
              newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
            }
            
            newX = Math.max(0, Math.min(canvasSize.width - draggedElement.width, newX));
            newY = Math.max(0, Math.min(canvasSize.height - draggedElement.height, newY));
            
            setDraggedElement((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                x: newX,
                y: newY
              };
            });
          }
        });
        return;
      }

      // Handle resizing - support all 8 handles with requestAnimationFrame
      if (isResizing && resizeHandle && draggedElement && resizeStartRef.current) {
        // Cancel previous animation frame
        if (resizeAnimationFrameRef.current !== null) {
          cancelAnimationFrame(resizeAnimationFrameRef.current);
        }
        
        // Use requestAnimationFrame for smooth resizing
        resizeAnimationFrameRef.current = requestAnimationFrame(() => {
          const start = resizeStartRef.current!;
          const deltaX = canvasX - start.mouseX;
          const deltaY = canvasY - start.mouseY;
          
          let newWidth = start.elementWidth;
          let newHeight = start.elementHeight;
          let newX = start.elementX;
          let newY = start.elementY;

          // Handle corner resizing
          if (resizeHandle === "se") {
            // Southeast - bottom right
            newWidth = Math.max(20, start.elementWidth + deltaX);
            newHeight = Math.max(20, start.elementHeight + deltaY);
          } else if (resizeHandle === "sw") {
            // Southwest - bottom left
            newWidth = Math.max(20, start.elementWidth - deltaX);
            newHeight = Math.max(20, start.elementHeight + deltaY);
            newX = start.elementX + deltaX;
          } else if (resizeHandle === "ne") {
            // Northeast - top right
            newWidth = Math.max(20, start.elementWidth + deltaX);
            newHeight = Math.max(20, start.elementHeight - deltaY);
            newY = start.elementY + deltaY;
          } else if (resizeHandle === "nw") {
            // Northwest - top left
            newWidth = Math.max(20, start.elementWidth - deltaX);
            newHeight = Math.max(20, start.elementHeight - deltaY);
            newX = start.elementX + deltaX;
            newY = start.elementY + deltaY;
          }
          // Handle edge resizing
          else if (resizeHandle === "n") {
            // North - top edge
            newHeight = Math.max(20, start.elementHeight - deltaY);
            newY = start.elementY + deltaY;
          } else if (resizeHandle === "s") {
            // South - bottom edge
            newHeight = Math.max(20, start.elementHeight + deltaY);
          } else if (resizeHandle === "e") {
            // East - right edge
            newWidth = Math.max(20, start.elementWidth + deltaX);
          } else if (resizeHandle === "w") {
            // West - left edge
            newWidth = Math.max(20, start.elementWidth - deltaX);
            newX = start.elementX + deltaX;
          }

          // Snap to grid if enabled
          if (showGrid) {
            newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
            newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE;
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
          }

          // Constrain to canvas bounds
          newX = Math.max(0, newX);
          newY = Math.max(0, newY);
          if (newX + newWidth > canvasSize.width) {
            newWidth = canvasSize.width - newX;
          }
          if (newY + newHeight > canvasSize.height) {
            newHeight = canvasSize.height - newY;
          }

          // Update element position and size
          const updatedElement = {
            ...draggedElement,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          };

          // If resizing a table, check if it's still inside a zone
          let newZoneId: string | undefined = undefined;
          if (updatedElement.type === "table") {
            const zones = elements.filter((el) => el.type === "zone");
            const containingZone = findContainingZone(updatedElement, zones);
            newZoneId = containingZone?.id;
          }

          setElements((prevElements) =>
            prevElements.map((el) =>
              el.id === draggedElement.id
                ? {
                    ...updatedElement,
                    zoneId: newZoneId !== undefined ? newZoneId : el.zoneId
                  }
                : el
            )
          );
          
          // Update dragged element for visual feedback
          setDraggedElement((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight
            };
          });
        });
        return;
      }

      // Handle rotating with requestAnimationFrame
      if (isRotating && draggedElement && rotateStartRef.current) {
        // Cancel previous animation frame
        if (rotateAnimationFrameRef.current !== null) {
          cancelAnimationFrame(rotateAnimationFrameRef.current);
        }
        
        // Use requestAnimationFrame for smooth rotation
        rotateAnimationFrameRef.current = requestAnimationFrame(() => {
          const start = rotateStartRef.current!;
          const centerX = start.centerX;
          const centerY = start.centerY;
          const dx = canvasX - centerX;
          const dy = canvasY - centerY;
          const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          const angleDelta = currentAngle - start.startAngle;
          const normalizedAngle = ((start.angle + angleDelta) % 360 + 360) % 360;

          setElements((prevElements) =>
            prevElements.map((el) =>
              el.id === draggedElement.id
                ? {
                    ...el,
                    rotation: normalizedAngle
                  }
                : el
            )
          );
          
          // Update dragged element for visual feedback
          setDraggedElement((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              rotation: normalizedAngle
            };
          });
        });
        return;
      }
    };

    const handleMouseUp = () => {
      // Cancel any pending animation frames
      if (dragAnimationFrameRef.current !== null) {
        cancelAnimationFrame(dragAnimationFrameRef.current);
        dragAnimationFrameRef.current = null;
      }
      if (resizeAnimationFrameRef.current !== null) {
        cancelAnimationFrame(resizeAnimationFrameRef.current);
        resizeAnimationFrameRef.current = null;
      }
      if (rotateAnimationFrameRef.current !== null) {
        cancelAnimationFrame(rotateAnimationFrameRef.current);
        rotateAnimationFrameRef.current = null;
      }
      
      // Handle selection box completion
      if (isSelecting && selectionBox) {
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const maxX = Math.max(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const maxY = Math.max(selectionBox.startY, selectionBox.endY);
        
        // Find all elements within selection box
        const selected = elements.filter(el => {
          const elCenterX = el.x + el.width / 2;
          const elCenterY = el.y + el.height / 2;
          return elCenterX >= minX && elCenterX <= maxX && elCenterY >= minY && elCenterY <= maxY;
        });
        
        if (selected.length > 0) {
          const selectedIds = new Set(selected.map(el => el.id));
          setSelectedElementIds(selectedIds);
          if (selected.length === 1) {
            setSelectedElementId(selected[0].id);
          } else {
            setSelectedElementId(null);
          }
        }
        
        setIsSelecting(false);
        setSelectionBox(null);
      }
      
      // Clean up drag state
      if (isDragging) {
        dragStartPosRef.current = null;
        dragElementsStartPosRef.current.clear();
      }
      
      // Clean up resize state
      if (isResizing) {
        resizeStartRef.current = null;
      }
      
      // Clean up rotate state
      if (isRotating) {
        rotateStartRef.current = null;
      }
      
      setIsDragging(false);
      setDraggedElement(null);
      setIsResizing(false);
      setResizeHandle(null);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating || isSelecting) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, isSelecting, selectionBox, draggedElement, resizeHandle, elements, canvasSize, viewMode, showGrid, zoom, selectedElementIds, selectedElementId]);
  
  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (dragAnimationFrameRef.current !== null) {
        cancelAnimationFrame(dragAnimationFrameRef.current);
      }
      if (resizeAnimationFrameRef.current !== null) {
        cancelAnimationFrame(resizeAnimationFrameRef.current);
      }
      if (rotateAnimationFrameRef.current !== null) {
        cancelAnimationFrame(rotateAnimationFrameRef.current);
      }
    };
  }, []);

  // Calculate total capacity from tables
  const totalCapacity = elements
    .filter((e) => e.type === "table" && e.seats)
    .reduce((sum, e) => sum + (e.seats || 0), 0);

  // Validate capacity
  const capacityError = venueCapacity > 0 && venueCapacity < totalCapacity;

  // Save
  const handleSave = useCallback(async () => {
    if (capacityError) {
      toast({
        title: t("errors.validation"),
        description: t("floorPlan.capacityTooSmall"),
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save tables (convert elements to tables)
      const tables = elements
        .filter((e) => e.type === "table")
        .map((e) => ({
          id: e.id,
          name: e.name,
          seats: e.seats,
          notes: e.notes,
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          rotation: e.rotation,
          shape: e.shape as "rectangle" | "circle" | "triangle" | "polygon",
          zoneId: e.zoneId,
          color: e.color
        }));

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
  }, [elements, venueId, capacityError, toast, t]);

  // Click canvas to deselect or add polygon point
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || viewMode !== "interactive") return;
      
      if (isDrawingPolygon) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setPolygonPoints([...polygonPoints, { x, y }]);
      } else if (e.target === canvasRef.current) {
        setSelectedElementId(null);
      }
    },
    [viewMode, isDrawingPolygon, polygonPoints, zoom]
  );
  
  // Finish polygon drawing
  const finishPolygonDrawing = useCallback(() => {
    if (polygonPoints.length >= 3) {
      // Calculate bounds
      const minX = Math.min(...polygonPoints.map(p => p.x));
      const minY = Math.min(...polygonPoints.map(p => p.y));
      const maxX = Math.max(...polygonPoints.map(p => p.x));
      const maxY = Math.max(...polygonPoints.map(p => p.y));
      const width = maxX - minX || 100;
      const height = maxY - minY || 100;
      
      // Normalize points to 0-100%
      const normalizedPoints = polygonPoints.map(p => ({
        x: width > 0 ? ((p.x - minX) / width) * 100 : p.x,
        y: height > 0 ? ((p.y - minY) / height) * 100 : p.y
      }));
      
      // Create new zone with polygon shape
      const newElement: FloorPlanElement = {
        id: `zone-${Date.now()}`,
        type: "zone",
        name: `Zone ${elements.filter(e => e.type === "zone").length + 1}`,
        x: minX,
        y: minY,
        width: width,
        height: height,
        rotation: 0,
        shape: "polygon",
        polygonPoints: normalizedPoints,
        color: "#3B82F6",
        description: null
      };
      
      setElements([...elements, newElement]);
      setPolygonPoints([]);
      setIsDrawingPolygon(false);
    }
  }, [polygonPoints, elements]);
  
  // Cancel polygon drawing
  const cancelPolygonDrawing = useCallback(() => {
    setPolygonPoints([]);
    setIsDrawingPolygon(false);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-250px)] flex-col gap-4">
        {/* Simplified Toolbar - Only Primary Actions */}
        <div className="flex shrink-0 items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Primary Action: Create */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t("common.create")}
                    </Button>
                  </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleAddElement("table")}>
                <Square className="ml-2 h-4 w-4" />
                {t("floorPlan.addTable")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("zone")}>
                <MapPin className="ml-2 h-4 w-4" />
                {t("floorPlan.addZone")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "entrance")}>
                <DoorOpen className="ml-2 h-4 w-4" />
                {t("floorPlan.specialAreas.entrance")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "exit")}>
                <DoorOpen className="ml-2 h-4 w-4" />
                {t("floorPlan.specialAreas.exit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "kitchen")}>
                <Utensils className="ml-2 h-4 w-4" />
                {t("floorPlan.specialAreas.kitchen")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "restroom")}>
                <MapPin className="ml-2 h-4 w-4" />
                {t("floorPlan.specialAreas.restroom")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "bar")}>
                {t("floorPlan.specialAreas.bar")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "stage")}>
                {t("floorPlan.specialAreas.stage")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "storage")}>
                {t("floorPlan.specialAreas.storage")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("specialArea", "other")}>
                {t("floorPlan.specialAreas.other")}
              </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>{t("common.create")}</TooltipContent>
            </Tooltip>
            
            {/* Secondary: Grid Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className={showGrid ? "bg-primary/10" : ""}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("floorPlan.grid")}</TooltipContent>
            </Tooltip>
            
            {/* Zoom Controls Group */}
            <div className="flex items-center gap-1 border-l pl-2 ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("floorPlan.zoomOut")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(1)}
                    className="min-w-[60px]"
                  >
                    {Math.round(zoom * 100)}%
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("floorPlan.resetZoom")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("floorPlan.zoomIn")}</TooltipContent>
              </Tooltip>
            </div>
            
            {/* Overflow Menu for Secondary Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setTemplateDialogOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("floorPlan.templates")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsDrawingPolygon(!isDrawingPolygon);
                    if (isDrawingPolygon) {
                      cancelPolygonDrawing();
                    }
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("floorPlan.shapes.polygon")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? (
                    <Minimize2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Maximize2 className="mr-2 h-4 w-4" />
                  )}
                  {isFullscreen ? t("floorPlan.exitFullscreen") : t("floorPlan.fullscreen")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Right Side: Stats and Save */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:block">
              {elements.filter((e) => e.type === "table").length} {t("floorPlan.tables")} •{" "}
              {totalCapacity} {t("common.seats")}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? t("common.loading") : t("common.save")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save changes</TooltipContent>
            </Tooltip>
          </div>
        </div>

      {/* View Mode Tabs and Map Type Selector */}
      <div className="flex shrink-0 items-center justify-between gap-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "interactive" | "nonInteractive")}>
          <TabsList>
            <TabsTrigger value="interactive">
              <Layout className="ml-2 h-4 w-4" />
              {t("floorPlan.interactiveView")}
            </TabsTrigger>
            <TabsTrigger value="nonInteractive">
              <List className="ml-2 h-4 w-4" />
              {t("floorPlan.nonInteractiveView")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={currentMapType} onValueChange={(v) => setCurrentMapType(v as MapType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">{t("floorPlan.mapTypes.general")}</SelectItem>
            <SelectItem value="tables">{t("floorPlan.mapTypes.tables")}</SelectItem>
            <SelectItem value="bars">{t("floorPlan.mapTypes.bars")}</SelectItem>
            <SelectItem value="security">{t("floorPlan.mapTypes.security")}</SelectItem>
            <SelectItem value="lines">{t("floorPlan.mapTypes.lines")}</SelectItem>
            <SelectItem value="entrances">{t("floorPlan.mapTypes.entrances")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

        {/* Main Content - Flex Layout with Context Panel */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {viewMode === "interactive" ? (
            <>
              <Card ref={containerRef} className="relative flex-1 overflow-hidden p-4">
                <div
            ref={canvasRef}
            className="relative h-full w-full cursor-crosshair bg-gradient-to-br from-muted/20 to-muted/40"
            style={{
              width: `${canvasSize.width || 800}px`,
              height: `${canvasSize.height || 600}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              backgroundImage: showGrid
                ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
                : undefined,
              backgroundSize: `${20 / zoom}px ${20 / zoom}px`
            }}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
          >
            {/* Selection Box */}
            {isSelecting && selectionBox && (
              <div
                style={{
                  position: "absolute",
                  left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
                  top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
                  width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
                  height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
                  border: "2px dashed #3B82F6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  pointerEvents: "none",
                  zIndex: 998
                }}
              />
            )}
            {/* Polygon drawing preview */}
            {isDrawingPolygon && polygonPoints.length > 0 && (
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 999
                }}
              >
                <polyline
                  points={polygonPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {polygonPoints.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#3B82F6"
                  />
                ))}
              </svg>
            )}
            {isDrawingPolygon && polygonPoints.length >= 3 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  zIndex: 1000
                }}
              >
                <Button
                  size="sm"
                  variant="default"
                  onClick={finishPolygonDrawing}
                  className="mr-2"
                >
                  {t("common.save")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelPolygonDrawing}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            )}
            {/* Visual Feedback Overlay */}
            {(isDragging || isResizing || isRotating) && draggedElement && (() => {
              // Check if table is in a zone
              const zones = elements.filter((el) => el.type === "zone");
              const containingZone = draggedElement.type === "table" 
                ? findContainingZone(draggedElement, zones)
                : null;

              return (
                <div
                  style={{
                    position: "absolute",
                    top: `${draggedElement.y - 30}px`,
                    left: `${draggedElement.x}px`,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    pointerEvents: "none",
                    zIndex: 1000,
                    whiteSpace: "nowrap"
                  }}
                >
                  {isDragging && (
                    <>
                      X: {Math.round(draggedElement.x)}px, Y: {Math.round(draggedElement.y)}px
                      {containingZone && (
                        <span style={{ marginLeft: "8px", color: containingZone.color || "#3B82F6" }}>
                          • {containingZone.name}
                        </span>
                      )}
                    </>
                  )}
                  {isResizing && (
                    <>
                      {Math.round(draggedElement.width)}×{Math.round(draggedElement.height)}px
                      {containingZone && (
                        <span style={{ marginLeft: "8px", color: containingZone.color || "#3B82F6" }}>
                          • {containingZone.name}
                        </span>
                      )}
                    </>
                  )}
                  {isRotating && (
                    <>
                      {Math.round(draggedElement.rotation)}°
                    </>
                  )}
                </div>
              );
            })()}
            {/* Render Elements - Filter by map type */}
            {elements
              .filter((element) => {
                if (currentMapType === "tables") return element.type === "table" && element.tableType !== "bar" && element.tableType !== "counter";
                if (currentMapType === "bars") return element.type === "table" && element.tableType === "bar";
                if (currentMapType === "security") return element.type === "security";
                if (currentMapType === "lines") return element.type === "line" || (element.type === "table" && element.tableType === "counter");
                if (currentMapType === "entrances") return element.type === "specialArea" && (element.areaType === "entrance" || element.areaType === "exit");
                return true; // general shows all
              })
              .map((element) => (
                <ElementRenderer
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id || selectedElementIds.has(element.id)}
                  isInteractive={true}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onDoubleClick={() => handleEditElement(element)}
                  onDelete={() => handleDeleteElement(element.id)}
                  onVertexDrag={(vertexIndex, newPoint) => {
                    setElements(
                      elements.map((e) =>
                        e.id === element.id && e.polygonPoints
                          ? {
                              ...e,
                              polygonPoints: e.polygonPoints.map((p, i) => (i === vertexIndex ? newPoint : p))
                            }
                          : e
                      )
                    );
                  }}
                  allElements={elements}
                  onResizeStart={(e, handle) => handleResizeStart(e, element, handle)}
                  onRotateStart={(e) => handleRotateStart(e, element)}
                />
              ))}
                </div>
              </Card>
              
              {/* Context Panel - Collapsible Right Panel */}
              <ContextPanel
                element={contextPanelElement}
                isOpen={isRightPanelOpen}
                onClose={() => {
                  setIsRightPanelOpen(false);
                  setContextPanelElement(null);
                  setSelectedElementId(null);
                  setSelectedElementIds(new Set());
                }}
                onToggle={() => setIsRightPanelOpen(!isRightPanelOpen)}
                onEdit={handleEditElement}
                onDelete={handleDeleteElement}
                onChange={handleContextPanelChange}
                onSave={handleContextPanelSave}
              />
            </>
          ) : (
            <NonInteractiveView
              elements={elements}
              onEdit={handleEditElement}
              onDelete={handleDeleteElement}
            />
          )}
        </div>

      {/* Template Selection Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("floorPlan.selectTemplate")}</DialogTitle>
            <DialogDescription>{t("floorPlan.selectTemplateDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {getAllTemplates().map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                onClick={() => {
                  setElements(template.elements.map((el) => ({ ...el, id: `${el.id}-${Date.now()}` })));
                  setVenueCapacity(template.defaultCapacity);
                  setTemplateDialogOpen(false);
                  toast({
                    title: t("success.templateLoaded"),
                    description: t("success.templateLoadedDescription", { name: template.name })
                  });
                }}
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-1">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {template.elements.length} {t("floorPlan.elements")} • {template.defaultCapacity} {t("common.seats")}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <DialogTitle>{t("floorPlan.title")}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div
                ref={canvasRef}
                className="relative cursor-crosshair bg-gradient-to-br from-muted/20 to-muted/40 mx-auto"
                style={{
                  width: `${canvasSize.width || 800}px`,
                  height: `${canvasSize.height || 600}px`,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  backgroundImage: showGrid
                    ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                       linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
                    : undefined,
                  backgroundSize: `${20 / zoom}px ${20 / zoom}px`
                }}
                onClick={handleCanvasClick}
              >
                {/* Polygon drawing preview */}
                {isDrawingPolygon && polygonPoints.length > 0 && (
                  <svg
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      zIndex: 999
                    }}
                  >
                    <polyline
                      points={polygonPoints.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    {polygonPoints.map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#3B82F6"
                      />
                    ))}
                  </svg>
                )}
                {isDrawingPolygon && polygonPoints.length >= 3 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      zIndex: 1000
                    }}
                  >
                    <Button
                      size="sm"
                      variant="default"
                      onClick={finishPolygonDrawing}
                      className="mr-2"
                    >
                      {t("common.save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelPolygonDrawing}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                )}
                {/* Render Elements - Filter by map type */}
                {elements
                  .filter((element) => {
                    if (currentMapType === "tables") return element.type === "table" && element.tableType !== "bar" && element.tableType !== "counter";
                    if (currentMapType === "bars") return element.type === "table" && element.tableType === "bar";
                    if (currentMapType === "security") return element.type === "security";
                    if (currentMapType === "lines") return element.type === "line" || (element.type === "table" && element.tableType === "counter");
                    if (currentMapType === "entrances") return element.type === "specialArea" && (element.areaType === "entrance" || element.areaType === "exit");
                    return true;
                  })
                  .map((element) => (
                    <ElementRenderer
                      key={element.id}
                      element={element}
                      isSelected={selectedElementId === element.id || selectedElementIds.has(element.id)}
                      isInteractive={true}
                      onMouseDown={(e) => handleElementMouseDown(e, element)}
                      onDoubleClick={() => handleEditElement(element)}
                      onDelete={() => handleDeleteElement(element.id)}
                      allElements={elements}
                      onResizeStart={(e, handle) => {
                        if (handle === "rotate") {
                          handleRotateStart(e, element);
                        } else {
                          handleResizeStart(e, element, handle as "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w");
                        }
                      }}
                      onRotateStart={(e) => handleRotateStart(e, element)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingElement?.type === "table"
                ? t("floorPlan.editTable")
                : editingElement?.type === "zone"
                  ? t("floorPlan.editZone")
                  : editingElement?.type === "security"
                    ? t("floorPlan.editSecurity")
                    : t("floorPlan.editSpecialArea")}
            </DialogTitle>
            <DialogDescription>{t("floorPlan.editDescription")}</DialogDescription>
          </DialogHeader>
          {editingElement && (
            <EditElementForm
              element={editingElement}
              onChange={setEditingElement}
              onSave={handleSaveEdit}
              onCancel={() => {
                setEditDialogOpen(false);
                setEditingElement(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Element Renderer Component
interface ElementRendererProps {
  element: FloorPlanElement;
  isSelected: boolean;
  isInteractive: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDelete: () => void;
  onVertexDrag?: (vertexIndex: number, newPoint: Point) => void;
  allElements?: FloorPlanElement[];
  onResizeStart?: (e: React.MouseEvent, handle: "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w" | "rotate") => void;
  onRotateStart?: (e: React.MouseEvent) => void;
}

function ElementRenderer({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  onVertexDrag,
  allElements = [],
  onResizeStart,
  onRotateStart
}: ElementRendererProps) {
  // Find the zone this table belongs to (for visual feedback)
  const parentZone = element.type === "table" && element.zoneId
    ? allElements.find((el) => el.id === element.zoneId && el.type === "zone")
    : null;

  const getElementStyle = (): React.CSSProperties => {
    // Determine border color based on zone membership
    let borderColor = isSelected ? "#3B82F6" : "rgba(0,0,0,0.3)";
    if (element.type === "table" && parentZone && !isSelected) {
      // Use zone color for border if table is in a zone
      borderColor = parentZone.color || "rgba(59, 130, 246, 0.5)";
    }

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotation}deg)`,
      transformOrigin: "center center",
      cursor: isInteractive ? (isSelected ? "move" : "grab") : "default",
      border: isSelected ? `2px solid ${borderColor}` : `2px solid ${borderColor}`,
      backgroundColor:
        element.type === "zone"
          ? element.color || `${AREA_TYPE_COLORS.zone}33` // 20% opacity
          : element.type === "specialArea"
            ? element.color || `${AREA_TYPE_COLORS[element.areaType || "other"]}33` // 20% opacity
            : element.type === "security"
              ? element.color || `${AREA_TYPE_COLORS.other}33` // 20% opacity
              : element.type === "table" && parentZone
                ? `${parentZone.color || AREA_TYPE_COLORS.zone}15` // Very light tint of zone color
                : isSelected
                  ? "rgba(59, 130, 246, 0.15)"
                  : AREA_TYPE_COLORS.table, // White for tables
      boxShadow: isSelected
        ? "0 4px 12px rgba(59, 130, 246, 0.3)"
        : element.type === "table" && parentZone
          ? `0 2px 8px ${parentZone.color || "#3B82F6"}40` // Subtle shadow with zone color
          : "0 2px 4px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      transition: isSelected ? "none" : "all 0.2s ease"
    };

    if (element.shape === "circle") {
      return { ...baseStyle, borderRadius: "50%" };
    }
    if (element.shape === "triangle" || element.shape === "polygon") {
      // For triangle and polygon, we'll use SVG clipPath
      return baseStyle;
    }
    // Rectangle (default)
    return { ...baseStyle, borderRadius: "4px" };
  };

  // Generate polygon path for regular shapes
  const getRegularPolygonPath = (sides: number, width: number, height: number): string => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    const points: Point[] = [];
    
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }
    
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  };

  const getPolygonPath = (): string => {
    if (element.shape === "triangle") {
      return getRegularPolygonPath(3, element.width, element.height);
    }
    if (element.shape === "polygon" && element.polygonPoints && element.polygonPoints.length >= 3) {
      // Convert normalized points (0-100%) to absolute coordinates
      const absolutePoints = element.polygonPoints.map((p) => ({
        x: (p.x / 100) * element.width,
        y: (p.y / 100) * element.height
      }));
      return absolutePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
    }
    return "";
  };

  const path = getPolygonPath();
  const needsSvg = element.shape === "triangle" || 
                   (element.shape === "polygon" && element.polygonPoints && element.polygonPoints.length >= 3);

  if (needsSvg && path) {
    return (
      <div
        style={{
          position: "absolute",
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          transform: `rotate(${element.rotation}deg)`,
          transformOrigin: "center center",
          cursor: isInteractive ? (isSelected ? "move" : "grab") : "default"
        }}
        onMouseDown={isInteractive ? onMouseDown : undefined}
        onDoubleClick={onDoubleClick}
        className="group"
      >
        <svg
          width={element.width}
          height={element.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0
          }}
        >
          <defs>
            <clipPath id={`polygon-${element.id}`}>
              <path d={path} />
            </clipPath>
          </defs>
          <path
            d={path}
            fill={
              element.type === "zone"
                ? element.color || "rgba(59, 130, 246, 0.2)"
                : element.type === "specialArea"
                  ? element.color || "rgba(16, 185, 129, 0.2)"
                  : element.type === "security"
                    ? element.color || "rgba(239, 68, 68, 0.2)"
                    : isSelected
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(255, 255, 255, 0.95)"
            }
            stroke={isSelected ? "#3B82F6" : "rgba(0,0,0,0.3)"}
            strokeWidth={isSelected ? 2 : 2}
          />
          {/* Render vertices for polygon editing */}
          {isInteractive && isSelected && element.shape === "polygon" && element.polygonPoints && onVertexDrag && (
            <>
              {element.polygonPoints.map((point, index) => (
                <PolygonVertex
                  key={index}
                  point={point}
                  index={index}
                  element={element}
                  allElements={allElements}
                  onDrag={onVertexDrag}
                />
              ))}
            </>
          )}
        </svg>
        <div
          className="pointer-events-none text-center px-1 absolute inset-0 flex items-center justify-center"
          style={{
            clipPath: `url(#polygon-${element.id})`
          }}
        >
          <div>
            <div 
              style={{
                fontSize: FLOOR_PLAN_TYPOGRAPHY.tableNumber.fontSize,
                fontWeight: FLOOR_PLAN_TYPOGRAPHY.tableNumber.fontWeight,
                lineHeight: FLOOR_PLAN_TYPOGRAPHY.tableNumber.lineHeight,
                color: FLOOR_PLAN_TYPOGRAPHY.tableNumber.color
              }}
              className="truncate"
            >
              {element.name}
            </div>
            {element.type === "table" && element.seats && (
              <div 
                style={{
                  fontSize: FLOOR_PLAN_TYPOGRAPHY.tableSeats.fontSize,
                  fontWeight: FLOOR_PLAN_TYPOGRAPHY.tableSeats.fontWeight,
                  lineHeight: FLOOR_PLAN_TYPOGRAPHY.tableSeats.lineHeight,
                  color: FLOOR_PLAN_TYPOGRAPHY.tableSeats.color,
                  marginTop: "2px"
                }}
              >
                Places: {element.seats}
              </div>
            )}
          </div>
        </div>
        {/* Resize handles for polygon shapes */}
        {isInteractive && isSelected && onResizeStart && (
          <>
            <div
              style={{
                position: "absolute",
                top: "-4px",
                left: "-4px",
                width: "8px",
                height: "8px",
                backgroundColor: "#3B82F6",
                border: "2px solid white",
                borderRadius: "50%",
                cursor: "nwse-resize",
                zIndex: 10
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, "nw");
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "8px",
                height: "8px",
                backgroundColor: "#3B82F6",
                border: "2px solid white",
                borderRadius: "50%",
                cursor: "nesw-resize",
                zIndex: 10
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, "ne");
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-4px",
                left: "-4px",
                width: "8px",
                height: "8px",
                backgroundColor: "#3B82F6",
                border: "2px solid white",
                borderRadius: "50%",
                cursor: "nesw-resize",
                zIndex: 10
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, "sw");
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-4px",
                right: "-4px",
                width: "8px",
                height: "8px",
                backgroundColor: "#3B82F6",
                border: "2px solid white",
                borderRadius: "50%",
                cursor: "nwse-resize",
                zIndex: 10
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, "se");
              }}
            />
          </>
        )}
        {/* Rotate handle for polygon shapes */}
        {isInteractive && isSelected && onRotateStart && (
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "8px",
              height: "8px",
              backgroundColor: "#10B981",
              border: "2px solid white",
              borderRadius: "50%",
              cursor: "grab",
              zIndex: 10
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onRotateStart(e);
            }}
          />
        )}
      </div>
    );
  }


  return (
    <div
      style={getElementStyle()}
      onMouseDown={isInteractive ? onMouseDown : undefined}
      onDoubleClick={onDoubleClick}
      className="group"
    >
      <div className="pointer-events-none text-center px-1">
        <div 
          style={{
            fontSize: FLOOR_PLAN_TYPOGRAPHY.tableNumber.fontSize,
            fontWeight: FLOOR_PLAN_TYPOGRAPHY.tableNumber.fontWeight,
            lineHeight: FLOOR_PLAN_TYPOGRAPHY.tableNumber.lineHeight,
            color: FLOOR_PLAN_TYPOGRAPHY.tableNumber.color
          }}
          className="truncate"
        >
          {element.name}
        </div>
        {element.type === "table" && element.seats && (
          <div 
            style={{
              fontSize: FLOOR_PLAN_TYPOGRAPHY.tableSeats.fontSize,
              fontWeight: FLOOR_PLAN_TYPOGRAPHY.tableSeats.fontWeight,
              lineHeight: FLOOR_PLAN_TYPOGRAPHY.tableSeats.lineHeight,
              color: FLOOR_PLAN_TYPOGRAPHY.tableSeats.color,
              marginTop: "2px"
            }}
          >
            Places: {element.seats}
          </div>
        )}
      </div>
      {isSelected && isInteractive && (
        <FreeTransform
          element={element}
          isSelected={isSelected}
          onResizeStart={(e, handle) => {
            if (onResizeStart && handle !== "rotate") {
              onResizeStart(e, handle as "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w");
            }
          }}
          onRotateStart={(e) => {
            if (onRotateStart) {
              onRotateStart(e);
            }
          }}
        />
      )}
    </div>
  );
}

// Edit Element Form Component
interface EditElementFormProps {
  element: FloorPlanElement;
  onChange: (element: FloorPlanElement) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditElementForm({ element, onChange, onSave, onCancel }: EditElementFormProps) {
  const { t } = useTranslations();

  // Initialize polygon points if shape is polygon and points don't exist
  useEffect(() => {
    if (element.shape === "polygon" && !element.polygonPoints) {
      // Create default rectangle polygon
      const defaultPoints: Point[] = [
        { x: 0, y: 0 },
        { x: element.width, y: 0 },
        { x: element.width, y: element.height },
        { x: 0, y: element.height }
      ];
      onChange({ ...element, polygonPoints: defaultPoints });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.shape]);

  const handleAddPolygonVertex = () => {
    if (!element.polygonPoints) return;
    const newPoint: Point = {
      x: element.width / 2,
      y: element.height / 2
    };
    onChange({
      ...element,
      polygonPoints: [...element.polygonPoints, newPoint]
    });
  };

  const handleRemovePolygonVertex = (index: number) => {
    if (!element.polygonPoints || element.polygonPoints.length <= 3) return;
    onChange({
      ...element,
      polygonPoints: element.polygonPoints.filter((_, i) => i !== index)
    });
  };

  const handleUpdatePolygonVertex = (index: number, point: Point) => {
    if (!element.polygonPoints) return;
    const updated = [...element.polygonPoints];
    updated[index] = point;
    onChange({ ...element, polygonPoints: updated });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="edit-name">{t("common.name")}</Label>
        <Input
          id="edit-name"
          value={element.name}
          onChange={(e) => onChange({ ...element, name: e.target.value })}
        />
      </div>

      {/* Shape Selection */}
      <div className="space-y-2">
        <Label htmlFor="edit-shape">{t("floorPlan.shape")}</Label>
        <Select
          value={element.shape}
          onValueChange={(value) => {
            const newShape = value as ElementShape;
            if (newShape === "polygon" && !element.polygonPoints) {
              // Initialize polygon points
              const defaultPoints: Point[] = [
                { x: 0, y: 0 },
                { x: element.width, y: 0 },
                { x: element.width, y: element.height },
                { x: 0, y: element.height }
              ];
              onChange({ ...element, shape: newShape, polygonPoints: defaultPoints });
            } else {
              onChange({ ...element, shape: newShape });
            }
          }}
        >
          <SelectTrigger id="edit-shape">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                {t("floorPlan.shapes.rectangle")}
              </div>
            </SelectItem>
            <SelectItem value="circle">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                {t("floorPlan.shapes.circle")}
              </div>
            </SelectItem>
            <SelectItem value="triangle">
              <div className="flex items-center gap-2">
                <Hexagon className="h-4 w-4" />
                {t("floorPlan.shapes.triangle")}
              </div>
            </SelectItem>
            <SelectItem value="polygon">
              <div className="flex items-center gap-2">
                <Hexagon className="h-4 w-4" />
                {t("floorPlan.shapes.polygon")}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Polygon Editor */}
      {element.shape === "polygon" && element.polygonPoints && (
        <div className="space-y-2 border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <Label>{t("floorPlan.polygonVertices")} ({element.polygonPoints.length})</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPolygonVertex}
              disabled={element.polygonPoints.length >= 20}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {element.polygonPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs w-8">{index + 1}</span>
                <Input
                  type="number"
                  value={Math.round(point.x)}
                  onChange={(e) =>
                    handleUpdatePolygonVertex(index, {
                      ...point,
                      x: parseInt(e.target.value) || 0
                    })
                  }
                  className="w-20"
                  placeholder="X"
                />
                <Input
                  type="number"
                  value={Math.round(point.y)}
                  onChange={(e) =>
                    handleUpdatePolygonVertex(index, {
                      ...point,
                      y: parseInt(e.target.value) || 0
                    })
                  }
                  className="w-20"
                  placeholder="Y"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePolygonVertex(index)}
                  disabled={element.polygonPoints!.length <= 3}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table specific: Seats */}
      {element.type === "table" && (
        <div className="space-y-2">
          <Label htmlFor="edit-seats">{t("common.seats")}</Label>
          <Input
            id="edit-seats"
            type="number"
            min="1"
            value={element.seats || ""}
            onChange={(e) =>
              onChange({
                ...element,
                seats: e.target.value ? parseInt(e.target.value) : null
              })
            }
          />
        </div>
      )}

      {/* Zone specific: Color and Description */}
      {element.type === "zone" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-color">{t("common.color")}</Label>
            <Input
              id="edit-color"
              type="color"
              value={element.color || "#3B82F6"}
              onChange={(e) => onChange({ ...element, color: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">{t("common.description")}</Label>
            <Textarea
              id="edit-description"
              value={element.description || ""}
              onChange={(e) => onChange({ ...element, description: e.target.value })}
              rows={3}
            />
          </div>
        </>
      )}

      {/* Security specific */}
      {element.type === "security" && (
        <div className="space-y-2">
          <Label htmlFor="edit-security-color">{t("common.color")}</Label>
          <Input
            id="edit-security-color"
            type="color"
            value={element.color || "#EF4444"}
            onChange={(e) => onChange({ ...element, color: e.target.value })}
          />
        </div>
      )}

      {/* Special Area specific: Color and Type */}
      {element.type === "specialArea" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-area-type">{t("floorPlan.areaType")}</Label>
            <Select
              value={element.areaType || "other"}
              onValueChange={(value) =>
                onChange({ ...element, areaType: value as SpecialAreaType })
              }
            >
              <SelectTrigger id="edit-area-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrance">{t("floorPlan.specialAreas.entrance")}</SelectItem>
                <SelectItem value="exit">{t("floorPlan.specialAreas.exit")}</SelectItem>
                <SelectItem value="kitchen">{t("floorPlan.specialAreas.kitchen")}</SelectItem>
                <SelectItem value="restroom">{t("floorPlan.specialAreas.restroom")}</SelectItem>
                <SelectItem value="bar">{t("floorPlan.specialAreas.bar")}</SelectItem>
                <SelectItem value="stage">{t("floorPlan.specialAreas.stage")}</SelectItem>
                <SelectItem value="storage">{t("floorPlan.specialAreas.storage")}</SelectItem>
                <SelectItem value="dj_booth">{t("floorPlan.specialAreas.dj_booth")}</SelectItem>
                <SelectItem value="other">{t("floorPlan.specialAreas.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-area-color">{t("common.color")}</Label>
            <Input
              id="edit-area-color"
              type="color"
              value={element.color || "#10B981"}
              onChange={(e) => onChange({ ...element, color: e.target.value })}
            />
          </div>
        </>
      )}


      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button onClick={onSave}>{t("common.save")}</Button>
      </DialogFooter>
    </div>
  );
}

// Polygon Vertex Component for dragging
interface PolygonVertexProps {
  point: Point;
  index: number;
  element: FloorPlanElement;
  allElements: FloorPlanElement[];
  onDrag: (vertexIndex: number, newPoint: Point) => void;
}

function PolygonVertex({ point, index, element, allElements, onDrag }: PolygonVertexProps) {
  const handleVertexMouseDown = (e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    const svgElement = e.currentTarget.ownerSVGElement;
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - rect.left;
      const newY = moveEvent.clientY - rect.top;

      // Constrain to element bounds
      const newPoint: Point = {
        x: Math.max(0, Math.min(element.width, newX)),
        y: Math.max(0, Math.min(element.height, newY))
      };

      // Basic collision check - prevent overlapping with other elements
      const hasCollision = allElements.some((other) => {
        if (other.id === element.id) return false;
        // Simple bounding box check for vertex area
        const vertexLeft = element.x + newPoint.x - 5;
        const vertexRight = element.x + newPoint.x + 5;
        const vertexTop = element.y + newPoint.y - 5;
        const vertexBottom = element.y + newPoint.y + 5;

        const otherLeft = other.x;
        const otherRight = other.x + other.width;
        const otherTop = other.y;
        const otherBottom = other.y + other.height;

        return !(
          vertexRight < otherLeft ||
          vertexLeft > otherRight ||
          vertexBottom < otherTop ||
          vertexTop > otherBottom
        );
      });

      if (!hasCollision) {
        onDrag(index, newPoint);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={6}
      fill="#3B82F6"
      stroke="white"
      strokeWidth={2}
      style={{ cursor: "grab" }}
      onMouseDown={handleVertexMouseDown}
    />
  );
}

// Non-Interactive View Component
interface NonInteractiveViewProps {
  elements: FloorPlanElement[];
  onEdit: (element: FloorPlanElement) => void;
  onDelete: (id: string) => void;
}

function NonInteractiveView({ elements, onEdit, onDelete }: NonInteractiveViewProps) {
  const { t } = useTranslations();
  const [filterType, setFilterType] = useState<ElementType | "all">("all");

  const filteredElements = elements.filter(
    (e) => filterType === "all" || e.type === filterType
  );

  const tables = elements.filter((e) => e.type === "table");
  const zones = elements.filter((e) => e.type === "zone");
  const specialAreas = elements.filter((e) => e.type === "specialArea");

  return (
    <div className="flex flex-1 gap-4 overflow-hidden">
      {/* List View */}
      <Card className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={filterType === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              {t("common.all")}
            </Button>
            <Button
              variant={filterType === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("table")}
            >
              {t("floorPlan.tables")} ({tables.length})
            </Button>
            <Button
              variant={filterType === "zone" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("zone")}
            >
              {t("floorPlan.zones")} ({zones.length})
            </Button>
            <Button
              variant={filterType === "specialArea" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("specialArea")}
            >
              {t("floorPlan.specialAreas.other")} ({specialAreas.length})
            </Button>
          </div>

          {/* Elements List */}
          <div className="space-y-2">
            {filteredElements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.empty")}
              </div>
            ) : (
              filteredElements.map((element) => (
                <Card key={element.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded border flex items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor:
                            element.type === "zone"
                              ? element.color || "#3B82F6"
                              : element.type === "specialArea"
                                ? element.color || "#10B981"
                                : "rgba(255, 255, 255, 0.95)",
                          color:
                            element.type === "zone" || element.type === "specialArea"
                              ? "white"
                              : "inherit"
                        }}
                      >
                        {element.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{element.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {element.type === "table" && element.seats
                            ? `${element.seats} ${t("common.seats")}`
                            : element.type === "zone"
                              ? `${t("floorPlan.zones")}`
                              : t(`floorPlan.specialAreas.${element.areaType || "other"}`)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(element)}>
                        {t("common.edit")}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(element.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

