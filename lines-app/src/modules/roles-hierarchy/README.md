# Roles & Hierarchy Module

Module for managing organizational structure with departments and roles.

## Features

- **Departments**: Create and manage departments with hierarchy support
- **Roles**: Create and manage roles within departments
- **Hierarchy View**: Visual tree representation of departments and roles

## Structure

```
src/modules/roles-hierarchy/
  ui/                    - React components
  actions/               - Server actions
  services/              - Business logic
  schemas/               - Zod validation schemas
  types.ts               - TypeScript types
  index.ts               - Public exports
  README.md              - This file
```

## Usage

### Server Actions

```typescript
import { listDepartments, createDepartment } from "@/modules/roles-hierarchy";

// List departments
const result = await listDepartments(venueId);

// Create department
const result = await createDepartment(venueId, {
  name: "Kitchen",
  color: "#3B82F6"
  // ...
});
```

### Components

```tsx
import { RolesHierarchyPage } from "@/modules/roles-hierarchy/ui/RolesHierarchyPage";

<RolesHierarchyPage venueId={venueId} />;
```

## Data Model

### Department

- `id`, `venueId`, `name`, `description`, `color`, `icon`
- `parentDepartmentId` (for hierarchy)
- `order` (display order)
- `isActive`

### Role

- `id`, `venueId`, `name`, `description`, `icon`, `color`
- `departmentId` (belongs to department)
- `isActive`

## Routes

- `/venues/[venueId]/roles` - Main roles & hierarchy page
