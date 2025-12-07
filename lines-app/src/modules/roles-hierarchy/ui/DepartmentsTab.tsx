"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Folder } from "lucide-react";
import { DepartmentCard } from "./DepartmentCard";
import { CreateDepartmentDialog } from "./CreateDepartmentDialog";
import { EditDepartmentDialog } from "./EditDepartmentDialog";
import { listDepartments, deleteDepartment } from "../actions/departmentActions";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { DepartmentWithRelations } from "../types";

type DepartmentsTabProps = {
  venueId: string;
};

export function DepartmentsTab({ venueId }: DepartmentsTabProps) {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<DepartmentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentWithRelations | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<DepartmentWithRelations | null>(
    null
  );

  const loadDepartments = async () => {
    setIsLoading(true);
    const result = await listDepartments(venueId);

    if (result.success && "data" in result) {
      setDepartments(result.data || []);
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: "Error",
        description: errorMsg || "Failed to load departments",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const handleEdit = (department: DepartmentWithRelations) => {
    setEditingDepartment(department);
  };

  const handleDelete = (department: DepartmentWithRelations) => {
    setDeletingDepartment(department);
  };

  const confirmDelete = async () => {
    if (!deletingDepartment) return;

    const result = await deleteDepartment(deletingDepartment.id, venueId);

    if (result.success) {
      toast({
        title: "Success",
        description: "Department deleted successfully"
      });
      setDepartments((prev) => prev.filter((d) => d.id !== deletingDepartment.id));
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : null;
      toast({
        title: "Error",
        description: errorMsg || "Failed to delete department",
        variant: "destructive"
      });
    }

    setDeletingDepartment(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Departments</h2>
            <p className="text-muted-foreground">Organize roles into departments</p>
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
            <h2 className="text-2xl font-bold">Departments</h2>
            <p className="text-muted-foreground">Organize roles into departments</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>

        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No departments yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first department to organize roles
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Department
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CreateDepartmentDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        venueId={venueId}
        parentDepartments={departments}
        onSuccess={loadDepartments}
      />

      {editingDepartment && (
        <EditDepartmentDialog
          isOpen={!!editingDepartment}
          onClose={() => setEditingDepartment(null)}
          venueId={venueId}
          department={editingDepartment}
          parentDepartments={departments}
          onSuccess={loadDepartments}
        />
      )}

      <Dialog open={!!deletingDepartment} onOpenChange={() => setDeletingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingDepartment?.name}&quot;? This action cannot be
              undone. All roles in this department must be removed or reassigned first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDepartment(null)}>
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
