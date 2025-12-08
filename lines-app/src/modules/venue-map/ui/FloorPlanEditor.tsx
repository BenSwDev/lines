/**
 * Floor Plan Editor - New Clean Implementation
 * Modular, maintainable, production-ready floor plan editor
 * Uses new hierarchical sidebar, edit panel, and zoom features
 */

"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { useDevice } from "../hooks";
import { useElementSelection } from "../hooks/useElementSelection";
import { useZoomToElement } from "../hooks/useZoomToElement";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useTransform } from "../hooks/useTransform";
import { FreeTransform } from "./FreeTransform";
import type { FloorPlanElement, ViewState } from "../types";
import { GRID_SIZE } from "../types";
import { saveVenueFloorPlan } from "../actions/floorPlanActions";
import { autoLinkElementsToZones } from "../utils/zoneContainment";
import { getTableDefaults, getZoneDefaults } from "../utils/smartDefaults";
import { HistoryManager } from "../utils/historyManager";
import { AutoSaveManager } from "../utils/autoSave";
import { CanvasViewport } from "./FloorPlanCanvas/CanvasViewport";
import { CanvasGrid } from "./FloorPlanCanvas/CanvasGrid";
import { ElementRenderer } from "./Elements/ElementRenderer";
import { HierarchicalSidebar } from "./Sidebar/HierarchicalSidebar";
import { EditPanel } from "./EditPanel/EditPanel";
import { ViewControls } from "./ViewControls";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { SuccessAnimation } from "./UX/SuccessAnimation";

interface FloorPlanEditorProps {
  venueId: string;
  initialElements?: FloorPlanElement[];
  initialCapacity?: number;
  userId?: string;
}

