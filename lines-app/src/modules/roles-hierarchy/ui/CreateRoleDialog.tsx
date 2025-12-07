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
import { User } from "lucide-react";
import type { RoleWithRelations } from "../types";
import { createRole } from "../actions/roleActions";
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

// 13 specific icons for common roles in restaurants, bars, and entertainment venues
const ICONS = [
  "👨‍🍳", // מטבח/שף
  "🍸",   // בר/ברמן
  "🍽️",   // שולחנות/מלצר
  "🛡️",   // אבטחה
  "🧹",   // ניקיון
  "👔",   // ניהול/מנהל
  "👑",   // בעלים/מנכ"ל
  "💼",   // מנהל עסקים
  "📋",   // אדמין/מזכירות
  "🎵",   // DJ/מוזיקה
  "🎤",   // זמר/בידור
  "🚗",   // שליח/משלוחים
  "🎯"    // אחר/כללי
];

type CreateRoleDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  parentRoles?: RoleWithRelations[];
  onSuccess: () => void;
};

export function CreateRoleDialog({
  isOpen,
  onClose,
  venueId,
  parentRoles = [],
  onSuccess
}: CreateRoleDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [icon, setIcon] = useState("");
  const [parentRoleId, setParentRoleId] = useState("");
  const [order, setOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setColor(COLORS[0].value);
      setIcon("");
      setParentRoleId("");
      setOrder(0);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createRole(venueId, {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        icon: icon || undefined,
        parentRoleId: parentRoleId || undefined,
        order
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Role created successfully"
        });
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to create role");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create Role</DialogTitle>
              <DialogDescription>Add a new role to the organization</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chef, Bartender, Manager"
                disabled={isSubmitting}
                autoFocus
                className={error && !name.trim() ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {parentRoles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Role (optional)</Label>
                <Select
                  value={parentRoleId || undefined}
                  onValueChange={(value) => setParentRoleId(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="parent">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    disabled={isSubmitting}
                    className={`h-10 w-10 rounded-md border-2 transition-all ${
                      color === c.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(icon === i ? "" : i)}
                    disabled={isSubmitting}
                    className={`h-10 w-10 rounded-md border-2 text-xl transition-all ${
                      icon === i ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    title={i}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
