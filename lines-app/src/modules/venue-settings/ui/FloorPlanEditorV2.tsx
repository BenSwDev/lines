"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  Circle,
  Hexagon,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Pencil,
  MoreVertical,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  Files,
  Shield,
  Bath,
  ChefHat,
  Triangle
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { saveVenueTables } from "../actions/floorPlanActions";
import { getAllTemplates } from "../utils/floorPlanTemplates";
import { findContainingZone } from "../utils/zoneContainment";
import { FreeTransform } from "./FreeTransform";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AREA_TYPE_COLORS } from "../config/floorPlanDesignTokens";
import { HistoryManager } from "../utils/historyManager";
import { ClipboardManager } from "../utils/clipboardManager";
import { AutoSaveManager } from "../utils/autoSave";
import { findAlignmentGuides, snapToGuides, calculateBounds, type AlignmentGuide } from "../utils/alignmentGuides";
import { alignElements, distributeElements, resizeToSameSize, type AlignmentType, type DistributionType } from "../utils/bulkOperations";

export type ElementShape = "rectangle" | "circle" | "triangle" | "square" | "polygon";

export type ElementType = "table" | "zone" | "specialArea" | "security" | "line";

// MapType removed - only one map per venue

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
}

const DEFAULT_TABLE_SIZE = 80;
const DEFAULT_ZONE_SIZE = 200;
const DEFAULT_AREA_SIZE = 100;
const GRID_SIZE = 20;

