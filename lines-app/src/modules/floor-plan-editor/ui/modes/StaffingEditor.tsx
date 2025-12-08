"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Minus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTranslations } from "@/core/i18n/provider";
import {
  updateStaffing,
  updateLineFloorPlanStaffing,
  getVenueLines
} from "../../actions/floorPlanActions";
import { lineFloorPlanStaffingService } from "../../services/lineFloorPlanService";
import type { Zone, Table, FloorPlanWithDetails, StaffingRule } from "../../types";

interface StaffingEditorProps {
  selectedZone: Zone | null;
  selectedTable: Table | null;
  floorPlan: FloorPlanWithDetails;
  roles: { id: string; name: string; color: string }[];
  venueId: string;
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

export function StaffingEditor({
  selectedZone,
  selectedTable,
  floorPlan,
  roles,
  venueId,
  onElementSelect
}: StaffingEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // If a table is selected, show table staffing editor
  if (selectedTable) {
    return (
      <StaffingForm
        target={selectedTable}
        targetType="table"
        roles={roles}
        floorPlan={floorPlan}
        venueId={venueId}
        isPending={isPending}
        startTransition={startTransition}
        onBack={() => onElementSelect(null, null)}
        router={router}
      />
    );
  }

  // If a zone is selected, show zone staffing editor
  if (selectedZone) {
    return (
      <StaffingForm
        target={selectedZone}
        targetType="zone"
        roles={roles}
        floorPlan={floorPlan}
        venueId={venueId}
        isPending={isPending}
        startTransition={startTransition}
        onBack={() => onElementSelect(null, null)}
        router={router}
      />
    );
  }

  // Default: show summary and element list
  return (
    <StaffingSummaryView floorPlan={floorPlan} roles={roles} onElementSelect={onElementSelect} />
  );
}

// Staffing Form
interface StaffingFormProps {
  target: Zone | Table;
  targetType: "zone" | "table";
  roles: { id: string; name: string; color: string }[];
  floorPlan: FloorPlanWithDetails;
  venueId: string;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
  onBack: () => void;
  router: ReturnType<typeof useRouter>;
}

function StaffingForm({
  target,
  targetType,
  roles,
  floorPlan,
  venueId,
  isPending,
  startTransition,
  onBack,
  router
}: StaffingFormProps) {
  const { t } = useTranslations();
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [availableLines, setAvailableLines] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  const [isLoadingLines, setIsLoadingLines] = useState(false);

  // Load available lines
  useEffect(() => {
    async function loadLines() {
      setIsLoadingLines(true);
      try {
        const result = await getVenueLines(venueId);
        if (result.success && result.data) {
          setAvailableLines(result.data);
        }
      } finally {
        setIsLoadingLines(false);
      }
    }
    loadLines();
  }, [venueId]);

  // Load existing staffing rules based on selected line or default
  const [staffingCounts, setStaffingCounts] = useState<Record<string, number>>({});
  const [isLoadingStaffing, setIsLoadingStaffing] = useState(false);

  useEffect(() => {
    async function loadStaffing() {
      setIsLoadingStaffing(true);
      try {
        let existingRules: StaffingRule[] = [];

        if (selectedLineId) {
          // Load line-specific staffing
          const zoneId = targetType === "zone" ? target.id : null;
          const tableId = targetType === "table" ? target.id : null;
          const rules = await lineFloorPlanStaffingService.getStaffingRules(
            selectedLineId,
            floorPlan.id,
            zoneId,
            tableId
          );
          existingRules = rules || [];
        } else {
          // Load default staffing from target
          existingRules = (target.staffingRules as StaffingRule[] | null) ?? [];
        }

        // Initialize state with role counts
        const counts: Record<string, number> = {};
        for (const role of roles) {
          const existing = existingRules.find((r) => r.roleId === role.id);
          counts[role.id] = existing?.count ?? 0;
        }
        setStaffingCounts(counts);
      } catch (error) {
        console.error("Error loading staffing:", error);
        // Fallback to default
        const existingRules = (target.staffingRules as StaffingRule[] | null) ?? [];
        const counts: Record<string, number> = {};
        for (const role of roles) {
          const existing = existingRules.find((r) => r.roleId === role.id);
          counts[role.id] = existing?.count ?? 0;
        }
        setStaffingCounts(counts);
      } finally {
        setIsLoadingStaffing(false);
      }
    }
    loadStaffing();
  }, [selectedLineId, target, targetType, floorPlan.id, roles]);

  const handleIncrement = (roleId: string) => {
    setStaffingCounts((prev) => ({
      ...prev,
      [roleId]: (prev[roleId] ?? 0) + 1
    }));
  };

  const handleDecrement = (roleId: string) => {
    setStaffingCounts((prev) => ({
      ...prev,
      [roleId]: Math.max(0, (prev[roleId] ?? 0) - 1)
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const staffingRules: StaffingRule[] = Object.entries(staffingCounts)
        .filter(([, count]) => count > 0)
        .map(([roleId, count]) => {
          const role = roles.find((r) => r.id === roleId);
          return {
            roleId,
            count,
            roleName: role?.name,
            roleColor: role?.color
          };
        });

      if (selectedLineId) {
        // Save line-specific staffing
        await updateLineFloorPlanStaffing({
          lineId: selectedLineId,
          floorPlanId: floorPlan.id,
          targetType,
          targetId: target.id,
          staffingRules
        });
      } else {
        // Save default staffing
        await updateStaffing({
          targetType,
          targetId: target.id,
          staffingRules
        });
      }
      router.refresh();
    });
  };

  const totalStaff = Object.values(staffingCounts).reduce((acc, c) => acc + c, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            👥 {t("floorPlan.editStaffing", { defaultValue: "עריכת סידור עבודה" })}
          </h3>
          <p className="text-sm text-muted-foreground">{target.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t("common.back", { defaultValue: "חזרה" })}
        </Button>
      </div>

      {/* Line Selection */}
      <div className="space-y-2">
        <Label>{t("floorPlan.selectLine", { defaultValue: "בחר ליין (אופציונלי)" })}</Label>
        <Select
          value={selectedLineId || "default"}
          onValueChange={(value) => setSelectedLineId(value === "default" ? null : value)}
          disabled={isLoadingLines}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t("floorPlan.selectLinePlaceholder", {
                defaultValue: "הגדרות כלליות למפה"
              })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              {t("floorPlan.generalSettings", { defaultValue: "הגדרות כלליות למפה" })}
            </SelectItem>
            {availableLines.map((line) => (
              <SelectItem key={line.id} value={line.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                  {line.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedLineId && (
          <p className="text-xs text-muted-foreground">
            {t("floorPlan.lineSpecificStaffing", {
              defaultValue: "סידור עבודה ספציפי לליין זה"
            })}
          </p>
        )}
      </div>

      {isLoadingStaffing ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t("common.loading", { defaultValue: "טוען..." })}</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{t("floorPlan.noRolesDefined", { defaultValue: "לא הוגדרו תפקידים עדיין" })}</p>
          <p className="text-sm">
            {t("floorPlan.defineRolesFirst", {
              defaultValue: "הגדר תפקידים תחילה בתפקידים והיררכיה"
            })}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <Label>{t("floorPlan.rolesNeeded", { defaultValue: "תפקידים נדרשים" })}</Label>
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                  <span className="font-medium">{role.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDecrement(role.id)}
                    disabled={staffingCounts[role.id] === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold">{staffingCounts[role.id]}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleIncrement(role.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {t("floorPlan.totalStaff", { defaultValue: 'סה"כ צוות' })}
              </span>
              <span className="text-2xl font-bold">{totalStaff}</span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isPending} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {isPending
              ? t("floorPlan.saving", { defaultValue: "שומר..." })
              : t("floorPlan.save", { defaultValue: "שמור" })}
          </Button>
        </>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          💡 {t("floorPlan.staffingTip", { defaultValue: "זה ישמש כברירת מחדל לסידור משמרות" })}
        </p>
      </div>
    </div>
  );
}

// Staffing Summary View
interface StaffingSummaryViewProps {
  floorPlan: FloorPlanWithDetails;
  roles: { id: string; name: string; color: string }[];
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

function StaffingSummaryView({ floorPlan, roles, onElementSelect }: StaffingSummaryViewProps) {
  const { t } = useTranslations();

  // Calculate total staffing needs
  const calculateTotalStaffing = () => {
    const totals: Record<string, number> = {};

    for (const zone of floorPlan.zones) {
      const zoneRules = (zone.staffingRules as StaffingRule[] | null) ?? [];
      for (const rule of zoneRules) {
        totals[rule.roleId] = (totals[rule.roleId] ?? 0) + rule.count;
      }

      for (const table of zone.tables) {
        const tableRules = (table.staffingRules as StaffingRule[] | null) ?? [];
        for (const rule of tableRules) {
          totals[rule.roleId] = (totals[rule.roleId] ?? 0) + rule.count;
        }
      }
    }

    return totals;
  };

  const totalStaffing = calculateTotalStaffing();
  const grandTotal = Object.values(totalStaffing).reduce((acc, c) => acc + c, 0);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-lg">
          👥 {t("floorPlan.staffingOverview", { defaultValue: "סקירת סידור עבודה" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("floorPlan.selectElementToEditStaffing", {
            defaultValue: "בחר איזור או שולחן לעריכת סידור עבודה"
          })}
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted rounded-lg space-y-3">
        <h4 className="font-medium">
          📊 {t("floorPlan.totalNeeds", { defaultValue: "צרכים כוללים" })}
        </h4>
        {roles.length > 0 ? (
          <div className="space-y-2">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                  <span>{role.name}</span>
                </div>
                <span className="font-bold">{totalStaffing[role.id] ?? 0}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>{t("floorPlan.total", { defaultValue: 'סה"כ' })}</span>
              <span>{grandTotal}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("floorPlan.noRolesDefined", { defaultValue: "לא הוגדרו תפקידים" })}
          </p>
        )}
      </div>

      {/* Zone List */}
      <div className="space-y-2">
        <h4 className="font-medium">{t("floorPlan.byZone", { defaultValue: "לפי איזור" })}</h4>
        {floorPlan.zones.map((zone) => {
          const zoneRules = (zone.staffingRules as StaffingRule[] | null) ?? [];
          const zoneTotal = zoneRules.reduce((acc, r) => acc + r.count, 0);

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
                <span className="text-sm text-muted-foreground">
                  {zoneTotal > 0
                    ? `${zoneTotal} 👤`
                    : t("floorPlan.notSet", { defaultValue: "לא הוגדר" })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StaffingEditor;
