"use client";

import { useRef, useState } from "react";
import { useTranslations } from "@/core/i18n/provider";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InteractiveElement } from "./InteractiveElement";
import type { EditorMode, FloorPlanWithDetails, Zone, Table, VenueArea } from "../../types";

interface FloorPlanViewerProps {
  floorPlan: FloorPlanWithDetails;
  selectedElementId: string | null;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
  onElementDelete?: (id: string, type: "zone" | "table" | "area") => void;
  mode: EditorMode;
  canEdit?: boolean;
}

export function FloorPlanViewer({
  floorPlan,
  selectedElementId,
  onElementSelect,
  onElementDelete,
  mode,
  canEdit = true
}: FloorPlanViewerProps) {
  const { t } = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Calculate canvas dimensions based on zones
  const canvasBounds = calculateCanvasBounds(floorPlan);

  return (
    <div className="relative h-full flex flex-col">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-background/80 backdrop-blur rounded-lg p-1 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title={t("zoomIn", { defaultValue: "Zoom In" })}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title={t("zoomOut", { defaultValue: "Zoom Out" })}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title={t("resetView", { defaultValue: "Reset View" })}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,#e5e7eb_19px,#e5e7eb_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,#e5e7eb_19px,#e5e7eb_20px)] dark:bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,#374151_19px,#374151_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,#374151_19px,#374151_20px)]"
      >
        <div
          className="relative min-w-full min-h-full p-8"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "center center",
            width: canvasBounds.width + 200,
            height: canvasBounds.height + 200
          }}
        >
          {/* Venue Areas (Background) - Only show in view mode */}
          {mode === "view" &&
            floorPlan.venueAreas.map((area) => (
              <VenueAreaElement
                key={area.id}
                area={area}
                isSelected={selectedElementId === area.id}
                onClick={() => onElementSelect(area.id, "area")}
                onDelete={onElementDelete ? () => onElementDelete(area.id, "area") : undefined}
                mode={mode}
                canEdit={canEdit}
              />
            ))}

          {/* Zones */}
          {floorPlan.zones.map((zone) => (
            <ZoneElement
              key={zone.id}
              zone={zone}
              isSelected={selectedElementId === zone.id}
              selectedTableId={selectedElementId}
              onClick={() => onElementSelect(zone.id, "zone")}
              onTableClick={(tableId) => onElementSelect(tableId, "table")}
              onDelete={onElementDelete ? () => onElementDelete(zone.id, "zone") : undefined}
              onTableDelete={onElementDelete ? (tableId) => onElementDelete(tableId, "table") : undefined}
              mode={mode}
              canEdit={canEdit}
            />
          ))}
        </div>
      </div>

      {/* Info Bar */}
      <div className="px-4 py-2 border-t bg-background/80 backdrop-blur text-sm text-muted-foreground flex items-center justify-between">
        <span>
          {t("zoom", { defaultValue: "Zoom" })}: {Math.round(zoom * 100)}%
        </span>
        <span>
          {floorPlan.zones.length} {t("zones", { defaultValue: "zones" })} •
          {floorPlan.zones.reduce((acc, z) => acc + z.tables.length, 0)}{" "}
          {t("tables", { defaultValue: "tables" })}
        </span>
      </div>
    </div>
  );
}

// Zone Element Component
interface ZoneElementProps {
  zone: Zone & { tables: Table[] };
  isSelected: boolean;
  selectedTableId: string | null;
  onClick: () => void;
  onTableClick: (tableId: string) => void;
  onDelete?: () => void;
  onTableDelete?: (tableId: string) => void;
  mode: EditorMode;
  canEdit?: boolean;
}

