"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/core/i18n/provider";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Trash2, Star, MoreVertical, Map, Layers, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { deleteFloorPlan, duplicateFloorPlan, updateFloorPlan } from "../actions/floorPlanActions";
import { ManageFloorPlanLinesDialog } from "./ManageFloorPlanLinesDialog";
import type { FloorPlanListItem } from "../types";

interface FloorPlanListProps {
  venueId: string;
  floorPlans: FloorPlanListItem[];
  onCreateNew: () => void;
}

export function FloorPlanList({ venueId, floorPlans, onCreateNew }: FloorPlanListProps) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlanListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [manageLinesDialogOpen, setManageLinesDialogOpen] = useState(false);
  const [floorPlanForLines, setFloorPlanForLines] = useState<FloorPlanListItem | null>(null);

  const handleDelete = async () => {
    if (!selectedFloorPlan) return;

    setIsDeleting(true);
    try {
      const result = await deleteFloorPlan(selectedFloorPlan.id, venueId);
      if (result.success) {
        toast({
          title: t("success.deleted", { defaultValue: "נמחק בהצלחה" }),
          description: t("floorPlan.floorPlanDeleted", { defaultValue: "המפה נמחקה בהצלחה" })
        });
        router.refresh();
      } else {
        toast({
          title: t("errors.generic", { defaultValue: "שגיאה" }),
          description: result.error || t("errors.deleting", { defaultValue: "שגיאה במחיקה" }),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic", { defaultValue: "שגיאה" }),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedFloorPlan(null);
    }
  };

  const handleDuplicate = async (floorPlan: FloorPlanListItem) => {
    setIsDuplicating(floorPlan.id);
    try {
      const newName = `${floorPlan.name} (${t("floorPlan.copy", { defaultValue: "העתק" })})`;
      const result = await duplicateFloorPlan(floorPlan.id, newName, venueId);
      if (result.success) {
        toast({
          title: t("success.created", { defaultValue: "נוצר בהצלחה" }),
          description: t("floorPlan.floorPlanDuplicated", { defaultValue: "המפה הועתקה בהצלחה" })
        });
        router.refresh();
      } else {
        toast({
          title: t("errors.generic", { defaultValue: "שגיאה" }),
          description: result.error || t("errors.creating", { defaultValue: "שגיאה ביצירה" }),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic", { defaultValue: "שגיאה" }),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleEdit = (floorPlanId: string) => {
    router.push(`/venues/${venueId}/settings/structure/${floorPlanId}`);
  };

  const handleManageLines = (floorPlan: FloorPlanListItem) => {
    setFloorPlanForLines(floorPlan);
    setManageLinesDialogOpen(true);
  };

  const handleSetAsDefault = async (floorPlan: FloorPlanListItem) => {
    try {
      const result = await updateFloorPlan({
        id: floorPlan.id,
        isDefault: true
      });
      if (result.success) {
        toast({
          title: t("success.detailsUpdated", { defaultValue: "עודכן בהצלחה" }),
          description: t("floorPlan.setAsDefault", { defaultValue: "המפה הוגדרה כברירת מחדל" })
        });
        router.refresh();
      } else {
        toast({
          title: t("errors.generic", { defaultValue: "שגיאה" }),
          description: result.error || t("errors.savingData", { defaultValue: "שגיאה בשמירה" }),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic", { defaultValue: "שגיאה" }),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("floorPlan.title")}</h2>
          <p className="text-muted-foreground">{t("floorPlan.description")}</p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("floorPlan.createNew")}
        </Button>
      </div>

      {/* Floor Plans Grid */}
      {floorPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Map className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("floorPlan.noFloorPlans")}</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              {t("floorPlan.noFloorPlansDescription")}
            </p>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("floorPlan.createFirstFloorPlan")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {floorPlans.map((floorPlan) => (
            <Card
              key={floorPlan.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-md",
                floorPlan.isDefault && "ring-2 ring-primary"
              )}
              onClick={() => handleEdit(floorPlan.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{floorPlan.name}</CardTitle>
                    {floorPlan.isDefault && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" />
                        {t("floorPlan.default")}
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(floorPlan.id);
                        }}
                      >
                        {t("floorPlan.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(floorPlan);
                        }}
                        disabled={isDuplicating === floorPlan.id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {isDuplicating === floorPlan.id
                          ? t("floorPlan.duplicating")
                          : t("floorPlan.duplicate")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageLines(floorPlan);
                        }}
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        {t("floorPlan.manageLines", { defaultValue: "נהל ליינים" })}
                      </DropdownMenuItem>
                      {!floorPlan.isDefault && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetAsDefault(floorPlan);
                          }}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {t("floorPlan.setAsDefault")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFloorPlan(floorPlan);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={floorPlan.isDefault}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("floorPlan.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {floorPlan.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {floorPlan.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span>
                      {floorPlan._count.zones} {t("floorPlan.zones")}
                    </span>
                  </div>
                </div>
                {floorPlan.lines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {floorPlan.lines.slice(0, 3).map((line) => (
                      <Badge
                        key={line.id}
                        variant="outline"
                        style={{ borderColor: line.color, color: line.color }}
                      >
                        {line.name}
                      </Badge>
                    ))}
                    {floorPlan.lines.length > 3 && (
                      <Badge variant="outline">+{floorPlan.lines.length - 3}</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("floorPlan.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("floorPlan.deleteConfirmDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("floorPlan.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("floorPlan.deleting") : t("floorPlan.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Lines Dialog */}
      {floorPlanForLines && (
        <ManageFloorPlanLinesDialog
          isOpen={manageLinesDialogOpen}
          onClose={() => {
            setManageLinesDialogOpen(false);
            setFloorPlanForLines(null);
          }}
          floorPlan={floorPlanForLines}
          venueId={venueId}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

export default FloorPlanList;
