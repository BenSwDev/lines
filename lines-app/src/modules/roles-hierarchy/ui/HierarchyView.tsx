"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, User, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listRoles, getManagementRoles } from "../actions/roleActions";
import { hierarchyService } from "../services/hierarchyService";
import type { HierarchyNode } from "../types";

type HierarchyViewProps = {
  venueId: string;
  ownerUserId?: string;
  ownerName?: string;
};

type ExpandedNodes = Set<string>;

export function HierarchyView({ venueId, ownerUserId, ownerName }: HierarchyViewProps) {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedNodes>(new Set());

  const loadHierarchy = async () => {
    setIsLoading(true);
    // Get both regular roles and management roles
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
      const roles = rolesResult.data || [];
      const managementRoles = managementResult.data || [];
      // Combine both types of roles for hierarchy display
      const allRoles = [...roles, ...managementRoles];
      const tree = hierarchyService.buildHierarchyTree(allRoles, ownerUserId, ownerName || "בעלים");
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

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: HierarchyNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(hierarchy);
    setExpanded(allIds);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const renderNode = (node: HierarchyNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const indent = depth * 20;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
            hasChildren ? "hover:bg-muted/70 cursor-pointer" : "hover:bg-muted/30 cursor-default"
          }`}
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => hasChildren && toggleExpand(node.id)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-5 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            )}
          </div>

          {/* Icon */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 border-2"
            style={{
              backgroundColor: `${node.color}15`,
              borderColor: `${node.color}40`
            }}
          >
            {node.icon ? (
              <span className="text-xl">{node.icon}</span>
            ) : (
              <User className="h-5 w-5" style={{ color: node.color }} />
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-base">{node.name}</div>
              {node.id.startsWith("owner-") && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                  בעלים
                </span>
              )}
              {node.data?.isManagementRole && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  ניהול
                </span>
              )}
              {node.data?.canManage && !node.id.startsWith("owner-") && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  מנהל
                </span>
              )}
            </div>
            {hasChildren && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {node.children.length}{" "}
                {node.id.startsWith("owner-")
                  ? node.children.length === 1
                    ? "תפקיד ישיר"
                    : "תפקידים ישירים"
                  : node.children.length === 1
                    ? "תפקיד כפוף"
                    : "תפקידים כפופים"}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Vertical line */}
            {depth === 0 && (
              <div
                className="absolute left-[31px] top-0 bottom-0 w-0.5 bg-border"
                style={{ top: "0px", bottom: "0px" }}
              />
            )}
            <div className="relative">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">היררכיה</h2>
          <p className="text-muted-foreground">תצוגה ויזואלית של התפקידים וההיררכיה</p>
        </div>
        <div className="space-y-2 rounded-lg border bg-card p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
        <User className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">אין היררכיה עדיין</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          צור תפקידים כדי לראות את ההיררכיה הארגונית
        </p>
      </div>
    );
  }

  const allExpanded = hierarchy.every((node) => {
    const checkExpanded = (n: HierarchyNode): boolean => {
      if (n.children.length === 0) return true;
      if (!expanded.has(n.id)) return false;
      return n.children.every(checkExpanded);
    };
    return checkExpanded(node);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">היררכיה</h2>
          <p className="text-muted-foreground">תצוגה ויזואלית של התפקידים וההיררכיה</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={allExpanded ? collapseAll : expandAll}
            className="gap-2"
          >
            {allExpanded ? (
              <>
                <Minimize2 className="h-4 w-4" />
                סגור הכל
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                פתח הכל
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="rounded-lg border bg-card p-4 min-h-[400px]" data-tour="roles-hierarchy">
        {hierarchy.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
