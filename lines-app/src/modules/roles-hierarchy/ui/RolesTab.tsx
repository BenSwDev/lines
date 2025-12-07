"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
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
import { listDepartments } from "../actions/departmentActions";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { RoleWithRelations, DepartmentWithRelations } from "../types";

type RolesTabProps = {
  venueId: string;
};

export function RolesTab({ venueId }: RolesTabProps) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleWithRelations[]>([]);
  const [departments, setDepartments] = useState<DepartmentWithRelations[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithRelations | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleWithRelations | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [rolesResult, departmentsResult] = await Promise.all([
      listRoles(venueId, selectedDepartmentId === "all" ? undefined : selectedDepartmentId),
      listDepartments(venueId)
    ]);

    if (rolesResult.success && "data" in rolesResult) {
      setRoles(rolesResult.data || []);
    } else {
      const errorMsg = !rolesResult.success && "error" in rolesResult ? rolesResult.error : null;
      toast({
        title: "Error",
        description: errorMsg || "Failed to load roles",
        variant: "destructive"
      });
    }

    if (departmentsResult.success && "data" in departmentsResult) {
      setDepartments(departmentsResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, selectedDepartmentId]);

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
        title: "Success",
        description: "Role deleted successfully"
      });
      setRoles((prev) => prev.filter((r) => r.id !== deletingRole.id));
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: "Error",
        description: errorMsg || "Failed to delete role",
        variant: "destructive"
      });
    }

    setDeletingRole(null);
  };

  const filteredRoles =
    selectedDepartmentId === "all"
      ? roles
      : roles.filter((r) => r.departmentId === selectedDepartmentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Roles</h2>
            <p className="text-muted-foreground">Manage roles within departments</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create
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

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Roles</h2>
            <p className="text-muted-foreground">Manage roles within departments</p>
          </div>
          <Button onClick={handleCreate} disabled={departments.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>

        {departments.length > 0 && (
          <div className="flex items-center gap-2">
            <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No departments yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a department first before adding roles
            </p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No roles yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first role to get started
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.map((role) => (
              <RoleCard key={role.id} role={role} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <CreateRoleDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        venueId={venueId}
        departments={departments}
        onSuccess={loadData}
      />

      {editingRole && (
        <EditRoleDialog
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          venueId={venueId}
          role={editingRole}
          departments={departments}
          onSuccess={loadData}
        />
      )}

      <Dialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingRole?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRole(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
