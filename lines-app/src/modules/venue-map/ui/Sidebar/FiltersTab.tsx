/**
 * Filters Tab Component
 * Unified search and filter interface
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { FloorPlanElement } from "../FloorPlanEditorV2";
import { cn } from "@/lib/utils";

interface FiltersTabProps {
  elements: FloorPlanElement[];
  filters?: {
    type?: string[];
    zone?: string[];
    color?: string[];
  };
  onFilterChange?: (filters: FiltersTabProps["filters"]) => void;
  onSelectElement: (id: string) => void;
}

export function FiltersTab({
  elements,
  filters = {},
  onFilterChange,
  onSelectElement
}: FiltersTabProps) {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique values for filters
  const allZones = elements.filter((e) => e.type === "zone");
  const allColors = Array.from(
    new Set(elements.map((e) => e.color).filter((color): color is string => Boolean(color)))
  );

  const handleFilterChange = (
    key: keyof NonNullable<FiltersTabProps["filters"]>,
    value: string
  ) => {
    const currentFilters = filters[key] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((v) => v !== value)
      : [...currentFilters, value];

    onFilterChange?.({
      ...filters,
      [key]: newFilters.length > 0 ? newFilters : undefined
    });
  };

  // Apply filters and search
  const filteredElements = elements.filter((element) => {
    // Search filter
    if (searchQuery && !element.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(element.type)) {
        return false;
      }
    }

    // Zone filter
    if (filters.zone && filters.zone.length > 0) {
      if (!element.zoneId || !filters.zone.includes(element.zoneId)) {
        return false;
      }
    }

    // Color filter
    if (filters.color && filters.color.length > 0) {
      if (!element.color || !filters.color.includes(element.color)) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery("");
    onFilterChange?.({});
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some((f) => f && f.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">{t("common.search") || "חיפוש"}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t("floorPlan.searchElements") || "חפש אלמנטים..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            {t("floorPlan.clearFilters") || "נקה סינון"}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t("floorPlan.filterByType") || "סוג"}</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-table"
                checked={filters.type?.includes("table") || false}
                onCheckedChange={() => handleFilterChange("type", "table")}
              />
              <Label htmlFor="filter-table" className="text-sm font-normal cursor-pointer">
                {t("floorPlan.tables") || "שולחנות"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-zone"
                checked={filters.type?.includes("zone") || false}
                onCheckedChange={() => handleFilterChange("type", "zone")}
              />
              <Label htmlFor="filter-zone" className="text-sm font-normal cursor-pointer">
                {t("floorPlan.zones") || "אזורים"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-area"
                checked={filters.type?.includes("specialArea") || false}
                onCheckedChange={() => handleFilterChange("type", "specialArea")}
              />
              <Label htmlFor="filter-area" className="text-sm font-normal cursor-pointer">
                {t("floorPlan.areas") || "אזורים מיוחדים"}
              </Label>
            </div>
          </div>
        </div>

        {/* Zone Filter */}
        {allZones.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("floorPlan.filterByZone") || "אזור"}</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {allZones.map((zone) => (
                <div key={zone.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-zone-${zone.id}`}
                    checked={filters.zone?.includes(zone.id) || false}
                    onCheckedChange={() => handleFilterChange("zone", zone.id)}
                  />
                  <Label
                    htmlFor={`filter-zone-${zone.id}`}
                    className="text-sm font-normal cursor-pointer truncate"
                  >
                    {zone.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Filter */}
        {allColors.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("floorPlan.filterByColor") || "צבע"}</Label>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleFilterChange("color", color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    filters.color?.includes(color)
                      ? "border-primary ring-2 ring-primary/20 scale-110"
                      : "border-border hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filtered Results */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm font-semibold">
              {t("floorPlan.results") || "תוצאות"} ({filteredElements.length})
            </Label>
            <div className="space-y-1">
              {filteredElements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("floorPlan.noResults") || "אין תוצאות"}
                </p>
              ) : (
                filteredElements.map((element) => (
                  <Card
                    key={element.id}
                    className="p-2 cursor-pointer transition-all hover:bg-muted"
                    onClick={() => onSelectElement(element.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: element.color || "#3B82F6" }}
                      />
                      <span className="text-sm truncate">{element.name}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
