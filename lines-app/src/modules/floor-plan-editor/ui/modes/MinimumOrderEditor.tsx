"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/core/i18n/provider";
import { updateMinimumOrder } from "../../actions/floorPlanActions";
import type { Zone, Table, FloorPlanWithDetails } from "../../types";

interface MinimumOrderEditorProps {
  selectedZone: Zone | null;
  selectedTable: Table | null;
  floorPlan: FloorPlanWithDetails;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

export function MinimumOrderEditor({
  selectedZone,
  selectedTable,
  floorPlan,
  onElementSelect
}: MinimumOrderEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // If a table is selected, show table minimum order editor
  if (selectedTable) {
    return (
      <MinimumOrderForm
        target={selectedTable}
        targetType="table"
        currentMinimum={selectedTable.minimumPrice ? Number(selectedTable.minimumPrice) : null}
        isPending={isPending}
        startTransition={startTransition}
        onBack={() => onElementSelect(null, null)}
        router={router}
      />
    );
  }

  // If a zone is selected, show zone minimum order editor
  if (selectedZone) {
    return (
      <MinimumOrderForm
        target={selectedZone}
        targetType="zone"
        currentMinimum={
          selectedZone.zoneMinimumPrice ? Number(selectedZone.zoneMinimumPrice) : null
        }
        isPending={isPending}
        startTransition={startTransition}
        onBack={() => onElementSelect(null, null)}
        router={router}
      />
    );
  }

  // Default: show summary and element list
  return <MinimumOrderSummaryView floorPlan={floorPlan} onElementSelect={onElementSelect} />;
}

// Minimum Order Form
interface MinimumOrderFormProps {
  target: Zone | Table;
  targetType: "zone" | "table";
  currentMinimum: number | null;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
  onBack: () => void;
  router: ReturnType<typeof useRouter>;
}

function MinimumOrderForm({
  target,
  targetType,
  currentMinimum,
  isPending,
  startTransition,
  onBack,
  router
}: MinimumOrderFormProps) {
  const { t } = useTranslations();
  const [minimumPrice, setMinimumPrice] = useState<string>(currentMinimum?.toString() ?? "");

  const handleSave = () => {
    startTransition(async () => {
      await updateMinimumOrder({
        targetType,
        targetId: target.id,
        minimumPrice: minimumPrice ? Number(minimumPrice) : 0
      });
      router.refresh();
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            💰 {t("floorPlan.editMinimumOrder", { defaultValue: "עריכת מינימום הזמנה" })}
          </h3>
          <p className="text-sm text-muted-foreground">{target.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t("common.back", { defaultValue: "חזרה" })}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="minimum-price">
            {t("floorPlan.minimumOrderAmount", { defaultValue: "סכום מינימום הזמנה" })}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₪
            </span>
            <Input
              id="minimum-price"
              type="number"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value)}
              placeholder="0"
              className="pl-8"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label>{t("floorPlan.quickPresets", { defaultValue: "ערכים מהירים" })}</Label>
          <div className="flex flex-wrap gap-2">
            {[100, 200, 300, 500, 750, 1000].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => setMinimumPrice(preset.toString())}
                className={cn(minimumPrice === preset.toString() && "ring-2 ring-primary")}
              >
                ₪{preset}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={isPending} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {isPending
            ? t("floorPlan.saving", { defaultValue: "שומר..." })
            : t("floorPlan.save", { defaultValue: "שמור" })}
        </Button>

        {/* Clear button */}
        <Button variant="ghost" onClick={() => setMinimumPrice("")} className="w-full">
          {t("floorPlan.clearMinimum", { defaultValue: "נקה מינימום" })}
        </Button>
      </div>
    </div>
  );
}

// Minimum Order Summary View
interface MinimumOrderSummaryViewProps {
  floorPlan: FloorPlanWithDetails;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

function MinimumOrderSummaryView({ floorPlan, onElementSelect }: MinimumOrderSummaryViewProps) {
  const { t } = useTranslations();

  // Calculate zones with minimum
  const zonesWithMinimum = floorPlan.zones.filter((z) => z.zoneMinimumPrice);
  const tablesWithMinimum = floorPlan.zones.flatMap((z) => z.tables.filter((t) => t.minimumPrice));

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-lg">
          💰 {t("floorPlan.minimumOrderOverview", { defaultValue: "סקירת מינימום הזמנה" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("floorPlan.selectElementToEditMinimum", {
            defaultValue: "בחר איזור או שולחן להגדרת מינימום הזמנה"
          })}
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted rounded-lg space-y-3">
        <h4 className="font-medium">📊 {t("floorPlan.summary", { defaultValue: "סיכום" })}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{zonesWithMinimum.length}</div>
            <div className="text-sm text-muted-foreground">
              {t("floorPlan.zonesWithMinimum", { defaultValue: "איזורים עם מינימום" })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{tablesWithMinimum.length}</div>
            <div className="text-sm text-muted-foreground">
              {t("floorPlan.tablesWithMinimum", { defaultValue: "שולחנות עם מינימום" })}
            </div>
          </div>
        </div>
      </div>

      {/* Zone List */}
      <div className="space-y-2">
        <h4 className="font-medium">{t("floorPlan.byZone", { defaultValue: "לפי איזור" })}</h4>
        {floorPlan.zones.map((zone) => {
          const zoneMin = zone.zoneMinimumPrice ? Number(zone.zoneMinimumPrice) : null;

          return (
            <button
              key={zone.id}
              className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
              onClick={() => onElementSelect(zone.id, "zone")}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                <span className="font-medium">{zone.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {zoneMin ? (
                  <span className="text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                    ₪{zoneMin}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t("floorPlan.notSet", { defaultValue: "לא הוגדר" })}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tables with special minimums */}
      {tablesWithMinimum.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">
            {t("floorPlan.tablesWithSpecialMinimum", { defaultValue: "שולחנות עם מינימום מיוחד" })}
          </h4>
          {floorPlan.zones.map((zone) =>
            zone.tables
              .filter((t) => t.minimumPrice)
              .map((table) => (
                <button
                  key={table.id}
                  className="w-full flex items-center justify-between p-2 pl-4 rounded-lg border hover:bg-muted/50 text-sm"
                  onClick={() => onElementSelect(table.id, "table")}
                >
                  <div className="flex items-center gap-2">
                    <span>{table.name}</span>
                    <span className="text-muted-foreground">({zone.name})</span>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                    ₪{Number(table.minimumPrice)}
                  </span>
                </button>
              ))
          )}
        </div>
      )}
    </div>
  );
}

export default MinimumOrderEditor;
