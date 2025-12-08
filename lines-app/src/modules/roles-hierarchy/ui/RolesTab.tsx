"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RoleCard } from "./RoleCard";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { EditRoleDialog } from "./EditRoleDialog";
import { listRoles, deleteRole } from "../actions/roleActions";
import { useToast } from "@/hooks/use-toast";
import { FeatureSlider, rolesFeatures } from "@/modules/feature-slider";
import { PageHero, getPageConfig } from "@/modules/demo-system";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { RoleWithRelations } from "../types";

type RolesTabProps = {
  venueId: string;
};

export function RolesTab({ venueId }: RolesTabProps) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleWithRelations[]>([]);
  const [selectedParentRoleId, setSelectedParentRoleId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithRelations | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleWithRelations | null>(null);
  const [showFeatureSlider, setShowFeatureSlider] = useState(roles.length === 0);

  const loadData = async () => {
    setIsLoading(true);
    const rolesResult = await listRoles(
      venueId,
      selectedParentRoleId === "all" ? undefined : selectedParentRoleId || null
    );

    if (rolesResult.success && "data" in rolesResult) {
      setRoles(rolesResult.data || []);
    } else {
      const errorMsg = !rolesResult.success && "error" in rolesResult ? rolesResult.error : null;
      toast({
        title: "שגיאה",
        description: errorMsg || "נכשל בטעינת התפקידים",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, selectedParentRoleId]);

  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const handleEdit = (role: RoleWithRelations) => {
    setEditingRole(role);
  };

  const handleDelete = (role: RoleWithRelations) => {
    setDeletingRole(role);
  };

  const confirmDelete = async () => {
    if (!deletingRole) return;

    const result = await deleteRole(deletingRole.id, venueId);

    if (result.success) {
      toast({
        title: "הצלחה",
        description: "התפקיד נמחק בהצלחה"
      });
      setRoles((prev) => prev.filter((r) => r.id !== deletingRole.id));
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: "שגיאה",
        description: errorMsg || "נכשל במחיקת התפקיד",
        variant: "destructive"
      });
    }

    setDeletingRole(null);
  };

  const filteredRoles =
    selectedParentRoleId === "all"
      ? roles
      : roles.filter((r) => (r.parentRoleId || null) === (selectedParentRoleId || null));

  const rootRoles = roles.filter((r) => !r.parentRoleId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">תפקידים</h2>
            <p className="text-muted-foreground">נהל תפקידים והיררכיה בארגון</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            צור תפקיד
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const pageConfig = getPageConfig("roles");

  return (
    <>
      <div className="space-y-4">
        {/* Page Hero */}
        {pageConfig && <PageHero hero={pageConfig.hero} cta={pageConfig.cta} className="mb-8" />}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">תפקידים</h2>
            <p className="text-muted-foreground">נהל תפקידים והיררכיה בארגון</p>
          </div>
          <Button onClick={handleCreate} data-tour="roles-departments">
            <Plus className="mr-2 h-4 w-4" />
            צור תפקיד
          </Button>
        </div>

        {/* Filter */}
        {roles.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedParentRoleId} onValueChange={setSelectedParentRoleId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="סינון לפי מנהל" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התפקידים</SelectItem>
                <SelectItem value="none">תפקידים ראשיים בלבד</SelectItem>
                {rootRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    תחת {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              ({filteredRoles.length} {filteredRoles.length === 1 ? "תפקיד" : "תפקידים"})
            </span>
          </div>
        )}

        {/* Feature Slider */}
        {showFeatureSlider && (
          <div className="mb-8">
            <FeatureSlider
              features={rolesFeatures.map((f) => ({
                ...f,
                actions: f.actions?.map((a) => ({
                  ...a,
                  onClick: () => {
                    if (a.label === "צור תפקיד") {
                      handleCreate();
                      setShowFeatureSlider(false);
                    }
                  }
                }))
              }))}
              config={{
                autoPlay: true,
                autoPlayInterval: 4000,
                showDots: true,
                showArrows: true,
                slidesToShow: 1,
                infinite: true
              }}
              onAction={(featureId, actionLabel) => {
                if (actionLabel === "צור תפקיד") {
                  handleCreate();
                  setShowFeatureSlider(false);
                }
              }}
              onClose={() => setShowFeatureSlider(false)}
              className="mb-6"
            />
          </div>
        )}

        {/* Content */}
        {filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
            <User className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">
              {roles.length === 0 ? "אין תפקידים עדיין" : "אין תפקידים תואמים"}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-md">
              {roles.length === 0
                ? "צור את התפקיד הראשון שלך כדי להתחיל לבנות את ההיררכיה הארגונית"
                : "נסה לשנות את הפילטר כדי לראות תפקידים אחרים"}
            </p>
            {roles.length === 0 && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                צור תפקיד ראשון
              </Button>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            data-tour="roles-departments"
          >
            {filteredRoles.map((role, index) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={handleEdit}
                onDelete={handleDelete}
                data-tour={index === 0 ? "roles-departments" : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateRoleDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        venueId={venueId}
        onSuccess={loadData}
      />

      {editingRole && (
        <EditRoleDialog
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          venueId={venueId}
          role={editingRole}
          onSuccess={loadData}
        />
      )}

      <Dialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת תפקיד</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את התפקיד &quot;{deletingRole?.name}&quot;?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRole(null)}>
              ביטול
            </Button>
            <Button onClick={confirmDelete} variant="destructive">
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
