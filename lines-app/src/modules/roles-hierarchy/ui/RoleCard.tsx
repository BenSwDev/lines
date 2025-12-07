"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, User, Users } from "lucide-react";
import type { RoleWithRelations } from "../types";

type RoleCardProps = {
  role: RoleWithRelations;
  onEdit: (role: RoleWithRelations) => void;
  onDelete: (role: RoleWithRelations) => void;
  "data-tour"?: string;
};

export function RoleCard({ role, onEdit, onDelete, "data-tour": dataTour }: RoleCardProps) {
  const hasChildren = role.childRoles && role.childRoles.length > 0;
  const hasParent = role.parentRole !== null;

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 border-l-4"
      style={{ borderLeftColor: role.color }}
      data-tour={dataTour}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${role.color}15` }}
            >
              {role.icon ? (
                <span className="text-2xl">{role.icon}</span>
              ) : (
                <User className="h-6 w-6" style={{ color: role.color }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-1">{role.name}</h3>
              {role.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(role)}
              className="h-8 w-8"
              title="ערוך"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(role)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="מחק"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {hasParent && role.parentRole && (
            <Badge variant="secondary" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              מנהל: {role.parentRole.name}
            </Badge>
          )}
          {hasChildren && (
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {role.childRoles.length}{" "}
              {role.childRoles.length === 1 ? "תפקיד כפוף" : "תפקידים כפופים"}
            </Badge>
          )}
          {!hasParent && !hasChildren && (
            <span className="text-xs text-muted-foreground">תפקיד ראשי</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
