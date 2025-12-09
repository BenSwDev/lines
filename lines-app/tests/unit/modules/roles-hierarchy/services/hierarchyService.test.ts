import { describe, it, expect } from "vitest";
import { hierarchyService } from "@/modules/roles-hierarchy/services/hierarchyService";
import type { RoleWithRelations } from "@/modules/roles-hierarchy/types";
import { mockRole, mockManagementRole, mockManagerRole } from "@/../../../fixtures/roles";

describe("HierarchyService", () => {
  describe("buildHierarchyTree()", () => {
    it("should build tree with owner at root", () => {
      const roles: RoleWithRelations[] = [mockRole];
      const ownerUserId = "owner-1";
      const ownerName = "Owner";

      const result = hierarchyService.buildHierarchyTree(roles, ownerUserId, ownerName);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(`owner-${ownerUserId}`);
      expect(result[0].name).toBe(ownerName);
    });

    it("should build management role relationships", () => {
      const managedRole = { ...mockRole, id: "role-1" };
      const managementRole = {
        ...mockManagementRole,
        id: "mgmt-1",
        managedRoleId: "role-1"
      };

      const roles: RoleWithRelations[] = [managedRole, managementRole];

      const result = hierarchyService.buildHierarchyTree(roles);

      // Management role should be parent of managed role
      const mgmtNode = result.find((n) => n.id === "mgmt-1");
      expect(mgmtNode).toBeDefined();
      if (mgmtNode) {
        expect(mgmtNode.children.some((c) => c.id === "role-1")).toBe(true);
      }
    });

    it("should build manager-role relationships", () => {
      const managerRole = { ...mockManagerRole, id: "manager-1", canManage: true };
      const managedRole = {
        ...mockRole,
        id: "role-1",
        managerRoleId: "manager-1"
      };

      const roles: RoleWithRelations[] = [managerRole, managedRole];

      const result = hierarchyService.buildHierarchyTree(roles);

      // Manager should be parent of managed role
      const managerNode = result.find((n) => n.id === "manager-1");
      expect(managerNode).toBeDefined();
      if (managerNode) {
        expect(managerNode.children.some((c) => c.id === "role-1")).toBe(true);
      }
    });

    it("should build parent-child relationships", () => {
      const parentRole = { ...mockRole, id: "parent-1" };
      const childRole = {
        ...mockRole,
        id: "child-1",
        parentRoleId: "parent-1"
      };

      const roles: RoleWithRelations[] = [parentRole, childRole];

      const result = hierarchyService.buildHierarchyTree(roles);

      const parentNode = result.find((n) => n.id === "parent-1");
      expect(parentNode).toBeDefined();
      if (parentNode) {
        expect(parentNode.children.some((c) => c.id === "child-1")).toBe(true);
      }
    });

    it("should handle roles without parents", () => {
      const roles: RoleWithRelations[] = [mockRole];

      const result = hierarchyService.buildHierarchyTree(roles);

      expect(result.length).toBeGreaterThan(0);
      // Role should appear as root node
      expect(result.some((n) => n.id === mockRole.id)).toBe(true);
    });

    it("should prevent duplicates", () => {
      const role1 = { ...mockRole, id: "role-1" };
      const role2 = { ...mockRole, id: "role-2", parentRoleId: "role-1" };

      const roles: RoleWithRelations[] = [role1, role2];

      const result = hierarchyService.buildHierarchyTree(roles);

      // Each node should appear only once
      const allIds = new Set<string>();
      const collectIds = (nodes: typeof result) => {
        nodes.forEach((node) => {
          expect(allIds.has(node.id)).toBe(false);
          allIds.add(node.id);
          if (node.children.length > 0) {
            collectIds(node.children);
          }
        });
      };
      collectIds(result);
    });

    it("should prevent circular references", () => {
      const role1 = { ...mockRole, id: "role-1", parentRoleId: "role-2" };
      const role2 = { ...mockRole, id: "role-2", parentRoleId: "role-1" };

      const roles: RoleWithRelations[] = [role1, role2];

      const result = hierarchyService.buildHierarchyTree(roles);

      // Should not create infinite loop
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should set correct depths", () => {
      const parent = { ...mockRole, id: "parent-1" };
      const child = { ...mockRole, id: "child-1", parentRoleId: "parent-1" };

      const roles: RoleWithRelations[] = [parent, child];

      const result = hierarchyService.buildHierarchyTree(roles);

      const parentNode = result.find((n) => n.id === "parent-1");
      const childNode = parentNode?.children.find((c) => c.id === "child-1");

      expect(parentNode?.depth).toBe(0);
      expect(childNode?.depth).toBe(1);
    });
  });

  describe("flattenHierarchy()", () => {
    it("should flatten tree correctly", () => {
      const nodes = [
        {
          id: "parent-1",
          type: "role" as const,
          name: "Parent",
          color: "#3B82F6",
          children: [
            {
              id: "child-1",
              type: "role" as const,
              name: "Child",
              color: "#3B82F6",
              children: [],
              depth: 1,
              data: mockRole as RoleWithRelations
            }
          ],
          depth: 0,
          data: mockRole as RoleWithRelations
        }
      ];

      const result = hierarchyService.flattenHierarchy(nodes);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("parent-1");
      expect(result[1].id).toBe("child-1");
    });

    it("should preserve depth information", () => {
      const nodes = [
        {
          id: "parent-1",
          type: "role" as const,
          name: "Parent",
          color: "#3B82F6",
          children: [
            {
              id: "child-1",
              type: "role" as const,
              name: "Child",
              color: "#3B82F6",
              children: [],
              depth: 1,
              data: mockRole as RoleWithRelations
            }
          ],
          depth: 0,
          data: mockRole as RoleWithRelations
        }
      ];

      const result = hierarchyService.flattenHierarchy(nodes);

      expect(result[0].depth).toBe(0);
      expect(result[1].depth).toBe(1);
    });
  });

  describe("findNodeById()", () => {
    it("should find node in tree", () => {
      const nodes = [
        {
          id: "parent-1",
          type: "role" as const,
          name: "Parent",
          color: "#3B82F6",
          children: [
            {
              id: "child-1",
              type: "role" as const,
              name: "Child",
              color: "#3B82F6",
              children: [],
              depth: 1,
              data: mockRole as RoleWithRelations
            }
          ],
          depth: 0,
          data: mockRole as RoleWithRelations
        }
      ];

      const result = hierarchyService.findNodeById(nodes, "child-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("child-1");
    });

    it("should return null if not found", () => {
      const nodes = [
        {
          id: "parent-1",
          type: "role" as const,
          name: "Parent",
          color: "#3B82F6",
          children: [],
          depth: 0,
          data: mockRole as RoleWithRelations
        }
      ];

      const result = hierarchyService.findNodeById(nodes, "non-existent");

      expect(result).toBeNull();
    });

    it("should search nested children", () => {
      const nodes = [
        {
          id: "parent-1",
          type: "role" as const,
          name: "Parent",
          color: "#3B82F6",
          children: [
            {
              id: "child-1",
              type: "role" as const,
              name: "Child",
              color: "#3B82F6",
              children: [
                {
                  id: "grandchild-1",
                  type: "role" as const,
                  name: "Grandchild",
                  color: "#3B82F6",
                  children: [],
                  depth: 2,
                  data: mockRole as RoleWithRelations
                }
              ],
              depth: 1,
              data: mockRole as RoleWithRelations
            }
          ],
          depth: 0,
          data: mockRole as RoleWithRelations
        }
      ];

      const result = hierarchyService.findNodeById(nodes, "grandchild-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("grandchild-1");
    });
  });

  describe("getRolePath()", () => {
    it("should return correct path for role", () => {
      const node = {
        id: "child-1",
        type: "role" as const,
        name: "Child",
        color: "#3B82F6",
        children: [],
        depth: 1,
        data: mockRole as RoleWithRelations
      };

      const nodes = [
        {
          id: "parent-1",
          type: "role" as const,
          name: "Parent",
          color: "#3B82F6",
          children: [node],
          depth: 0,
          data: mockRole as RoleWithRelations
        }
      ];

      const result = hierarchyService.getRolePath(node, nodes);

      expect(result).toEqual(["Parent", "Child"]);
    });

    it("should handle deep nesting", () => {
      const grandchild = {
        id: "grandchild-1",
        type: "role" as const,
        name: "Grandchild",
        color: "#3B82F6",
        children: [],
        depth: 2,
        data: mockRole as RoleWithRelations
      };

      const child = {
        id: "child-1",
        type: "role" as const,
        name: "Child",
        color: "#3B82F6",
        children: [grandchild],
        depth: 1,
        data: mockRole as RoleWithRelations
      };

      const parent = {
        id: "parent-1",
        type: "role" as const,
        name: "Parent",
        color: "#3B82F6",
        children: [child],
        depth: 0,
        data: mockRole as RoleWithRelations
      };

      const nodes = [parent];

      const result = hierarchyService.getRolePath(grandchild, nodes);

      expect(result).toEqual(["Parent", "Child", "Grandchild"]);
    });
  });
});
