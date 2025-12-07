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
import type { RoleWithRelations } from "../types";
import { updateRole } from "../actions/roleActions";
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
  availableParents?: RoleWithRelations[];
  onSuccess: () => void;
};

export function EditRoleDialog({
  isOpen,
  onClose,
  venueId,
  role,
  availableParents = [],
  onSuccess
}: EditRoleDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const [color, setColor] = useState(role.color);
  const [icon, setIcon] = useState(role.icon || "");
  const [parentRoleId, setParentRoleId] = useState(role.parentRoleId || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(role.name);
      setDescription(role.description || "");
      setColor(role.color);
      setIcon(role.icon || "");
      setParentRoleId(role.parentRoleId || "");
      setShowAdvanced(false);
      setError("");
    }
  }, [isOpen, role]);

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
        order: role.order || 0
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

            {/* צבע ואייקון - יחד */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>צבע</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      disabled={isSubmitting}
                      className={`h-9 w-9 rounded-md border-2 transition-all ${
                        color === c.value
                          ? "border-foreground scale-110 ring-2 ring-offset-2"
                          : "border-transparent hover:border-muted-foreground/50"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                      aria-label={`Select ${c.label} color`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>אייקון (אופציונלי)</Label>
                <div className="grid grid-cols-7 gap-2">
                  {ICONS.map((item) => (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => setIcon(icon === item.emoji ? "" : item.emoji)}
                      disabled={isSubmitting}
                      className={`h-10 w-10 rounded-md border-2 text-lg transition-all flex items-center justify-center ${
                        icon === item.emoji
                          ? "border-foreground scale-110 ring-2 ring-offset-2 bg-muted"
                          : "border-transparent hover:border-muted-foreground/50 hover:bg-muted/50"
                      }`}
                      title={item.label}
                      aria-label={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* אפשרויות מתקדמות - קיפול */}
            {availableParents.length > 0 && (
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
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="parent">תפקיד מנהל (אופציונלי)</Label>
                    <Select
                      value={parentRoleId || undefined}
                      onValueChange={(value) => setParentRoleId(value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="parent">
                        <SelectValue placeholder="ללא מנהל" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParents.map((parentRole) => (
                          <SelectItem key={parentRole.id} value={parentRole.id}>
                            {parentRole.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      בחר תפקיד מנהל אם התפקיד הזה כפוף לתפקיד אחר
                    </p>
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
