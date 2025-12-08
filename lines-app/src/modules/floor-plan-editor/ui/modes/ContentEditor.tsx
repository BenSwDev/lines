"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, ChevronDown, ChevronRight, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/core/i18n/provider";
import { updateZoneContent, updateTableContent, autoGenerateTables } from "../../actions/floorPlanActions";
import type { Zone, Table, FloorPlanWithDetails } from "../../types";

interface ContentEditorProps {
  selectedZone: Zone | null;
  selectedTable: Table | null;
  floorPlan: FloorPlanWithDetails;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

export function ContentEditor({
  selectedZone,
  selectedTable,
  floorPlan,
  onElementSelect
}: ContentEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // If a table is selected, show table editor
  if (selectedTable) {
    return (
      <TableContentEditor
        table={selectedTable}
        isPending={isPending}
        startTransition={startTransition}
        onBack={() => onElementSelect(null, null)}
        router={router}
      />
    );
  }

  // If a zone is selected, show zone editor
  if (selectedZone) {
    return (
      <ZoneContentEditor
        zone={selectedZone}
        isPending={isPending}
        startTransition={startTransition}
        onBack={() => onElementSelect(null, null)}
        onTableSelect={(tableId) => onElementSelect(tableId, "table")}
        router={router}
      />
    );
  }

  // Default: show element list
  return <ElementListView floorPlan={floorPlan} onElementSelect={onElementSelect} />;
}

// Zone Content Editor
interface ZoneContentEditorProps {
  zone: Zone;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
  onBack: () => void;
  onTableSelect: (tableId: string) => void;
  router: ReturnType<typeof useRouter>;
}

function ZoneContentEditor({
  zone,
  isPending,
  startTransition,
  onBack,
  onTableSelect,
  router
}: ZoneContentEditorProps) {
  const { t } = useTranslations();
  const isBar = zone.zoneType === "bar";
  const isKitchen = zone.zoneType === "kitchen" || zone.isKitchen;
  
  const [formData, setFormData] = useState({
    name: zone.name,
    zoneNumber: zone.zoneNumber ?? "",
    description: zone.description ?? "",
    // Bar-specific fields
    barNumber: zone.barNumber?.toString() ?? "",
    barName: zone.barName ?? "",
    barSeats: zone.barSeats?.toString() ?? "",
    barMinimumPrice: zone.barMinimumPrice?.toString() ?? ""
  });

  const handleSave = () => {
    startTransition(async () => {
      await updateZoneContent({
        id: zone.id,
        name: formData.name,
        zoneNumber: formData.zoneNumber ? Number(formData.zoneNumber) : null,
        description: formData.description || null,
        // Bar-specific fields
        ...(isBar && {
          barNumber: formData.barNumber ? Number(formData.barNumber) : null,
          barName: formData.barName || null,
          barSeats: formData.barSeats ? Number(formData.barSeats) : null,
          barMinimumPrice: formData.barMinimumPrice ? Number(formData.barMinimumPrice) : null
        })
      });
      router.refresh();
    });
  };

  // Get tables from parent zone
  const tables = (zone as Zone & { tables?: Table[] }).tables ?? [];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            ✏️ {t("floorPlan.editZone", { defaultValue: "עריכת איזור" })}
          </h3>
          <p className="text-sm text-muted-foreground">{zone.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t("common.back", { defaultValue: "חזרה" })}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="zone-name">{t("floorPlan.name", { defaultValue: "שם" })}</Label>
          <Input
            id="zone-name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone-number">
            {t("floorPlan.zoneNumber", { defaultValue: "מספר איזור" })}
          </Label>
          <Input
            id="zone-number"
            type="number"
            value={formData.zoneNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, zoneNumber: e.target.value }))}
            placeholder="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone-desc">{t("floorPlan.description", { defaultValue: "תיאור" })}</Label>
          <Textarea
            id="zone-desc"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={t("floorPlan.descriptionPlaceholder", {
              defaultValue: "תיאור אופציונלי..."
            })}
            rows={3}
          />
        </div>

        {/* Bar-specific fields */}
        {isBar && (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              🍸 {t("floorPlan.barSettings", { defaultValue: "הגדרות בר" })}
            </h4>
            <div className="space-y-2">
              <Label htmlFor="bar-number">
                {t("floorPlan.barNumber", { defaultValue: "מספר בר" })}
              </Label>
              <Input
                id="bar-number"
                type="number"
                value={formData.barNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, barNumber: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bar-name">
                {t("floorPlan.barName", { defaultValue: "שם בר" })}
              </Label>
              <Input
                id="bar-name"
                value={formData.barName}
                onChange={(e) => setFormData((prev) => ({ ...prev, barName: e.target.value }))}
                placeholder={t("floorPlan.barNamePlaceholder", { defaultValue: "שם הבר" })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bar-seats">
                {t("floorPlan.barSeats", { defaultValue: "כמות כיסאות" })}
              </Label>
              <Input
                id="bar-seats"
                type="number"
                value={formData.barSeats}
                onChange={(e) => setFormData((prev) => ({ ...prev, barSeats: e.target.value }))}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bar-minimum-price">
                {t("floorPlan.barMinimumPrice", { defaultValue: "מינימום הזמנה" })}
              </Label>
              <Input
                id="bar-minimum-price"
                type="number"
                step="0.01"
                value={formData.barMinimumPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, barMinimumPrice: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {/* Kitchen indicator */}
        {isKitchen && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-900 dark:text-orange-100">
              👨‍🍳 {t("floorPlan.kitchenNote", { defaultValue: "מטבח - ניתן להגדיר סידור עבודה בלבד (ללא מינימום הזמנה)" })}
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={isPending} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {isPending
            ? t("floorPlan.saving", { defaultValue: "שומר..." })
            : t("floorPlan.save", { defaultValue: "שמור" })}
        </Button>
      </div>

      {/* Auto-generate Tables Button - Only for seating zones */}
      {zone.zoneType === "seating" && tables.length === 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
            {t("floorPlan.autoGenerateTablesDescription", {
              defaultValue: "צור שולחנות אוטומטית שימלאו את האיזור"
            })}
          </p>
          <AutoGenerateTablesButton zoneId={zone.id} router={router} />
        </div>
      )}

      {/* Tables in Zone */}
      {tables.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">
            {t("floorPlan.tablesInZone", { defaultValue: "שולחנות באיזור" })} ({tables.length})
          </h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {tables.map((table) => (
              <button
                key={table.id}
                className="w-full text-left p-2 rounded bg-muted/50 hover:bg-muted text-sm flex justify-between items-center"
                onClick={() => onTableSelect(table.id)}
              >
                <span>{table.name}</span>
                <span className="text-muted-foreground">
                  {table.seats} {t("floorPlan.seats", { defaultValue: "מושבים" })}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Table Content Editor
interface TableContentEditorProps {
  table: Table;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
  onBack: () => void;
  router: ReturnType<typeof useRouter>;
}

function TableContentEditor({
  table,
  isPending,
  startTransition,
  onBack,
  router
}: TableContentEditorProps) {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    name: table.name,
    tableNumber: table.tableNumber ?? "",
    seats: table.seats ?? ""
  });

  const handleSave = () => {
    startTransition(async () => {
      await updateTableContent({
        id: table.id,
        name: formData.name,
        tableNumber: formData.tableNumber ? Number(formData.tableNumber) : null,
        seats: formData.seats ? Number(formData.seats) : null
      });
      router.refresh();
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            ✏️ {t("floorPlan.editTable", { defaultValue: "עריכת שולחן" })}
          </h3>
          <p className="text-sm text-muted-foreground">{table.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t("common.back", { defaultValue: "חזרה" })}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="table-name">{t("floorPlan.name", { defaultValue: "שם" })}</Label>
          <Input
            id="table-name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="table-number">
            {t("floorPlan.tableNumber", { defaultValue: "מספר שולחן" })}
          </Label>
          <Input
            id="table-number"
            type="number"
            value={formData.tableNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, tableNumber: e.target.value }))}
            placeholder="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="table-seats">{t("floorPlan.seats", { defaultValue: "מושבים" })}</Label>
          <Input
            id="table-seats"
            type="number"
            value={formData.seats}
            onChange={(e) => setFormData((prev) => ({ ...prev, seats: e.target.value }))}
            placeholder="4"
          />
        </div>

        <Button onClick={handleSave} disabled={isPending} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {isPending
            ? t("floorPlan.saving", { defaultValue: "שומר..." })
            : t("floorPlan.save", { defaultValue: "שמור" })}
        </Button>
      </div>
    </div>
  );
}

// Element List View
interface ElementListViewProps {
  floorPlan: FloorPlanWithDetails;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

function ElementListView({ floorPlan, onElementSelect }: ElementListViewProps) {
  const { t } = useTranslations();
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

  const toggleZone = (zoneId: string) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">
          📝 {t("floorPlan.editContent", { defaultValue: "עריכת סידור הושבה" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("floorPlan.selectElementToEdit", { defaultValue: "בחר אלמנט לעריכה" })}
        </p>
      </div>

      <div className="space-y-2">
        {floorPlan.zones.map((zone) => (
          <div key={zone.id} className="rounded-lg border overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
              onClick={() => toggleZone(zone.id)}
            >
              <div className="flex items-center gap-2">
                {expandedZones.has(zone.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                <span className="font-medium">{zone.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onElementSelect(zone.id, "zone");
                }}
              >
                {t("floorPlan.edit", { defaultValue: "עריכה" })}
              </Button>
            </button>
            {expandedZones.has(zone.id) && zone.tables.length > 0 && (
              <div className="border-t bg-muted/30">
                {zone.tables.map((table) => (
                  <button
                    key={table.id}
                    className="w-full flex items-center justify-between p-2 pl-10 hover:bg-muted/50 text-sm"
                    onClick={() => onElementSelect(table.id, "table")}
                  >
                    <span>{table.name}</span>
                    <span className="text-muted-foreground">
                      {table.seats} {t("floorPlan.seats", { defaultValue: "מושבים" })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Auto-generate Tables Button Component
interface AutoGenerateTablesButtonProps {
  zoneId: string;
  router: ReturnType<typeof useRouter>;
}

function AutoGenerateTablesButton({ zoneId, router }: AutoGenerateTablesButtonProps) {
  const { t } = useTranslations();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAutoGenerate = () => {
    setIsGenerating(true);
    startTransition(async () => {
      const result = await autoGenerateTables({
        zoneId,
        tableWidth: 60,
        tableHeight: 60,
        spacing: 10,
        defaultSeats: 4
      });
      if (result.success) {
        router.refresh();
      }
      setIsGenerating(false);
    });
  };

  return (
    <Button
      onClick={handleAutoGenerate}
      disabled={isGenerating || isPending}
      className="w-full gap-2"
      variant="outline"
    >
      <Grid3x3 className="h-4 w-4" />
      {isGenerating || isPending
        ? t("floorPlan.generating", { defaultValue: "יוצר שולחנות..." })
        : t("floorPlan.autoGenerateTables", { defaultValue: "צור שולחנות אוטומטית" })}
    </Button>
  );
}

export default ContentEditor;