export function FloorPlanEditor({
  venueId,
  initialElements = [],
  userId
}: FloorPlanEditorProps) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const device = useDevice();

  // Core state
  const [elements, setElements] = useState<FloorPlanElement[]>(initialElements);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // View state
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: true,
    showTables: true,
    showZones: true,
    showBars: true,
    viewMode: "detailed"
  });

  // Edit panel state
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const screenToCanvasRef = useRef<((x: number, y: number) => { x: number; y: number }) | null>(
    null
  );
  const historyManagerRef = useRef(new HistoryManager<FloorPlanElement>(50));
  const autoSaveManagerRef = useRef<AutoSaveManager<FloorPlanElement[]> | null>(null);

  // Hooks
  const selection = useElementSelection();
  const { zoomToElement } = useZoomToElement();
  const dragAndDrop = useDragAndDrop();
  const transform = useTransform();

  // Initialize auto-save
  useEffect(() => {
    autoSaveManagerRef.current = new AutoSaveManager<FloorPlanElement[]>(
      async (data) => {
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
            zoneId: e.zoneId,
            color: e.color
          }));

        const zones = data
          .filter((e) => e.type === "zone")
          .map((e) => ({
            id: e.id,
            name: e.name,
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
            shape: e.shape,
            color: e.color || "#3B82F6",
            description: e.description,
            polygonPoints: e.polygonPoints
          }));

        await saveVenueFloorPlan(venueId, tables, zones, [], userId);
      },
      2000 // Auto-save every 2 seconds
    );
  }, [venueId, userId]);

  // Update elements with history
  const updateElementsWithHistory = useCallback((newElements: FloorPlanElement[]) => {
    setElements(newElements);
    historyManagerRef.current.push(newElements);
    autoSaveManagerRef.current?.schedule(newElements);
  }, []);


  // Handle element mouse down - start drag or open edit panel
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, element: FloorPlanElement) => {
      e.stopPropagation();
      e.preventDefault();

      // Handle touch events
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      // If double click or edit panel is open, open edit panel
      if (("detail" in e && e.detail === 2) || editPanelOpen) {
        handleElementClick(element);
        return;
      }

      // Select element
      selection.selectElement(element.id);

      // Get canvas position
      if (!screenToCanvasRef.current) return;
      const canvasPos = screenToCanvasRef.current(clientX, clientY);

      // Start drag
      const selectedIds = new Set([element.id]);
      dragAndDrop.startDrag(element, canvasPos.x, canvasPos.y, selectedIds, elements);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selection, dragAndDrop, elements, editPanelOpen]
  );

  // Handle element click - open edit panel
  const handleElementClick = useCallback(
    (element: FloorPlanElement) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      selection.selectElement(element.id);
      setEditingElement(element);
      setEditPanelOpen(true);

      // Zoom to element
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newViewState = zoomToElement(element, {
          width: containerRect.width,
          height: containerRect.height
        });
        setViewState((prev) => ({
          ...prev,
          zoom: newViewState.zoom,
          pan: newViewState.pan
        }));
      }
    },
    [selection, zoomToElement]
  );

  // Handle element selection from sidebar - zoom to element
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (selection.selectedElementId && containerRef.current) {
      const element = elements.find((e) => e.id === selection.selectedElementId);
      if (element) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newViewState = zoomToElement(element, {
          width: containerRect.width,
          height: containerRect.height
        });
        setViewState((prev) => ({
          ...prev,
          zoom: newViewState.zoom,
          pan: newViewState.pan
        }));
      }
    }
  }, [selection.selectedElementId, elements, zoomToElement]);

  // Handle save element
  const handleSaveElement = useCallback(
    (id: string, updates: Partial<FloorPlanElement>) => {
      const updatedElements = elements.map((e) => (e.id === id ? { ...e, ...updates } : e));
      const linkedElements = autoLinkElementsToZones(updatedElements);
      updateElementsWithHistory(linkedElements);
    },
    [elements, updateElementsWithHistory]
  );

  // Handle delete element
  const handleDeleteElement = useCallback(
    (id: string) => {
      const newElements = elements.filter((e) => e.id !== id);
      updateElementsWithHistory(newElements);
      if (selection.selectedElementId === id) {
        selection.clearSelection();
        setEditPanelOpen(false);
      }
    },
    [elements, updateElementsWithHistory, selection]
  );

  // Handle add table
  const handleAddTable = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const centerX = 1000;
    const centerY = 1000;
    const defaults = getTableDefaults(elements);

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
      shape: "circle",
      color: defaults.color,
      seats: defaults.seats,
      tableType: "table"
    };

    const newElements = [...elements, newElement];
    const linkedElements = autoLinkElementsToZones(newElements);
    updateElementsWithHistory(linkedElements);
    selection.selectElement(newElement.id);
    handleElementClick(newElement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, updateElementsWithHistory, selection, handleElementClick]);

  // Handle add bar
  const handleAddBar = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const centerX = 1000;
    const centerY = 1000;
    const defaults = getTableDefaults(elements);

    const snappedX = Math.round((centerX - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round((centerY - defaults.size / 2) / GRID_SIZE) * GRID_SIZE;
    const snappedSize = Math.round(defaults.size / GRID_SIZE) * GRID_SIZE;

    const newElement: FloorPlanElement = {
      id: `bar-${Date.now()}`,
      type: "table",
      name: defaults.name,
      x: snappedX,
      y: snappedY,
      width: snappedSize * 2,
      height: snappedSize / 2,
      rotation: 0,
      shape: "rectangle",
      color: "#A0522D",
      seats: 0,
      tableType: "bar",
      showStools: true
    };

    const newElements = [...elements, newElement];
    const linkedElements = autoLinkElementsToZones(newElements);
    updateElementsWithHistory(linkedElements);
    selection.selectElement(newElement.id);
    handleElementClick(newElement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, updateElementsWithHistory, selection, handleElementClick]);

  // Handle add zone
  const handleAddZone = useCallback(() => {
    const centerX = 1000;
    const centerY = 1000;
    const defaults = getZoneDefaults(elements);

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
    updateElementsWithHistory(newElements);
    selection.selectElement(newElement.id);
    handleElementClick(newElement);
  }, [elements, updateElementsWithHistory, selection, handleElementClick]);

  // Handle save (manual save)
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
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
          shape: e.shape,
          zoneId: e.zoneId,
          color: e.color
        }));

      const zones = elements
        .filter((e) => e.type === "zone")
        .map((e) => ({
          id: e.id,
          name: e.name,
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          shape: e.shape,
          color: e.color || "#3B82F6",
          description: e.description,
          polygonPoints: e.polygonPoints
        }));

      const result = await saveVenueFloorPlan(venueId, tables, zones, [], userId);
      if (result.success) {
        setSuccessMessage(t("common.save") || "נשמר בהצלחה");
        setShowSuccessAnimation(true);
      } else {
        toast({
          title: t("errors.generic") || "שגיאה",
          description: "error" in result ? result.error : t("errors.saveFailed"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic") || "שגיאה",
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [elements, venueId, userId, toast, t]);

  // Filter elements based on view state
  const visibleElements = useMemo(() => {
    return elements.filter((element) => {
      if (element.type === "table" && element.tableType === "bar") {
        return viewState.showBars;
      }
      if (element.type === "table") {
        return viewState.showTables;
      }
      if (element.type === "zone") {
        return viewState.showZones;
      }
      return true;
    });
  }, [elements, viewState]);

  // Get all elements for navigation
  const allElementsForNavigation = useMemo(() => {
    return elements.sort((a, b) => a.name.localeCompare(b.name));
  }, [elements]);

  // Navigation helpers
  const getCurrentElementIndex = useCallback(() => {
    if (!editingElement) return -1;
    return allElementsForNavigation.findIndex((e) => e.id === editingElement.id);
  }, [editingElement, allElementsForNavigation]);

  const handleNavigateNext = useCallback(() => {
    const currentIndex = getCurrentElementIndex();
    if (currentIndex < allElementsForNavigation.length - 1) {
      const nextElement = allElementsForNavigation[currentIndex + 1];
      handleElementClick(nextElement);
    }
  }, [getCurrentElementIndex, allElementsForNavigation, handleElementClick]);

  const handleNavigatePrevious = useCallback(() => {
    const currentIndex = getCurrentElementIndex();
    if (currentIndex > 0) {
      const prevElement = allElementsForNavigation[currentIndex - 1];
      handleElementClick(prevElement);
    }
  }, [getCurrentElementIndex, allElementsForNavigation, handleElementClick]);

  // Handle mouse move - drag elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragAndDrop.isDragging || !screenToCanvasRef.current) return;

      const canvasPos = screenToCanvasRef.current(e.clientX, e.clientY);
      const selectedIds = selection.selectedElementId
        ? new Set([selection.selectedElementId])
        : new Set<string>();

      const updatedElements = dragAndDrop.handleDrag(
        canvasPos.x,
        canvasPos.y,
        selectedIds,
        elements
      );

      // Auto-link to zones and update
      const linkedElements = autoLinkElementsToZones(updatedElements);
      setElements(linkedElements);
    };

    const handleMouseUp = () => {
      if (dragAndDrop.isDragging) {
        dragAndDrop.endDrag();
        // Save to history after drag ends
        historyManagerRef.current.push(elements);
      }
    };

    if (dragAndDrop.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragAndDrop, selection, elements]);

  return (
    <div className="flex h-full">
      {/* Hierarchical Sidebar */}
      {(device.isDesktop || device.isTablet) && (
        <div className={`shrink-0 border-r bg-card flex flex-col ${device.isDesktop ? "w-[320px]" : "w-[280px]"}`}>
          <div className="flex-1 overflow-hidden">
            <HierarchicalSidebar
            elements={elements}
            selectedElementId={selection.selectedElementId}
            onSelectElement={selection.selectElement}
            onAddTable={handleAddTable}
            onAddZone={handleAddZone}
            onAddBar={handleAddBar}
            onDeleteElement={handleDeleteElement}
            onSaveElement={handleSaveElement}
              onEditClick={handleElementClick}
            />
          </div>
          <div className="border-t p-2">
            <ViewControls
              viewState={viewState}
              onViewStateChange={(updates) => setViewState((prev) => ({ ...prev, ...updates }))}
            />
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t("settings.venueMap") || "מפת המקום"}</h2>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? t("common.loading") : t("common.save")}
          </Button>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden">
          <CanvasViewport
            initialZoom={viewState.zoom}
            initialPan={viewState.pan}
            onZoomChange={(zoom) => setViewState((prev) => ({ ...prev, zoom }))}
            onPanChange={(pan) => setViewState((prev) => ({ ...prev, pan }))}
            onScreenToCanvas={(fn) => {
              screenToCanvasRef.current = fn;
            }}
            showGrid={viewState.showGrid}
            elements={visibleElements}
          >
            {viewState.showGrid && <CanvasGrid zoom={viewState.zoom} />}
            <div
              ref={canvasRef}
              className="absolute inset-0"
              style={{
                transform: `translate(${viewState.pan.x}px, ${viewState.pan.y}px) scale(${viewState.zoom})`,
                transformOrigin: "center center"
              }}
            >
              {visibleElements.map((element) => {
                const isSelected = selection.selectedElementId === element.id;
                return (
                  <div key={element.id} className="relative">
                    <ElementRenderer
                      element={element}
                      isSelected={isSelected}
                      isInteractive={true}
                      onMouseDown={(e) => handleElementMouseDown(e, element)}
                      onDoubleClick={() => handleElementClick(element)}
                      allElements={elements}
                      viewMode={viewState.viewMode}
                    />
                    {isSelected && (
                      <FreeTransform
                        element={element}
                        isSelected={isSelected}
                        onResizeStart={(e, handle) => {
                          e.stopPropagation();
                          if (!screenToCanvasRef.current) return;
                          const canvasPos = screenToCanvasRef.current(e.clientX, e.clientY);
                          historyManagerRef.current.push(elements);
                          transform.startResize(element, handle, canvasPos.x, canvasPos.y);
                        }}
                        onRotateStart={(e) => {
                          e.stopPropagation();
                          if (!screenToCanvasRef.current) return;
                          const canvasPos = screenToCanvasRef.current(e.clientX, e.clientY);
                          historyManagerRef.current.push(elements);
                          transform.startRotate(element, canvasPos.x, canvasPos.y);
                        }}
                        scale={viewState.zoom}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CanvasViewport>
        </div>
      </div>

      {/* Edit Panel */}
      {editPanelOpen && editingElement && (
        <div className="shrink-0 border-l bg-card w-[320px]">
          <EditPanel
            element={editingElement}
            allElements={allElementsForNavigation}
            onSave={(updates) => {
              handleSaveElement(editingElement.id, updates);
              setEditingElement({ ...editingElement, ...updates });
            }}
            onCancel={() => {
              setEditPanelOpen(false);
              setEditingElement(null);
            }}
            onNavigateNext={handleNavigateNext}
            onNavigatePrevious={handleNavigatePrevious}
            canNavigateNext={getCurrentElementIndex() < allElementsForNavigation.length - 1}
            canNavigatePrevious={getCurrentElementIndex() > 0}
          />
        </div>
      )}

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        message={successMessage}
        onComplete={() => setShowSuccessAnimation(false)}
      />
    </div>
  );
}