function ZoneElement({
  zone,
  isSelected,
  selectedTableId,
  onClick,
  onTableClick,
  onDelete,
  onTableDelete,
  mode,
  canEdit = true
}: ZoneElementProps) {
  const posX = Number(zone.positionX ?? 0);
  const posY = Number(zone.positionY ?? 0);
  const width = Number(zone.width ?? 200);
  const height = Number(zone.height ?? 150);

  // Mode-specific overlays
  const getOverlayContent = () => {
    switch (mode) {
      case "staffing": {
        const staffingRules = zone.staffingRules as
          | { roleId: string; count: number; roleName?: string }[]
          | null;
        if (staffingRules && staffingRules.length > 0) {
          return (
            <div className="absolute top-1 left-1 flex gap-1">
              {staffingRules.slice(0, 2).map((rule, i) => (
                <span key={i} className="bg-blue-500 text-white text-xs px-1 rounded">
                  👤{rule.count}
                </span>
              ))}
            </div>
          );
        }
        return null;
      }
      case "minimum-order":
        if (zone.zoneMinimumPrice) {
          return (
            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
              ₪{Number(zone.zoneMinimumPrice)}
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <InteractiveElement
      id={zone.id}
      type="zone"
      x={posX}
      y={posY}
      width={width}
      height={height}
      isSelected={isSelected}
      canEdit={canEdit && mode === "view"}
      onSelect={onClick}
      onDelete={onDelete}
      className="rounded-lg border-2"
      style={{
        backgroundColor: `${zone.color}20`,
        borderColor: zone.color,
        borderStyle: isSelected ? "solid" : "dashed"
      }}
    >
      {/* Zone Label */}
      <div
        className="absolute -top-6 left-0 text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
        style={{ backgroundColor: zone.color, color: "white" }}
      >
        {zone.name}
        {zone.zoneNumber && ` #${zone.zoneNumber}`}
      </div>

      {/* Mode Overlay */}
      {getOverlayContent()}

      {/* Tables - positioned relative to zone */}
      <div className="relative w-full h-full">
        {zone.tables.map((table) => (
          <TableElement
            key={table.id}
            table={table}
            zoneColor={zone.color}
            isSelected={selectedTableId === table.id}
            onClick={() => onTableClick(table.id)}
            onDelete={onTableDelete ? () => onTableDelete(table.id) : undefined}
            mode={mode}
            canEdit={canEdit}
          />
        ))}
      </div>
    </InteractiveElement>
  );
}

// Table Element Component
interface TableElementProps {
  table: Table;
  zoneColor: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  mode: EditorMode;
  canEdit?: boolean;
}

function TableElement({
  table,
  zoneColor,
  isSelected,
  onClick,
  onDelete,
  mode,
  canEdit = true
}: TableElementProps) {
  const posX = Number(table.positionX ?? 10);
  const posY = Number(table.positionY ?? 10);
  const width = Number(table.width ?? 40);
  const height = Number(table.height ?? 40);
  const rotation = Number(table.rotation ?? 0);

  const isCircle = table.shape === "circle" || table.shape === "oval";

  // Mode-specific content
  const getModeContent = () => {
    switch (mode) {
      case "content":
        return (
          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
            {table.seats && `${table.seats}`}
          </div>
        );
      case "staffing": {
        const staffingRules = table.staffingRules as { count: number }[] | null;
        if (staffingRules && staffingRules.length > 0) {
          const total = staffingRules.reduce((acc, r) => acc + r.count, 0);
          return (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
              {total}
            </div>
          );
        }
        return null;
      }
      case "minimum-order":
        if (table.minimumPrice) {
          return (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[7px] px-1 rounded whitespace-nowrap">
              ₪{Number(table.minimumPrice)}
            </div>
          );
        }
        return null;
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-medium">
            {table.tableNumber ?? table.name}
          </div>
        );
    }
  };

  return (
    <InteractiveElement
      id={table.id}
      type="table"
      x={posX}
      y={posY}
      width={width}
      height={height}
      rotation={rotation}
      isSelected={isSelected}
      canEdit={canEdit && mode === "view"}
      onSelect={onClick}
      onDelete={onDelete}
      className={cn(
        "bg-white dark:bg-gray-800 border-2 flex items-center justify-center shadow-sm",
        isCircle ? "rounded-full" : "rounded-md"
      )}
      style={{
        borderColor: zoneColor
      }}
    >
      {getModeContent()}
    </InteractiveElement>
  );
}

// Venue Area Element Component
interface VenueAreaElementProps {
  area: VenueArea;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  mode: EditorMode;
  canEdit?: boolean;
}

function VenueAreaElement({
  area,
  isSelected,
  onClick,
  onDelete,
  canEdit = true
}: VenueAreaElementProps) {
  const posX = Number(area.positionX);
  const posY = Number(area.positionY);
  const width = Number(area.width);
  const height = Number(area.height);

  const getIcon = () => {
    switch (area.areaType) {
      case "entrance":
        return "🚪";
      case "exit":
        return "🚪";
      case "restroom":
        return "🚻";
      case "kitchen":
        return "👨‍🍳";
      case "bar":
        return "🍸";
      case "stage":
        return "🎤";
      case "dj_booth":
        return "🎧";
      case "storage":
        return "📦";
      default:
        return "📍";
    }
  };

  return (
    <InteractiveElement
      id={area.id}
      type="area"
      x={posX}
      y={posY}
      width={width}
      height={height}
      rotation={Number(area.rotation ?? 0)}
      isSelected={isSelected}
      canEdit={canEdit}
      onSelect={onClick}
      onDelete={onDelete}
      className="rounded-lg border"
      style={{
        backgroundColor: area.color ?? "#6B7280"
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-2xl">{getIcon()}</span>
        <span className="text-xs font-medium mt-1">{area.name}</span>
      </div>
    </InteractiveElement>
  );
}

// Helper function to calculate canvas bounds
function calculateCanvasBounds(floorPlan: FloorPlanWithDetails) {
  let maxX = 0;
  let maxY = 0;

  for (const zone of floorPlan.zones) {
    const zoneRight = Number(zone.positionX ?? 0) + Number(zone.width ?? 200);
    const zoneBottom = Number(zone.positionY ?? 0) + Number(zone.height ?? 150);
    maxX = Math.max(maxX, zoneRight);
    maxY = Math.max(maxY, zoneBottom);
  }

  for (const area of floorPlan.venueAreas) {
    const areaRight = Number(area.positionX) + Number(area.width);
    const areaBottom = Number(area.positionY) + Number(area.height);
    maxX = Math.max(maxX, areaRight);
    maxY = Math.max(maxY, areaBottom);
  }

  return {
    width: Math.max(maxX, 600),
    height: Math.max(maxY, 400)
  };
}

export default FloorPlanViewer;
