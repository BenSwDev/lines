"use client";

import { useState, useRef, useCallback, useEffect, useMemo, memo } from "react";
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
import { Progress } from "@/components/ui/progress";
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
  Trash2,
  Save,
  Grid,
  Layout,
  List,
  X,
  Sparkles,
  Minimize2,
  Maximize2,
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
  CheckCircle2,
  Info,
  HelpCircle,
  BookOpen,
  Hand,
  Users,
  Wand2,
  AlertCircle
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { saveVenueFloorPlan } from "../actions/floorPlanActions";
import { getAllTemplates } from "../utils/floorPlanTemplates";
import { saveTemplate } from "../actions/templateActions";
import { findContainingZone } from "../utils/zoneContainment";
import { FreeTransform } from "./FreeTransform";
import { AddElementDialog } from "./AddElementDialog";
import { QuickAddDialog } from "./QuickAddDialog";
import { QuickEditPanel } from "./QuickEditPanel";
import {
  getTableDefaults,
  getZoneDefaults,
  getAreaDefaults,
  getNextElementName
} from "../utils/smartDefaults";
import {
  getZoneTypeConfig,
  getElementTypeConfig,
  type ZoneType,
  type ElementCategory
} from "../config/zoneAndElementTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AREA_TYPE_COLORS } from "../config/floorPlanDesignTokens";
import { HistoryManager } from "../utils/historyManager";
import { ClipboardManager } from "../utils/clipboardManager";
import { AutoSaveManager } from "../utils/autoSave";
import {
  findAlignmentGuides,
  snapToGuides,
  calculateBounds,
  type AlignmentGuide
} from "../utils/alignmentGuides";
import { EmptyState } from "./UX/EmptyState";
import { ContextualToolbar } from "./UX/ContextualToolbar";
import { SuccessAnimation } from "./UX/SuccessAnimation";
import { HelpPanel } from "./UX/HelpPanel";
import { ContextAwareSidebar } from "./Sidebar/ContextAwareSidebar";
import { useDevice } from "../hooks/useDevice";
// import { arrangeInGrid } from "../utils/smartAutoArrangement"; // Reserved for future use
// import { ResponsiveDialog } from "./Dialogs/ResponsiveDialog"; // Reserved for future use
import {
  alignElements,
  distributeElements,
  resizeToSameSize,
  type AlignmentType,
  type DistributionType
} from "../utils/bulkOperations";

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
  showStools?: boolean; // Show bar stools (default: false for bars)
  minimumPrice?: number | null; // Minimum order price
  pricePerSeat?: number | null; // Price per seat (for bars)
  // Zone specific
  description?: string | null;
  zoneType?:
    | "tables_zone"
    | "entrance_zone"
    | "dance_floor"
    | "vip_zone"
    | "bar_area"
    | "seating_area"
    | "standing_area"
    | "custom";
  zoneMinimumPrice?: number | null; // Minimum price for entire zone
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
  userId?: string;
}

const DEFAULT_TABLE_SIZE = 80;
const DEFAULT_ZONE_SIZE = 200;
const DEFAULT_AREA_SIZE = 100;
export const GRID_SIZE = 20;

