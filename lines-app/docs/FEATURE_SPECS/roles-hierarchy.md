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
- Belongs to exactly one department
- Can be active or inactive

---

## User Stories

1. As a venue manager, I want to create departments to organize roles.
2. As a venue manager, I want to create roles within departments.
3. As a venue manager, I want to view the organizational hierarchy visually.
4. As a venue manager, I want to edit departments and roles.
5. As a venue manager, I want to delete departments and roles (with validation).

---

## UI Components

### Roles & Hierarchy Page (`/venues/[venueId]/roles`)

**Layout:**
- Page title: "Roles & Hierarchy"
- Three tabs: "Hierarchy", "Departments", "Roles"

**Tabs:**

1. **Hierarchy Tab**
   - Visual tree view of departments and roles
   - Expandable/collapsible nodes
   - Color-coded by department/role

2. **Departments Tab**
   - Grid of department cards
   - Each card shows: name, icon, color, description, role count
   - Actions: Create, Edit, Delete

3. **Roles Tab**
   - Grid of role cards
   - Filter by department
   - Each card shows: name, icon, color, department
   - Actions: Create, Edit, Delete

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

- `listRoles(venueId: string, departmentId?: string)` - List roles (optionally filtered by department)
- `getRole(id: string, venueId: string)` - Get a single role
- `createRole(venueId: string, input: CreateRoleInput)` - Create a role
- `updateRole(id: string, venueId: string, input: UpdateRoleInput)` - Update a role
- `deleteRole(id: string, venueId: string)` - Delete a role

---

## Business Rules

1. Department name is required and must be unique per venue (not enforced at DB level).
2. Role name is required and must belong to a department.
3. Cannot delete a department that has roles or child departments.
4. Cannot set a department as its own parent (circular reference prevention).
5. All operations require authentication and venue ownership verification.

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
    RolesHierarchyPage.tsx       - Main page component
    DepartmentsTab.tsx            - Departments management tab
    RolesTab.tsx                 - Roles management tab
    HierarchyView.tsx            - Visual hierarchy tree
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
    hierarchyService.ts          - Hierarchy tree building
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

**Last Updated:** 2025-01-15

