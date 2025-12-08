"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Minus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/core/i18n/provider";
import { updateStaffing } from "../../actions/floorPlanActions";
import type { Zone, Table, FloorPlanWithDetails, StaffingRule } from "../../types";

interface StaffingEditorProps {
  selectedZone: Zone | null;
  selectedTable: Table | null;
  floorPlan: FloorPlanWithDetails;
  roles: { id: string; name: string; color: string }[];
  onElementSelect: (id: string | null, type: "zone" | "table" | "area" | null) => void;
}

export function StaffingEditor({
  selectedZone,
  selectedTable,
  floorPlan,
  roles,
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
  isPending: boolean;
  startTransition: (callback: () => void) => void;
  onBack: () => void;
  router: ReturnType<typeof useRouter>;
}

function StaffingForm({
  target,
  targetType,
  roles,
  isPending,
  startTransition,
  onBack,
  router
}: StaffingFormProps) {
  const { t } = useTranslations();

  // Parse existing staffing rules
  const existingRules = (target.staffingRules as StaffingRule[] | null) ?? [];

  // Initialize state with role counts
  const [staffingCounts, setStaffingCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const role of roles) {
      const existing = existingRules.find((r) => r.roleId === role.id);
      counts[role.id] = existing?.count ?? 0;
    }
    return counts;
  });

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

      await updateStaffing({
        targetType,
        targetId: target.id,
        staffingRules
      });
      router.refresh();
    });
  };

  const totalStaff = Object.values(staffingCounts).reduce((acc, c) => acc + c, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            👥 {t("editStaffing", { defaultValue: "Edit Staffing" })}
          </h3>
          <p className="text-sm text-muted-foreground">{target.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t("back", { defaultValue: "Back" })}
        </Button>
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{t("noRolesDefined", { defaultValue: "No roles defined yet" })}</p>
          <p className="text-sm">
            {t("defineRolesFirst", { defaultValue: "Define roles in Roles & Hierarchy first" })}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <Label>{t("rolesNeeded", { defaultValue: "Roles Needed" })}</Label>
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
                {t("totalStaff", { defaultValue: "Total Staff" })}
              </span>
              <span className="text-2xl font-bold">{totalStaff}</span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isPending} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {isPending
              ? t("saving", { defaultValue: "Saving..." })
              : t("save", { defaultValue: "Save Changes" })}
          </Button>
        </>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          💡{" "}
          {t("staffingTip", { defaultValue: "This will be used as default for scheduling shifts" })}
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
          👥 {t("staffingOverview", { defaultValue: "Staffing Overview" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("selectElementToEditStaffing", {
            defaultValue: "Select a zone or table to edit staffing"
          })}
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted rounded-lg space-y-3">
        <h4 className="font-medium">📊 {t("totalNeeds", { defaultValue: "Total Needs" })}</h4>
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
              <span>{t("total", { defaultValue: "Total" })}</span>
              <span>{grandTotal}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("noRolesDefined", { defaultValue: "No roles defined" })}
          </p>
        )}
      </div>

      {/* Zone List */}
      <div className="space-y-2">
        <h4 className="font-medium">{t("byZone", { defaultValue: "By Zone" })}</h4>
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
                  {zoneTotal > 0 ? `${zoneTotal} 👤` : t("notSet", { defaultValue: "Not set" })}
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
