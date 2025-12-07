import type { RoleWithRelations, HierarchyNode } from "../types";

export class HierarchyService {
  buildHierarchyTree(roles: RoleWithRelations[]): HierarchyNode[] {
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

    // Second pass: build parent-child relationships
    roles.forEach((role) => {
      const node = roleMap.get(role.id);
      if (!node) return;

      if (role.parentRoleId) {
        const parentNode = roleMap.get(role.parentRoleId);
        if (parentNode) {
          parentNode.children.push(node);
          node.depth = (parentNode.depth || 0) + 1;
        } else {
          // Parent not in list, add as root
          nodes.push(node);
        }
      } else {
        // Root role
        nodes.push(node);
      }
    });

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
