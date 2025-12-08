"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit2, Trash2, Eye, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { RoleWithRelations } from "../types";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { EditRoleDialog } from "./EditRoleDialog";

type RolesSidebarProps = {
  venueId: string;
  roles: RoleWithRelations[];
  selectedRoleId?: string | null;
  onRoleSelect?: (role: RoleWithRelations | null) => void;
  onRoleUpdate?: () => void;
};

export function RolesSidebar({
  venueId,
  roles,
  selectedRoleId,
  onRoleSelect,
  onRoleUpdate
}: RolesSidebarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithRelations | null>(null);
  const [viewingRole, setViewingRole] = useState<RoleWithRelations | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleWithRelations | null>(null);

  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const handleEdit = (role: RoleWithRelations, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingRole(role);
  };

  const handleView = (role: RoleWithRelations, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setViewingRole(role);
    onRoleSelect?.(role);
  };

  const handleDelete = (role: RoleWithRelations, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingRole(role);
  };

  const handleRoleClick = (role: RoleWithRelations) => {
    onRoleSelect?.(role);
  };

  const handleSuccess = () => {
    onRoleUpdate?.();
    setIsCreateOpen(false);
    setEditingRole(null);
  };

  return (
    <>
      <div className="flex flex-col h-full border-r bg-card">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">תפקידים</h2>
            <Button onClick={handleCreate} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              הוסף
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {roles.length} {roles.length === 1 ? "תפקיד" : "תפקידים"}
          </p>
        </div>

        {/* Roles List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mb-4">אין תפקידים עדיין</p>
                <Button onClick={handleCreate} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  צור תפקיד ראשון
                </Button>
              </div>
            ) : (
              roles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                const isManagement = role.isManagementRole;

                return (
                  <div
                    key={role.id}
                    onClick={() => handleRoleClick(role)}
                    className={`
                      group relative p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }
                    `}
                    style={{
                      borderLeftColor: isSelected ? role.color : undefined,
                      borderLeftWidth: isSelected ? "4px" : "2px"
                    }}
                  >
                    {/* Role Header */}
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${role.color}15` }}
                      >
                        {role.icon ? (
                          <span className="text-xl">{role.icon}</span>
                        ) : (
                          <User className="h-5 w-5" style={{ color: role.color }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{role.name}</h3>
                          {isManagement && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              ניהול
                            </Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions (shown on hover) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => handleView(role, e)}
                        title="צפה"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {!isManagement && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleEdit(role, e)}
                            title="ערוך"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDelete(role, e)}
                            title="מחק"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Dialogs */}
      <CreateRoleDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        venueId={venueId}
        onSuccess={handleSuccess}
      />

      {editingRole && (
        <EditRoleDialog
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          venueId={venueId}
          role={editingRole}
          onSuccess={handleSuccess}
        />
      )}

      {/* View Role Dialog */}
      <Dialog open={!!viewingRole} onOpenChange={() => setViewingRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${viewingRole?.color}15` }}
              >
                {viewingRole?.icon ? (
                  <span className="text-2xl">{viewingRole.icon}</span>
                ) : (
                  <User className="h-6 w-6" style={{ color: viewingRole?.color }} />
                )}
              </div>
              <div>
                <div>{viewingRole?.name}</div>
                {viewingRole?.isManagementRole && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    תפקיד ניהול
                  </Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>{viewingRole?.description || "אין תיאור"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewingRole?.parentRole && (
              <div>
                <div className="text-sm font-medium mb-1">מנהל:</div>
                <div className="text-sm text-muted-foreground">{viewingRole.parentRole.name}</div>
              </div>
            )}
            {viewingRole?.childRoles && viewingRole.childRoles.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">
                  תפקידים כפופים ({viewingRole.childRoles.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewingRole.childRoles.map((child) => (
                    <Badge key={child.id} variant="outline" className="text-xs">
                      {child.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {viewingRole?.managedRole && (
              <div>
                <div className="text-sm font-medium mb-1">תפקיד מנוהל:</div>
                <div className="text-sm text-muted-foreground">{viewingRole.managedRole.name}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            {!viewingRole?.isManagementRole && viewingRole && (
              <Button onClick={() => handleEdit(viewingRole)} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                ערוך
              </Button>
            )}
            <Button onClick={() => setViewingRole(null)}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            <Button
              onClick={async () => {
                if (!deletingRole) return;
                // Import delete action
                const { deleteRole } = await import("../actions/roleActions");
                const result = await deleteRole(deletingRole.id, venueId);
                if (result.success) {
                  onRoleUpdate?.();
                  setDeletingRole(null);
                }
              }}
              variant="destructive"
            >
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
