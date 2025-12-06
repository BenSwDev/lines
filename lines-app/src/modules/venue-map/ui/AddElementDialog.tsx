/**
 * Add Element Dialog Component
 * Beautiful card-based UI for adding zones and elements
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // eslint-disable-line @typescript-eslint/no-unused-vars
import {
  ZONE_TYPES,
  ELEMENT_TYPES,
  type ZoneType,
  type ElementCategory
} from "../config/zoneAndElementTypes";

interface AddElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddZone: (zoneType: ZoneType) => void;
  onAddElement: (elementCategory: ElementCategory) => void;
}

export function AddElementDialog({
  open,
  onOpenChange,
  onAddZone,
  onAddElement
}: AddElementDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredZones = ZONE_TYPES.filter(
    (zone) =>
      zone.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredElements = ELEMENT_TYPES.filter(
    (element) =>
      element.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleZoneClick = (zoneType: ZoneType) => {
    onAddZone(zoneType);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleElementClick = (elementCategory: ElementCategory) => {
    onAddElement(elementCategory);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוסף אובייקט</DialogTitle>
          <DialogDescription>בחר סוג אזור או אובייקט להוספה למפה</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">חיפוש</Label>
            <Input
              id="search"
              placeholder="חפש אזור או אובייקט..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="zones" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zones">אזורים</TabsTrigger>
              <TabsTrigger value="elements">אובייקטים</TabsTrigger>
            </TabsList>

            {/* Zones Tab */}
            <TabsContent value="zones" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZones.map((zone) => {
                  const Icon = zone.icon;
                  return (
                    <Card
                      key={zone.id}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary p-4"
                      onClick={() => handleZoneClick(zone.id)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div
                          className="p-3 rounded-full"
                          style={{ backgroundColor: `${zone.color}20` }}
                        >
                          <Icon className="h-8 w-8" style={{ color: zone.color }} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{zone.label}</h3>
                          <p className="text-sm text-muted-foreground">{zone.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Elements Tab */}
            <TabsContent value="elements" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredElements.map((element) => {
                  const Icon = element.icon;
                  return (
                    <Card
                      key={element.id}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary p-4"
                      onClick={() => handleElementClick(element.id)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div
                          className="p-3 rounded-full"
                          style={{ backgroundColor: `${element.color}20` }}
                        >
                          <Icon className="h-8 w-8" style={{ color: element.color }} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{element.label}</h3>
                          <p className="text-sm text-muted-foreground">{element.description}</p>
                          {element.canBeInZone && (
                            <span className="text-xs text-primary">ניתן להכלה באזור</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
