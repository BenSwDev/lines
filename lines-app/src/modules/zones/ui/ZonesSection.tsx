"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Armchair, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Zone = {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  tables: Table[];
};

type Table = {
  id: string;
  name: string;
  seats?: number | null;
  notes?: string | null;
};

type ZonesSectionProps = {
  venueId: string;
  zones: Zone[];
  onRefresh: () => void;
};

export function ZonesSection({ zones, onRefresh }: ZonesSectionProps) {
  const { toast } = useToast();
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentZoneId, setCurrentZoneId] = useState<string | null>(null);

  const [zoneName, setZoneName] = useState("");
  const [zoneColor, setZoneColor] = useState("#3B82F6");
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState("");

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement API call
    toast({
      title: "הצלחה",
      description: `האזור "${zoneName}" נוצר`,
    });
    setIsCreateZoneOpen(false);
    setZoneName("");
    setZoneColor("#3B82F6");
    onRefresh();
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement API call
    toast({
      title: "הצלחה",
      description: `השולחן "${tableName}" נוסף`,
    });
    setIsCreateTableOpen(false);
    setTableName("");
    setTableSeats("");
    onRefresh();
  };

  const totalTables = zones.reduce((sum, zone) => sum + zone.tables.length, 0);
  const totalSeats = zones.reduce(
    (sum, zone) =>
      sum + zone.tables.reduce((s, t) => s + (t.seats || 0), 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">אזורים ושולחנות</h2>
          <p className="text-sm text-muted-foreground">
            ניהול אזורי הישיבה והשולחנות
          </p>
        </div>
        <Button onClick={() => setIsCreateZoneOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          צור אזור
        </Button>
      </div>

      {/* Stats */}
      {zones.length > 0 && (
        <div className="flex gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{zones.length}</div>
                  <div className="text-xs text-muted-foreground">אזורים</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Armchair className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{totalTables}</div>
                  <div className="text-xs text-muted-foreground">שולחנות</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{totalSeats}</div>
                <div className="text-xs text-muted-foreground">מקומות ישיבה</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Zones List */}
      {zones.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">אין אזורים</h3>
            <p className="text-sm text-muted-foreground">
              צור את האזור הראשון שלך
            </p>
            <Button className="mt-4" onClick={() => setIsCreateZoneOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              צור אזור
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg"
                      style={{ backgroundColor: zone.color }}
                    />
                    <div>
                      <span>{zone.name}</span>
                      <p className="text-sm font-normal text-muted-foreground">
                        {zone.tables.length} שולחנות •{" "}
                        {zone.tables.reduce((s, t) => s + (t.seats || 0), 0)}{" "}
                        מקומות
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentZoneId(zone.id);
                        setIsCreateTableOpen(true);
                      }}
                    >
                      <Plus className="ml-1 h-3 w-3" />
                      שולחן
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>

              {zone.tables.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {zone.tables.map((table) => (
                      <div
                        key={table.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Armchair className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{table.name}</span>
                          {table.seats && (
                            <Badge variant="secondary" className="text-xs">
                              {table.seats} מקומות
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Zone Dialog */}
      <Dialog open={isCreateZoneOpen} onOpenChange={setIsCreateZoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>יצירת אזור חדש</DialogTitle>
            <DialogDescription>הגדר אזור ישיבה חדש</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateZone}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">שם האזור *</Label>
                <Input
                  id="zoneName"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="אזור VIP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneColor">צבע</Label>
                <Input
                  id="zoneColor"
                  type="color"
                  value={zoneColor}
                  onChange={(e) => setZoneColor(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateZoneOpen(false)}
              >
                ביטול
              </Button>
              <Button type="submit" disabled={!zoneName.trim()}>
                יצירה
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Table Dialog */}
      <Dialog open={isCreateTableOpen} onOpenChange={setIsCreateTableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת שולחן</DialogTitle>
            <DialogDescription>הוסף שולחן לאזור</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTable}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">שם השולחן *</Label>
                <Input
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="שולחן 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableSeats">מספר מקומות</Label>
                <Input
                  id="tableSeats"
                  type="number"
                  min="1"
                  value={tableSeats}
                  onChange={(e) => setTableSeats(e.target.value)}
                  placeholder="4"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateTableOpen(false)}
              >
                ביטול
              </Button>
              <Button type="submit" disabled={!tableName.trim()}>
                הוספה
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