export function FloorPlanEditorV2({
  venueId,
  initialElements = [],
  initialCapacity = 0,
  userId
}: FloorPlanEditorV2Props) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const device = useDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<FloorPlanElement[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [saveHistory, setSaveHistory] = useState<
    Array<{
      timestamp: Date;
      tablesCount: number;
      zonesCount: number;
      areasCount: number;
    }>
  >([]);
  const [showGrid, setShowGrid] = useState(true); // Grid always enabled for clean alignment
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"interactive" | "nonInteractive">("interactive");
  const [venueCapacity, setVenueCapacity] = useState(initialCapacity);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);
  // Removed mapType - only one map per venue
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [addElementDialogOpen, setAddElementDialogOpen] = useState(false);
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);
  const [quickEditPanelOpen, setQuickEditPanelOpen] = useState(false);
  const [quickEditPosition, setQuickEditPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0.3);
  const [showRuler, setShowRuler] = useState(false);
  const [scale, setScale] = useState(1); // 1px = scale meters
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [layers, setLayers] = useState({
    zones: { visible: true, locked: false },
    tables: { visible: true, locked: false },
    specialAreas: { visible: true, locked: false }
  });
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  // Custom templates removed - using only recommended templates for simplicity
  // const [customTemplates, setCustomTemplates] = useState<...>([]);

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
  const relativePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const dragAnimationFrameRef = useRef<number | null>(null);

  // Resize state - support all 8 handles
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<
    "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w" | null
  >(null);
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
  const rotateStartRef = useRef<{
    angle: number;
    centerX: number;
    centerY: number;
    startAngle: number;
  } | null>(null);
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

  // Pan mode vs Select mode
  const [panMode, setPanMode] = useState(true); // false = select mode, true = pan/drag mode (default)

  // Selection mode state - activated by long press
  const [selectionMode, setSelectionMode] = useState(false);

  // Simple Mode - simplified interface for easy use
  const [simpleMode, setSimpleMode] = useState(true); // Default to simple mode

  // Long press detection
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressThreshold = 500; // 500ms for long press
  const longPressStartRef = useRef<{
    x: number;
    y: number;
    element: FloorPlanElement | null;
  } | null>(null);

  // Element locking and hiding
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lockedElements] = useState<Set<string>>(new Set());
  const [hiddenElements] = useState<Set<string>>(new Set());

  // Search/filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [filterElementType, setFilterElementType] = useState<ElementType | "all">("all");

  // Minimap
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showMinimap] = useState(true);

  // Loading state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, _setIsLoading] = useState(false);

  // Load custom templates
  useEffect(() => {
    if (userId) {
      // Custom templates removed - using only recommended templates for simplicity
      // loadUserTemplates(userId, venueId).then((result) => { ... });
    }
  }, [userId, venueId]);

  // Initialize auto-save and history
  useEffect(() => {
    autoSaveManagerRef.current = new AutoSaveManager<FloorPlanElement[]>(
      async (data) => {
        // Save all elements (tables, zones, venue areas)
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
            shape: e.shape as "rectangle" | "circle" | "triangle" | "square" | "polygon",
            zoneId: e.zoneId,
            color: e.color
          }));

        const zones = data
          .filter((e) => e.type === "zone")
          .map((e) => ({
            id: e.id,
            name: e.name,
            color: e.color || "#3B82F6",
            description: e.description,
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
            shape: e.shape as "rectangle" | "circle" | "triangle" | "square" | "polygon",
            polygonPoints: e.polygonPoints
          }));

        const venueAreas = data
          .filter((e) => e.type === "specialArea")
          .map((e) => ({
            id: e.id,
            name: e.name,
            areaType: e.areaType || "other",
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
            rotation: e.rotation,
            shape: e.shape as "rectangle" | "circle" | "triangle" | "square" | "polygon",
            color: e.color,
            icon: e.icon
          }));

        await saveVenueFloorPlan(venueId, tables, zones, venueAreas);
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
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
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
    },
    [zoom, panOffset]
  );

  // Helper function to update elements with history and auto-save
  const updateElementsWithHistory = useCallback(
    (newElements: FloorPlanElement[], skipHistory = false) => {
      if (!skipHistory) {
        historyManagerRef.current.push(elements);
      }
      setElements(newElements);
      autoSaveManagerRef.current?.schedule(newElements);
    },
    [elements]
  );

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
    const selectedIds =
      selectedElementIds.size > 0
        ? selectedElementIds
        : selectedElementId
          ? new Set([selectedElementId])
          : new Set();
    const selectedElements = elements.filter((e) => selectedIds.has(e.id));
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
      setSelectedElementIds(new Set(pasted.map((e) => e.id)));
      toast({
        title: t("success.pasted"),
        description: t("success.pastedDescription", { count: pasted.length.toString() })
      });
    }
  }, [elements, updateElementsWithHistory, toast, t]);

  // Duplicate
  const handleDuplicate = useCallback(() => {
    const selectedIds =
      selectedElementIds.size > 0
        ? selectedElementIds
        : selectedElementId
          ? new Set([selectedElementId])
          : new Set();
    const selectedElements = elements.filter((e) => selectedIds.has(e.id));
    if (selectedElements.length > 0) {
      const duplicated = clipboardManagerRef.current.duplicate(selectedElements);
      const newElements = [...elements, ...duplicated];
      updateElementsWithHistory(newElements);
      setSelectedElementIds(new Set(duplicated.map((e) => e.id)));
      toast({
        title: t("success.duplicated"),
        description: t("success.duplicatedDescription", { count: duplicated.length.toString() })
      });
    }
  }, [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]);

  // Filter elements by search query
  const filteredElements = useMemo(() => {
    let filtered = elements;

    // Filter by element type
    if (filterElementType !== "all") {
      filtered = filtered.filter((el) => el.type === filterElementType);
    }

    // Filter by zone
    if (filterZone) {
      filtered = filtered.filter((el) => el.zoneId === filterZone);
    }

    // Search query - search in name, description, notes, seats
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((el) => {
        const nameMatch = el.name.toLowerCase().includes(query);
        const descriptionMatch = el.description?.toLowerCase().includes(query);
        const notesMatch = el.notes?.toLowerCase().includes(query);
        const seatsMatch = el.seats?.toString().includes(query);
        const zoneNameMatch = el.zoneId
          ? elements
              .find((z) => z.id === el.zoneId && z.type === "zone")
              ?.name.toLowerCase()
              .includes(query)
          : false;

        return nameMatch || descriptionMatch || notesMatch || seatsMatch || zoneNameMatch;
      });
    }

    return filtered;
  }, [elements, searchQuery, filterZone, filterElementType]);

  // Get unique zones for filter dropdown
  const availableZones = useMemo(() => {
    return elements.filter((el) => el.type === "zone");
  }, [elements]);

  // Get selected elements array for ContextualToolbar
  const selectedElements = useMemo(() => {
    const selectedIds =
      selectedElementIds.size > 0
        ? selectedElementIds
        : selectedElementId
          ? new Set([selectedElementId])
          : new Set();
    return elements.filter((e) => selectedIds.has(e.id));
  }, [selectedElementIds, selectedElementId, elements]);

  // Bulk operations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAlign = useCallback(
    (alignment: AlignmentType) => {
      const selectedIds =
        selectedElementIds.size > 0
          ? selectedElementIds
          : selectedElementId
            ? new Set([selectedElementId])
            : new Set();
      if (selectedIds.size < 2) {
        toast({
          title: t("errors.validation"),
          description: "Select at least 2 elements to align",
          variant: "destructive"
        });
        return;
      }

      const selectedElements = elements.filter((e) => selectedIds.has(e.id));
      const bounds = selectedElements.map((e) => ({
        id: e.id,
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height
      }));

      const positions = alignElements(bounds, alignment);
      const newElements = elements.map((el) => {
        const pos = positions.get(el.id);
        if (pos) {
          return { ...el, x: pos.x, y: pos.y };
        }
        return el;
      });

      updateElementsWithHistory(newElements);
    },
    [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDistribute = useCallback(
    (distribution: DistributionType) => {
      const selectedIds =
        selectedElementIds.size > 0
          ? selectedElementIds
          : selectedElementId
            ? new Set([selectedElementId])
            : new Set();
      if (selectedIds.size < 3) {
        toast({
          title: t("errors.validation"),
          description: "Select at least 3 elements to distribute",
          variant: "destructive"
        });
        return;
      }

      const selectedElements = elements.filter((e) => selectedIds.has(e.id));
      const bounds = selectedElements.map((e) => ({
        id: e.id,
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height
      }));

      const positions = distributeElements(bounds, distribution);
      const newElements = elements.map((el) => {
        const pos = positions.get(el.id);
        if (pos) {
          return { ...el, x: pos.x, y: pos.y };
        }
        return el;
      });

      updateElementsWithHistory(newElements);
    },
    [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]
  );

  // Wrapper functions for ContextualToolbar (must be after _handleAlign and _handleDistribute)
  const handleContextualAlign = useCallback(
    (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
      const alignmentMap: Record<string, AlignmentType> = {
        left: "left",
        center: "center",
        right: "right",
        top: "top",
        middle: "middle",
        bottom: "bottom"
      };
      _handleAlign(alignmentMap[type] || "left");
    },
    [_handleAlign]
  );

  const handleContextualDistribute = useCallback(
    (type: "horizontal" | "vertical") => {
      const distributionMap: Record<string, DistributionType> = {
        horizontal: "horizontal",
        vertical: "vertical"
      };
      _handleDistribute(distributionMap[type] || "horizontal");
    },
    [_handleDistribute]
  );

  const handleContextualDuplicate = useCallback(() => {
    handleDuplicate();
  }, [handleDuplicate]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleResizeToSameSize = useCallback(() => {
    const selectedIds =
      selectedElementIds.size > 0
        ? selectedElementIds
        : selectedElementId
          ? new Set([selectedElementId])
          : new Set();
    if (selectedIds.size < 2) {
      toast({
        title: t("errors.validation"),
        description: "Select at least 2 elements to resize",
        variant: "destructive"
      });
      return;
    }

    const selectedElements = elements.filter((e) => selectedIds.has(e.id));
    const firstElement = selectedElements[0];
    const bounds = selectedElements.map((e) => ({
      id: e.id,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height
    }));

    const sizes = resizeToSameSize(bounds, firstElement.width, firstElement.height);
    const newElements = elements.map((el) => {
      const size = sizes.get(el.id);
      if (size) {
        return { ...el, width: size.width, height: size.height };
      }
      return el;
    });

    updateElementsWithHistory(newElements);
  }, [selectedElementIds, selectedElementId, elements, updateElementsWithHistory, toast, t]);

  // Export functions
  const handleExportPNG = useCallback(async () => {
    if (!containerRef.current) return;
    setIsSaving(true);
    try {
      const { exportToPNG } = await import("../utils/exportUtils");
      await exportToPNG(containerRef.current, `floor-plan-${Date.now()}.png`);
      toast({
        title: t("success.exported") || "הייצוא הושלם",
        description: "המפה יוצאה כ-PNG"
      });
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : "נכשל בייצוא PNG",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast, t]);

  const handleExportPDF = useCallback(async () => {
    if (!containerRef.current) return;
    setIsSaving(true);
    try {
      const { exportToPDF } = await import("../utils/exportUtils");
      await exportToPDF(containerRef.current, `floor-plan-${Date.now()}.pdf`);
      toast({
        title: t("success.exported") || "הייצוא הושלם",
        description: "המפה יוצאה כ-PDF"
      });
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : "נכשל בייצוא PDF",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast, t]);

  const handleExportJPEG = useCallback(async () => {
    if (!containerRef.current) return;
    setIsSaving(true);
    try {
      const { exportToJPEG } = await import("../utils/exportUtils");
      await exportToJPEG(containerRef.current, `floor-plan-${Date.now()}.jpg`);
      toast({
        title: t("success.exported") || "הייצוא הושלם",
        description: "המפה יוצאה כ-JPEG"
      });
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : "נכשל בייצוא JPEG",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast, t]);

  // Auto-link elements to zones - automatically connect tables/elements to containing zones
  // MUST be defined before handleAddZone and other functions that use it
  const autoLinkElementsToZones = useCallback(
    (elementsToLink: FloorPlanElement[]): FloorPlanElement[] => {
      const zones = elementsToLink.filter((el) => el.type === "zone");
      if (zones.length === 0) return elementsToLink; // No zones, nothing to link

      return elementsToLink.map((element) => {
        // Only link tables and other elements that can be in zones (not zones themselves)
        if (element.type === "zone" || element.type === "specialArea") {
          return element; // Don't link zones or special areas
        }

        // Always find the current containing zone (even if already linked to another)
        // This ensures that if an element is moved from zone A to zone B, it gets updated to zone B
        const containingZone = findContainingZone(element, zones);

        if (containingZone) {
          // Element is in a zone - link to it (even if it was linked to a different zone before)
          return {
            ...element,
            zoneId: containingZone.id
          };
        }

        // No containing zone found - remove zoneId if it exists
        if (element.zoneId) {
          return {
            ...element,
            zoneId: undefined
          };
        }

        return element;
      });
    },
    []
  );

  // Quick Add Handlers - using smart defaults
  const handleQuickAddTable = useCallback(() => {
    const centerX = 1000;
    const centerY = 1000;
    const defaults = getTableDefaults(elements);

    // Snap to grid
    const snappedX = Math.round((centerX - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round((centerY - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedSize = Math.round(defaults.size / GRID_SIZE) * GRID_SIZE;

    const newElement: FloorPlanElement = {
      id: `table-${Date.now()}`,
      type: "table",
      name: defaults.name,
      x: snappedX,
      y: snappedY,
      width: snappedSize,
      height: snappedSize,
      rotation: 0,
      shape: "rectangle",
      color: defaults.color,
      seats: defaults.seats,
      tableType: "table"
    };

    const newElements = [...elements, newElement];
    const linkedElements = autoLinkElementsToZones(newElements);
    updateElementsWithHistory(linkedElements);
    setSelectedElementId(newElement.id);
  }, [elements, updateElementsWithHistory, autoLinkElementsToZones]);

  // Bulk Add - Add 5 tables at once
  const handleBulkAddTables = useCallback(() => {
    const centerX = 1000;
    const centerY = 1000;
    const newTables: FloorPlanElement[] = [];

    for (let i = 0; i < 5; i++) {
      const defaults = getTableDefaults([...elements, ...newTables]);
      const offsetX = (i % 3) * (defaults.size + GRID_SIZE * 2);
      const offsetY = Math.floor(i / 3) * (defaults.size + GRID_SIZE * 2);

      const snappedX = Math.round((centerX - defaults.size / 2 + offsetX) / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round((centerY - defaults.size / 2 + offsetY) / GRID_SIZE) * GRID_SIZE;
      const snappedSize = Math.round(defaults.size / GRID_SIZE) * GRID_SIZE;

      newTables.push({
        id: `table-${Date.now()}-${i}`,
        type: "table",
        name: defaults.name,
        x: snappedX,
        y: snappedY,
        width: snappedSize,
        height: snappedSize,
        rotation: 0,
        shape: "rectangle",
        color: defaults.color,
        seats: defaults.seats,
        tableType: "table"
      });
    }

    const newElements = [...elements, ...newTables];
    const linkedElements = autoLinkElementsToZones(newElements);
    updateElementsWithHistory(linkedElements);
    setSelectedElementIds(new Set(newTables.map((t) => t.id)));
    toast({
      title: t("success.tablesAdded") || "שולחנות נוספו",
      description: t("success.tablesAddedDescription", { count: "5" }) || "5 שולחנות נוספו בהצלחה"
    });
  }, [elements, updateElementsWithHistory, autoLinkElementsToZones, toast, t]);

  const handleQuickAddZone = useCallback(() => {
    const centerX = 1000;
    const centerY = 1000;
    const defaults = getZoneDefaults(elements);

    // Snap to grid
    const snappedX = Math.round((centerX - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round((centerY - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedSize = Math.round(defaults.size / GRID_SIZE) * GRID_SIZE;

    const newElement: FloorPlanElement = {
      id: `zone-${Date.now()}`,
      type: "zone",
      name: defaults.name,
      x: snappedX,
      y: snappedY,
      width: snappedSize,
      height: snappedSize,
      rotation: 0,
      shape: "rectangle",
      color: defaults.color,
      zoneType: defaults.type
    };

    const newElements = [...elements, newElement];
    const linkedElements = autoLinkElementsToZones(newElements);
    updateElementsWithHistory(linkedElements);
    setSelectedElementId(newElement.id);
  }, [elements, updateElementsWithHistory, autoLinkElementsToZones]);

  const handleQuickAddArea = useCallback(() => {
    const centerX = 1000;
    const centerY = 1000;
    const defaults = getAreaDefaults(elements);

    // Snap to grid
    const snappedX = Math.round((centerX - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round((centerY - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedSize = Math.round(defaults.size / GRID_SIZE) * GRID_SIZE;

    const newElement: FloorPlanElement = {
      id: `area-${Date.now()}`,
      type: "specialArea",
      name: defaults.name,
      x: snappedX,
      y: snappedY,
      width: snappedSize,
      height: snappedSize,
      rotation: 0,
      shape: "rectangle",
      color: defaults.color,
      areaType: defaults.type
    };

    const newElements = [...elements, newElement];
    const linkedElements = autoLinkElementsToZones(newElements);
    updateElementsWithHistory(linkedElements);
    setSelectedElementId(newElement.id);
  }, [elements, updateElementsWithHistory, autoLinkElementsToZones]);

  // Handle adding zone with zone type (for advanced mode)
  const handleAddZone = useCallback(
    (zoneType: ZoneType) => {
      const centerX = 1000;
      const centerY = 1000;
      const zoneConfig = getZoneTypeConfig(zoneType);
      const size = DEFAULT_ZONE_SIZE;

      // Snap to grid for clean alignment
      const snappedX = Math.round((centerX - size / 2) / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round((centerY - size / 2) / GRID_SIZE) * GRID_SIZE;
      const snappedSize = Math.round(size / GRID_SIZE) * GRID_SIZE;

      const newElement: FloorPlanElement = {
        id: `zone-${Date.now()}`,
        type: "zone",
        name: getNextElementName("zone", elements, zoneConfig.label),
        x: snappedX,
        y: snappedY,
        width: snappedSize,
        height: snappedSize,
        rotation: 0,
        shape: "rectangle",
        color: zoneConfig.defaultColor,
        zoneType: zoneType
      };

      const newElements = [...elements, newElement];
      // Auto-link elements to zones after adding new zone (existing elements might now be inside it)
      const linkedElements = autoLinkElementsToZones(newElements);
      updateElementsWithHistory(linkedElements);
      setSelectedElementId(newElement.id);
    },
    [elements, updateElementsWithHistory, autoLinkElementsToZones]
  );

  // Handle adding element with element category
  const handleAddElementByCategory = useCallback(
    (elementCategory: ElementCategory) => {
      const centerX = 1000;
      const centerY = 1000;
      const elementConfig = getElementTypeConfig(elementCategory);
      const size = elementConfig.defaultSize;

      // Map element category to ElementType
      let type: ElementType;
      let areaType: SpecialAreaType | undefined;
      let tableType: "table" | "bar" | "counter" | undefined;

      if (elementCategory === "table") {
        type = "table";
        tableType = "table";
      } else if (elementCategory === "bar") {
        type = "table";
        tableType = "bar";
      } else if (elementCategory === "security") {
        type = "security";
      } else if (
        ["entrance", "exit", "kitchen", "restroom", "dj", "stage", "storage"].includes(
          elementCategory
        )
      ) {
        type = "specialArea";
        areaType = elementCategory === "dj" ? "dj_booth" : (elementCategory as SpecialAreaType);
      } else {
        type = "table";
        tableType = "table";
      }

      // Snap to grid for clean alignment and consistent sizing
      const snappedX = Math.round((centerX - size.width / 2) / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round((centerY - size.height / 2) / GRID_SIZE) * GRID_SIZE;
      const snappedWidth = Math.round(size.width / GRID_SIZE) * GRID_SIZE;
      const snappedHeight = Math.round(size.height / GRID_SIZE) * GRID_SIZE;

      const newElement: FloorPlanElement = {
        id: `${type}-${Date.now()}`,
        type,
        name: getNextElementName(type, elements, elementConfig.label),
        x: snappedX,
        y: snappedY,
        width: snappedWidth,
        height: snappedHeight,
        rotation: 0,
        shape: "rectangle",
        color: elementConfig.defaultColor,
        seats: type === "table" ? (tableType === "bar" ? 8 : 4) : undefined,
        tableType: type === "table" ? tableType || "table" : undefined,
        areaType: type === "specialArea" ? areaType || "other" : undefined
      };

      const newElements = [...elements, newElement];
      // Auto-link new element to zone if it's inside one
      const linkedElements = autoLinkElementsToZones(newElements);
      updateElementsWithHistory(linkedElements);
      setSelectedElementId(newElement.id);
    },
    [elements, updateElementsWithHistory, autoLinkElementsToZones]
  );

  // Add new element (legacy - for backward compatibility - kept for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddElement = useCallback(
    (type: ElementType, areaType?: SpecialAreaType, tableType?: "table" | "bar" | "counter") => {
      const centerX = 1000; // Center of infinite canvas (middle of 2000x2000 canvas)
      const centerY = 1000;
      const size =
        type === "table"
          ? DEFAULT_TABLE_SIZE
          : type === "zone"
            ? DEFAULT_ZONE_SIZE
            : DEFAULT_AREA_SIZE;

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
        tableType: type === "table" ? tableType || "table" : undefined,
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

  // Wrapper for ContextualToolbar delete action
  const handleContextualDelete = useCallback(() => {
    const selectedIds =
      selectedElementIds.size > 0
        ? selectedElementIds
        : selectedElementId
          ? new Set([selectedElementId as string])
          : new Set<string>();
    selectedIds.forEach((id) => handleDeleteElement(id));
    setSelectedElementIds(new Set());
    setSelectedElementId(null);
  }, [selectedElementIds, selectedElementId, handleDeleteElement]);

  // Handle editing element - Quick Edit for simple mode, Full Edit for advanced
  const handleEditElement = useCallback(
    (element: FloorPlanElement, event?: React.MouseEvent) => {
      if (simpleMode && event) {
        // Quick Edit Panel - show at mouse position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          setQuickEditPosition({
            x: event.clientX - rect.left + 20,
            y: event.clientY - rect.top + 20
          });
          setEditingElement(element);
          setQuickEditPanelOpen(true);
        }
      } else {
        // Full Edit Dialog
        setEditingElement({ ...element });
        setEditDialogOpen(true);
      }
    },
    [simpleMode]
  );

  // Handle Quick Edit Save
  const handleQuickEditSave = useCallback(
    (updates: Partial<FloorPlanElement>) => {
      if (!editingElement) return;

      const updatedElement = { ...editingElement, ...updates };
      const updatedElements = elements.map((e) =>
        e.id === editingElement.id ? updatedElement : e
      );

      // Auto-link after update
      const linkedElements = autoLinkElementsToZones(updatedElements);
      updateElementsWithHistory(linkedElements);
      setQuickEditPanelOpen(false);
      setEditingElement(null);
      setQuickEditPosition(null);
    },
    [editingElement, elements, updateElementsWithHistory, autoLinkElementsToZones]
  );

  // Handle Quick Edit Cancel
  const handleQuickEditCancel = useCallback(() => {
    setQuickEditPanelOpen(false);
    setEditingElement(null);
    setQuickEditPosition(null);
  }, []);

  // Save edited element
  const handleSaveEdit = useCallback(() => {
    if (!editingElement) return;

    // If disconnecting elements from zone, update those elements too
    const updatedElements = elements.map((e) => {
      if (e.id === editingElement.id) {
        return editingElement;
      }
      // If zone was edited and element's zoneId was removed, update it
      if (editingElement.type === "zone" && e.zoneId === editingElement.id) {
        // Check if element is still in zone bounds
        const isStillInZone = findContainingZone(e, [editingElement]);
        if (!isStillInZone) {
          return { ...e, zoneId: undefined };
        }
      }
      return e;
    });

    // Auto-link elements to zones after editing
    const linkedElements = autoLinkElementsToZones(updatedElements);
    setElements(linkedElements);
    updateElementsWithHistory(linkedElements);
    setEditDialogOpen(false);
    setEditingElement(null);
  }, [editingElement, elements, updateElementsWithHistory, autoLinkElementsToZones]);

  // Handle element save from Properties Panel
  const handleSaveElement = useCallback(
    (updates: Partial<FloorPlanElement>) => {
      if (!selectedElementId) return;

      const updatedElements = elements.map((e) =>
        e.id === selectedElementId ? { ...e, ...updates } : e
      );

      // Auto-link after update
      const linkedElements = autoLinkElementsToZones(updatedElements);
      updateElementsWithHistory(linkedElements);
    },
    [selectedElementId, elements, updateElementsWithHistory, autoLinkElementsToZones]
  );

  // Handle layer visibility toggle
  const handleToggleLayerVisibility = useCallback((layer: "zones" | "tables" | "specialAreas") => {
    setLayers((prev) => ({
      ...prev,
      [layer]: { ...prev[layer], visible: !prev[layer].visible }
    }));
  }, []);

  // Handle layer lock toggle
  const handleToggleLayerLock = useCallback((layer: "zones" | "tables" | "specialAreas") => {
    setLayers((prev) => ({
      ...prev,
      [layer]: { ...prev[layer], locked: !prev[layer].locked }
    }));
  }, []);

  // Handle bulk actions
  const handleBulkAction = useCallback(
    (action: string, elementIds: string[]) => {
      if (action === "delete") {
        elementIds.forEach((id) => handleDeleteElement(id));
      } else if (action === "changeColor") {
        // TODO: Implement color change dialog
        toast({
          title: t("floorPlan.colorChange") || "שינוי צבע",
          description: t("floorPlan.colorChangeDescription") || "פונקציה זו תהיה זמינה בקרוב"
        });
      } else if (action === "moveToZone") {
        // TODO: Implement zone move dialog
        toast({
          title: t("floorPlan.moveToZone") || "העבר לאזור",
          description: t("floorPlan.moveToZoneDescription") || "פונקציה זו תהיה זמינה בקרוב"
        });
      }
    },
    [handleDeleteElement, toast, t]
  );

  // Context panel removed - using Edit Dialog instead

  // Mouse down on element
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, element: FloorPlanElement) => {
      if (viewMode === "nonInteractive") return;

      // Don't start drag if we're already resizing or rotating
      if (isResizing || isRotating) return;

      e.stopPropagation();
      e.preventDefault();

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const mouseX = canvasPos.x;
      const mouseY = canvasPos.y;

      // Store position for long press detection
      longPressStartRef.current = { x: e.clientX, y: e.clientY, element };

      // Cancel any existing long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // If in selection mode, handle selection first
      if (selectionMode) {
        // Determine new selection based on modifier keys
        let newSelection: Set<string>;
        let newSelectedElementId: string | null;

        if (e.shiftKey) {
          // Shift+Click: Duplicate element
          e.preventDefault();
          e.stopPropagation();
          const duplicated = clipboardManagerRef.current.duplicate([element]);
          const newElements = [...elements, ...duplicated];
          const linkedElements = autoLinkElementsToZones(newElements);
          updateElementsWithHistory(linkedElements);
          setSelectedElementId(duplicated[0].id);
          toast({
            title: t("success.duplicated"),
            description: t("success.duplicatedDescription", { count: "1" })
          });
          return;
        }

        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Click: Add to selection (multi-select)
          newSelection = new Set(selectedElementIds);
          if (newSelection.has(element.id)) {
            newSelection.delete(element.id);
            if (newSelection.size === 0) {
              newSelectedElementId = null;
            } else if (newSelection.size === 1) {
              newSelectedElementId = Array.from(newSelection)[0];
            } else {
              newSelectedElementId = selectedElementId === element.id ? null : selectedElementId;
            }
          } else {
            newSelection.add(element.id);
            newSelectedElementId = element.id;
          }
        } else {
          // Regular click: Select only this element
          newSelection = new Set([element.id]);
          newSelectedElementId = element.id;
        }

        setSelectedElementIds(newSelection);
        setSelectedElementId(newSelectedElementId);

        // Store drag start position for when user starts dragging
        dragStartPosRef.current = { x: mouseX, y: mouseY };

        // Prepare for potential drag of selected items
        const selectedIds = newSelection;
        const movingZones = elements.filter((el) => selectedIds.has(el.id) && el.type === "zone");
        const containedElementIds = new Set<string>();
        const elementToZoneMap = new Map<string, string>();

        movingZones.forEach((zone) => {
          elements.forEach((el) => {
            if (el.zoneId === zone.id && !selectedIds.has(el.id)) {
              containedElementIds.add(el.id);
              elementToZoneMap.set(el.id, zone.id);
            }
          });
        });

        const allMovingIds = new Set([...selectedIds, ...containedElementIds]);

        dragElementsStartPosRef.current.clear();
        relativePositionsRef.current.clear();

        allMovingIds.forEach((id) => {
          const el = elements.find((e) => e.id === id);
          if (el) {
            dragElementsStartPosRef.current.set(id, { x: el.x, y: el.y });

            const zoneId = elementToZoneMap.get(id);
            if (zoneId) {
              const zone = elements.find((e) => e.id === zoneId);
              if (zone) {
                relativePositionsRef.current.set(id, {
                  x: el.x - zone.x,
                  y: el.y - zone.y
                });
              }
            }
          }
        });

        return; // Don't start dragging immediately in selection mode
      }

      // Default drag mode: start dragging immediately
      // Determine new selection based on modifier keys
      let newSelection: Set<string>;
      let newSelectedElementId: string | null;

      if (e.shiftKey && selectedElementIds.size > 0) {
        newSelection = new Set(selectedElementIds);
        const selectedIds = Array.from(selectedElementIds);
        const lastSelected = elements.find((el) => el.id === selectedIds[selectedIds.length - 1]);
        if (lastSelected) {
          const startX = Math.min(lastSelected.x, element.x);
          const endX = Math.max(lastSelected.x + lastSelected.width, element.x + element.width);
          const startY = Math.min(lastSelected.y, element.y);
          const endY = Math.max(lastSelected.y + lastSelected.height, element.y + element.height);

          elements.forEach((el) => {
            if (
              el.x >= startX &&
              el.x + el.width <= endX &&
              el.y >= startY &&
              el.y + el.height <= endY
            ) {
              newSelection.add(el.id);
            }
          });
        } else {
          newSelection.add(element.id);
        }
        newSelectedElementId = element.id;
      } else if (e.ctrlKey || e.metaKey) {
        newSelection = new Set(selectedElementIds);
        if (newSelection.has(element.id)) {
          newSelection.delete(element.id);
          if (newSelection.size === 0) {
            newSelectedElementId = null;
          } else if (newSelection.size === 1) {
            newSelectedElementId = Array.from(newSelection)[0];
          } else {
            newSelectedElementId = selectedElementId === element.id ? null : selectedElementId;
          }
        } else {
          newSelection.add(element.id);
          newSelectedElementId = element.id;
        }
      } else {
        newSelection = new Set([element.id]);
        newSelectedElementId = element.id;
      }

      setSelectedElementIds(newSelection);
      setSelectedElementId(newSelectedElementId);

      // Store drag start position
      dragStartPosRef.current = { x: mouseX, y: mouseY };

      // Store initial positions of all selected elements
      const selectedIds = newSelection;

      const movingZones = elements.filter((el) => selectedIds.has(el.id) && el.type === "zone");
      const containedElementIds = new Set<string>();
      const elementToZoneMap = new Map<string, string>();

      movingZones.forEach((zone) => {
        elements.forEach((el) => {
          if (el.zoneId === zone.id && !selectedIds.has(el.id)) {
            containedElementIds.add(el.id);
            elementToZoneMap.set(el.id, zone.id);
          }
        });
      });

      const allMovingIds = new Set([...selectedIds, ...containedElementIds]);

      dragElementsStartPosRef.current.clear();
      relativePositionsRef.current.clear();

      allMovingIds.forEach((id) => {
        const el = elements.find((e) => e.id === id);
        if (el) {
          dragElementsStartPosRef.current.set(id, { x: el.x, y: el.y });

          const zoneId = elementToZoneMap.get(id);
          if (zoneId) {
            const zone = elements.find((e) => e.id === zoneId);
            if (zone) {
              relativePositionsRef.current.set(id, {
                x: el.x - zone.x,
                y: el.y - zone.y
              });
            }
          }
        }
      });

      // Start long press timer - if held long enough, enter selection mode
      longPressTimerRef.current = setTimeout(() => {
        setSelectionMode(true);
        setPanMode(false);
        longPressTimerRef.current = null;
      }, longPressThreshold);

      // Start dragging immediately in default mode
      historyManagerRef.current.push(elements);
      setIsDragging(true);
      setDraggedElement(element);
    },
    [
      viewMode,
      selectedElementIds,
      selectedElementId,
      elements,
      isResizing,
      isRotating,
      screenToCanvas,
      selectionMode,
      longPressThreshold
    ]
  );

  // Handle canvas mouse down for selection box or pan
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || viewMode !== "interactive" || isDrawingPolygon) return;

      // Check if click is on canvas (not on an element)
      const target = e.target as HTMLElement;
      const isDirectCanvasClick = target === canvasRef.current;

      // If not direct canvas click, check if we clicked on empty space
      if (!isDirectCanvasClick) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const clickedElement = elements.find((el) => {
          if (el.type === "zone" && el.polygonPoints) {
            return false;
          }
          return (
            canvasPos.x >= el.x &&
            canvasPos.x <= el.x + el.width &&
            canvasPos.y >= el.y &&
            canvasPos.y <= el.y + el.height
          );
        });

        // If clicked on an element, let element handler deal with it
        if (clickedElement) return;
      }

      // Middle mouse button, right click, or Space + left click for panning
      if (
        e.button === 1 ||
        e.button === 2 ||
        (e.button === 0 && (e as unknown as KeyboardEvent).code === "Space")
      ) {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (e.button !== 0) return; // Only left mouse button for selection

      // Get canvas position
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const startX = canvasPos.x;
      const startY = canvasPos.y;

      // Store position for long press detection
      longPressStartRef.current = { x: e.clientX, y: e.clientY, element: null };

      // Cancel any existing long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // If in selection mode, start selection box
      if (selectionMode) {
        setIsSelecting(true);
        setSelectionBox({ startX, startY, endX: startX, endY: startY });

        // Clear selection only if not using modifier keys
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          setSelectedElementId(null);
          setSelectedElementIds(new Set());
        }
        return;
      }

      // Default drag mode: start panning immediately on empty canvas
      // Start long press timer - if held long enough, enter selection mode
      longPressTimerRef.current = setTimeout(() => {
        setSelectionMode(true);
        setPanMode(false);
        setIsSelecting(true);
        setSelectionBox({ startX, startY, endX: startX, endY: startY });
        longPressTimerRef.current = null;
      }, longPressThreshold);

      // Start panning immediately
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };

      // Clear selection only if not using modifier keys
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setSelectedElementId(null);
        setSelectedElementIds(new Set());
      }
    },
    [viewMode, isDrawingPolygon, screenToCanvas, elements, selectionMode, longPressThreshold]
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

        // Calculate new zoom (smooth zoom factor) - no minimum limit for infinite canvas
        const zoomFactor = 1.1;
        const newZoom =
          e.deltaY > 0
            ? Math.max(0.01, zoom / zoomFactor) // Allow very small zoom for infinite canvas
            : Math.min(10, zoom * zoomFactor); // Increased max zoom

        // Adjust pan to keep zoom point under mouse
        const newPanX = mouseX - worldX * newZoom;
        const newPanY = mouseY - worldY * newZoom;

        setPanOffset({ x: newPanX, y: newPanY });
        setZoom(newZoom);
      } else {
        // Pan with regular wheel (horizontal and vertical)
        const panSpeed = 1;
        setPanOffset((prev) => ({
          x: prev.x - e.deltaX * panSpeed,
          y: prev.y - e.deltaY * panSpeed
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

      // Save current state to history before starting rotate
      historyManagerRef.current.push(elements);

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
    [screenToCanvas, elements]
  );

  // Handle resize start - support all 8 handles (not rotate)
  const handleResizeStart = useCallback(
    (
      e: React.MouseEvent,
      element: FloorPlanElement,
      handle: "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w" | "rotate"
    ) => {
      if (handle === "rotate") {
        handleRotateStart(e, element);
        return;
      }
      e.stopPropagation();
      e.preventDefault();

      // Prevent drag when resizing
      setIsDragging(false);
      dragStartPosRef.current = null;

      // Save current state to history before starting resize
      historyManagerRef.current.push(elements);

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
    [handleRotateStart, screenToCanvas, elements]
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
        setSelectedElementIds(new Set(elements.map((e) => e.id)));
        return;
      }

      // Delete key
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        (selectedElementId || selectedElementIds.size > 0)
      ) {
        e.preventDefault();
        const idsToDelete =
          selectedElementIds.size > 0 ? Array.from(selectedElementIds) : [selectedElementId!];
        idsToDelete.forEach((id) => handleDeleteElement(id));
        setSelectedElementIds(new Set());
        setSelectedElementId(null);
        return;
      }

      // Arrow keys for movement (only if element is selected)
      if (e.key.startsWith("Arrow") && (selectedElementId || selectedElementIds.size > 0)) {
        e.preventDefault();
        const selectedIds =
          selectedElementIds.size > 0 ? selectedElementIds : new Set([selectedElementId!]);
        // Always use grid size for clean alignment (grid is always enabled)
        const step = e.shiftKey ? GRID_SIZE * 5 : GRID_SIZE;

        const updatedElements = elements.map((el) => {
          if (!selectedIds.has(el.id)) return el;

          let newX = el.x;
          let newY = el.y;

          // Move with arrow keys
          if (e.key === "ArrowLeft") newX = el.x - step;
          if (e.key === "ArrowRight") newX = el.x + step;
          if (e.key === "ArrowUp") newY = el.y - step;
          if (e.key === "ArrowDown") newY = el.y + step;

          // Snap to grid for clean alignment
          newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

          const updatedElement = {
            ...el,
            x: newX,
            y: newY
          };

          return updatedElement;
        });

        // Auto-link elements to zones after moving (especially important if zone was moved)
        const linkedElements = autoLinkElementsToZones(updatedElements);
        updateElementsWithHistory(linkedElements);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElementId,
    selectedElementIds,
    elements,
    canvasSize,
    viewMode,
    handleDeleteElement,
    autoLinkElementsToZones,
    updateElementsWithHistory,
    showGrid,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleDuplicate
  ]);

  // Mouse move - handle dragging, resizing, and rotating
  useEffect(() => {
    if (viewMode === "nonInteractive") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      // Cancel long press timer if mouse moved (indicates drag, not long press)
      if (longPressTimerRef.current && longPressStartRef.current) {
        const moveThreshold = 5; // pixels
        const deltaX = Math.abs(e.clientX - longPressStartRef.current.x);
        const deltaY = Math.abs(e.clientY - longPressStartRef.current.y);

        if (deltaX > moveThreshold || deltaY > moveThreshold) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }

      // In selection mode: if we have selected items and mouse moves, start dragging them
      if (selectionMode && !isDragging && !isSelecting && !isPanning && longPressStartRef.current) {
        const selectedIds: Set<string> =
          selectedElementIds.size > 0
            ? selectedElementIds
            : selectedElementId
              ? new Set<string>([selectedElementId])
              : new Set<string>();

        if (selectedIds.size > 0) {
          // Check if mouse moved enough to start dragging
          const moveThreshold = 3; // pixels
          const deltaX = Math.abs(e.clientX - longPressStartRef.current.x);
          const deltaY = Math.abs(e.clientY - longPressStartRef.current.y);

          if (deltaX > moveThreshold || deltaY > moveThreshold) {
            // Start dragging all selected items
            const canvasPos = screenToCanvas(e.clientX, e.clientY);
            dragStartPosRef.current = { x: canvasPos.x, y: canvasPos.y };

            // Store initial positions
            const movingZones = elements.filter(
              (el) => selectedIds.has(el.id) && el.type === "zone"
            );
            const containedElementIds = new Set<string>();
            const elementToZoneMap = new Map<string, string>();

            movingZones.forEach((zone) => {
              elements.forEach((el) => {
                if (el.zoneId === zone.id && !selectedIds.has(el.id)) {
                  containedElementIds.add(el.id);
                  elementToZoneMap.set(el.id, zone.id);
                }
              });
            });

            const allMovingIds = new Set<string>([...selectedIds, ...containedElementIds]);

            dragElementsStartPosRef.current.clear();
            relativePositionsRef.current.clear();

            allMovingIds.forEach((id) => {
              const el = elements.find((e) => e.id === id);
              if (el) {
                dragElementsStartPosRef.current.set(id, { x: el.x, y: el.y });

                const zoneId = elementToZoneMap.get(id);
                if (zoneId) {
                  const zone = elements.find((e) => e.id === zoneId);
                  if (zone) {
                    relativePositionsRef.current.set(id, {
                      x: el.x - zone.x,
                      y: el.y - zone.y
                    });
                  }
                }
              }
            });

            historyManagerRef.current.push(elements);
            setIsDragging(true);
            setDraggedElement(elements.find((el) => selectedIds.has(el.id)) || null);
            // Exit selection mode and enter drag mode
            setSelectionMode(false);
            setPanMode(true);
          }
        }
      }

      // Handle panning (Space + drag or middle mouse button or right click drag)
      if (isPanning && panStartRef.current) {
        const deltaX = e.clientX - panStartRef.current.x;
        const deltaY = e.clientY - panStartRef.current.y;
        setPanOffset((prev) => ({
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
          const selectedIds =
            selectedElementIds.size > 0
              ? selectedElementIds
              : selectedElementId
                ? new Set([selectedElementId])
                : new Set();

          // Update all selected elements
          setElements((prevElements) => {
            // Check if we're moving a zone - if so, move all contained elements too
            const movingZones = prevElements.filter(
              (el) => selectedIds.has(el.id) && el.type === "zone"
            );
            const containedElementIds = new Set<string>();
            movingZones.forEach((zone) => {
              prevElements.forEach((el) => {
                if (el.zoneId === zone.id && !selectedIds.has(el.id)) {
                  containedElementIds.add(el.id);
                }
              });
            });

            // Combine selected IDs with contained element IDs
            const allMovingIds = new Set([...selectedIds, ...containedElementIds]);

            return prevElements.map((el) => {
              if (allMovingIds.has(el.id)) {
                const startPos = dragElementsStartPosRef.current.get(el.id);
                if (!startPos) {
                  return el;
                }

                // Check if this is a contained element (has relative position stored)
                const relativePos = relativePositionsRef.current.get(el.id);

                if (relativePos) {
                  // This is a contained element - move it relative to its parent zone
                  const parentZone = movingZones.find((z) => el.zoneId === z.id);
                  if (parentZone) {
                    const zoneStartPos = dragElementsStartPosRef.current.get(parentZone.id);
                    if (zoneStartPos) {
                      // Calculate new zone position
                      const newZoneX = zoneStartPos.x + deltaX;
                      const newZoneY = zoneStartPos.y + deltaY;

                      // Apply relative position
                      return {
                        ...el,
                        x: newZoneX + relativePos.x,
                        y: newZoneY + relativePos.y
                      };
                    }
                  }
                }

                // For directly selected elements (including zones), use their start position
                let newX = startPos.x + deltaX;
                let newY = startPos.y + deltaY;

                // Calculate bounds for alignment guides
                const movingBounds = calculateBounds(newX, newY, el.width, el.height);
                const otherElements = prevElements
                  .filter((e) => !selectedIds.has(e.id))
                  .map((e) => calculateBounds(e.x, e.y, e.width, e.height));

                // Find alignment guides
                const guides = showAlignmentGuides
                  ? findAlignmentGuides(movingBounds, otherElements)
                  : [];
                setAlignmentGuides(guides);

                // Snap to guides if found
                if (guides.length > 0) {
                  const snapped = snapToGuides(movingBounds, guides);
                  newX = snapped.x;
                  newY = snapped.y;
                }

                // Always snap to grid for clean alignment (grid is always enabled)
                newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

                // No canvas bounds constraint for infinite canvas
                // Allow elements to move freely

                const updatedElement = {
                  ...el,
                  x: newX,
                  y: newY
                };

                return updatedElement;
              }
              return el;
            });
          });

          // Update dragged element for visual feedback
          const startPos = dragElementsStartPosRef.current.get(draggedElement.id);
          if (startPos) {
            let newX = startPos.x + deltaX;
            let newY = startPos.y + deltaY;

            // Always snap to grid for clean alignment
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

            // No canvas bounds constraint for infinite canvas - allow free movement

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

          // Handle corner resizing - simple 2D calculations
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

          // Always snap to grid for clean alignment and consistent sizing
          newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
          newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE;
          newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

          // Ensure minimum size after snapping
          if (newWidth < GRID_SIZE) newWidth = GRID_SIZE;
          if (newHeight < GRID_SIZE) newHeight = GRID_SIZE;

          // No canvas bounds constraint for infinite canvas - allow free resizing
          // Ensure minimum size (already done above)

          // Update element position and size
          const updatedElement = {
            ...draggedElement,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          };

          // If resizing a table or security element, check if it's still inside a zone
          let newZoneId: string | undefined = undefined;
          if (updatedElement.type === "table" || updatedElement.type === "security") {
            const zones = elements.filter((el) => el.type === "zone");
            const containingZone = findContainingZone(updatedElement, zones);

            if (containingZone) {
              // Element is still in a zone
              newZoneId = containingZone.id;
            } else {
              // Element left the zone or is not in any zone
              newZoneId = undefined;
            }
          }

          setElements((prevElements) =>
            prevElements.map((el) =>
              el.id === draggedElement.id
                ? {
                    ...updatedElement,
                    zoneId: newZoneId
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
          const normalizedAngle = (((start.angle + angleDelta) % 360) + 360) % 360;

          // Update element with new rotation
          const rotatedElement = {
            ...draggedElement,
            rotation: normalizedAngle
          };

          // If rotating a table or security element, check if it's still inside a zone
          let newZoneId: string | undefined = undefined;
          if (rotatedElement.type === "table" || rotatedElement.type === "security") {
            const zones = elements.filter((el) => el.type === "zone");
            const containingZone = findContainingZone(rotatedElement, zones);

            if (containingZone) {
              // Element is still in a zone
              newZoneId = containingZone.id;
            } else {
              // Element left the zone or is not in any zone
              newZoneId = undefined;
            }
          }

          setElements((prevElements) =>
            prevElements.map((el) =>
              el.id === draggedElement.id
                ? {
                    ...rotatedElement,
                    zoneId: newZoneId
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
      // Cancel long press timer if still active
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

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
        const selected = elements.filter((el) => {
          const elCenterX = el.x + el.width / 2;
          const elCenterY = el.y + el.height / 2;
          return elCenterX >= minX && elCenterX <= maxX && elCenterY >= minY && elCenterY <= maxY;
        });

        if (selected.length > 0) {
          // Standard behavior: selection box replaces previous selection
          const selectedIds = new Set(selected.map((el) => el.id));
          setSelectedElementIds(selectedIds);
          if (selected.length === 1) {
            setSelectedElementId(selected[0].id);
          } else {
            setSelectedElementId(null); // Multi-select: no single selected element
          }
        } else {
          // Empty selection box on empty canvas: clear selection (standard behavior)
          setSelectedElementId(null);
          setSelectedElementIds(new Set());
        }

        setIsSelecting(false);
        setSelectionBox(null);
      }

      // Clean up drag state (history already saved at start)
      // IMPORTANT: After drag, keep selection (don't clear it) - standard behavior like Photoshop/Illustrator
      if (isDragging) {
        dragStartPosRef.current = null;
        dragElementsStartPosRef.current.clear();
        // Clear alignment guides when drag ends - no leftover lines on canvas
        setAlignmentGuides([]);
        // Selection is preserved - this is the standard behavior
      }

      // Clean up resize state (history already saved at start)
      if (isResizing) {
        resizeStartRef.current = null;
        // Clear alignment guides when resize ends
        setAlignmentGuides([]);
      }

      // Clean up rotate state (history already saved at start)
      if (isRotating) {
        rotateStartRef.current = null;
        // Clear alignment guides when rotate ends
        setAlignmentGuides([]);
      }

      setIsDragging(false);
      setDraggedElement(null);
      setIsResizing(false);
      setResizeHandle(null);
      setIsRotating(false);
      setIsPanning(false);
      panStartRef.current = null;
      longPressStartRef.current = null;
    };

    // Always listen in interactive mode to handle all interactions including long press
    if (viewMode === "interactive") {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    isRotating,
    isSelecting,
    selectionBox,
    draggedElement,
    resizeHandle,
    elements,
    canvasSize,
    viewMode,
    showGrid,
    zoom,
    selectedElementIds,
    selectedElementId,
    isPanning,
    panOffset,
    showAlignmentGuides,
    selectionMode,
    screenToCanvas,
    panMode,
    relativePositionsRef,
    dragElementsStartPosRef
  ]);

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Only handle Escape when typing
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y" && !e.shiftKey)
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl/Cmd + C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        if (selectedElementIds.size > 0 || selectedElementId) {
          handleCopy();
        }
      }
      // Ctrl/Cmd + V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePaste();
      }
      // Delete: Delete selected element(s)
      if (e.key === "Delete" || e.key === "Backspace") {
        const selectedIds: Set<string> =
          selectedElementIds.size > 0
            ? selectedElementIds
            : selectedElementId
              ? new Set([selectedElementId])
              : new Set<string>();
        if (selectedIds.size > 0) {
          // Check if any selected element is locked
          const selectedElements = elements.filter((el) => selectedIds.has(el.id));
          const isAnyLocked = selectedElements.some(
            (el) =>
              (el.type === "zone" && layers.zones.locked) ||
              (el.type === "table" && layers.tables.locked) ||
              (el.type === "specialArea" && layers.specialAreas.locked)
          );
          if (!isAnyLocked) {
            e.preventDefault();
            // Delete all selected elements
            selectedIds.forEach((id) => {
              handleDeleteElement(id);
            });
          }
        }
      }
      // Escape: Exit selection mode, deselect, or exit fullscreen
      if (e.key === "Escape") {
        if (isFullscreen) {
          e.preventDefault();
          setIsFullscreen(false);
        } else if (selectionMode) {
          e.preventDefault();
          setSelectionMode(false);
          setPanMode(true); // Return to default drag mode
          setSelectedElementId(null);
          setSelectedElementIds(new Set());
        } else {
          setSelectedElementId(null);
          setSelectedElementIds(new Set());
        }
      }
      // Arrow keys: Move selected element(s)
      const selectedIds =
        selectedElementIds.size > 0
          ? selectedElementIds
          : selectedElementId
            ? new Set([selectedElementId])
            : new Set();
      if (selectedIds.size > 0) {
        const selectedElements = elements.filter((el) => selectedIds.has(el.id));
        const isAnyLocked = selectedElements.some(
          (el) =>
            (el.type === "zone" && layers.zones.locked) ||
            (el.type === "table" && layers.tables.locked) ||
            (el.type === "specialArea" && layers.specialAreas.locked)
        );
        if (!isAnyLocked && selectedElements.length > 0) {
          // Always use grid size for clean alignment (grid is always enabled)
          const step = e.shiftKey ? GRID_SIZE * 5 : GRID_SIZE;
          let deltaX = 0;
          let deltaY = 0;

          if (e.key === "ArrowLeft") {
            e.preventDefault();
            deltaX = -step;
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            deltaX = step;
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            deltaY = -step;
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            deltaY = step;
          }

          if (deltaX !== 0 || deltaY !== 0) {
            const updatedElements = elements.map((el: FloorPlanElement) => {
              if (selectedIds.has(el.id)) {
                let newX = el.x + deltaX;
                let newY = el.y + deltaY;

                // Snap to grid for clean alignment
                newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

                // No canvas bounds for infinite canvas - allow free movement
                return { ...el, x: newX, y: newY };
              }
              return el;
            });
            // Auto-link elements to zones after moving with keyboard
            const linkedElements = autoLinkElementsToZones(updatedElements);
            updateElementsWithHistory(linkedElements);
          }
        }
      }
      // F11: Toggle fullscreen
      if (e.key === "F11") {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElementId,
    selectedElementIds,
    elements,
    layers,
    handleUndo,
    handleRedo,
    autoLinkElementsToZones,
    updateElementsWithHistory,
    handleCopy,
    handlePaste,
    handleDeleteElement,
    isFullscreen,
    setIsFullscreen,
    selectionMode,
    setSelectionMode,
    setPanMode
  ]);

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

  // Validation constants
  const CANVAS_SIZE = 2000;

  // Collision checking removed - users can overlap elements if they want

  // Simplified validation - only critical errors (warnings, not blocking)
  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];
    elements.forEach((element) => {
      // Only check for extremely small elements (less than 10px is probably a mistake)
      if (element.width < 10 || element.height < 10) {
        warnings.push(
          `האלמנט "${element.name}" קטן מאוד (${Math.round(element.width)}x${Math.round(element.height)}px)`
        );
      }

      // Only warn if element is completely outside canvas (partial overlap is OK)
      if (
        element.x + element.width < 0 ||
        element.y + element.height < 0 ||
        element.x > CANVAS_SIZE ||
        element.y > CANVAS_SIZE
      ) {
        warnings.push(`האלמנט "${element.name}" נמצא מחוץ לגבולות המפה`);
      }
    });
    return warnings;
  }, [elements]);

  const hasValidationWarnings = validationWarnings.length > 0;

  // Auto-fix validation warnings (optional - not blocking)
  const handleAutoFix = useCallback(() => {
    if (!hasValidationWarnings) {
      toast({
        title: "אין אזהרות",
        description: "המפה תקינה",
        variant: "default"
      });
      return;
    }

    // Save current state to history before auto-fix
    historyManagerRef.current.push(elements);

    let fixedCount = 0;
    const fixedElements: FloorPlanElement[] = [...elements];
    const fixes: string[] = [];

    // Fix 1: Size warnings - resize elements that are extremely small (< 10px)
    fixedElements.forEach((element, index) => {
      if (element.width < 10 || element.height < 10) {
        const newWidth = Math.max(20, element.width);
        const newHeight = Math.max(20, element.height);
        fixedElements[index] = {
          ...element,
          width: newWidth,
          height: newHeight
        };
        fixes.push(`גודל "${element.name}" תוקן ל-${newWidth}x${newHeight}px`);
        fixedCount++;
      }
    });

    // Fix 2: Position warnings - move elements that are completely outside canvas
    fixedElements.forEach((element, index) => {
      const isCompletelyOutside =
        element.x + element.width < 0 ||
        element.y + element.height < 0 ||
        element.x > CANVAS_SIZE ||
        element.y > CANVAS_SIZE;

      if (isCompletelyOutside) {
        let newX = element.x;
        let newY = element.y;

        // Fix X position
        if (newX < 0) {
          newX = 0;
        } else if (newX + element.width > CANVAS_SIZE) {
          newX = CANVAS_SIZE - element.width;
        }

        // Fix Y position
        if (newY < 0) {
          newY = 0;
        } else if (newY + element.height > CANVAS_SIZE) {
          newY = CANVAS_SIZE - element.height;
        }

        // Ensure element is not pushed outside (in case it's larger than canvas)
        if (element.width > CANVAS_SIZE) {
          fixedElements[index] = {
            ...fixedElements[index],
            width: CANVAS_SIZE,
            x: 0
          };
        }
        if (element.height > CANVAS_SIZE) {
          fixedElements[index] = {
            ...fixedElements[index],
            height: CANVAS_SIZE,
            y: 0
          };
        }

        if (newX !== element.x || newY !== element.y) {
          fixedElements[index] = {
            ...fixedElements[index],
            x: newX,
            y: newY
          };
          fixes.push(`מיקום "${element.name}" תוקן ל-(${Math.round(newX)}, ${Math.round(newY)})`);
          fixedCount++;
        }
      }
    });

    // No collision fixing - collisions/overlaps are allowed (users can place elements as they want)

    // Apply fixes
    updateElementsWithHistory(fixedElements, true); // Skip history since we already saved

    // Show results
    toast({
      title: `תיקון אוטומטי הושלם`,
      description: `תוקנו ${fixedCount} בעיות. ${fixes.length > 0 ? fixes.slice(0, 3).join(", ") : ""}${
        fixes.length > 3 ? " ועוד..." : ""
      }`,
      variant: "default",
      duration: 5000
    });
  }, [hasValidationWarnings, elements, updateElementsWithHistory, toast]);

  // Save confirmation dialog handler
  const handleSaveClick = useCallback(() => {
    setSaveConfirmDialogOpen(true);
  }, []);

  // Actual save function
  const handleSave = useCallback(async () => {
    if (capacityError) {
      toast({
        title: t("errors.validation"),
        description: t("floorPlan.capacityTooSmall"),
        variant: "destructive"
      });
      return;
    }

    // Show warnings but allow saving
    if (hasValidationWarnings) {
      toast({
        title: "שימו לב",
        description: `יש ${validationWarnings.length} אזהרות במפה. המפה תישמר בכל מקרה.`,
        variant: "default",
        duration: 3000
      });
    }

    setIsSaving(true);
    setSaveProgress(0);
    setSaveStatus("מכין נתונים...");

    try {
      // Split heavy computation to prevent blocking UI - yield to browser between operations
      setSaveProgress(20);
      setSaveStatus("מעבד שולחנות...");
      await new Promise((resolve) => setTimeout(resolve, 0)); // Yield to browser
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
          shape: e.shape as "rectangle" | "circle" | "triangle" | "square" | "polygon",
          zoneId: e.zoneId,
          color: e.color
        }));

      setSaveProgress(40);
      setSaveStatus("מעבד אזורים...");
      await new Promise((resolve) => setTimeout(resolve, 0)); // Yield to browser
      const zones = elements
        .filter((e) => e.type === "zone")
        .map((e) => ({
          id: e.id,
          name: e.name,
          color: e.color || "#3B82F6",
          description: e.description,
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          shape: e.shape as "rectangle" | "circle" | "triangle" | "square" | "polygon",
          polygonPoints: e.polygonPoints
        }));

      setSaveProgress(60);
      setSaveStatus("מעבד אזורים מיוחדים...");
      await new Promise((resolve) => setTimeout(resolve, 0)); // Yield to browser
      const venueAreas = elements
        .filter((e) => e.type === "specialArea")
        .map((e) => ({
          id: e.id,
          name: e.name,
          areaType: e.areaType || "other",
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          rotation: e.rotation,
          shape: e.shape as "rectangle" | "circle" | "triangle" | "square" | "polygon",
          color: e.color,
          icon: e.icon
        }));

      setSaveProgress(80);
      setSaveStatus("שומר במסד הנתונים...");
      // CRITICAL: Pass userId for ownership validation
      const result = await saveVenueFloorPlan(venueId, tables, zones, venueAreas, userId);

      setSaveProgress(100);
      setSaveStatus("נשמר בהצלחה!");

      if (result.success && result.data) {
        const savedCounts = result.data;
        const saveTime = new Date();
        setLastSaveTime(saveTime);

        // Add to save history
        setSaveHistory((prev) => [
          {
            timestamp: saveTime,
            tablesCount: savedCounts.tablesCount,
            zonesCount: savedCounts.zonesCount,
            areasCount: savedCounts.areasCount
          },
          ...prev.slice(0, 9) // Keep last 10 saves
        ]);

        // Show success animation
        setSuccessMessage(
          `נשמרו: ${savedCounts.tablesCount} שולחנות, ${savedCounts.zonesCount} אזורים, ${savedCounts.areasCount} אזורים מיוחדים`
        );
        setShowSuccessAnimation(true);

        toast({
          title: t("success.detailsUpdated"),
          description: `נשמרו: ${savedCounts.tablesCount} שולחנות, ${savedCounts.zonesCount} אזורים, ${savedCounts.areasCount} אזורים מיוחדים`,
          duration: 5000
        });
      } else {
        throw new Error(result.error || t("errors.savingData"));
      }

      setSaveConfirmDialogOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: t("errors.generic"),
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: t("errors.generic"),
          description: t("errors.savingData"),
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveProgress(0);
        setSaveStatus("");
      }, 1000);
    }
  }, [
    venueId,
    userId,
    elements,
    capacityError,
    hasValidationWarnings,
    validationWarnings.length,
    toast,
    t
  ]);

  // Save as template
  const handleSaveTemplate = useCallback(
    async (name: string, description?: string) => {
      if (!userId) {
        toast({
          title: t("errors.generic"),
          description: "נדרש להתחבר כדי לשמור תבנית",
          variant: "destructive"
        });
        return;
      }

      try {
        const result = await saveTemplate(
          userId,
          name,
          elements,
          totalCapacity,
          description,
          venueId
        );

        if (result.success) {
          toast({
            title: "תבנית נשמרה",
            description: `התבנית &quot;${name}&quot; נשמרה בהצלחה`
          });
          setSaveTemplateDialogOpen(false);
          // Custom templates removed - using only recommended templates for simplicity
        } else {
          throw new Error(result.error || "שגיאה בשמירת תבנית");
        }
      } catch (error) {
        toast({
          title: t("errors.generic"),
          description: error instanceof Error ? error.message : "שגיאה בשמירת תבנית",
          variant: "destructive"
        });
      }
    },
    [userId, elements, totalCapacity, venueId, toast, t]
  );

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
      const minX = Math.min(...polygonPoints.map((p) => p.x));
      const minY = Math.min(...polygonPoints.map((p) => p.y));
      const maxX = Math.max(...polygonPoints.map((p) => p.x));
      const maxY = Math.max(...polygonPoints.map((p) => p.y));
      const width = maxX - minX || 100;
      const height = maxY - minY || 100;

      // Normalize points to 0-100%
      const normalizedPoints = polygonPoints.map((p) => ({
        x: width > 0 ? ((p.x - minX) / width) * 100 : p.x,
        y: height > 0 ? ((p.y - minY) / height) * 100 : p.y
      }));

      // Create new zone with polygon shape
      const newElement: FloorPlanElement = {
        id: `zone-${Date.now()}`,
        type: "zone",
        name: `Zone ${elements.filter((e) => e.type === "zone").length + 1}`,
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
        {/* Organized Toolbar - Clear Groups - Hidden in fullscreen */}
        {!isFullscreen && (
          <div className="flex shrink-0 items-center justify-between rounded-lg border bg-card p-3 shadow-sm gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {simpleMode ? (
                /* Simple Mode Toolbar - Only Essential Actions */
                <>
                  {/* Start with Template */}
                  <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="default"
                          variant="default"
                          className="gap-2"
                          onClick={() => setTemplateDialogOpen(true)}
                          data-tour="map-templates-button"
                          aria-label={
                            t("floorPlan.templates") ||
                            "התחל עם תבנית - בחר תבנית מוכנה או התחל מאפס"
                          }
                        >
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          {t("floorPlan.templates") || "התחל עם תבנית"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {t("floorPlan.templates") || "התחל עם תבנית"}
                          </div>
                          <div className="text-xs">בחר תבנית מוכנה או התחל מאפס</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Add Elements - Simple */}
                  <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="default"
                          className="gap-2"
                          onClick={() => setQuickAddDialogOpen(true)}
                          data-tour="map-add-button"
                          aria-label={
                            t("floorPlan.addElement") ||
                            "הוסף שולחן או אזור - לחץ כדי להוסיף אלמנטים למפה"
                          }
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          {t("floorPlan.addElement") || "הוסף שולחן או אזור"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {t("floorPlan.addElement") || "הוסף שולחן או אזור"}
                          </div>
                          <div className="text-xs">לחץ כדי להוסיף שולחן או אזור למפה</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Toggle to Advanced Mode */}
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSimpleMode(false)}
                          className="gap-2"
                        >
                          <Wand2 className="h-4 w-4" />
                          מצב מתקדם
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">מצב מתקדם</div>
                          <div className="text-xs">הצג כל האפשרויות המתקדמות</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              ) : (
                /* Advanced Mode Toolbar - All Features */
                <>
                  {/* Group 1: Templates, Create & Add */}
                  <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                    {/* Templates Button - First and Most Important */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="default"
                          variant="default"
                          className="gap-2"
                          onClick={() => setTemplateDialogOpen(true)}
                        >
                          <Sparkles className="h-4 w-4" />
                          {t("floorPlan.templates") || "טמפלטים"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {t("floorPlan.templates") || "טמפלטים"}
                          </div>
                          <div className="text-xs">בחר תבנית התחלתית לבחירה</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="default"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setTemplateDialogOpen(true)}
                        >
                          <Plus className="h-5 w-5" />
                          {t("floorPlan.createMap")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.createMap")}</div>
                          <div className="text-xs">בחר תבנית מקצועית או התחל מאפס</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="default"
                          className="gap-2"
                          onClick={() => setAddElementDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                          {t("floorPlan.addElement")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.addElement")}</div>
                          <div className="text-xs">הוסף שולחנות, אזורים ואזורים מיוחדים</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Group 2: Edit Actions */}
                  <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">ביטול פעולה</div>
                          <div className="text-xs">Ctrl+Z</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">חזרה על פעולה</div>
                          <div className="text-xs">Ctrl+Shift+Z</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">העתק</div>
                          <div className="text-xs">Ctrl+C</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">הדבק</div>
                          <div className="text-xs">Ctrl+V</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">שכפול</div>
                          <div className="text-xs">Ctrl+D</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    {/* Bulk Operations - only show when multiple elements selected */}
                    {(selectedElementIds.size > 1 ||
                      (selectedElementId && selectedElementIds.size > 0)) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Layout className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem
                                onClick={() => _handleAlign("left")}
                                disabled={selectedElementIds.size < 2 && !selectedElementId}
                              >
                                יישור שמאל
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => _handleAlign("right")}
                                disabled={selectedElementIds.size < 2 && !selectedElementId}
                              >
                                יישור ימין
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => _handleAlign("top")}
                                disabled={selectedElementIds.size < 2 && !selectedElementId}
                              >
                                יישור עליון
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => _handleAlign("bottom")}
                                disabled={selectedElementIds.size < 2 && !selectedElementId}
                              >
                                יישור תחתון
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => _handleAlign("center")}
                                disabled={selectedElementIds.size < 2 && !selectedElementId}
                              >
                                יישור מרכז
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => _handleResizeToSameSize()}
                                disabled={selectedElementIds.size < 2 && !selectedElementId}
                              >
                                גודל אחיד
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const selectedIds =
                                    selectedElementIds.size > 0
                                      ? selectedElementIds
                                      : selectedElementId
                                        ? new Set([selectedElementId])
                                        : new Set();
                                  if (selectedIds.size > 0) {
                                    const newColor = prompt("הזן צבע חדש (hex):", "#3B82F6");
                                    if (newColor) {
                                      const newElements = elements.map((el) =>
                                        selectedIds.has(el.id) ? { ...el, color: newColor } : el
                                      );
                                      updateElementsWithHistory(newElements);
                                    }
                                  }
                                }}
                                disabled={selectedElementIds.size === 0 && !selectedElementId}
                              >
                                שנה צבע
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <div className="font-semibold">פעולות קבוצתיות</div>
                            <div className="text-xs">יישור, גודל אחיד, שינוי צבע ועוד</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Group 3: View Controls */}
                  <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGrid(!showGrid)}
                          className={showGrid ? "bg-primary/10" : ""}
                          aria-label={t("floorPlan.grid") || "הצג/הסתר רשת עזר"}
                          aria-checked={showGrid}
                          role="switch"
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.grid")}</div>
                          <div className="text-xs">הצג/הסתר רשת עזר</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRuler(!showRuler)}
                          className={showRuler ? "bg-primary/10" : ""}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">סרגל מדידה</div>
                          <div className="text-xs">הצג/הסתר סרגל מדידה</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newScale = prompt(
                              "הגדר קנה מידה (1px = X מטרים):",
                              scale.toString()
                            );
                            if (newScale !== null) {
                              const parsed = parseFloat(newScale);
                              if (!isNaN(parsed) && parsed > 0) {
                                setScale(parsed);
                              }
                            }
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">קנה מידה</div>
                          <div className="text-xs">1px = {scale} מטרים</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMeasurements(!showMeasurements)}
                          className={showMeasurements ? "bg-primary/10" : ""}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">הצג מידות</div>
                          <div className="text-xs">הצג מידות על אלמנטים</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.zoomOut")}</div>
                          <div className="text-xs">הקטן תצוגה</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.resetZoom")}</div>
                          <div className="text-xs">איפוס תצוגה</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.zoomIn")}</div>
                          <div className="text-xs">הגדל תצוגה</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Group 4: Fullscreen */}
                  <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">מסך מלא</div>
                          <div className="text-xs">F11</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Group 5: Help */}
                  <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setHelpDialogOpen(true)}>
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">מדריך למשתמש</div>
                          <div className="text-xs">למד איך להשתמש בכלים</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Group 6: Export */}
                  <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Files className="h-4 w-4" />
                              ייצוא
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const result = event.target?.result as string;
                                      setBackgroundImage(result);
                                      toast({
                                        title: "תמונה הועלתה",
                                        description: "התמונה הוגדרה כבסיס למפה"
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              <Files className="mr-2 h-4 w-4" />
                              ייבא תמונה כבסיס
                            </DropdownMenuItem>
                            {backgroundImage && (
                              <>
                                <DropdownMenuItem onClick={() => setBackgroundImage(null)}>
                                  <X className="mr-2 h-4 w-4" />
                                  הסר תמונת רקע
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const newOpacity = prompt(
                                      "הזן שקיפות (0-1):",
                                      backgroundImageOpacity.toString()
                                    );
                                    if (newOpacity !== null) {
                                      const opacity = parseFloat(newOpacity);
                                      if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
                                        setBackgroundImageOpacity(opacity);
                                      }
                                    }
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  שנה שקיפות
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={handleExportPNG} disabled={isSaving}>
                              <Files className="mr-2 h-4 w-4" />
                              PNG
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportJPEG} disabled={isSaving}>
                              <Files className="mr-2 h-4 w-4" />
                              JPEG
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPDF} disabled={isSaving}>
                              <Files className="mr-2 h-4 w-4" />
                              PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">ייצוא מפה</div>
                          <div className="text-xs">ייצא את המפה לתמונה או PDF</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Group 7: More Options */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {userId && elements.length > 0 && (
                            <DropdownMenuItem onClick={() => setSaveTemplateDialogOpen(true)}>
                              <Save className="mr-2 h-4 w-4" />
                              שמור כתבנית
                            </DropdownMenuItem>
                          )}
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
                          <DropdownMenuItem onClick={() => setSimpleMode(true)}>
                            <Minimize2 className="mr-2 h-4 w-4" />
                            חזור למצב פשוט
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">{t("floorPlan.moreOptions")}</div>
                        <div className="text-xs">אפשרויות נוספות</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
            {/* Right Side: Stats and Save */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                {elements.filter((e) => e.type === "table").length} {t("floorPlan.tables")} •{" "}
                {totalCapacity} {t("common.seats")}
              </div>
              {hasValidationWarnings && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleAutoFix} className="gap-2">
                        <Wand2 className="h-4 w-4" />
                        תיקון אוטומטי
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">תיקון אוטומטי של אזהרות</div>
                        <div className="text-xs">תקן גודל ומיקום אוטומטית (אופציונלי)</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-sm cursor-help">
                        <AlertCircle className="h-4 w-4" />
                        {validationWarnings.length} אזהרות
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-2xl max-h-96 overflow-y-auto p-4">
                      <div className="space-y-3">
                        <div className="font-semibold text-base text-yellow-600 dark:text-yellow-500">
                          אזהרות ({validationWarnings.length}):
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-2 text-left">
                          {validationWarnings.map((warning, i) => (
                            <li key={i} className="leading-relaxed">
                              {warning}
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          ניתן לשמור את המפה גם עם אזהרות. לחץ על &quot;תיקון אוטומטי&quot; כדי לתקן
                          אוטומטית.
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
              {/* Save Status & Progress - Enhanced */}
              {isSaving && (
                <div className="flex items-center gap-3 min-w-[250px] bg-muted/50 rounded-lg px-3 py-2 border">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{saveStatus}</span>
                      <span className="text-xs text-muted-foreground">{saveProgress}%</span>
                    </div>
                    <Progress value={saveProgress} className="h-2 transition-all duration-300" />
                  </div>
                </div>
              )}
              {!isSaving && lastSaveTime && (
                <div className="text-xs text-muted-foreground hidden md:block">
                  נשמר לאחרונה: {lastSaveTime.toLocaleTimeString("he-IL")}
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    size="sm"
                    className="gap-2"
                    variant="default"
                    data-tour="map-save-button"
                    aria-label={
                      isSaving ? t("common.saving") || "שומר..." : t("common.save") || "שמור מפה"
                    }
                    aria-busy={isSaving}
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {isSaving ? t("common.loading") : t("common.save")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-semibold">שמירת מפה</div>
                    <div className="text-xs">
                      נשמרים: שולחנות, אזורים, כניסות, יציאות, מטבח, שירותים
                    </div>
                    {lastSaveTime && (
                      <div className="text-xs text-muted-foreground mt-1">
                        נשמר לאחרונה: {lastSaveTime.toLocaleString("he-IL")}
                      </div>
                    )}
                    {hasValidationWarnings && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                        יש {validationWarnings.length} אזהרות - ניתן לשמור בכל מקרה
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Contextual Toolbar - Shows when elements are selected */}
        {selectedElements.length > 0 && (
          <ContextualToolbar
            selectedElements={selectedElements}
            onAlign={handleContextualAlign}
            onDistribute={handleContextualDistribute}
            onDuplicate={handleContextualDuplicate}
            onDelete={handleContextualDelete}
          />
        )}

        {/* View Mode Tabs and Map Type Selector - Hidden in fullscreen */}
        {!isFullscreen && (
          <div className="flex shrink-0 items-center justify-between gap-4">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "interactive" | "nonInteractive")}
            >
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
            <div className="flex items-center gap-2 flex-1 max-w-2xl">
              <Input
                placeholder={t("common.search") || "חיפוש אלמנטים..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <Select
                value={filterElementType}
                onValueChange={(v) => setFilterElementType(v as ElementType | "all")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t("floorPlan.filterByType") || "סינון לפי סוג"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all") || "הכל"}</SelectItem>
                  <SelectItem value="table">{t("floorPlan.tables") || "שולחנות"}</SelectItem>
                  <SelectItem value="zone">{t("floorPlan.zones") || "אזורים"}</SelectItem>
                  <SelectItem value="specialArea">
                    {t("floorPlan.specialAreas.other") || "אזורים מיוחדים"}
                  </SelectItem>
                </SelectContent>
              </Select>
              {availableZones.length > 0 && (
                <Select
                  value={filterZone || "all"}
                  onValueChange={(v) => setFilterZone(v === "all" ? null : v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t("floorPlan.filterByZone") || "סינון לפי אזור"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all") || "הכל"}</SelectItem>
                    {availableZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {(searchQuery || filterElementType !== "all" || filterZone) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterElementType("all");
                    setFilterZone(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Main Content - Canvas-Centric Layout with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Context-Aware Sidebar - Desktop/Tablet */}
          {device.isDesktop || device.isTablet ? (
            <div
              className={`shrink-0 border-r bg-card ${
                device.isDesktop ? "w-[280px]" : "w-[240px]"
              }`}
            >
              <ContextAwareSidebar
                elements={elements}
                selectedElementId={selectedElementId}
                selectedElementIds={selectedElementIds}
                onSelectElement={setSelectedElementId}
                onAddTable={handleQuickAddTable}
                onAddZone={handleQuickAddZone}
                onAddArea={handleQuickAddArea}
                onDeleteElement={handleDeleteElement}
                onEditElement={handleEditElement}
                onBulkAction={handleBulkAction}
                onSaveElement={handleSaveElement}
                layers={layers}
                onToggleLayerVisibility={handleToggleLayerVisibility}
                onToggleLayerLock={handleToggleLayerLock}
              />
            </div>
          )}
          {/* Old Layers Panel - Removed, using ContextAwareSidebar instead */}
            <Card className="w-64 border-r shrink-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">שכבות</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowLayersPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layers.zones.visible}
                        onChange={(e) =>
                          setLayers((prev) => ({
                            ...prev,
                            zones: { ...prev.zones, visible: e.target.checked }
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">אזורים</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        setLayers((prev) => ({
                          ...prev,
                          zones: { ...prev.zones, locked: !prev.zones.locked }
                        }))
                      }
                      title={layers.zones.locked ? "פתח נעילה" : "נעול"}
                    >
                      {layers.zones.locked ? "🔒" : "🔓"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layers.tables.visible}
                        onChange={(e) =>
                          setLayers((prev) => ({
                            ...prev,
                            tables: { ...prev.tables, visible: e.target.checked }
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">שולחנות</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        setLayers((prev) => ({
                          ...prev,
                          tables: { ...prev.tables, locked: !prev.tables.locked }
                        }))
                      }
                      title={layers.tables.locked ? "פתח נעילה" : "נעול"}
                    >
                      {layers.tables.locked ? "🔒" : "🔓"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layers.specialAreas.visible}
                        onChange={(e) =>
                          setLayers((prev) => ({
                            ...prev,
                            specialAreas: { ...prev.specialAreas, visible: e.target.checked }
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">אזורים מיוחדים</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        setLayers((prev) => ({
                          ...prev,
                          specialAreas: { ...prev.specialAreas, locked: !prev.specialAreas.locked }
                        }))
                      }
                      title={layers.specialAreas.locked ? "פתח נעילה" : "נעול"}
                    >
                      {layers.specialAreas.locked ? "🔒" : "🔓"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
          {viewMode === "interactive" ? (
            <>
              <Card ref={containerRef} className="relative flex-1 overflow-hidden p-0">
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    cursor: panMode
                      ? isPanning
                        ? "grabbing"
                        : "grab"
                      : isPanning
                        ? "grabbing"
                        : "default",
                    position: "relative"
                  }}
                >
                  {/* Ruler - Top */}
                  {showRuler && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "30px",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderBottom: "1px solid rgba(0,0,0,0.1)",
                        zIndex: 10,
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: `${panOffset.x}px`,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left"
                      }}
                    >
                      {Array.from({ length: Math.ceil(2000 / (100 / scale)) }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            left: `${(i * 100) / scale}px`,
                            height: "100%",
                            borderLeft: "1px solid rgba(0,0,0,0.2)",
                            display: "flex",
                            alignItems: "flex-start",
                            paddingTop: "4px",
                            fontSize: "10px",
                            color: "rgba(0,0,0,0.6)"
                          }}
                        >
                          {(i * 100) / scale}m
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Ruler - Left */}
                  {showRuler && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: "30px",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRight: "1px solid rgba(0,0,0,0.1)",
                        zIndex: 10,
                        pointerEvents: "none",
                        display: "flex",
                        flexDirection: "column",
                        paddingTop: `${panOffset.y}px`,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left"
                      }}
                    >
                      {Array.from({ length: Math.ceil(2000 / (100 / scale)) }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            top: `${(i * 100) / scale}px`,
                            width: "100%",
                            borderTop: "1px solid rgba(0,0,0,0.2)",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "4px",
                            fontSize: "10px",
                            color: "rgba(0,0,0,0.6)",
                            writingMode: "vertical-rl",
                            textOrientation: "mixed"
                          }}
                        >
                          {(i * 100) / scale}m
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    ref={canvasRef}
                    className="absolute bg-background"
                    style={{
                      cursor: panMode ? (isPanning ? "grabbing" : "grab") : "default",
                      minWidth: "2000px",
                      minHeight: "2000px",
                      width: "2000px",
                      height: "2000px",
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom})`,
                      transformOrigin: "center center",
                      backgroundImage: backgroundImage
                        ? `url(${backgroundImage})`
                        : showGrid
                          ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
                          : undefined,
                      backgroundSize: backgroundImage ? "contain" : `${20 / zoom}px ${20 / zoom}px`,
                      backgroundRepeat: backgroundImage ? "no-repeat" : "repeat",
                      backgroundPosition: "center",
                      opacity: backgroundImage ? backgroundImageOpacity : 1
                    }}
                    onClick={handleCanvasClick}
                    onMouseDown={handleCanvasMouseDown}
                    role="application"
                    aria-label="Floor plan canvas"
                    aria-describedby="canvas-description"
                    aria-live="polite"
                    aria-atomic="true"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      // Allow keyboard navigation within canvas
                      if (e.key === "Tab") {
                        // Let Tab work for focus management
                        return;
                      }
                      // Other keys handled by global handler
                    }}
                  >
                    <div id="canvas-description" className="sr-only">
                      Interactive floor plan canvas. Use arrow keys to move selected elements, Enter
                      or Space to select, Shift+Enter to edit, Ctrl+Z to undo, Ctrl+Shift+Z to redo,
                      Delete to remove elements.
                    </div>
                    {/* Selection Box - Enhanced visibility for multi-select */}
                    {isSelecting && selectionBox && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
                          top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
                          width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
                          height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
                          border: "2px solid #3B82F6",
                          backgroundColor: "rgba(59, 130, 246, 0.15)",
                          borderRadius: "4px",
                          pointerEvents: "none",
                          zIndex: 998,
                          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
                        }}
                      />
                    )}
                    {/* Multi-select helper message */}
                    {selectedElementIds.size > 1 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "rgba(59, 130, 246, 0.95)",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 500,
                          zIndex: 1001,
                          pointerEvents: "none",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                        }}
                      >
                        {selectedElementIds.size} אובייקטים נבחרו • לחץ Ctrl/Cmd+Click להוספה/הסרה •
                        Shift+Click לבחירת טווח
                      </div>
                    )}
                    {/* Zone movement helper message */}
                    {selectedElementId &&
                      elements.find((e) => e.id === selectedElementId)?.type === "zone" &&
                      elements.filter((e) => e.zoneId === selectedElementId).length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: selectedElementIds.size > 1 ? "50px" : "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "rgba(16, 185, 129, 0.95)",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 500,
                            zIndex: 1001,
                            pointerEvents: "none",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                          }}
                        >
                          כל האובייקטים באזור יזוזו איתך (
                          {elements.filter((e) => e.zoneId === selectedElementId).length} אובייקטים)
                        </div>
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
                          points={polygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        {polygonPoints.map((point, i) => (
                          <circle key={i} cx={point.x} cy={point.y} r="4" fill="#3B82F6" />
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
                        <Button size="sm" variant="outline" onClick={cancelPolygonDrawing}>
                          {t("common.cancel")}
                        </Button>
                      </div>
                    )}
                    {/* Visual Feedback Overlay */}
                    {(isDragging || isResizing || isRotating) &&
                      draggedElement &&
                      (() => {
                        // Check if table is in a zone
                        const zones = elements.filter((el) => el.type === "zone");
                        const containingZone =
                          draggedElement.type === "table"
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
                                X: {Math.round(draggedElement.x)}px (
                                {Math.round(draggedElement.x * scale * 100) / 100}m), Y:{" "}
                                {Math.round(draggedElement.y)}px (
                                {Math.round(draggedElement.y * scale * 100) / 100}m)
                                {containingZone && (
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      color: containingZone.color || "#3B82F6"
                                    }}
                                  >
                                    • {containingZone.name}
                                  </span>
                                )}
                              </>
                            )}
                            {isResizing && (
                              <>
                                {Math.round(draggedElement.width)}×
                                {Math.round(draggedElement.height)}px (
                                {Math.round(draggedElement.width * scale * 100) / 100}m ×{" "}
                                {Math.round(draggedElement.height * scale * 100) / 100}m)
                                {containingZone && (
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      color: containingZone.color || "#3B82F6"
                                    }}
                                  >
                                    • {containingZone.name}
                                  </span>
                                )}
                              </>
                            )}
                            {isRotating && <>{Math.round(draggedElement.rotation)}°</>}
                          </div>
                        );
                      })()}
                    {/* Alignment Guides Visualization - only show when actively dragging */}
                    {showAlignmentGuides &&
                      isDragging &&
                      alignmentGuides.length > 0 &&
                      alignmentGuides.map((guide, index) => (
                        <div
                          key={index}
                          style={{
                            position: "absolute",
                            [guide.type === "vertical" ? "left" : "top"]: `${guide.position}px`,
                            [guide.type === "vertical" ? "width" : "height"]: "1px",
                            [guide.type === "vertical" ? "height" : "width"]:
                              guide.type === "vertical"
                                ? `${canvasSize.height}px`
                                : `${canvasSize.width}px`,
                            backgroundColor: "#3B82F6",
                            opacity: 0.5,
                            pointerEvents: "none",
                            zIndex: 997
                          }}
                        />
                      ))}

                    {/* Empty Canvas Message - Using EmptyState Component */}
                    {elements.length === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 10,
                          width: "100%",
                          height: "100%",
                          pointerEvents: "none"
                        }}
                      >
                        <div style={{ pointerEvents: "auto" }}>
                          <EmptyState
                            onUseTemplate={() => setTemplateDialogOpen(true)}
                            onAddElement={() => setQuickAddDialogOpen(true)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Render Elements - Zones first (lower z-index), then other elements */}
                    {filteredElements
                      .filter((element) => {
                        if (hiddenElements.has(element.id)) return false;
                        // Filter by layer visibility
                        if (element.type === "zone" && !layers.zones.visible) return false;
                        if (element.type === "table" && !layers.tables.visible) return false;
                        if (element.type === "specialArea" && !layers.specialAreas.visible)
                          return false;

                        // Hide bar stools by default - only show if parent bar has showStools = true
                        if (
                          element.type === "table" &&
                          element.tableType === "bar" &&
                          element.name?.includes("כיסא בר")
                        ) {
                          // Find parent bar - look for nearby bar table (not zone)
                          const parentBar = elements.find(
                            (e) =>
                              e.type === "table" &&
                              e.tableType === "bar" &&
                              e.id !== element.id &&
                              !e.name?.includes("כיסא בר") &&
                              Math.abs(e.x - element.x) < 300 &&
                              Math.abs(e.y - element.y) < 300
                          );
                          // If no parent bar found or parent bar doesn't have showStools, hide the stool
                          if (!parentBar || !parentBar.showStools) {
                            return false;
                          }
                        }

                        return true;
                      })
                      .sort((a, b) => {
                        // Zones first (z-index 1), then other elements (z-index 10)
                        if (a.type === "zone" && b.type !== "zone") return -1;
                        if (a.type !== "zone" && b.type === "zone") return 1;
                        return 0;
                      })
                      .map((element) => {
                        // Check if element is locked
                        const isLocked =
                          (element.type === "zone" && layers.zones.locked) ||
                          (element.type === "table" && layers.tables.locked) ||
                          (element.type === "specialArea" && layers.specialAreas.locked);

                        // Highlight search matches
                        const isSearchMatch =
                          searchQuery.trim() &&
                          (element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            element.description
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            element.notes?.toLowerCase().includes(searchQuery.toLowerCase()));

                        return (
                          <ElementRenderer
                            showMeasurements={showMeasurements}
                            scale={scale}
                            key={element.id}
                            element={element}
                            isSelected={
                              selectedElementId === element.id || selectedElementIds.has(element.id)
                            }
                            isInteractive={!isLocked}
                            onMouseDown={(e) => handleElementMouseDown(e, element)}
                            onDoubleClick={(e) => handleEditElement(element, e)}
                            onEdit={() => {
                              const elementToEdit = elements.find((e) => e.id === element.id);
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
                                        polygonPoints: e.polygonPoints.map((p, i) =>
                                          i === vertexIndex ? newPoint : p
                                        )
                                      }
                                    : e
                                )
                              );
                            }}
                            allElements={elements}
                            onResizeStart={(e, handle) => handleResizeStart(e, element, handle)}
                            onRotateStart={(e) => handleRotateStart(e, element)}
                            isSearchMatch={!!isSearchMatch}
                          />
                        );
                      })}
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

        {/* Template Selection Dialog - Simple 4-6 Recommended Templates */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("floorPlan.createMap") || "התחל עם תבנית"}</DialogTitle>
              <DialogDescription>
                {t("floorPlan.createMapDescription") || "בחר תבנית מוכנה או התחל מאפס"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Recommended Templates - Simple Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAllTemplates()
                  .filter((t) =>
                    [
                      "restaurant",
                      "bar",
                      "event_hall",
                      "conference_hall",
                      "shalvata",
                      "club"
                    ].includes(t.id)
                  )
                  .slice(0, 6)
                  .map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary"
                      onClick={() => {
                        const newElements = template.elements.map((el) => ({
                          ...el,
                          id: `${el.id}-${Date.now()}`
                        }));
                        // Auto-link elements to zones after loading template
                        const linkedElements = autoLinkElementsToZones(newElements);
                        setElements(linkedElements);
                        setVenueCapacity(template.defaultCapacity);
                        // Reset zoom and pan to center on template
                        setZoom(1);
                        setPanOffset({ x: 0, y: 0 });
                        // Clear selection
                        setSelectedElementId(null);
                        setSelectedElementIds(new Set());
                        setTemplateDialogOpen(false);
                        toast({
                          title: t("success.templateLoaded"),
                          description: t("success.templateLoadedDescription", {
                            name: template.name
                          })
                        });
                      }}
                    >
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 text-lg">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {template.elements.length} {t("floorPlan.elements")}
                          </span>
                          <span>
                            {template.defaultCapacity} {t("common.seats")}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Empty Canvas Option */}
              <div className="pt-4 border-t">
                <Card
                  className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary border-dashed"
                  onClick={() => {
                    setElements([]);
                    setVenueCapacity(0);
                    setSelectedElementId(null);
                    setSelectedElementIds(new Set());
                    setTemplateDialogOpen(false);
                    toast({
                      title: t("success.mapCleared") || "מפה ריקה",
                      description: t("success.mapClearedDescription") || "התחל ליצור מפה חדשה מאפס"
                    });
                  }}
                >
                  <div className="p-4 text-center">
                    <h4 className="font-semibold mb-2 text-lg">
                      {t("floorPlan.startFromScratch") || "התחל מאפס"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("floorPlan.startFromScratchDescription") || "צור מפה חדשה מאפס"}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save Template Dialog */}
        <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>שמור כתבנית</DialogTitle>
              <DialogDescription>שמור את המפה הנוכחית כתבנית לשימוש עתידי</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">שם התבנית</Label>
                <Input
                  id="template-name"
                  placeholder="לדוגמה: בר מרכזי"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      const nameInput = document.getElementById(
                        "template-name"
                      ) as HTMLInputElement;
                      const descInput = document.getElementById(
                        "template-description"
                      ) as HTMLTextAreaElement;
                      if (nameInput?.value.trim()) {
                        handleSaveTemplate(nameInput.value.trim(), descInput?.value || undefined);
                      }
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">תיאור (אופציונלי)</Label>
                <Textarea id="template-description" placeholder="תיאור קצר של התבנית" />
              </div>
              <div className="text-xs text-muted-foreground">
                התבנית תכלול: {elements.filter((e) => e.type === "table").length} שולחנות,{" "}
                {elements.filter((e) => e.type === "zone").length} אזורים,{" "}
                {elements.filter((e) => e.type === "specialArea").length} אזורים מיוחדים
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveTemplateDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => {
                  const nameInput = document.getElementById("template-name") as HTMLInputElement;
                  const descInput = document.getElementById(
                    "template-description"
                  ) as HTMLTextAreaElement;
                  if (nameInput?.value.trim()) {
                    handleSaveTemplate(nameInput.value.trim(), descInput?.value || undefined);
                  }
                }}
              >
                שמור
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fullscreen Modal */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 m-0 rounded-none">
            <div className="flex flex-col h-full">
              {/* Fullscreen Toolbar - Same as normal toolbar */}
              <div className="flex shrink-0 items-center justify-between rounded-lg border-b bg-card p-3 shadow-sm gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Group 1: Templates, Create & Add */}
                  <div className="flex items-center gap-2 border-r pr-2 md:pr-3">
                    {/* Templates Button - First and Most Important */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-2"
                          onClick={() => {
                            setIsFullscreen(false);
                            setTemplateDialogOpen(true);
                          }}
                        >
                          <Sparkles className="h-4 w-4" />
                          {t("floorPlan.templates") || "טמפלטים"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {t("floorPlan.templates") || "טמפלטים"}
                          </div>
                          <div className="text-xs">בחר תבנית התחלתית לבחירה</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            setIsFullscreen(false);
                            setTemplateDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          {t("floorPlan.createMap")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.createMap")}</div>
                          <div className="text-xs">בחר תבנית מקצועית או התחל מאפס</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setIsFullscreen(false);
                            setAddElementDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          {t("floorPlan.addElement")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.addElement")}</div>
                          <div className="text-xs">הוסף שולחנות, אזורים ואזורים מיוחדים</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Group 2: Edit Actions */}
                  <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">ביטול פעולה</div>
                          <div className="text-xs">Ctrl+Z</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">חזרה על פעולה</div>
                          <div className="text-xs">Ctrl+Shift+Z / Ctrl+Y</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">העתק</div>
                          <div className="text-xs">Ctrl+C</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">הדבק</div>
                          <div className="text-xs">Ctrl+V</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Group 3: View Controls */}
                  <div className="flex items-center gap-1 border-r pr-2 md:pr-3">
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.grid")}</div>
                          <div className="text-xs">הצג/הסתר רשת עזר</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.zoomOut")}</div>
                          <div className="text-xs">הקטן תצוגה</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.resetZoom")}</div>
                          <div className="text-xs">איפוס תצוגה</div>
                        </div>
                      </TooltipContent>
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
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{t("floorPlan.zoomIn")}</div>
                          <div className="text-xs">הגדל תצוגה</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {/* Right Side: Stats, Errors, Save, Exit */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground hidden md:block">
                    {elements.filter((e) => e.type === "table").length} {t("floorPlan.tables")} •{" "}
                    {totalCapacity} {t("common.seats")}
                  </div>
                  {hasValidationWarnings && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAutoFix}
                            className="gap-2"
                          >
                            <Wand2 className="h-4 w-4" />
                            תיקון אוטומטי
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <div className="font-semibold">תיקון אוטומטי של אזהרות</div>
                            <div className="text-xs">תקן גודל ומיקום אוטומטית (אופציונלי)</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-sm cursor-help">
                            <AlertCircle className="h-4 w-4" />
                            {validationWarnings.length} אזהרות
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-lg max-h-96 overflow-y-auto">
                          <div className="space-y-2">
                            <div className="font-semibold text-base text-yellow-600 dark:text-yellow-500">
                              אזהרות:
                            </div>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {validationWarnings.map((warning, i) => (
                                <li key={i} className="text-left">
                                  {warning}
                                </li>
                              ))}
                            </ul>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                              ניתן לשמור את המפה גם עם אזהרות. לחץ על &quot;תיקון אוטומטי&quot; כדי
                              לתקן אוטומטית.
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setIsFullscreen(false);
                          handleSaveClick();
                        }}
                        disabled={isSaving}
                        size="sm"
                        className="gap-2"
                        variant="default"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? t("common.loading") : t("common.save")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">שמירת מפה</div>
                        {hasValidationWarnings && (
                          <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                            יש {validationWarnings.length} אזהרות - ניתן לשמור בכל מקרה
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">{t("floorPlan.exitFullscreen")}</div>
                        <div className="text-xs">F11 או Esc</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div
                className="flex-1 overflow-hidden relative"
                style={{
                  cursor: panMode
                    ? isPanning
                      ? "grabbing"
                      : "grab"
                    : isPanning
                      ? "grabbing"
                      : "default"
                }}
              >
                {/* Canvas Controls - Pan Mode Toggle */}
                <div
                  className="absolute top-2 right-2 z-[1002] flex items-center gap-2 bg-background/90 backdrop-blur-sm border rounded-lg p-1 shadow-lg"
                  style={{ pointerEvents: "auto" }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={panMode ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPanMode(!panMode)}
                      >
                        <Hand className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">{panMode ? "מצב גרירה" : "מצב בחירה"}</div>
                        <div className="text-xs">
                          {panMode ? "לחץ כדי לעבור למצב בחירה" : "לחץ כדי לעבור למצב גרירה"}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="h-6 w-px bg-border mx-1" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setZoom((prev) => Math.min(10, prev * 1.2))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">{t("floorPlan.zoomIn")}</div>
                        <div className="text-xs">Ctrl/Cmd + Scroll</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setZoom((prev) => Math.max(0.01, prev / 1.2))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">{t("floorPlan.zoomOut")}</div>
                        <div className="text-xs">Ctrl/Cmd + Scroll</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setZoom(1);
                          setPanOffset({ x: 0, y: 0 });
                        }}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">איפוס זום</div>
                        <div className="text-xs">החזר לזום 100%</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div
                  ref={canvasRef}
                  className="absolute bg-background"
                  style={{
                    cursor: panMode ? (isPanning ? "grabbing" : "grab") : "default",
                    minWidth: "2000px",
                    minHeight: "2000px",
                    width: "2000px",
                    height: "2000px",
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom})`,
                    transformOrigin: "center center",
                    backgroundImage: backgroundImage
                      ? `url(${backgroundImage})`
                      : showGrid
                        ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
                        : undefined,
                    backgroundSize: backgroundImage ? "contain" : `${20 / zoom}px ${20 / zoom}px`,
                    backgroundRepeat: backgroundImage ? "no-repeat" : "repeat",
                    backgroundPosition: "center",
                    opacity: backgroundImage ? backgroundImageOpacity : 1
                  }}
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
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
                        points={polygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      {polygonPoints.map((point, i) => (
                        <circle key={i} cx={point.x} cy={point.y} r="4" fill="#3B82F6" />
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
                      <Button size="sm" variant="outline" onClick={cancelPolygonDrawing}>
                        {t("common.cancel")}
                      </Button>
                    </div>
                  )}
                  {/* Empty Canvas Message */}
                  {elements.length === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 10,
                        pointerEvents: "none"
                      }}
                    >
                      <div
                        className="bg-card/90 backdrop-blur-sm border-2 border-dashed border-primary/50 rounded-lg p-8 max-w-md"
                        style={{ pointerEvents: "auto" }}
                      >
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">
                          {t("floorPlan.emptyCanvasTitle")}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {t("floorPlan.emptyCanvasDescription")}
                        </p>
                        <Button
                          onClick={() => {
                            setIsFullscreen(false);
                            setTemplateDialogOpen(true);
                          }}
                          className="gap-2"
                          size="lg"
                          style={{ pointerEvents: "auto" }}
                        >
                          <Plus className="h-5 w-5" />
                          {t("floorPlan.createMap")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Render Elements - Zones first (lower z-index), then other elements */}
                  {elements
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
                        isSelected={
                          selectedElementId === element.id || selectedElementIds.has(element.id)
                        }
                        isInteractive={true}
                        onMouseDown={(e) => handleElementMouseDown(e, element)}
                        onDoubleClick={(e) => handleEditElement(element, e)}
                        onEdit={() => {
                          const elementToEdit = elements.find((e) => e.id === element.id);
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
                                    polygonPoints: e.polygonPoints.map((p, i) =>
                                      i === vertexIndex ? newPoint : p
                                    )
                                  }
                                : e
                            )
                          );
                        }}
                        allElements={elements}
                        onResizeStart={(e, handle) => {
                          if (handle === "rotate") {
                            handleRotateStart(e, element);
                          } else {
                            handleResizeStart(
                              e,
                              element,
                              handle as "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w"
                            );
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

        {/* Quick Add Dialog - Simple 3-button layout for simple mode */}
        {simpleMode ? (
          <QuickAddDialog
            open={quickAddDialogOpen}
            onOpenChange={setQuickAddDialogOpen}
            onAddTable={handleQuickAddTable}
            onAddZone={handleQuickAddZone}
            onAddArea={handleQuickAddArea}
            onBulkAddTables={handleBulkAddTables}
          />
        ) : (
          <AddElementDialog
            open={addElementDialogOpen}
            onOpenChange={setAddElementDialogOpen}
            onAddZone={handleAddZone}
            onAddElement={handleAddElementByCategory}
          />
        )}

        {/* Quick Edit Panel - Simple inline editing */}
        {quickEditPanelOpen && editingElement && quickEditPosition && (
          <QuickEditPanel
            element={editingElement}
            onSave={handleQuickEditSave}
            onCancel={handleQuickEditCancel}
            position={quickEditPosition}
          />
        )}

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
                allElements={elements}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Save Confirmation Dialog */}
        <Dialog open={saveConfirmDialogOpen} onOpenChange={setSaveConfirmDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("floorPlan.saveMap") || "שמירת מפה"}</DialogTitle>
              <DialogDescription>
                {t("floorPlan.saveMapDescription") || "האם לשמור את כל השינויים במפה?"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  {elements.filter((e) => e.type === "table").length} {t("floorPlan.tables")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>
                  {elements.filter((e) => e.type === "zone").length} {t("floorPlan.zones")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span>
                  {elements.filter((e) => e.type === "specialArea").length}{" "}
                  {t("floorPlan.specialAreas.other")}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                <Info className="h-3 w-3 inline mr-1" />
                כל האלמנטים יישמרו במסד הנתונים ויהיו זמינים בפעם הבאה שתפתח את המפה
              </div>
              {isSaving && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">{saveStatus}</div>
                  <Progress value={saveProgress} />
                </div>
              )}
              {saveHistory.length > 0 && !isSaving && (
                <div className="text-sm border-t pt-4">
                  <p className="font-semibold mb-2 text-xs">היסטוריית שמירות אחרונות:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {saveHistory.slice(0, 3).map((save, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                        <span>{save.timestamp.toLocaleString("he-IL")}</span>
                        <span>
                          {save.tablesCount} שולחנות, {save.zonesCount} אזורים, {save.areasCount}{" "}
                          אזורים מיוחדים
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSaveConfirmDialogOpen(false)}
                disabled={isSaving}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={async () => {
                  setSaveConfirmDialogOpen(false);
                  await handleSave();
                }}
                disabled={isSaving}
              >
                {isSaving ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tips Overlay */}
        {showTips && (
          <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border rounded-lg shadow-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                טיפים שימושיים
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowTips(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {currentTipIndex === 0 && (
                <p>
                  💡 <strong>גרור אלמנטים</strong> כדי להזיז אותם על המפה. לחץ פעמיים לעריכה.
                </p>
              )}
              {currentTipIndex === 1 && (
                <p>
                  💡 <strong>השתמש ב-Ctrl/Cmd</strong> + גלגלת עכבר כדי להגדיל/להקטין את התצוגה.
                </p>
              )}
              {currentTipIndex === 2 && (
                <p>
                  💡 <strong>בחר מספר אלמנטים</strong> עם גרירת תיבה כדי לבצע פעולות קבוצתיות.
                </p>
              )}
              {currentTipIndex === 3 && (
                <p>
                  💡 <strong>שולחנות שנגררים לאזור</strong> יורשים את צבע האזור אוטומטית.
                </p>
              )}
              {currentTipIndex === 4 && (
                <p>
                  💡 <strong>שמור תבנית מותאמת</strong> כדי להשתמש במפה שוב בעתיד.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    className={`h-2 w-2 rounded-full ${currentTipIndex === idx ? "bg-primary" : "bg-muted"}`}
                    onClick={() => setCurrentTipIndex(idx)}
                    aria-label={`טיפ ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setCurrentTipIndex((prev) => (prev > 0 ? prev - 1 : 4))}
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setCurrentTipIndex((prev) => (prev < 4 ? prev + 1 : 0))}
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Help/Demo Dialog */}
        {/* Help Panel - Enhanced */}
        <HelpPanel open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
      </div>
      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        message={successMessage}
        onComplete={() => setShowSuccessAnimation(false)}
      />
    </TooltipProvider>
  );
}

// Element Renderer Component - Memoized for performance
interface ElementRendererProps {
  element: FloorPlanElement;
  isSelected: boolean;
  isInteractive: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: (e?: React.MouseEvent) => void;
  onDelete: () => void;
  onEdit?: () => void;
  onVertexDrag?: (vertexIndex: number, newPoint: Point) => void;
  allElements?: FloorPlanElement[];
  onResizeStart?: (
    e: React.MouseEvent,
    handle: "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w" | "rotate"
  ) => void;
  onRotateStart?: (e: React.MouseEvent) => void;
  showMeasurements?: boolean;
  scale?: number;
}

const ElementRenderer = memo(function ElementRenderer({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  onEdit,
  onVertexDrag,
  allElements = [],
  onResizeStart,
  onRotateStart,
  isSearchMatch = false,
  showMeasurements = false,
  scale = 1
}: ElementRendererProps & { isSearchMatch?: boolean }) {
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
      border:
        element.type === "zone"
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
      outline: isSearchMatch && !isSelected ? "2px solid #F59E0B" : undefined,
      outlineOffset: isSearchMatch && !isSelected ? "2px" : undefined,
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
  const needsSvg =
    element.shape === "triangle" ||
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
            stroke={
              element.type === "zone"
                ? element.color || "#3B82F6"
                : isSelected
                  ? "#3B82F6"
                  : "rgba(0,0,0,0.3)"
            }
            strokeWidth={2}
            strokeDasharray={element.type === "zone" ? "5,5" : "none"}
          />
          {/* Render vertices for polygon editing */}
          {isInteractive &&
            isSelected &&
            element.shape === "polygon" &&
            element.polygonPoints &&
            onVertexDrag && (
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
                  fontWeight: "bold",
                  lineHeight: FLOOR_PLAN_TYPOGRAPHY.tableSeats.lineHeight,
                  color: "#000000",
                  marginTop: "2px"
                }}
              >
                {element.seats}
              </div>
            )}
            {/* Price display */}
            {(element.minimumPrice ||
              element.pricePerSeat ||
              (parentZone && parentZone.zoneMinimumPrice)) && (
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#10B981",
                  marginTop: "2px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  padding: "2px 4px",
                  borderRadius: "2px"
                }}
              >
                {(() => {
                  // Calculate price: zone price > table price > price per seat
                  const zonePrice = parentZone?.zoneMinimumPrice;
                  const tablePrice = element.minimumPrice;
                  const perSeatPrice = element.pricePerSeat;

                  if (zonePrice) {
                    return `₪${zonePrice.toFixed(0)}`;
                  } else if (tablePrice) {
                    return `₪${tablePrice.toFixed(0)}`;
                  } else if (perSeatPrice && element.seats) {
                    return `₪${(perSeatPrice * element.seats).toFixed(0)} (${perSeatPrice.toFixed(0)}/כסא)`;
                  }
                  return null;
                })()}
              </div>
            )}
            {showMeasurements && (
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(0,0,0,0.6)",
                  marginTop: "4px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  padding: "2px 4px",
                  borderRadius: "2px"
                }}
              >
                {Math.round(element.width * scale * 100) / 100}m ×{" "}
                {Math.round(element.height * scale * 100) / 100}m
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
              fontWeight: "bold",
              lineHeight: FLOOR_PLAN_TYPOGRAPHY.tableSeats.lineHeight,
              color: "#000000",
              marginTop: "2px"
            }}
          >
            {element.seats}
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
});

ElementRenderer.displayName = "ElementRenderer";

// Edit Element Form Component
interface EditElementFormProps {
  element: FloorPlanElement;
  onChange: (element: FloorPlanElement) => void;
  onSave: () => void;
  onCancel: () => void;
  allElements?: FloorPlanElement[]; // All elements for zone connection/disconnection (optional now)
}

function EditElementForm({ element, onChange, onSave, onCancel }: EditElementFormProps) {
  const [editMode, setEditMode] = useState<
    | "select"
    | "name"
    | "color"
    | "seats"
    | "price"
    | "pricePerSeat"
    | "zonePrice"
    | "showStools"
    | "description"
  >("select");
  const [tempValue, setTempValue] = useState<string>("");

  // Reset to selection when element changes
  useEffect(() => {
    setEditMode("select");
    setTempValue("");
  }, [element.id]);

  const handleSaveField = () => {
    switch (editMode) {
      case "name": {
        if (tempValue.trim()) {
          onChange({ ...element, name: tempValue.trim() });
        }
        break;
      }
      case "seats": {
        const seats = parseInt(tempValue);
        if (!isNaN(seats) && seats > 0) {
          onChange({ ...element, seats });
        }
        break;
      }
      case "price": {
        const price = parseFloat(tempValue);
        if (!isNaN(price) && price >= 0) {
          onChange({ ...element, minimumPrice: price || null });
        }
        break;
      }
      case "pricePerSeat": {
        const pricePerSeat = parseFloat(tempValue);
        if (!isNaN(pricePerSeat) && pricePerSeat >= 0) {
          onChange({ ...element, pricePerSeat: pricePerSeat || null });
        }
        break;
      }
      case "zonePrice": {
        const zonePrice = parseFloat(tempValue);
        if (!isNaN(zonePrice) && zonePrice >= 0) {
          onChange({ ...element, zoneMinimumPrice: zonePrice || null });
        }
        break;
      }
      case "description": {
        onChange({ ...element, description: tempValue.trim() || null });
        break;
      }
    }
    setEditMode("select");
    setTempValue("");
  };

  const handleStartEdit = (mode: typeof editMode) => {
    setEditMode(mode);
    switch (mode) {
      case "name":
        setTempValue(element.name);
        break;
      case "seats":
        setTempValue(element.seats?.toString() || "");
        break;
      case "price":
        setTempValue(element.minimumPrice?.toString() || "");
        break;
      case "pricePerSeat":
        setTempValue(element.pricePerSeat?.toString() || "");
        break;
      case "zonePrice":
        setTempValue(element.zoneMinimumPrice?.toString() || "");
        break;
      case "description":
        setTempValue(element.description || "");
        break;
      case "showStools":
        onChange({ ...element, showStools: !element.showStools });
        setEditMode("select");
        return;
      case "color":
        // Color picker opens directly
        break;
    }
  };

  const handleCancelEdit = () => {
    setEditMode("select");
    setTempValue("");
  };

  // Selection Menu - What do you want to edit?
  if (editMode === "select") {
    return (
      <div className="space-y-4">
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold mb-1">מה תרצה לערוך?</h3>
          <p className="text-sm text-muted-foreground">בחר מה לשנות</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Name */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => handleStartEdit("name")}
          >
            <Pencil className="h-6 w-6" />
            <span className="text-sm font-medium">שם</span>
            <span className="text-xs text-muted-foreground truncate w-full">{element.name}</span>
          </Button>

          {/* Color (for zones) */}
          {element.type === "zone" && (
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleStartEdit("color")}
            >
              <div
                className="h-6 w-6 rounded border-2 border-gray-300"
                style={{ backgroundColor: element.color || "#3B82F6" }}
              />
              <span className="text-sm font-medium">צבע</span>
            </Button>
          )}

          {/* Seats (for tables) */}
          {element.type === "table" && (
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleStartEdit("seats")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">מספר מקומות</span>
              <span className="text-xs text-muted-foreground">{element.seats || "לא הוגדר"}</span>
            </Button>
          )}

          {/* Minimum Price (for tables) */}
          {element.type === "table" && (
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleStartEdit("price")}
            >
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-medium">מחיר מינימום</span>
              <span className="text-xs text-muted-foreground">
                {element.minimumPrice ? `₪${element.minimumPrice}` : "לא הוגדר"}
              </span>
            </Button>
          )}

          {/* Price per Seat (for bars) */}
          {element.type === "table" && element.tableType === "bar" && (
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleStartEdit("pricePerSeat")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">מחיר לכסא</span>
              <span className="text-xs text-muted-foreground">
                {element.pricePerSeat ? `₪${element.pricePerSeat}` : "לא הוגדר"}
              </span>
            </Button>
          )}

          {/* Show Stools (for bars) */}
          {element.type === "table" && element.tableType === "bar" && (
            <Button
              variant={element.showStools ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleStartEdit("showStools")}
            >
              <Layout className="h-6 w-6" />
              <span className="text-sm font-medium">הצג כיסאות</span>
              <span className="text-xs">{element.showStools ? "מוצגים" : "מוסתרים"}</span>
            </Button>
          )}

          {/* Zone Minimum Price */}
          {element.type === "zone" && (
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleStartEdit("zonePrice")}
            >
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-medium">מחיר לאזור</span>
              <span className="text-xs text-muted-foreground">
                {element.zoneMinimumPrice ? `₪${element.zoneMinimumPrice}` : "לא הוגדר"}
              </span>
            </Button>
          )}

          {/* Description (for zones) */}
          {element.type === "zone" && (
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleStartEdit("description")}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm font-medium">תיאור</span>
              <span className="text-xs text-muted-foreground truncate w-full">
                {element.description || "לא הוגדר"}
              </span>
            </Button>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onCancel}>
            ביטול
          </Button>
          <Button onClick={onSave}>שמור הכל</Button>
        </DialogFooter>
      </div>
    );
  }

  // Single Field Editing - Focused, one field at a time
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="w-full justify-start">
        <X className="h-4 w-4 mr-2" />
        חזרה לבחירה
      </Button>

      {/* Name Editing */}
      {editMode === "name" && (
        <div className="space-y-4">
          <div className="text-center">
            <Pencil className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-xl font-semibold mb-2">עריכת שם</h3>
            <p className="text-sm text-muted-foreground">הזן שם חדש לאובייקט</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-name-field" className="text-base font-medium">
              שם האובייקט
            </Label>
            <Input
              id="edit-name-field"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="הזן שם..."
              className="text-lg h-12"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveField();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            {tempValue.trim() && (
              <p className="text-xs text-muted-foreground">
                ✓ השם החדש: <strong>{tempValue.trim()}</strong>
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              ביטול
            </Button>
            <Button onClick={handleSaveField} disabled={!tempValue.trim()} className="flex-1">
              שמור שם
            </Button>
          </div>
        </div>
      )}

      {/* Seats Editing */}
      {editMode === "seats" && (
        <div className="space-y-4">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-xl font-semibold mb-2">מספר מקומות ישיבה</h3>
            <p className="text-sm text-muted-foreground">כמה אנשים יכולים לשבת כאן?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-seats-field" className="text-base font-medium">
              מספר מקומות
            </Label>
            <Input
              id="edit-seats-field"
              type="number"
              min="1"
              value={tempValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (!isNaN(parseInt(val)) && parseInt(val) > 0)) {
                  setTempValue(val);
                }
              }}
              placeholder="הזן מספר..."
              className="text-lg h-12"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveField();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            {tempValue && parseInt(tempValue) > 0 && (
              <p className="text-xs text-muted-foreground">
                ✓ מספר מקומות: <strong>{tempValue}</strong>
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              ביטול
            </Button>
            <Button
              onClick={handleSaveField}
              disabled={!tempValue || parseInt(tempValue) <= 0}
              className="flex-1"
            >
              שמור מספר
            </Button>
          </div>
        </div>
      )}

      {/* Price Editing */}
      {editMode === "price" && (
        <div className="space-y-4">
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-xl font-semibold mb-2">מחיר מינימום הזמנה</h3>
            <p className="text-sm text-muted-foreground">מה הסכום המינימלי להזמנה?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price-field" className="text-base font-medium">
              מחיר מינימום (₪)
            </Label>
            <Input
              id="edit-price-field"
              type="number"
              min="0"
              step="0.01"
              value={tempValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                  setTempValue(val);
                }
              }}
              placeholder="הזן סכום..."
              className="text-lg h-12"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveField();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            {tempValue && parseFloat(tempValue) >= 0 && (
              <p className="text-xs text-muted-foreground">
                ✓ מחיר מינימום: <strong>₪{parseFloat(tempValue).toFixed(2)}</strong>
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempValue("");
                onChange({ ...element, minimumPrice: null });
              }}
              className="w-full"
            >
              הסר מחיר מינימום
            </Button>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              ביטול
            </Button>
            <Button
              onClick={handleSaveField}
              disabled={
                tempValue !== "" && (isNaN(parseFloat(tempValue)) || parseFloat(tempValue) < 0)
              }
              className="flex-1"
            >
              שמור מחיר
            </Button>
          </div>
        </div>
      )}

      {/* Price Per Seat Editing */}
      {editMode === "pricePerSeat" && (
        <div className="space-y-4">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-xl font-semibold mb-2">מחיר לכסא</h3>
            <p className="text-sm text-muted-foreground">מה המחיר לכל כסא בבר?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price-per-seat-field" className="text-base font-medium">
              מחיר לכסא (₪)
            </Label>
            <Input
              id="edit-price-per-seat-field"
              type="number"
              min="0"
              step="0.01"
              value={tempValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                  setTempValue(val);
                }
              }}
              placeholder="הזן מחיר לכסא..."
              className="text-lg h-12"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveField();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            {tempValue && parseFloat(tempValue) >= 0 && element.seats && (
              <p className="text-xs text-muted-foreground">
                ✓ מחיר כולל ({element.seats} כסאות):{" "}
                <strong>₪{(parseFloat(tempValue) * element.seats).toFixed(2)}</strong>
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempValue("");
                onChange({ ...element, pricePerSeat: null });
              }}
              className="w-full"
            >
              הסר מחיר לכסא
            </Button>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              ביטול
            </Button>
            <Button
              onClick={handleSaveField}
              disabled={
                tempValue !== "" && (isNaN(parseFloat(tempValue)) || parseFloat(tempValue) < 0)
              }
              className="flex-1"
            >
              שמור מחיר
            </Button>
          </div>
        </div>
      )}

      {/* Zone Price Editing */}
      {editMode === "zonePrice" && (
        <div className="space-y-4">
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-xl font-semibold mb-2">מחיר מינימום לאזור</h3>
            <p className="text-sm text-muted-foreground">מה הסכום המינימלי לכל השולחנות באזור?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-zone-price-field" className="text-base font-medium">
              מחיר מינימום לאזור (₪)
            </Label>
            <Input
              id="edit-zone-price-field"
              type="number"
              min="0"
              step="0.01"
              value={tempValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                  setTempValue(val);
                }
              }}
              placeholder="הזן סכום..."
              className="text-lg h-12"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveField();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            {tempValue && parseFloat(tempValue) >= 0 && (
              <p className="text-xs text-muted-foreground">
                ✓ מחיר מינימום לאזור: <strong>₪{parseFloat(tempValue).toFixed(2)}</strong>
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempValue("");
                onChange({ ...element, zoneMinimumPrice: null });
              }}
              className="w-full"
            >
              הסר מחיר מינימום
            </Button>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              ביטול
            </Button>
            <Button
              onClick={handleSaveField}
              disabled={
                tempValue !== "" && (isNaN(parseFloat(tempValue)) || parseFloat(tempValue) < 0)
              }
              className="flex-1"
            >
              שמור מחיר
            </Button>
          </div>
        </div>
      )}

      {/* Color Editing */}
      {editMode === "color" && (
        <div className="space-y-4">
          <div className="text-center">
            <div
              className="h-16 w-16 mx-auto mb-3 rounded-lg border-4 border-gray-300 shadow-lg"
              style={{ backgroundColor: element.color || "#3B82F6" }}
            />
            <h3 className="text-xl font-semibold mb-2">בחירת צבע</h3>
            <p className="text-sm text-muted-foreground">בחר צבע לאזור</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-color-field" className="text-base font-medium">
              צבע האזור
            </Label>
            <Input
              id="edit-color-field"
              type="color"
              value={element.color || "#3B82F6"}
              onChange={(e) => onChange({ ...element, color: e.target.value })}
              className="h-16 w-full cursor-pointer"
            />
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                ביטול
              </Button>
              <Button onClick={() => setEditMode("select")} className="flex-1">
                שמור צבע
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Description Editing */}
      {editMode === "description" && (
        <div className="space-y-4">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-xl font-semibold mb-2">תיאור האזור</h3>
            <p className="text-sm text-muted-foreground">הוסף תיאור לאזור (אופציונלי)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description-field" className="text-base font-medium">
              תיאור
            </Label>
            <Textarea
              id="edit-description-field"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="הזן תיאור..."
              rows={4}
              className="text-base"
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              ביטול
            </Button>
            <Button onClick={handleSaveField} className="flex-1">
              שמור תיאור
            </Button>
          </div>
        </div>
      )}
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

  const filteredElements = elements.filter((e) => filterType === "all" || e.type === filterType);

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
              <div className="text-center py-8 text-muted-foreground">{t("common.empty")}</div>
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
