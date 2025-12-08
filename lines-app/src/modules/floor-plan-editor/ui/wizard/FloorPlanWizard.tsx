"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/core/i18n/provider";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Square,
  RectangleHorizontal,
  LayoutPanelLeft,
  Sparkles,
  GripVertical,
  Plus,
  Minus,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { createFloorPlan } from "../../actions/floorPlanActions";
import { ZONE_TYPE_CONFIGS } from "../../types";
import type {
  WizardStep,
  WizardState,
  WizardZone,
  VenueShape,
  VenueSize,
  ZoneTypeKey
} from "../../types";

interface FloorPlanWizardProps {
  venueId: string;
  lines: { id: string; name: string; color: string }[];
  onCancel: () => void;
  onComplete: (floorPlanId: string) => void;
}

const STEPS: WizardStep[] = ["shape", "size", "zones", "tables", "finish"];

export function FloorPlanWizard({ venueId, lines, onCancel, onComplete }: FloorPlanWizardProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [state, setState] = useState<WizardState>({
    step: "shape",
    venueShape: "rectangle",
    venueSize: "medium",
    zones: [],
    floorPlanName: "",
    selectedLineIds: []
  });

  const currentStepIndex = STEPS.indexOf(state.step);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setState((prev) => ({ ...prev, step: STEPS[nextIndex] }));
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setState((prev) => ({ ...prev, step: STEPS[prevIndex] }));
    } else {
      onCancel();
    }
  };

  const handleFinish = () => {
    startTransition(async () => {
      // Convert wizard state to floor plan input
      const zones = state.zones.map((zone, index) => ({
        name: zone.name,
        color: zone.color,
        positionX: zone.position.x,
        positionY: zone.position.y,
        width: zone.size.width,
        height: zone.size.height,
        zoneNumber: index + 1,
        tables: Array.from({ length: zone.tableCount }, (_, i) => ({
          name: `${t("table", { defaultValue: "Table" })} ${i + 1}`,
          seats: zone.seatsPerTable,
          tableNumber: i + 1
        }))
      }));

      const result = await createFloorPlan({
        venueId,
        name: state.floorPlanName || t("newFloorPlan", { defaultValue: "New Floor Plan" }),
        isDefault: true,
        zones,
        lineIds: state.selectedLineIds
      });

      if (result.success && result.data) {
        onComplete(result.data.id);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Progress Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            🏠 {t("createFloorPlan", { defaultValue: "Create Floor Plan" })}
          </h2>
          <Button variant="ghost" onClick={onCancel}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : index === currentStepIndex
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-1 mx-1",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto p-6">
        {state.step === "shape" && (
          <ShapeStep
            value={state.venueShape}
            onChange={(shape) => setState((prev) => ({ ...prev, venueShape: shape }))}
          />
        )}
        {state.step === "size" && (
          <SizeStep
            value={state.venueSize}
            onChange={(size) => setState((prev) => ({ ...prev, venueSize: size }))}
          />
        )}
        {state.step === "zones" && (
          <ZonesStep
            zones={state.zones}
            onChange={(zones) => setState((prev) => ({ ...prev, zones }))}
          />
        )}
        {state.step === "tables" && (
          <TablesStep
            zones={state.zones}
            onChange={(zones) => setState((prev) => ({ ...prev, zones }))}
          />
        )}
        {state.step === "finish" && (
          <FinishStep
            state={state}
            lines={lines}
            onChange={(updates) => setState((prev) => ({ ...prev, ...updates }))}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t flex justify-between">
        <Button variant="outline" onClick={goBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {currentStepIndex === 0
            ? t("cancel", { defaultValue: "Cancel" })
            : t("back", { defaultValue: "Back" })}
        </Button>

        {state.step === "finish" ? (
          <Button onClick={handleFinish} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {isPending
              ? t("creating", { defaultValue: "Creating..." })
              : t("createFloorPlan", { defaultValue: "Create Floor Plan" })}
          </Button>
        ) : (
          <Button onClick={goNext} className="gap-2">
            {t("next", { defaultValue: "Next" })}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Step 1: Shape Selection
interface ShapeStepProps {
  value: VenueShape;
  onChange: (shape: VenueShape) => void;
}

function ShapeStep({ value, onChange }: ShapeStepProps) {
  const { t } = useTranslations();

  const shapes = [
    {
      id: "rectangle" as const,
      icon: RectangleHorizontal,
      label: t("rectangle", { defaultValue: "Rectangle" })
    },
    { id: "square" as const, icon: Square, label: t("square", { defaultValue: "Square" }) },
    {
      id: "l-shape" as const,
      icon: LayoutPanelLeft,
      label: t("lShape", { defaultValue: "L Shape" })
    },
    { id: "custom" as const, icon: Sparkles, label: t("custom", { defaultValue: "Custom" }) }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          🏠 {t("whatShapeIsYourVenue", { defaultValue: "What shape is your venue?" })}
        </h3>
        <p className="text-muted-foreground">
          {t("chooseClosestShape", {
            defaultValue: "Choose the closest shape to your venue layout"
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            className={cn(
              "p-6 rounded-xl border-2 transition-all hover:shadow-md",
              value === shape.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-muted hover:border-primary/50"
            )}
            onClick={() => onChange(shape.id)}
          >
            <shape.icon
              className={cn(
                "h-12 w-12 mx-auto mb-3",
                value === shape.id ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div className="font-medium">{shape.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Size Selection
interface SizeStepProps {
  value: VenueSize;
  onChange: (size: VenueSize) => void;
}

function SizeStep({ value, onChange }: SizeStepProps) {
  const { t } = useTranslations();

  const sizes = [
    {
      id: "small" as const,
      label: t("small", { defaultValue: "Small" }),
      description: "< 50 seats",
      width: 400,
      height: 300
    },
    {
      id: "medium" as const,
      label: t("medium", { defaultValue: "Medium" }),
      description: "50-150 seats",
      width: 600,
      height: 450
    },
    {
      id: "large" as const,
      label: t("large", { defaultValue: "Large" }),
      description: "150+ seats",
      width: 800,
      height: 600
    }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          📐 {t("howBigIsYourVenue", { defaultValue: "How big is your venue?" })}
        </h3>
        <p className="text-muted-foreground">
          {t("selectApproximateSize", { defaultValue: "Select the approximate size" })}
        </p>
      </div>

      <div className="space-y-3">
        {sizes.map((size) => (
          <button
            key={size.id}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all hover:shadow-md flex items-center justify-between",
              value === size.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-muted hover:border-primary/50"
            )}
            onClick={() => onChange(size.id)}
          >
            <div className="text-left">
              <div className="font-medium text-lg">{size.label}</div>
              <div className="text-sm text-muted-foreground">{size.description}</div>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                value === size.id ? "border-primary bg-primary" : "border-muted"
              )}
            >
              {value === size.id && <Check className="h-4 w-4 text-primary-foreground" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 3: Zones
interface ZonesStepProps {
  zones: WizardZone[];
  onChange: (zones: WizardZone[]) => void;
}

function ZonesStep({ zones, onChange }: ZonesStepProps) {
  const { t } = useTranslations();

  const addZone = (type: ZoneTypeKey) => {
    const config = ZONE_TYPE_CONFIGS[type];
    const newZone: WizardZone = {
      id: `zone-${Date.now()}`,
      type,
      name: config.label,
      color: config.defaultColor,
      tableCount: type === "seating" || type === "vip" ? 4 : 0,
      seatsPerTable: 4,
      autoFill: true,
      position: { x: 50 + zones.length * 50, y: 50 },
      size: { width: 200, height: 150 }
    };
    onChange([...zones, newZone]);
  };

  const removeZone = (id: string) => {
    onChange(zones.filter((z) => z.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          🪑 {t("addZonesToYourVenue", { defaultValue: "Add zones to your venue" })}
        </h3>
        <p className="text-muted-foreground">
          {t("dragZonesToAdd", { defaultValue: "Click to add zones to your floor plan" })}
        </p>
      </div>

      {/* Zone Type Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {(
          Object.entries(ZONE_TYPE_CONFIGS) as [
            ZoneTypeKey,
            (typeof ZONE_TYPE_CONFIGS)[ZoneTypeKey]
          ][]
        ).map(([type, config]) => (
          <Button key={type} variant="outline" className="gap-2" onClick={() => addZone(type)}>
            <span>{config.icon}</span>
            {config.label}
          </Button>
        ))}
      </div>

      {/* Added Zones */}
      {zones.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">{t("addedZones", { defaultValue: "Added Zones" })}</h4>
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
                <span className="font-medium">{zone.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeZone(zone.id)}>
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {zones.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          <p>{t("noZonesYet", { defaultValue: "No zones added yet" })}</p>
          <p className="text-sm">
            {t("clickButtonsAbove", { defaultValue: "Click the buttons above to add zones" })}
          </p>
        </div>
      )}
    </div>
  );
}

// Step 4: Tables
interface TablesStepProps {
  zones: WizardZone[];
  onChange: (zones: WizardZone[]) => void;
}

function TablesStep({ zones, onChange }: TablesStepProps) {
  const { t } = useTranslations();

  const updateZone = (id: string, updates: Partial<WizardZone>) => {
    onChange(zones.map((z) => (z.id === id ? { ...z, ...updates } : z)));
  };

  const seatingZones = zones.filter((z) => z.type === "seating" || z.type === "vip");

  if (seatingZones.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h3 className="text-2xl font-bold mb-2">
          {t("noSeatingZones", { defaultValue: "No seating zones added" })}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t("goBackToAddZones", { defaultValue: "Go back to add seating zones first" })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          🍽️ {t("configureTablesInZones", { defaultValue: "Configure tables in each zone" })}
        </h3>
        <p className="text-muted-foreground">
          {t("setTableCountAndSeats", {
            defaultValue: "Set the number of tables and seats per table"
          })}
        </p>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        {seatingZones.map((zone) => (
          <div key={zone.id} className="p-4 rounded-xl border space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
              <span className="font-semibold">{zone.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("numberOfTables", { defaultValue: "Number of Tables" })}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateZone(zone.id, { tableCount: Math.max(0, zone.tableCount - 1) })
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={zone.tableCount}
                    onChange={(e) =>
                      updateZone(zone.id, { tableCount: parseInt(e.target.value) || 0 })
                    }
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateZone(zone.id, { tableCount: zone.tableCount + 1 })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("seatsPerTable", { defaultValue: "Seats per Table" })}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateZone(zone.id, { seatsPerTable: Math.max(1, zone.seatsPerTable - 1) })
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={zone.seatsPerTable}
                    onChange={(e) =>
                      updateZone(zone.id, { seatsPerTable: parseInt(e.target.value) || 1 })
                    }
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateZone(zone.id, { seatsPerTable: zone.seatsPerTable + 1 })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {t("totalSeats", { defaultValue: "Total seats" })}:{" "}
              <strong>{zone.tableCount * zone.seatsPerTable}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 5: Finish
interface FinishStepProps {
  state: WizardState;
  lines: { id: string; name: string; color: string }[];
  onChange: (updates: Partial<WizardState>) => void;
}

function FinishStep({ state, lines, onChange }: FinishStepProps) {
  const { t } = useTranslations();

  const totalTables = state.zones.reduce((acc, z) => acc + z.tableCount, 0);
  const totalSeats = state.zones.reduce((acc, z) => acc + z.tableCount * z.seatsPerTable, 0);

  const toggleLine = (lineId: string) => {
    const current = state.selectedLineIds;
    if (current.includes(lineId)) {
      onChange({ selectedLineIds: current.filter((id) => id !== lineId) });
    } else {
      onChange({ selectedLineIds: [...current, lineId] });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          🎉 {t("almostDone", { defaultValue: "Almost done!" })}
        </h3>
        <p className="text-muted-foreground">
          {t("reviewAndFinish", { defaultValue: "Review your floor plan and finish setup" })}
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted rounded-xl space-y-3">
        <h4 className="font-medium">📊 {t("summary", { defaultValue: "Summary" })}</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{state.zones.length}</div>
            <div className="text-sm text-muted-foreground">
              {t("zones", { defaultValue: "Zones" })}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalTables}</div>
            <div className="text-sm text-muted-foreground">
              {t("tables", { defaultValue: "Tables" })}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalSeats}</div>
            <div className="text-sm text-muted-foreground">
              {t("seats", { defaultValue: "Seats" })}
            </div>
          </div>
        </div>
      </div>

      {/* Floor Plan Name */}
      <div className="space-y-2">
        <Label htmlFor="fp-name">{t("floorPlanName", { defaultValue: "Floor Plan Name" })}</Label>
        <Input
          id="fp-name"
          value={state.floorPlanName}
          onChange={(e) => onChange({ floorPlanName: e.target.value })}
          placeholder={t("newFloorPlan", { defaultValue: "New Floor Plan" })}
        />
      </div>

      {/* Link to Lines */}
      {lines.length > 0 && (
        <div className="space-y-2">
          <Label>{t("linkToLines", { defaultValue: "Link to Lines (optional)" })}</Label>
          <div className="space-y-2">
            {lines.map((line) => (
              <label
                key={line.id}
                className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted/50"
              >
                <Checkbox
                  checked={state.selectedLineIds.includes(line.id)}
                  onCheckedChange={() => toggleLine(line.id)}
                />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                <span>{line.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FloorPlanWizard;
