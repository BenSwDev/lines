"use client";

import { useEffect, useState } from "react";
import { HierarchyDiagram } from "./HierarchyDiagram";
import { RolesSidebar } from "./RolesSidebar";
import { listRoles, getManagementRoles } from "../actions/roleActions";
import { hierarchyService } from "../services/hierarchyService";
import type { HierarchyNode, RoleWithRelations } from "../types";

type RolesHierarchyPageProps = {
  venueId: string;
  ownerUserId?: string;
  ownerName?: string;
};

export function RolesHierarchyPage({ venueId, ownerUserId, ownerName }: RolesHierarchyPageProps) {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [roles, setRoles] = useState<RoleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [rolesResult, managementResult] = await Promise.all([
      listRoles(venueId),
      getManagementRoles(venueId)
    ]);

    if (
      rolesResult.success &&
      "data" in rolesResult &&
      managementResult.success &&
      "data" in managementResult
    ) {
      const regularRoles = rolesResult.data || [];
      const managementRoles = managementResult.data || [];
      const allRoles = [...regularRoles, ...managementRoles];

      setRoles(allRoles);

      const tree = hierarchyService.buildHierarchyTree(allRoles, ownerUserId, ownerName || "בעלים");
      setHierarchy(tree);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const handleNodeClick = (node: HierarchyNode) => {
    setSelectedRoleId(node.id);
    // Find the role in the roles list
    const role = roles.find((r) => r.id === node.id);
    if (role) {
      // This will trigger the sidebar to show the role details
    }
  };

  const handleRoleSelect = (role: RoleWithRelations | null) => {
    if (role) {
      setSelectedRoleId(role.id);
    } else {
      setSelectedRoleId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Roles & Hierarchy</h1>
          <p className="text-muted-foreground mt-2">Manage roles and organizational structure</p>
        </div>
        <div className="flex gap-6 h-[600px]">
          <div className="w-80 border-r bg-card animate-pulse rounded" />
          <div className="flex-1 bg-muted/30 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      <div>
        <h1 className="text-3xl font-bold">Roles & Hierarchy</h1>
        <p className="text-muted-foreground mt-2">Manage roles and organizational structure</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar with roles list */}
        <div className="w-80 flex-shrink-0">
          <RolesSidebar
            venueId={venueId}
            roles={roles}
            selectedRoleId={selectedRoleId}
            onRoleSelect={handleRoleSelect}
            onRoleUpdate={loadData}
          />
        </div>

        {/* Main diagram area */}
        <div className="flex-1 min-w-0">
          <HierarchyDiagram
            hierarchy={hierarchy}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedRoleId}
          />
        </div>
      </div>
    </div>
  );
}
