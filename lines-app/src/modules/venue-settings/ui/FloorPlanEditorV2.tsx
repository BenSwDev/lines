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
  Plus,
  Square,
  Trash2,
  Save,
  Grid,
  Layout,
  List,
  MapPin,
  DoorOpen,
  Utensils
} from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { saveVenueTables } from "../actions/floorPlanActions";

export type ElementShape = "rectangle" | "circle" | "oval" | "square" | "polygon";

export type ElementType = "table" | "zone" | "specialArea";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"interactive" | "nonInteractive">("interactive");
  const [venueCapacity, setVenueCapacity] = useState(initialCapacity);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);

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
      const size = type === "table" ? DEFAULT_TABLE_SIZE : type === "zone" ? DEFAULT_ZONE_SIZE : DEFAULT_AREA_SIZE;

      const newElement: FloorPlanElement = {
        id: `${type}-${Date.now()}`,
        type,
        name:
          type === "table"
            ? `שולחן ${elements.filter((e) => e.type === "table").length + 1}`
            : type === "zone"
              ? `אזור ${elements.filter((e) => e.type === "zone").length + 1}`
              : t(`floorPlan.specialAreas.${areaType || "other"}`),
        x: Math.max(0, centerX - size / 2),
        y: Math.max(0, centerY - size / 2),
        width: size,
        height: size,
        rotation: 0,
        shape: "rectangle",
        color: type === "zone" ? "#3B82F6" : type === "specialArea" ? "#10B981" : undefined,
        seats: type === "table" ? 4 : undefined,
        areaType: type === "specialArea" ? areaType || "other" : undefined
      };

      setElements([...elements, newElement]);
      setSelectedElementId(newElement.id);
      setEditingElement(newElement);
      setEditDialogOpen(true);
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

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  return (
    <div className="flex h-[calc(100vh-250px)] flex-col gap-4">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2">
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

      {/* View Mode Tabs */}
      <div className="flex shrink-0 items-center gap-4">
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
            {/* Render Elements */}
            {elements.map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                isInteractive={viewMode === "interactive"}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onDoubleClick={() => handleEditElement(element)}
                onDelete={() => handleDeleteElement(element.id)}
              />
            ))}
          </div>
        </Card>

        {/* Properties Panel - Only in interactive mode */}
        {viewMode === "interactive" && selectedElement && (
          <Card className="w-80 shrink-0 overflow-y-auto">
            <div className="space-y-4 p-4">
              <h3 className="font-semibold">{t("floorPlan.edit")}</h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("common.name")}</Label>
                <div className="text-sm">{selectedElement.name}</div>
              </div>
              {selectedElement.type === "table" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("common.seats")}</Label>
                  <div className="text-sm">{selectedElement.seats || "-"}</div>
                </div>
              )}
              {selectedElement.type === "zone" && selectedElement.color && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("common.color")}</Label>
                  <div
                    className="h-8 w-full rounded border"
                    style={{ backgroundColor: selectedElement.color }}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditElement(selectedElement)}
                  className="flex-1"
                >
                  {t("common.edit")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteElement(selectedElement.id)}
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingElement?.type === "table"
                ? t("floorPlan.editTable")
                : editingElement?.type === "zone"
                  ? t("floorPlan.editZone")
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
}

function ElementRenderer({
  element,
  isSelected,
  isInteractive,
  onMouseDown,
  onDoubleClick
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
    return { ...baseStyle, borderRadius: "8px" };
  };

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

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="edit-name">{t("common.name")}</Label>
        <Input
          id="edit-name"
          value={element.name}
          onChange={(e) => onChange({ ...element, name: e.target.value })}
        />
      </div>

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

      {/* Zone specific: Color */}
      {element.type === "zone" && (
        <div className="space-y-2">
          <Label htmlFor="edit-color">{t("common.color")}</Label>
          <Input
            id="edit-color"
            type="color"
            value={element.color || "#3B82F6"}
            onChange={(e) => onChange({ ...element, color: e.target.value })}
          />
        </div>
      )}

      {/* Special Area specific: Color and Type */}
      {element.type === "specialArea" && (
        <>
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

