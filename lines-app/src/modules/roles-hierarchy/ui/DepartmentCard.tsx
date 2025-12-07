"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Folder } from "lucide-react";
import type { DepartmentWithRelations } from "../types";

type DepartmentCardProps = {
  department: DepartmentWithRelations;
  onEdit: (department: DepartmentWithRelations) => void;
  onDelete: (department: DepartmentWithRelations) => void;
};

export function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
  const roleCount = department._count?.roles || department.roles.length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${department.color}20` }}
            >
              {department.icon ? (
                <span className="text-2xl">{department.icon}</span>
              ) : (
                <Folder className="h-6 w-6" style={{ color: department.color }} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{department.name}</h3>
              {department.description && (
                <p className="text-sm text-muted-foreground mt-1">{department.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(department)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(department)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {roleCount} {roleCount === 1 ? "role" : "roles"}
          </Badge>
          {department.childDepartments.length > 0 && (
            <Badge variant="outline">
              {department.childDepartments.length}{" "}
              {department.childDepartments.length === 1 ? "sub-dept" : "sub-depts"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
