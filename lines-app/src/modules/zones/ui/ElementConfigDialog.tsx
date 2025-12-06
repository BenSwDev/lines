/**
 * Element Configuration Dialog
 * Opens after drawing to configure element properties
 */

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { ZoneVisual, TableVisual, VenueAreaVisual, AreaType, ShapeType } from "../types";

const COLOR_PALETTE = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#475569",
  "#334155"
];

const SHAPES: { value: ShapeType; label: string; icon: string }[] = [
  { value: "rectangle", label: "מלבן", icon: "▭" },
  { value: "square", label: "ריבוע", icon: "■" },
  { value: "circle", label: "עיגול", icon: "●" },
  { value: "oval", label: "אליפסה", icon: "⬭" }
];

type ElementConfigDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (config: Partial<ZoneVisual | TableVisual | VenueAreaVisual>) => void;
  element: ZoneVisual | TableVisual | VenueAreaVisual | null;
  elementType: "zone" | "table" | "area";
};

export function ElementConfigDialog({
  open,
  onClose,
  onSave,
  element,
  elementType
}: ElementConfigDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [shape, setShape] = useState<ShapeType>("rectangle");
  const [seats, setSeats] = useState<number | undefined>(undefined);
  const [areaType, setAreaType] = useState<AreaType>("kitchen");

  useEffect(() => {
    if (element) {
      setName("name" in element ? element.name : "");
      if ("color" in element && element.color) {
        setColor(element.color);
      }
      setShape(element.shape);
      if ("seats" in element) {
        setSeats(element.seats);
      }
      if ("areaType" in element) {
        setAreaType(element.areaType);
      }
    }
  }, [element]);

  const handleSave = () => {
    const config: Partial<ZoneVisual | TableVisual | VenueAreaVisual> = {
      name,
      shape,
      ...(elementType === "zone" || elementType === "area" ? { color } : {}),
      ...(elementType === "table" ? { seats } : {}),
      ...(elementType === "area" ? { areaType } : {})
    };
    onSave(config);
    onClose();
  };

  if (!element) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {elementType === "zone" && "הגדר אזור"}
            {elementType === "table" && "הגדר שולחן"}
            {elementType === "area" && "הגדר אזור מיוחד"}
          </DialogTitle>
          <DialogDescription>הגדר את המאפיינים של האלמנט שיצרת</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="element-name">שם</Label>
            <Input
              id="element-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס שם..."
              autoFocus
            />
          </div>

          {/* Shape Selector */}
          <div className="space-y-2">
            <Label>צורה</Label>
            <div className="grid grid-cols-4 gap-2">
              {SHAPES.map((s) => (
                <Button
                  key={s.value}
                  variant={shape === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShape(s.value)}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs">{s.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Color Picker (for zones and areas) */}
          {(elementType === "zone" || elementType === "area") && (
            <div className="space-y-2">
              <Label>צבע</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-border"
                      style={{ backgroundColor: color }}
                    />
                    <span>בחר צבע</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          color === c
                            ? "border-primary scale-110 shadow-lg"
                            : "border-border hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`צבע ${c}`}
                      />
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <Label htmlFor="color-hex">קוד צבע</Label>
                    <Input
                      id="color-hex"
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                      className="font-mono"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Seats (for tables) */}
          {elementType === "table" && (
            <div className="space-y-2">
              <Label htmlFor="element-seats">מקומות ישיבה</Label>
              <Input
                id="element-seats"
                type="number"
                min="0"
                value={seats || ""}
                onChange={(e) => setSeats(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="מספר מקומות..."
              />
            </div>
          )}

          {/* Area Type (for areas) */}
          {elementType === "area" && (
            <div className="space-y-2">
              <Label>סוג אזור</Label>
              <Select value={areaType} onValueChange={(v) => setAreaType(v as AreaType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitchen">מטבח</SelectItem>
                  <SelectItem value="restroom">שירותים</SelectItem>
                  <SelectItem value="dj_booth">עמדת דיג׳יי</SelectItem>
                  <SelectItem value="stage">במה</SelectItem>
                  <SelectItem value="storage">מחסן</SelectItem>
                  <SelectItem value="bar">בר</SelectItem>
                  <SelectItem value="dance_floor">רחבת ריקודים</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="outdoor">חוץ</SelectItem>
                  <SelectItem value="entrance">כניסה</SelectItem>
                  <SelectItem value="exit">יציאה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave}>שמור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
