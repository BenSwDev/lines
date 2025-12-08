"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { RoleWithRelations } from "../types";
import { updateRole, getManagementRoles, getManagerRoles } from "../actions/roleActions";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#84CC16", label: "Lime" }
];

// 13 specific icons for common roles
const ICONS = [
  { emoji: "👨‍🍳", label: "מטבח" },
  { emoji: "🍸", label: "בר" },
  { emoji: "🍽️", label: "שולחנות" },
  { emoji: "🛡️", label: "אבטחה" },
  { emoji: "🧹", label: "ניקיון" },
  { emoji: "👔", label: "ניהול" },
  { emoji: "👑", label: "בעלים" },
  { emoji: "💼", label: "עסקים" },
  { emoji: "📋", label: "מזכירות" },
  { emoji: "🎵", label: "מוזיקה" },
  { emoji: "🎤", label: "בידור" },
  { emoji: "🚗", label: "משלוחים" },
  { emoji: "🎯", label: "אחר" }
];

type EditRoleDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  role: RoleWithRelations;
  onSuccess: () => void;
};

export function EditRoleDialog({ isOpen, onClose, venueId, role, onSuccess }: EditRoleDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const [color, setColor] = useState(role.color);
  const [icon, setIcon] = useState(role.icon || ICONS[0].emoji);
  const [parentRoleId, setParentRoleId] = useState(role.parentRoleId || "");
  const [managerRoleId, setManagerRoleId] = useState(role.managerRoleId || "");
  const [requiresManagement, setRequiresManagement] = useState(role.requiresManagement || false);
  const [requiresStaffing, setRequiresStaffing] = useState(role.requiresStaffing || false);
  const [canManage, setCanManage] = useState(role.canManage || false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [managementRoles, setManagementRoles] = useState<RoleWithRelations[]>([]);
  const [managerRoles, setManagerRoles] = useState<RoleWithRelations[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName(role.name);
      setDescription(role.description || "");
      setColor(role.color);
      setIcon(role.icon || ICONS[0].emoji);
      setParentRoleId(role.parentRoleId || "");
      setManagerRoleId(role.managerRoleId || "");
      setRequiresManagement(role.requiresManagement || false);
      setRequiresStaffing(role.requiresStaffing || false);
      setCanManage(role.canManage || false);
      setShowAdvanced(false);
      setError("");
    }
  }, [isOpen, role]);

  const loadManagementRoles = async () => {
    const result = await getManagementRoles(venueId);
    if (result.success && "data" in result) {
      // Exclude the current role's management role if it exists
      const filtered = (result.data || []).filter((mr) => mr.managedRoleId !== role.id);
      setManagementRoles(filtered);
    }
  };

  const loadManagerRoles = async () => {
    const result = await getManagerRoles(venueId);
    if (result.success && "data" in result) {
      // Exclude the current role itself
      const filtered = (result.data || []).filter((r) => r.id !== role.id);
      setManagerRoles(filtered);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadManagementRoles();
      loadManagerRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, venueId, role.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("שם התפקיד הוא שדה חובה");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateRole(role.id, venueId, {
        name: name.trim(),
        description: description.trim() || null,
        color,
        icon: icon || null,
        parentRoleId: parentRoleId ? parentRoleId : null,
        managerRoleId: managerRoleId ? managerRoleId : null,
        order: role.order || 0,
        requiresManagement,
        requiresStaffing,
        canManage
      });

      if (result.success) {
        toast({
          title: "הצלחה",
          description: "התפקיד עודכן בהצלחה"
        });
        onSuccess();
        onClose();
      } else {
        setError(result.error || "שגיאה בעדכון התפקיד");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון התפקיד");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>עריכת תפקיד</DialogTitle>
          <DialogDescription>עדכן את פרטי התפקיד</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* שם התפקיד - חובה */}
            <div className="space-y-2">
              <Label htmlFor="name">
                שם התפקיד <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: שף, ברמן, מנהל"
                disabled={isSubmitting}
                autoFocus
                className={error && !name.trim() ? "border-destructive" : ""}
              />
            </div>

            {/* תיאור - אופציונלי */}
            <div className="space-y-2">
              <Label htmlFor="description">תיאור (אופציונלי)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="הוסף תיאור קצר לתפקיד"
                disabled={isSubmitting}
                rows={2}
              />
            </div>

            {/* צבע ואייקון - dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>צבע</Label>
                <Select value={color} onValueChange={setColor} disabled={isSubmitting}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border" style={{ backgroundColor: color }} />
                      <span>{COLORS.find((c) => c.value === color)?.label || "בחר צבע"}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded border"
                            style={{ backgroundColor: c.value }}
                          />
                          <span>{c.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>אייקון</Label>
                <Select value={icon} onValueChange={setIcon} disabled={isSubmitting}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <span>{ICONS.find((i) => i.emoji === icon)?.label || "בחר אייקון"}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((item) => (
                      <SelectItem key={item.emoji} value={item.emoji}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <span>{item.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* דורש ניהול */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="requiresManagement"
                checked={requiresManagement}
                onCheckedChange={(checked) => setRequiresManagement(checked === true)}
                disabled={isSubmitting}
              />
              <Label htmlFor="requiresManagement" className="text-sm font-normal cursor-pointer">
                תפקיד זה דורש קבוצת ניהול
              </Label>
            </div>
            {requiresManagement && (
              <p className="text-xs text-muted-foreground pr-6">
                יווצר אוטומטית תפקיד ניהול עבור תפקיד זה
              </p>
            )}

            {/* דורש סידור עבודה */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="requiresStaffing"
                checked={requiresStaffing}
                onCheckedChange={(checked) => setRequiresStaffing(checked === true)}
                disabled={isSubmitting}
              />
              <Label htmlFor="requiresStaffing" className="text-sm font-normal cursor-pointer">
                תפקיד זה דורש סידור עבודה
              </Label>
            </div>
            {requiresStaffing && (
              <p className="text-xs text-muted-foreground pr-6">
                התפקיד יופיע בעורך סידור העבודה במפות
              </p>
            )}

            {/* יכול לנהל */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="canManage"
                checked={canManage}
                onCheckedChange={(checked) => setCanManage(checked === true)}
                disabled={isSubmitting}
              />
              <Label htmlFor="canManage" className="text-sm font-normal cursor-pointer">
                תפקיד זה יכול לנהל תפקידים אחרים
              </Label>
            </div>
            {canManage && (
              <p className="text-xs text-muted-foreground pr-6">
                ניתן למנות מנהלים מתפקיד זה לתפקידים אחרים
              </p>
            )}

            {/* אפשרויות מתקדמות - קיפול */}
            {managementRoles.length > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>אפשרויות נוספות</span>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="parent">תפקיד הורה (אופציונלי)</Label>
                      <Select
                        value={parentRoleId || undefined}
                        onValueChange={(value) => setParentRoleId(value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="parent">
                          <SelectValue placeholder="ללא תפקיד הורה" />
                        </SelectTrigger>
                        <SelectContent>
                          {managementRoles.map((parentRole) => (
                            <SelectItem key={parentRole.id} value={parentRole.id}>
                              {parentRole.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        רק תפקידי ניהול יכולים להיות תפקידים הורים. בחר תפקיד ניהול אם התפקיד הזה כפוף אליו.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="manager">מנהל ישיר (אופציונלי)</Label>
                      <Select
                        value={managerRoleId || undefined}
                        onValueChange={(value) => setManagerRoleId(value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="manager">
                          <SelectValue placeholder="ללא מנהל ישיר" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">ללא מנהל ישיר</SelectItem>
                          {managerRoles.map((managerRole) => (
                            <SelectItem key={managerRole.id} value={managerRole.id}>
                              {managerRole.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        בחר תפקיד שמנהל את התפקיד הזה. רק תפקידים עם &quot;יכול לנהל&quot; יכולים להיות מנהלים.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "מעדכן..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
