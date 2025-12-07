"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Folder, User } from "lucide-react";
import { getDepartmentHierarchy } from "../actions/departmentActions";
import { listRoles } from "../actions/roleActions";
import { hierarchyService } from "../services/hierarchyService";
import type { HierarchyNode } from "../types";

type HierarchyViewProps = {
  venueId: string;
};

type ExpandedNodes = Set<string>;

export function HierarchyView({ venueId }: HierarchyViewProps) {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedNodes>(new Set());

  const loadHierarchy = async () => {
    setIsLoading(true);
    const [departmentsResult, rolesResult] = await Promise.all([
      getDepartmentHierarchy(venueId),
      listRoles(venueId)
    ]);

    if (
      departmentsResult.success &&
      "data" in departmentsResult &&
      rolesResult.success &&
      "data" in rolesResult
    ) {
      const departments = departmentsResult.data || [];
      const roles = rolesResult.data || [];
      const tree = hierarchyService.buildHierarchyTree(departments, roles);
      setHierarchy(tree);
      // Expand all by default
      const allIds = new Set<string>();
      const collectIds = (nodes: HierarchyNode[]) => {
        nodes.forEach((node) => {
          allIds.add(node.id);
          if (node.children.length > 0) {
            collectIds(node.children);
          }
        });
      };
      collectIds(tree);
      setExpanded(allIds);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const toggleExpand = (nodeId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: HierarchyNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const isDepartment = node.type === "department";

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer"
          style={{ paddingLeft: `${depth * 24 + 8}px` }}
          onClick={() => hasChildren && toggleExpand(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              isDepartment ? "rounded-lg" : "rounded-full"
            }`}
            style={{ backgroundColor: `${node.color}20` }}
          >
            {node.icon ? (
              <span className="text-lg">{node.icon}</span>
            ) : isDepartment ? (
              <Folder className="h-4 w-4" style={{ color: node.color }} />
            ) : (
              <User className="h-4 w-4" style={{ color: node.color }} />
            )}
          </div>

          <span className="font-medium">{node.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Hierarchy</h2>
          <p className="text-muted-foreground">Visual representation of departments and roles</p>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Folder className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No hierarchy yet</h3>
        <p className="text-sm text-muted-foreground">
          Create departments and roles to see the hierarchy
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Hierarchy</h2>
        <p className="text-muted-foreground">Visual representation of departments and roles</p>
      </div>
      <div className="rounded-lg border bg-card p-4">
        {hierarchy.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
