"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, User } from "lucide-react";
import type { RoleWithRelations } from "../types";

type RoleCardProps = {
  role: RoleWithRelations;
  onEdit: (role: RoleWithRelations) => void;
  onDelete: (role: RoleWithRelations) => void;
};

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${role.color}20` }}
            >
              {role.icon ? (
                <span className="text-2xl">{role.icon}</span>
              ) : (
                <User className="h-6 w-6" style={{ color: role.color }} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{role.name}</h3>
              {role.description && (
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(role)} className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(role)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{role.department.name}</Badge>
      </CardContent>
    </Card>
  );
}
