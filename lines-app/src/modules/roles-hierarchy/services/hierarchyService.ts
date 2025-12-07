import type { DepartmentWithRelations, RoleWithRelations, HierarchyNode } from "../types";

export class HierarchyService {
  buildHierarchyTree(
    departments: DepartmentWithRelations[],
    roles: RoleWithRelations[]
  ): HierarchyNode[] {
    const nodes: HierarchyNode[] = [];

    // Build department nodes
    const departmentMap = new Map<string, HierarchyNode>();

    // First pass: create all department nodes
    departments.forEach((dept) => {
      const node: HierarchyNode = {
        id: dept.id,
        type: "department",
        name: dept.name,
        color: dept.color,
        icon: dept.icon || undefined,
        children: [],
        data: dept
      };
      departmentMap.set(dept.id, node);
    });

    // Second pass: build parent-child relationships
    departments.forEach((dept) => {
      const node = departmentMap.get(dept.id);
      if (!node) return;

      if (dept.parentDepartmentId) {
        const parentNode = departmentMap.get(dept.parentDepartmentId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // Parent not in list, add as root
          nodes.push(node);
        }
      } else {
        // Root department
        nodes.push(node);
      }
    });

    // Third pass: add roles to their departments
    roles.forEach((role) => {
      const departmentNode = departmentMap.get(role.departmentId);
      if (departmentNode) {
        const roleNode: HierarchyNode = {
          id: role.id,
          type: "role",
          name: role.name,
          color: role.color,
          icon: role.icon || undefined,
          children: [],
          data: role
        };
        departmentNode.children.push(roleNode);
      }
    });

    return nodes;
  }

  flattenHierarchy(nodes: HierarchyNode[]): HierarchyNode[] {
    const result: HierarchyNode[] = [];

    const traverse = (node: HierarchyNode) => {
      result.push(node);
      node.children.forEach((child) => traverse(child));
    };

    nodes.forEach((node) => traverse(node));

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

  getDepartmentPath(node: HierarchyNode, nodes: HierarchyNode[]): string[] {
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
