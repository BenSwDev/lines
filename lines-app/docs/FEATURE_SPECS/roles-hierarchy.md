# Feature Specification: Roles & Hierarchy

**Status:** Implemented  
**Module:** `src/modules/roles-hierarchy`  
**Routes:** `/venues/[venueId]/roles`

---

## Overview

The Roles & Hierarchy feature provides organizational structure management for venues. Users can create departments, assign roles to departments, and visualize the hierarchy in a tree view.

Based on the requirement to manage roles and hierarchy for any venue type worldwide.

---

## Core Concepts

### Department

A department represents an organizational unit within a venue (e.g., Kitchen, Bar, Service, Security, Management).

- Has a name, description, color, and optional icon
- Can have a parent department (hierarchy support)
- Has a display order
- Can be active or inactive

### Role

A role represents a specific position within a department (e.g., Chef, Bartender, Manager).

- Has a name, description, color, and optional icon
- Can have a parent role (hierarchy support) - only management roles can be parents
- Can require management (automatically creates a management role)
- Can be active or inactive

### Management Role

A management role is automatically created when a regular role is marked as "requires management".

- Automatically created when a role requires management
- Can be a parent to other roles (only management roles can be parents in the hierarchy)
- Linked to the managed role via `managedRoleId`
- Name format: "ניהול [Role Name]"

---

## User Stories

1. As a venue manager, I want to create departments to organize roles.
2. As a venue manager, I want to create roles within departments.
3. As a venue manager, I want to mark roles as requiring management (automatically creates management role).
4. As a venue manager, I want to view the organizational hierarchy visually.
5. As a venue manager, I want to edit departments and roles.
6. As a venue manager, I want to delete departments and roles (with validation).
7. As a venue manager, I want to assign parent roles (only management roles can be parents).

---

## UI Components

### Roles & Hierarchy Page (`/venues/[venueId]/roles`)

**Layout:**

- Page title: "Roles & Hierarchy"
- Split view: **Sidebar** (left) with roles list + **Interactive Diagram** (center) with visual hierarchy

**Components:**

1. **Roles Sidebar** (Left Panel)
   - Scrollable list of all roles (including management roles)
   - Each role card shows: icon, name, description, management badge
   - Actions on hover: View, Edit, Delete
   - "Add" button at top to create new roles
   - Selected role is highlighted
   - Click on role to select it in the diagram

2. **Interactive Hierarchy Diagram** (Center Panel)
   - Visual pyramid/tree diagram with connecting lines between levels
   - Nodes are color-coded by role color
   - Management roles appear above the roles they manage
   - Click on node to select and view details
   - Hover effects for better interactivity
   - SVG-based rendering for smooth scaling
   - Automatic layout calculation based on hierarchy depth and width

---

## API Endpoints

All operations use Server Actions (no REST API endpoints).

### Department Actions

- `listDepartments(venueId: string)` - List all departments for a venue
- `getDepartment(id: string, venueId: string)` - Get a single department
- `createDepartment(venueId: string, input: CreateDepartmentInput)` - Create a department
- `updateDepartment(id: string, venueId: string, input: UpdateDepartmentInput)` - Update a department
- `deleteDepartment(id: string, venueId: string)` - Delete a department
- `getDepartmentHierarchy(venueId: string)` - Get hierarchy tree

### Role Actions

- `listRoles(venueId: string, parentRoleId?: string | null)` - List roles (excludes management roles, optionally filtered by parent)
- `getManagementRoles(venueId: string)` - List all management roles for a venue
- `getRole(id: string, venueId: string)` - Get a single role
- `createRole(venueId: string, input: CreateRoleInput)` - Create a role (optionally creates management role)
- `updateRole(id: string, venueId: string, input: UpdateRoleInput)` - Update a role (optionally creates/deletes management role)
- `deleteRole(id: string, venueId: string)` - Delete a role (also deletes associated management role if exists)

---

## Business Rules

1. Department name is required and must be unique per venue (not enforced at DB level).
2. Role name is required.
3. Cannot delete a department that has roles or child departments.
4. Cannot set a department as its own parent (circular reference prevention).
5. **Only management roles can be parent roles** - regular roles cannot be parents.
6. When a role is marked as "requires management", a management role is automatically created.
7. When a role is unmarked as "requires management", its management role is automatically deleted.
8. Management roles cannot be directly edited - edit the managed role instead.
9. Cannot delete a role that has child roles.
10. All operations require authentication and venue ownership verification.

---

## Data Model

See `docs/DATA_MODEL.md` for complete entity definitions.

**Key Entities:**

- `Department` - Organizational unit
- `Role` - Position within a department

---

## Module Structure

```
src/modules/roles-hierarchy/
  ui/
    RolesHierarchyPage.tsx       - Main page component (split view: sidebar + diagram)
    HierarchyDiagram.tsx         - Interactive SVG-based hierarchy diagram
    RolesSidebar.tsx             - Sidebar with roles list and actions
    RolesTab.tsx                 - Legacy roles tab (deprecated, kept for reference)
    HierarchyView.tsx            - Legacy hierarchy view (deprecated, kept for reference)
    DepartmentCard.tsx           - Department card component
    RoleCard.tsx                 - Role card component
    CreateDepartmentDialog.tsx   - Create department dialog
    EditDepartmentDialog.tsx      - Edit department dialog
    CreateRoleDialog.tsx         - Create role dialog
    EditRoleDialog.tsx           - Edit role dialog
  actions/
    departmentActions.ts         - Department server actions
    roleActions.ts               - Role server actions
  services/
    departmentsService.ts        - Department business logic
    rolesService.ts              - Role business logic
    hierarchyService.ts          - Hierarchy tree building (fixed management role positioning)
  schemas/
    departmentSchemas.ts         - Zod validation for departments
    roleSchemas.ts               - Zod validation for roles
  types.ts                       - TypeScript types
  index.ts                       - Public exports
  README.md                      - Module documentation
```

---

## Future Enhancements

- Staff assignment (linking users to roles)
- Role permissions system
- Department templates
- Bulk operations
- Export/import hierarchy

---

---

## Recent Updates (2025-01-XX)

### UI Redesign

- **Removed tabs** - Replaced with split view (sidebar + diagram)
- **Interactive Diagram** - New SVG-based visual hierarchy with connecting lines
- **Sidebar Integration** - Roles list moved to sidebar with inline actions
- **Better Hierarchy Display** - Management roles now correctly appear above managed roles

### Bug Fixes

- **Management Role Positioning** - Fixed hierarchy service to correctly position management roles above the roles they manage
- **Visual Hierarchy** - Management roles (e.g., "ניהול בר") now appear at correct level above regular roles (e.g., "בר")

**Last Updated:** 2025-01-XX