export function FloorPlanEditorV2({
  venueId,
  initialElements = [],
  initialCapacity = 0
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
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"interactive" | "nonInteractive">("interactive");
  const [venueCapacity, setVenueCapacity] = useState(initialCapacity);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);
  // Removed mapType - only one map per venue
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Polygon drawing mode
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  
  // Fullscreen modal
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  
  // Context panel removed - using Edit Dialog instead

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
  
  // History management (Undo/Redo)
  const historyManagerRef = useRef(new HistoryManager<FloorPlanElement>(50));
  
  // Clipboard management (Copy/Paste)
  const clipboardManagerRef = useRef(new ClipboardManager<FloorPlanElement>());
  
  // Auto-save management
  const autoSaveManagerRef = useRef<AutoSaveManager<FloorPlanElement[]> | null>(null);
  
  // Alignment guides
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [showAlignmentGuides] = useState(true);
  
  // Pan state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // Element locking and hiding
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lockedElements] = useState<Set<string>>(new Set());
  const [hiddenElements] = useState<Set<string>>(new Set());
  
  // Search/filter
  const [searchQuery, setSearchQuery] = useState("");
  
  // Minimap
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showMinimap] = useState(true);
  
  // Loading state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, _setIsLoading] = useState(false);

  // Initialize auto-save and history
  useEffect(() => {
    autoSaveManagerRef.current = new AutoSaveManager<FloorPlanElement[]>(
      async (data) => {
        // Save tables (convert elements to tables)
        const tables = data
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
            shape: e.shape,
            tableType: e.tableType || "table"
          }));
        
        await saveVenueTables(venueId, tables);
      },
      2000 // 2 second delay
    );
    
    // Initialize history with initial state
    historyManagerRef.current.push(initialElements);
    
    return () => {
      autoSaveManagerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);
  
  // Calculate canvas size to fit container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Helper function to convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Mouse position relative to container
    const containerX = screenX - containerRect.left;
    const containerY = screenY - containerRect.top;
    
    // Canvas center in container coordinates
    const canvasCenterX = containerRect.width / 2;
    const canvasCenterY = containerRect.height / 2;
    
    // Mouse position relative to canvas center (before zoom)
    const relativeX = (containerX - canvasCenterX - panOffset.x) / zoom;
    const relativeY = (containerY - canvasCenterY - panOffset.y) / zoom;
    
    // Canvas coordinates (canvas is 2000x2000, centered)
    const canvasX = relativeX + 1000; // 1000 is half of 2000
    const canvasY = relativeY + 1000;
    
    return { x: canvasX, y: canvasY };
  }, [zoom, panOffset]);
  
  // Helper function to update elements with history and auto-save
  const updateElementsWithHistory = useCallback((newElements: FloorPlanElement[], skipHistory = false) => {
    if (!skipHistory) {
      historyManagerRef.current.push(elements);
    }
    setElements(newElements);
    autoSaveManagerRef.current?.schedule(newElements);
  }, [elements]);
  
  // Undo
  const handleUndo = useCallback(() => {
    const previousState = historyManagerRef.current.undo();
    if (previousState) {
      setElements(previousState);
      autoSaveManagerRef.current?.schedule(previousState);
    }
  }, []);
  
  // Redo
  const handleRedo = useCallback(() => {
    const nextState = historyManagerRef.current.redo();
    if (nextState) {
      setElements(nextState);
      autoSaveManagerRef.current?.schedule(nextState);
    }
  }, []);
  
  // Copy
  const handleCopy = useCallback(() => {
    const selectedIds = selectedElementIds.size > 0 ? selectedElementIds : (selectedElementId ? new Set([selectedElementId]) : new Set());
    const selectedElements = elements.filter(e => selectedIds.has(e.id));
    if (selectedElements.length > 0) {
      clipboardManagerRef.current.copy(selectedElements);
      toast({
        title: t("success.copied"),
        description: t("success.copiedDescription", { count: selectedElements.length.toString() })
      });
    }
  }, [selectedElementIds, selectedElementId, elements, toast, t]);
  
  // Paste
  const handlePaste = useCallback(() => {
    const pasted = clipboardManagerRef.current.paste();
    if (pasted && pasted.length > 0) {
      const newElements = [...elements, ...pasted];
      updateElementsWithHistory(newElements);
      setSelectedElementIds(new Set(pasted.map(e => e.id)));
      toast({
        title: t("success.pasted"),
        description: t("success.pastedDescription", { count: pasted.length.toString() })
      });
    }
  }, [elements, updateElementsWithHistory, toast, t]);
  
  // Duplicate
  const handleDuplicate = useCallback(() => {
    const selectedIds = selectedElementIds.size > 0 ? selectedElementIds : (selectedElementId ? new Set([selectedElementId]) : new Set());
    const selectedElements = elements.filter(e => selectedIds.has(e.id));
    if (selectedElements.length > 0) {
      const duplicated = clipboardManagerRef.current.duplicate(selectedElements);
      const newElements = [...elements, ...duplicated];
      updateElementsWithHistory(newElements);
      setSelectedElementIds(new Set(duplicated.map(e => e.id)));
      toast({
        title: t("success.duplicated"),
        description: t("success.duplicatedDescription", { count: duplicated.length.toString() })
      });
    }
  }, [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]);
  
  // Filter elements by search query
  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) return elements;
    const query = searchQuery.toLowerCase();
    return elements.filter(el => 
      el.name.toLowerCase().includes(query) ||
      (el.type === "table" && el.seats?.toString().includes(query)) ||
      (el.type === "zone" && el.description?.toLowerCase().includes(query))
    );
  }, [elements, searchQuery]);
  
  // Bulk operations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAlign = useCallback((alignment: AlignmentType) => {
    const selectedIds = selectedElementIds.size > 0 ? selectedElementIds : (selectedElementId ? new Set([selectedElementId]) : new Set());
    if (selectedIds.size < 2) {
      toast({
        title: t("errors.validation"),
        description: "Select at least 2 elements to align",
        variant: "destructive"
      });
      return;
    }
    
    const selectedElements = elements.filter(e => selectedIds.has(e.id));
    const bounds = selectedElements.map(e => ({
      id: e.id,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height
    }));
    
    const positions = alignElements(bounds, alignment);
    const newElements = elements.map(el => {
      const pos = positions.get(el.id);
      if (pos) {
        return { ...el, x: pos.x, y: pos.y };
      }
      return el;
    });
    
    updateElementsWithHistory(newElements);
  }, [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDistribute = useCallback((distribution: DistributionType) => {
    const selectedIds = selectedElementIds.size > 0 ? selectedElementIds : (selectedElementId ? new Set([selectedElementId]) : new Set());
    if (selectedIds.size < 3) {
      toast({
        title: t("errors.validation"),
        description: "Select at least 3 elements to distribute",
        variant: "destructive"
      });
      return;
    }
    
    const selectedElements = elements.filter(e => selectedIds.has(e.id));
    const bounds = selectedElements.map(e => ({
      id: e.id,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height
    }));
    
    const positions = distributeElements(bounds, distribution);
    const newElements = elements.map(el => {
      const pos = positions.get(el.id);
      if (pos) {
        return { ...el, x: pos.x, y: pos.y };
      }
      return el;
    });
    
    updateElementsWithHistory(newElements);
  }, [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleResizeToSameSize = useCallback(() => {
    const selectedIds = selectedElementIds.size > 0 ? selectedElementIds : (selectedElementId ? new Set([selectedElementId]) : new Set());
    if (selectedIds.size < 2) {
      toast({
        title: t("errors.validation"),
        description: "Select at least 2 elements to resize",
        variant: "destructive"
      });
      return;
    }
    
    const selectedElements = elements.filter(e => selectedIds.has(e.id));
    const firstElement = selectedElements[0];
    const bounds = selectedElements.map(e => ({
      id: e.id,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height
    }));
    
    const sizes = resizeToSameSize(bounds, firstElement.width, firstElement.height);
    const newElements = elements.map(el => {
      const size = sizes.get(el.id);
      if (size) {
        return { ...el, width: size.width, height: size.height };
      }
      return el;
    });
    
    updateElementsWithHistory(newElements);
  }, [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]);
  
  // Export functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleExportPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    _setIsLoading(true);
    try {
      const { exportToPNG } = await import("../utils/exportUtils");
      await exportToPNG(canvasRef.current, `floor-plan-${Date.now()}.png`);
      toast({
        title: t("success.exported"),
        description: "Floor plan exported as PNG"
      });
        } catch {
          toast({
        title: t("errors.generic"),
        description: "Failed to export PNG",
        variant: "destructive"
      });
    } finally {
      _setIsLoading(false);
    }
  }, [toast, t]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleExportPDF = useCallback(async () => {
    if (!canvasRef.current) return;
    _setIsLoading(true);
    try {
      const { exportToPDF } = await import("../utils/exportUtils");
      await exportToPDF(canvasRef.current, `floor-plan-${Date.now()}.pdf`);
      toast({
        title: t("success.exported"),
        description: "Floor plan exported as PDF"
      });
        } catch {
          toast({
        title: t("errors.generic"),
        description: "Failed to export PDF",
        variant: "destructive"
      });
    } finally {
      _setIsLoading(false);
    }
  }, [toast, t]);

  // Add new element
  const handleAddElement = useCallback(
    (type: ElementType, areaType?: SpecialAreaType, tableType?: "table" | "bar" | "counter") => {
      const centerX = 2500; // Center of infinite canvas
      const centerY = 2500;
      const size = type === "table" ? DEFAULT_TABLE_SIZE : type === "zone" ? DEFAULT_ZONE_SIZE : DEFAULT_AREA_SIZE;

      const newElement: FloorPlanElement = {
        id: `${type}-${Date.now()}`,
        type,
        name:
          type === "table"
            ? tableType === "bar"
              ? `בר ${elements.filter((e) => e.type === "table" && e.tableType === "bar").length + 1}`
              : `שולחן ${elements.filter((e) => e.type === "table" && e.tableType !== "bar").length + 1}`
            : type === "zone"
              ? `אזור ${elements.filter((e) => e.type === "zone").length + 1}`
              : t(`floorPlan.specialAreas.${areaType || "other"}`),
        x: centerX - size / 2,
        y: centerY - size / 2,
        width: size,
        height: size,
        rotation: 0,
        shape: "rectangle",
        color: type === "zone" ? "#3B82F6" : type === "specialArea" ? "#10B981" : undefined,
        seats: type === "table" ? (tableType === "bar" ? 8 : 4) : undefined,
        tableType: type === "table" ? (tableType || "table") : undefined,
        areaType: type === "specialArea" ? areaType || "other" : undefined
      };

      const newElements = [...elements, newElement];
      updateElementsWithHistory(newElements);
      setSelectedElementId(newElement.id);
    },
    [elements, t, updateElementsWithHistory]
  );

  // Delete element
  const handleDeleteElement = useCallback(
    (id: string) => {
      const newElements = elements.filter((e) => e.id !== id);
      updateElementsWithHistory(newElements);
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
      const newSelectedIds = new Set(selectedElementIds);
      newSelectedIds.delete(id);
      setSelectedElementIds(newSelectedIds);
    },
    [elements, selectedElementId, selectedElementIds, updateElementsWithHistory]
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
  
  // Context panel removed - using Edit Dialog instead

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
      
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const mouseX = canvasPos.x;
      const mouseY = canvasPos.y;
      
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
    [viewMode, selectedElementIds, elements, isResizing, isRotating, screenToCanvas]
  );
  
  // Handle canvas mouse down for selection box or pan
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || viewMode !== "interactive" || isDrawingPolygon) return;
      if (e.target !== canvasRef.current) return; // Only on canvas, not on elements
      
      // Middle mouse button, right click, or Space + left click for panning
      if (e.button === 1 || e.button === 2 || (e.button === 0 && (e as unknown as KeyboardEvent).code === "Space")) {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      
      if (e.button !== 0) return; // Only left mouse button for selection
      
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const startX = canvasPos.x;
      const startY = canvasPos.y;
      
      setIsSelecting(true);
      setSelectionBox({ startX, startY, endX: startX, endY: startY });
      
      // If not Ctrl/Cmd, clear selection
      if (!e.ctrlKey && !e.metaKey) {
        setSelectedElementId(null);
        setSelectedElementIds(new Set());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewMode, isDrawingPolygon, screenToCanvas]
  );
  
  // Mouse wheel zoom - professional implementation like Excalidraw
  useEffect(() => {
    if (viewMode === "nonInteractive" || !containerRef.current) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Get mouse position relative to container
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Zoom with Ctrl/Cmd or Shift + wheel
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        // Calculate zoom point in canvas coordinates (before zoom)
        const worldX = (mouseX - panOffset.x) / zoom;
        const worldY = (mouseY - panOffset.y) / zoom;
        
        // Calculate new zoom (smooth zoom factor)
        const zoomFactor = 1.1;
        const newZoom = e.deltaY > 0 
          ? Math.max(0.1, zoom / zoomFactor)
          : Math.min(5, zoom * zoomFactor);
        
        // Adjust pan to keep zoom point under mouse
        const newPanX = mouseX - worldX * newZoom;
        const newPanY = mouseY - worldY * newZoom;
        
        setPanOffset({ x: newPanX, y: newPanY });
        setZoom(newZoom);
      } else {
        // Pan with regular wheel (horizontal and vertical)
        const panSpeed = 1;
        setPanOffset(prev => ({
          x: prev.x - (e.deltaX * panSpeed),
          y: prev.y - (e.deltaY * panSpeed)
        }));
      }
    };
    
    const container = containerRef.current;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [viewMode, zoom, panOffset]);

  // Handle rotate start
  const handleRotateStart = useCallback(
    (e: React.MouseEvent, element: FloorPlanElement) => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedElementId(element.id);
      setIsRotating(true);
      setDraggedElement(element);
      
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const mouseX = canvasPos.x;
      const mouseY = canvasPos.y;
      
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
    },
    [screenToCanvas]
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
      
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const mouseX = canvasPos.x;
      const mouseY = canvasPos.y;
      
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
    },
    [handleRotateStart, screenToCanvas]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (viewMode === "nonInteractive") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      // Undo (Ctrl+Z)
      if (isCtrlOrCmd && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      
      // Redo (Ctrl+Shift+Z or Ctrl+Y)
      if ((isCtrlOrCmd && e.key === "z" && e.shiftKey) || (isCtrlOrCmd && e.key === "y")) {
        e.preventDefault();
        handleRedo();
        return;
      }
      
      // Copy (Ctrl+C)
      if (isCtrlOrCmd && e.key === "c") {
        e.preventDefault();
        handleCopy();
        return;
      }
      
      // Paste (Ctrl+V)
      if (isCtrlOrCmd && e.key === "v") {
        e.preventDefault();
        handlePaste();
        return;
      }
      
      // Duplicate (Ctrl+D)
      if (isCtrlOrCmd && e.key === "d") {
        e.preventDefault();
        handleDuplicate();
        return;
      }
      
      // Select All (Ctrl+A)
      if (isCtrlOrCmd && e.key === "a") {
        e.preventDefault();
        setSelectedElementIds(new Set(elements.map(e => e.id)));
        return;
      }

      // Delete key
      if ((e.key === "Delete" || e.key === "Backspace") && (selectedElementId || selectedElementIds.size > 0)) {
        e.preventDefault();
        const idsToDelete = selectedElementIds.size > 0 ? Array.from(selectedElementIds) : [selectedElementId!];
        idsToDelete.forEach(id => handleDeleteElement(id));
        setSelectedElementIds(new Set());
        setSelectedElementId(null);
        return;
      }

      // Arrow keys for movement (only if element is selected)
      if (e.key.startsWith("Arrow") && (selectedElementId || selectedElementIds.size > 0)) {
        e.preventDefault();
        const selectedIds = selectedElementIds.size > 0 ? selectedElementIds : new Set([selectedElementId!]);
        const step = showGrid ? GRID_SIZE : (e.shiftKey ? 10 : 1);
        
        const updatedElements = elements.map((el) => {
          if (!selectedIds.has(el.id)) return el;
          
          let newX = el.x;
          let newY = el.y;

          // No canvas bounds for infinite canvas - allow free movement
          if (e.key === "ArrowLeft") newX = el.x - step;
          if (e.key === "ArrowRight") newX = el.x + step;
          if (e.key === "ArrowUp") newY = el.y - step;
          if (e.key === "ArrowDown") newY = el.y + step;

          const updatedElement = {
            ...el,
            x: newX,
            y: newY
          };

          // If moving a table, check if it's inside a zone
          let newZoneId: string | undefined = undefined;
          if (updatedElement.type === "table") {
            const zones = elements.filter((zoneEl) => zoneEl.type === "zone");
            const containingZone = findContainingZone(updatedElement, zones);
            newZoneId = containingZone?.id;
          }

          return {
            ...updatedElement,
            zoneId: newZoneId !== undefined ? newZoneId : el.zoneId
          };
        });
        
        updateElementsWithHistory(updatedElements);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, selectedElementIds, elements, canvasSize, viewMode, handleDeleteElement, showGrid, handleUndo, handleRedo, handleCopy, handlePaste, handleDuplicate, updateElementsWithHistory]);

  // Mouse move - handle dragging, resizing, and rotating
  useEffect(() => {
    if (viewMode === "nonInteractive") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      // Handle panning (Space + drag or middle mouse button or right click drag)
      if (isPanning && panStartRef.current) {
        const deltaX = (e.clientX - panStartRef.current.x);
        const deltaY = (e.clientY - panStartRef.current.y);
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Calculate canvas coordinates accounting for pan and zoom
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const canvasX = canvasPos.x;
      const canvasY = canvasPos.y;
      
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
                
                // Calculate bounds for alignment guides
                const movingBounds = calculateBounds(newX, newY, el.width, el.height);
                const otherElements = prevElements
                  .filter(e => !selectedIds.has(e.id))
                  .map(e => calculateBounds(e.x, e.y, e.width, e.height));
                
                // Find alignment guides
                const guides = showAlignmentGuides ? findAlignmentGuides(movingBounds, otherElements) : [];
                setAlignmentGuides(guides);
                
                // Snap to guides if found
                if (guides.length > 0) {
                  const snapped = snapToGuides(movingBounds, guides);
                  newX = snapped.x;
                  newY = snapped.y;
                }
                
                // Snap to grid if enabled
                if (showGrid) {
                  newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                  newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
                }
                
                // No canvas bounds constraint for infinite canvas
                // Allow elements to move freely
                
                const updatedElement = {
                  ...el,
                  x: newX,
                  y: newY
                };

                // Check if element is inside a zone (for tables and other elements)
                let newZoneId: string | undefined = undefined;
                if (updatedElement.type === "table" || updatedElement.type === "security") {
                  const zones = prevElements.filter((zoneEl) => zoneEl.type === "zone");
                  const containingZone = findContainingZone(updatedElement, zones);
                  newZoneId = containingZone?.id;
                  // If element left the zone, remove zoneId
                  if (!containingZone && el.zoneId) {
                    newZoneId = undefined;
                  }
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
      setIsPanning(false);
      panStartRef.current = null;
    };

    if (isDragging || isResizing || isRotating || isSelecting || isPanning) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isResizing, isRotating, isSelecting, selectionBox, draggedElement, resizeHandle, elements, canvasSize, viewMode, showGrid, zoom, selectedElementIds, selectedElementId, isPanning, panOffset, showAlignmentGuides]);
  
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
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const x = canvasPos.x;
        const y = canvasPos.y;
        setPolygonPoints([...polygonPoints, { x, y }]);
      } else if (e.target === canvasRef.current) {
        setSelectedElementId(null);
      }
    },
    [viewMode, isDrawingPolygon, polygonPoints, screenToCanvas]
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
      
      const newElements = [...elements, newElement];
      updateElementsWithHistory(newElements);
      setPolygonPoints([]);
      setIsDrawingPolygon(false);
    }
  }, [polygonPoints, elements, updateElementsWithHistory]);
  
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
            {/* Primary Action: Create Map */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setTemplateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t("floorPlan.createMap")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("floorPlan.createMapTooltip")}</TooltipContent>
            </Tooltip>
            
            {/* Secondary: Quick Add Elements */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t("floorPlan.addElement")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleAddElement("table")}>
                      <Square className="ml-2 h-4 w-4" />
                      {t("floorPlan.addTable")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddElement("table", undefined, "bar")}>
                      <Square className="ml-2 h-4 w-4" />
                      {t("floorPlan.addBar")}
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
                      <ChefHat className="ml-2 h-4 w-4" />
                      {t("floorPlan.specialAreas.kitchen")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddElement("specialArea", "restroom")}>
                      <Bath className="ml-2 h-4 w-4" />
                      {t("floorPlan.specialAreas.restroom")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>{t("floorPlan.addElementTooltip")}</TooltipContent>
            </Tooltip>
            
            {/* Edit Actions Group */}
            <div className="flex items-center gap-1 border-l pl-2 ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={!historyManagerRef.current.canUndo()}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={!historyManagerRef.current.canRedo()}
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={selectedElementIds.size === 0 && !selectedElementId}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy (Ctrl+C)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePaste}
                    disabled={!clipboardManagerRef.current.hasData()}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Paste (Ctrl+V)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    disabled={selectedElementIds.size === 0 && !selectedElementId}
                  >
                    <Files className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
              </Tooltip>
            </div>
            
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
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
              </TooltipTrigger>
              <TooltipContent>{t("floorPlan.moreOptions")}</TooltipContent>
            </Tooltip>
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
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

        {/* Main Content - Canvas Only (Panel moved to overlay) */}
        <div className="flex flex-1 overflow-hidden">
          {viewMode === "interactive" ? (
            <>
              <Card ref={containerRef} className="relative flex-1 overflow-hidden p-0">
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{ 
                    cursor: isPanning ? "grabbing" : "grab",
                    position: "relative"
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="absolute cursor-crosshair bg-gradient-to-br from-muted/20 to-muted/40"
                    style={{
                      width: "2000px",
                      height: "2000px",
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom})`,
                      transformOrigin: "center center",
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
            {/* Alignment Guides Visualization */}
            {showAlignmentGuides && alignmentGuides.map((guide, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  [guide.type === "vertical" ? "left" : "top"]: `${guide.position}px`,
                  [guide.type === "vertical" ? "width" : "height"]: "1px",
                  [guide.type === "vertical" ? "height" : "width"]: guide.type === "vertical" ? `${canvasSize.height}px` : `${canvasSize.width}px`,
                  backgroundColor: "#3B82F6",
                  opacity: 0.5,
                  pointerEvents: "none",
                  zIndex: 997
                }}
              />
            ))}
            
            {/* Render Elements - Zones first (lower z-index), then other elements */}
            {filteredElements
              .filter((element) => !hiddenElements.has(element.id))
              .sort((a, b) => {
                // Zones first (z-index 1), then other elements (z-index 10)
                if (a.type === "zone" && b.type !== "zone") return -1;
                if (a.type !== "zone" && b.type === "zone") return 1;
                return 0;
              })
              .map((element) => (
                <ElementRenderer
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id || selectedElementIds.has(element.id)}
                  isInteractive={true}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onDoubleClick={() => handleEditElement(element)}
                  onEdit={() => {
                    const elementToEdit = elements.find(e => e.id === element.id);
                    if (elementToEdit) {
                      handleEditElement(elementToEdit);
                    }
                  }}
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
                </div>
              </Card>
            </>
          ) : (
            <NonInteractiveView
              elements={elements}
              onEdit={handleEditElement}
              onDelete={handleDeleteElement}
            />
          )}
        </div>

      {/* Context Panel removed - using Edit Dialog instead when edit button is clicked */}

      {/* Template Selection Dialog - Professional Map Creation */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("floorPlan.createMap")}</DialogTitle>
            <DialogDescription>{t("floorPlan.createMapDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Event Venues Category */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{t("floorPlan.categories.eventVenues")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAllTemplates()
                  .filter(t => ["event_hall", "conference_hall", "concert_hall"].includes(t.id))
                  .map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary"
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
                        <h4 className="font-semibold mb-2 text-lg">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{template.elements.length} {t("floorPlan.elements")}</span>
                          <span>{template.defaultCapacity} {t("common.seats")}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Dining & Entertainment Category */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{t("floorPlan.categories.diningEntertainment")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAllTemplates()
                  .filter(t => ["restaurant", "bar", "club"].includes(t.id))
                  .map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary"
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
                        <h4 className="font-semibold mb-2 text-lg">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{template.elements.length} {t("floorPlan.elements")}</span>
                          <span>{template.defaultCapacity} {t("common.seats")}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Start from Scratch */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{t("floorPlan.categories.custom")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAllTemplates()
                  .filter(t => t.id === "empty")
                  .map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary border-dashed"
                      onClick={() => {
                        setElements([]);
                        setVenueCapacity(0);
                        setTemplateDialogOpen(false);
                        toast({
                          title: t("success.templateLoaded"),
                          description: t("success.templateLoadedDescription", { name: template.name })
                        });
                      }}
                    >
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 text-lg">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("floorPlan.startFromScratch")}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
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
                {/* Render Elements - Zones first (lower z-index), then other elements */}
                {elements
                  .sort((a, b) => {
                    // Zones first (z-index 1), then other elements (z-index 10)
                    if (a.type === "zone" && b.type !== "zone") return -1;
                    if (a.type !== "zone" && b.type === "zone") return 1;
                    return 0;
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
  onEdit?: () => void;
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
  onEdit,
  onVertexDrag,
  allElements = [],
  onResizeStart,
  onRotateStart
}: ElementRendererProps) {
  // Find the zone this element belongs to (for visual feedback and color inheritance)
  const parentZone = element.zoneId
    ? allElements.find((el) => el.id === element.zoneId && el.type === "zone")
    : null;

  const getElementStyle = (): React.CSSProperties => {
    // Determine border color based on zone membership - inherit from zone
    let borderColor = isSelected ? "#3B82F6" : "rgba(0,0,0,0.3)";
    if (element.type === "zone") {
      // Zones have colored border
      borderColor = element.color || "#3B82F6";
    } else if (parentZone && !isSelected) {
      // Use zone color for border if element is in a zone - inherit zone color
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
      border: element.type === "zone" 
        ? `2px dashed ${borderColor}` // Zones have dashed border
        : isSelected 
          ? `2px solid ${borderColor}` 
          : `2px solid ${borderColor}`,
      backgroundColor: (() => {
        if (element.type === "zone") {
          return "transparent"; // Zones have transparent background
        }
        if (element.type === "specialArea") {
          return element.color || `${AREA_TYPE_COLORS[element.areaType || "other"]}33`; // 20% opacity
        }
        if (element.type === "security") {
          return parentZone 
            ? `${parentZone.color || AREA_TYPE_COLORS.zone}20` // Inherit zone color for security in zone
            : element.color || `${AREA_TYPE_COLORS.other}33`; // 20% opacity
        }
        if (element.type === "table" && parentZone) {
          return `${parentZone.color || AREA_TYPE_COLORS.zone}20`; // Inherit zone color for tables in zone
        }
        if (isSelected) {
          return "rgba(59, 130, 246, 0.15)";
        }
        return AREA_TYPE_COLORS.table; // White for tables
      })(),
      zIndex: element.type === "zone" ? 1 : 10, // Zones always have lower z-index
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
    if (element.shape === "square") {
      return { ...baseStyle, borderRadius: "4px" };
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
    if (element.shape === "square") {
      // Square is handled by CSS, but we can add it here for consistency
      return "";
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
                   (element.shape === "polygon" && element.polygonPoints && element.polygonPoints.length >= 3) ||
                   element.shape === "square";

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
          cursor: isInteractive ? (isSelected ? "move" : "grab") : "default",
          zIndex: element.type === "zone" ? 1 : 10 // Zones always have lower z-index
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
                ? "transparent" // Zones have transparent background
                : element.type === "specialArea"
                  ? element.color || "rgba(16, 185, 129, 0.2)"
                  : element.type === "security"
                    ? element.color || "rgba(239, 68, 68, 0.2)"
                    : parentZone
                      ? `${parentZone.color || "#3B82F6"}20` // Inherit zone color
                      : isSelected
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(255, 255, 255, 0.95)"
            }
            stroke={element.type === "zone" ? (element.color || "#3B82F6") : (isSelected ? "#3B82F6" : "rgba(0,0,0,0.3)")}
            strokeWidth={2}
            strokeDasharray={element.type === "zone" ? "5,5" : "none"}
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
          className="pointer-events-none text-center px-1 absolute inset-0 flex flex-col items-center justify-center"
          style={{
            clipPath: `url(#polygon-${element.id})`
          }}
        >
          {/* Icons for special areas */}
          {element.type === "security" && (
            <Shield className="h-6 w-6 mb-1" style={{ color: element.color || "#EF4444" }} />
          )}
          {element.type === "specialArea" && element.areaType === "restroom" && (
            <Bath className="h-6 w-6 mb-1" style={{ color: element.color || "#06B6D4" }} />
          )}
          {element.type === "specialArea" && element.areaType === "kitchen" && (
            <ChefHat className="h-6 w-6 mb-1" style={{ color: element.color || "#F59E0B" }} />
          )}
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
      <div className="pointer-events-none text-center px-1 flex flex-col items-center justify-center h-full">
        {/* Icons for special areas */}
        {element.type === "security" && (
          <Shield className="h-6 w-6 mb-1" style={{ color: element.color || "#EF4444" }} />
        )}
        {element.type === "specialArea" && element.areaType === "restroom" && (
          <Bath className="h-6 w-6 mb-1" style={{ color: element.color || "#06B6D4" }} />
        )}
        {element.type === "specialArea" && element.areaType === "kitchen" && (
          <ChefHat className="h-6 w-6 mb-1" style={{ color: element.color || "#F59E0B" }} />
        )}
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
      {/* Edit button - always visible on hover/selection */}
      {isInteractive && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit();
          }}
          className="absolute top-1 right-1 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 data-[selected]:opacity-100 border-2 border-white"
          data-selected={isSelected ? "" : undefined}
          title="עריכה"
          style={{
            opacity: isSelected ? 1 : undefined
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
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
            <SelectItem value="square">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                {t("floorPlan.shapes.square")}
              </div>
            </SelectItem>
            <SelectItem value="triangle">
              <div className="flex items-center gap-2">
                <Triangle className="h-4 w-4" />
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

