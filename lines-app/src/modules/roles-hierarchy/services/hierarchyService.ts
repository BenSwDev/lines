import type { RoleWithRelations, HierarchyNode } from "../types";

export class HierarchyService {
  /**
   * Build family tree hierarchy: Owner -> Managers -> Roles
   * Owner is at the root, managers are linked via managerRoleId, roles are linked via parentRoleId
   */
  buildHierarchyTree(
    roles: RoleWithRelations[],
    ownerUserId?: string,
    ownerName?: string
  ): HierarchyNode[] {
    const nodes: HierarchyNode[] = [];
    const roleMap = new Map<string, HierarchyNode>();

    // First pass: create all role nodes
    roles.forEach((role) => {
      const node: HierarchyNode = {
        id: role.id,
        type: "role",
        name: role.name,
        color: role.color,
        icon: role.icon || undefined,
        children: [],
        data: role,
        depth: 0
      };
      roleMap.set(role.id, node);
    });

    // Create owner node if provided
    let ownerNode: HierarchyNode | null = null;
    if (ownerUserId && ownerName) {
      // Create a minimal role-like object for owner
      const ownerData = {
        id: `owner-${ownerUserId}`,
        venueId: "",
        name: ownerName,
        color: "#F59E0B",
        description: null,
        icon: "👑",
        parentRoleId: null,
        managerRoleId: null,
        order: 0,
        isActive: true,
        requiresManagement: false,
        isManagementRole: false,
        managedRoleId: null,
        requiresStaffing: false,
        canManage: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentRole: null,
        childRoles: [],
        managedRole: null,
        managementRole: null,
        managerRole: null,
        managedRoles: []
      };
      ownerNode = {
        id: `owner-${ownerUserId}`,
        type: "role",
        name: ownerName,
        color: "#F59E0B",
        icon: "👑",
        children: [],
        data: ownerData as RoleWithRelations,
        depth: 0
      };
    }

    // Second pass: build manager-role relationships (managerRoleId)
    // This creates the family tree: manager -> managed roles
    roles.forEach((role) => {
      const node = roleMap.get(role.id);
      if (!node) return;

      if (role.managerRoleId) {
        const managerNode = roleMap.get(role.managerRoleId);
        if (managerNode) {
          // Manager exists in the list - add as child
          managerNode.children.push(node);
          node.depth = (managerNode.depth || 0) + 1;
        }
        // If manager doesn't exist, we'll handle it in the next pass
      }
    });

    // Third pass: build parent-child relationships (parentRoleId) for roles without managers
    // This is for legacy hierarchy support
    roles.forEach((role) => {
      const node = roleMap.get(role.id);
      if (!node) return;

      // Only process if role doesn't have a manager (managerRoleId takes precedence)
      if (!role.managerRoleId && role.parentRoleId) {
        const parentNode = roleMap.get(role.parentRoleId);
        if (parentNode) {
          // Check if node is not already a child of parent
          if (!parentNode.children.some((c) => c.id === node.id)) {
            parentNode.children.push(node);
            node.depth = (parentNode.depth || 0) + 1;
          }
        }
      }
    });

    // Fourth pass: collect root nodes (roles without managers and without parents)
    // These will be added under owner or as top-level nodes
    const rootRoles: HierarchyNode[] = [];
    const processedNodes = new Set<string>();

    // Mark all nodes that are children
    const markChildren = (node: HierarchyNode) => {
      node.children.forEach((child) => {
        processedNodes.add(child.id);
        markChildren(child);
      });
    };

    // Find all root nodes (not children of anyone)
    roleMap.forEach((node) => {
      if (!processedNodes.has(node.id)) {
        // Check if this node is a child of someone
        const isChild = roles.some(
          (r) => r.id === node.id && (r.managerRoleId || r.parentRoleId)
        );
        if (!isChild) {
          rootRoles.push(node);
        }
      }
    });

    // Mark all children
    rootRoles.forEach(markChildren);

    // Add root roles under owner or as top-level
    rootRoles.forEach((node) => {
      if (ownerNode) {
        // Check if not already under owner
        if (!ownerNode.children.some((c) => c.id === node.id)) {
          ownerNode.children.push(node);
          node.depth = 1;
        }
      } else {
        nodes.push(node);
      }
    });

    // If owner exists, add it as root
    if (ownerNode) {
      nodes.push(ownerNode);
    }

    return nodes;
  }

  flattenHierarchy(nodes: HierarchyNode[]): HierarchyNode[] {
    const result: HierarchyNode[] = [];

    const traverse = (node: HierarchyNode, depth: number = 0) => {
      const nodeWithDepth = { ...node, depth };
      result.push(nodeWithDepth);
      node.children.forEach((child) => traverse(child, depth + 1));
    };

    nodes.forEach((node) => traverse(node, 0));

    return result;
  }

  findNodeById(nodes: HierarchyNode[], id: string): HierarchyNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      const found = this.findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  getRolePath(node: HierarchyNode, nodes: HierarchyNode[]): string[] {
    const path: string[] = [];
    const findPath = (
      currentNodes: HierarchyNode[],
      targetId: string,
      currentPath: string[]
    ): boolean => {
      for (const n of currentNodes) {
        if (n.id === targetId) {
          path.push(...currentPath, n.name);
          return true;
        }
        if (findPath(n.children, targetId, [...currentPath, n.name])) {
          return true;
        }
      }
      return false;
    };
    findPath(nodes, node.id, []);
    return path;
  }
}

export const hierarchyService = new HierarchyService();
