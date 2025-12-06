"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Sparkles
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { saveVenueTables } from "../actions/floorPlanActions";
import { getAllTemplates } from "../utils/floorPlanTemplates";

export type ElementShape = "rectangle" | "circle" | "oval" | "square" | "triangle" | "pentagon" | "hexagon" | "polygon";

export type ElementType = "table" | "zone" | "specialArea" | "security";

export type MapType = "tables" | "bars" | "general" | "security";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"interactive" | "nonInteractive">("interactive");
  const [venueCapacity, setVenueCapacity] = useState(initialCapacity);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);
  const [currentMapType, setCurrentMapType] = useState<MapType>(mapType);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Drag state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState<FloorPlanElement | null>(null);

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

  // Mouse down on element
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, element: FloorPlanElement) => {
      if (viewMode === "nonInteractive") return;
      e.stopPropagation();
      e.preventDefault();
      setSelectedElementId(element.id);
      setIsDragging(true);
      setDraggedElement(element);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        setDragOffset({
          x: canvasX - element.x,
          y: canvasY - element.y
        });
      }
    },
    [viewMode]
  );

  // Mouse move - handle dragging
  useEffect(() => {
    if (!isDragging || !draggedElement || !canvasRef.current || viewMode === "nonInteractive") return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const newX = Math.max(0, Math.min(canvasSize.width - draggedElement.width, canvasX - dragOffset.x));
      const newY = Math.max(0, Math.min(canvasSize.height - draggedElement.height, canvasY - dragOffset.y));

      setElements(
        elements.map((e) =>
          e.id === draggedElement.id
            ? {
                ...e,
                x: newX,
                y: newY
              }
            : e
        )
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedElement(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, draggedElement, dragOffset, elements, canvasSize, viewMode]);

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
          shape: e.shape as "rectangle" | "circle" | "oval" | "square",
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

  // Click canvas to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current && viewMode === "interactive") {
        setSelectedElementId(null);
      }
    },
    [viewMode]
  );

  return (
    <div className="flex h-[calc(100vh-250px)] flex-col gap-4">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTemplateDialogOpen(true)}
          >
            <Sparkles className="ml-2 h-4 w-4" />
            {t("floorPlan.templates")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="ml-2 h-4 w-4" />
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? "bg-primary/10" : ""}
          >
            <Grid className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="capacity" className="text-sm whitespace-nowrap">
              {t("floorPlan.venueCapacity")}:
            </Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              value={venueCapacity}
              onChange={(e) => setVenueCapacity(parseInt(e.target.value) || 0)}
              className={`w-20 ${capacityError ? "border-destructive" : ""}`}
            />
            {capacityError && (
              <span className="text-xs text-destructive">{t("floorPlan.capacityTooSmall")}</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {elements.filter((e) => e.type === "table").length} {t("floorPlan.tables")} •{" "}
            {totalCapacity} {t("common.seats")}
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="ml-2 h-4 w-4" />
            {isSaving ? t("common.loading") : t("common.save")}
          </Button>
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
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      {viewMode === "interactive" ? (
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
            {/* Render Elements - Filter by map type */}
            {elements
              .filter((element) => {
                if (currentMapType === "tables") return element.type === "table";
                if (currentMapType === "bars") return element.type === "table" && element.tableType === "bar";
                if (currentMapType === "security") return element.type === "security";
                return true; // general shows all
              })
              .map((element) => (
                <ElementRenderer
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
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
                />
              ))}
          </div>
        </Card>
      ) : (
        <NonInteractiveView
          elements={elements}
          onEdit={handleEditElement}
          onDelete={handleDeleteElement}
        />
      )}

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
}

function ElementRenderer({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick,
  onVertexDrag,
  allElements = []
}: ElementRendererProps) {
  const getElementStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotation}deg)`,
      transformOrigin: "center center",
      cursor: isInteractive ? (isSelected ? "move" : "grab") : "default",
      border: isSelected ? "2px solid #3B82F6" : "2px solid rgba(0,0,0,0.3)",
      backgroundColor:
        element.type === "zone"
          ? element.color || "rgba(59, 130, 246, 0.2)"
          : element.type === "specialArea"
            ? element.color || "rgba(16, 185, 129, 0.2)"
            : element.type === "security"
              ? element.color || "rgba(239, 68, 68, 0.2)"
              : isSelected
                ? "rgba(59, 130, 246, 0.15)"
                : "rgba(255, 255, 255, 0.95)",
      boxShadow: isSelected
        ? "0 4px 12px rgba(59, 130, 246, 0.3)"
        : "0 2px 4px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      transition: isSelected ? "none" : "all 0.2s ease"
    };

    if (element.shape === "circle" || element.shape === "oval") {
      return { ...baseStyle, borderRadius: "50%" };
    }
    if (element.shape === "square") {
      return { ...baseStyle, borderRadius: "4px" };
    }
    if (element.shape === "triangle" || element.shape === "pentagon" || element.shape === "hexagon" || element.shape === "polygon") {
      // For complex shapes, we'll use SVG clipPath
      return baseStyle;
    }
    return { ...baseStyle, borderRadius: "8px" };
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
    if (element.shape === "pentagon") {
      return getRegularPolygonPath(5, element.width, element.height);
    }
    if (element.shape === "hexagon") {
      return getRegularPolygonPath(6, element.width, element.height);
    }
    if (element.shape === "polygon" && element.polygonPoints && element.polygonPoints.length >= 3) {
      return element.polygonPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
    }
    return "";
  };

  const path = getPolygonPath();
  const needsSvg = element.shape === "triangle" || element.shape === "pentagon" || element.shape === "hexagon" || 
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
            <div className="text-xs font-semibold truncate">{element.name}</div>
            {element.type === "table" && element.seats && (
              <div className="text-[10px] text-muted-foreground mt-0.5">{element.seats}</div>
            )}
          </div>
        </div>
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
        <div className="text-xs font-semibold truncate">{element.name}</div>
        {element.type === "table" && element.seats && (
          <div className="text-[10px] text-muted-foreground mt-0.5">{element.seats}</div>
        )}
      </div>
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
            <SelectItem value="square">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                {t("floorPlan.shapes.square")}
              </div>
            </SelectItem>
            <SelectItem value="circle">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                {t("floorPlan.shapes.circle")}
              </div>
            </SelectItem>
            <SelectItem value="oval">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                {t("floorPlan.shapes.oval")}
              </div>
            </SelectItem>
            <SelectItem value="triangle">
              <div className="flex items-center gap-2">
                <Hexagon className="h-4 w-4" />
                {t("floorPlan.shapes.triangle")}
              </div>
            </SelectItem>
            <SelectItem value="pentagon">
              <div className="flex items-center gap-2">
                <Hexagon className="h-4 w-4" />
                {t("floorPlan.shapes.pentagon")}
              </div>
            </SelectItem>
            <SelectItem value="hexagon">
              <div className="flex items-center gap-2">
                <Hexagon className="h-4 w-4" />
                {t("floorPlan.shapes.hexagon")}
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

