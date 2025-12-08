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
    // Track which nodes have been added as children to prevent duplicates
    const childNodes = new Set<string>();

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

    // Helper function to add child node safely (prevents duplicates)
    const addChildSafely = (parent: HierarchyNode, child: HierarchyNode) => {
      // Prevent adding the same node twice
      if (childNodes.has(child.id)) {
        return false;
      }

      // Prevent circular references
      if (parent.id === child.id) {
        return false;
      }

      // Check if child is already a child of this parent
      if (parent.children.some((c) => c.id === child.id)) {
        return false;
      }

      // Add child
      parent.children.push(child);
      childNodes.add(child.id);
      child.depth = (parent.depth || 0) + 1;
      return true;
    };

    // Second pass: build management role relationships (managedRoleId)
    // Management roles should be parents of the roles they manage
    // Priority: Management roles are highest priority
    roles.forEach((role) => {
      const node = roleMap.get(role.id);
      if (!node) return;

      // If this is a management role, add the managed role as its child
      if (role.isManagementRole && role.managedRoleId) {
        const managedNode = roleMap.get(role.managedRoleId);
        if (managedNode && !childNodes.has(managedNode.id)) {
          addChildSafely(node, managedNode);
        }
      }
    });

    // Third pass: build manager-role relationships (managerRoleId)
    // This creates the family tree: manager -> managed roles
    // Priority: Manager relationships are second priority
    roles.forEach((role) => {
      const node = roleMap.get(role.id);
      if (!node) return;

      // Skip if this role is already a child
      if (childNodes.has(node.id)) {
        return;
      }

      if (role.managerRoleId) {
        const managerNode = roleMap.get(role.managerRoleId);
        if (managerNode) {
          addChildSafely(managerNode, node);
        }
      }
    });

    // Fourth pass: build parent-child relationships (parentRoleId) for roles without managers
    // This is for legacy hierarchy support
    // Priority: Parent relationships are lowest priority
    roles.forEach((role) => {
      const node = roleMap.get(role.id);
      if (!node) return;

      // Skip if this role is already a child
      if (childNodes.has(node.id)) {
        return;
      }

      // Only process if role doesn't have a manager
      if (!role.managerRoleId && role.parentRoleId) {
        const parentNode = roleMap.get(role.parentRoleId);
        if (parentNode) {
          addChildSafely(parentNode, node);
        }
      }
    });

    // Fifth pass: collect root nodes (roles that are not children of anyone)
    // These will be added under owner or as top-level nodes
    const rootRoles: HierarchyNode[] = [];

    // Find all root nodes (not in childNodes set)
    roleMap.forEach((node) => {
      if (!childNodes.has(node.id)) {
        rootRoles.push(node);
      }
    });

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
