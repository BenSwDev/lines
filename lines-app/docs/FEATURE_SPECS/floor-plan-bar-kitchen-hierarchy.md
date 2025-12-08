# Floor Plan Bar/Kitchen & Hierarchy Improvements

## Overview
This document outlines the requirements for:
1. Converting Bar and Kitchen from special areas to regular zones
2. Adding bar-specific fields (minimum order, seats, number, name)
3. Adding kitchen staffing (no minimum order)
4. Improving staffing system with manager/employee counts
5. Role-based staffing configuration
6. Family tree hierarchy visualization

## 1. Bar and Kitchen as Regular Zones

### Current State
- Bar and Kitchen are `VenueArea` special areas
- They cannot have zones, tables, or detailed configuration

### New State
- Bar and Kitchen become regular `Zone` entities
- They can have tables, seating, and all zone features
- Bar-specific fields:
  - `barNumber: Int?` - מספר בר
  - `barName: String?` - שם בר
  - `barSeats: Int?` - כמות כיסאות בבר
  - `barMinimumPrice: Decimal?` - מינימום הזמנה לבר
- Kitchen-specific:
  - Only staffing (no minimum order)
  - `isKitchen: Boolean` flag to distinguish

### Schema Changes
```prisma
model Zone {
  // ... existing fields ...
  
  // Bar-specific fields
  barNumber      Int?     @map("bar_number")
  barName        String?  @map("bar_name")
  barSeats       Int?     @map("bar_seats")
  barMinimumPrice Decimal? @db.Decimal(10, 2) @map("bar_minimum_price")
  
  // Kitchen flag
  isKitchen      Boolean  @default(false) @map("is_kitchen")
  zoneType       String?  @default("seating") // seating, bar, kitchen
}
```

## 2. Enhanced Staffing System

### Current State
- Staffing rules: `{ roleId: count }[]`
- No distinction between managers and employees
- No role-level configuration

### New State
- Staffing rules: `{ roleId: string, managers: number, employees: number }[]`
- Role configuration: `requiresStaffing: boolean` - which roles need staffing
- For roles with management: choose 0-X managers and 0-X employees

### Schema Changes
```prisma
model Role {
  // ... existing fields ...
  requiresStaffing Boolean @default(false) @map("requires_staffing")
  canManage        Boolean @default(false) @map("can_manage") // Can this role have managers?
}

// Updated staffing rules structure:
// { roleId: string, managers: number, employees: number }[]
```

## 3. Family Tree Hierarchy

### Current State
- Flat hierarchy with `parentRoleId`
- Owner is implicit

### New State
- Family tree structure:
  - Owner (Venue.userId) is root
  - Owner manages all direct roles
  - Managers are linked above their roles
  - Visual tree representation + sidebar

### Schema Changes
```prisma
model Role {
  // ... existing fields ...
  parentRoleId String? @map("parent_role_id")
  managerRoleId String? @map("manager_role_id") // Role that manages this role
  // Owner is determined by Venue.userId
}

model Venue {
  // ... existing fields ...
  userId String // This is the owner
}
```

### Visualization
- Tree view with drag-and-drop
- Sidebar for role management
- Visual connections showing hierarchy
- Owner at top, roles below with managers

## 4. Implementation Tasks

### Phase 1: Database Schema
- [ ] Add bar fields to Zone model
- [ ] Add isKitchen and zoneType to Zone
- [ ] Add requiresStaffing and canManage to Role
- [ ] Add managerRoleId to Role
- [ ] Create migration

### Phase 2: Bar/Kitchen Conversion
- [ ] Update Zone creation to support bar/kitchen types
- [ ] Update UI to create bar/kitchen as zones
- [ ] Add bar-specific fields to zone editor
- [ ] Add kitchen staffing editor (no minimum order)
- [ ] Update floor plan templates

### Phase 3: Enhanced Staffing
- [ ] Update staffing rules structure
- [ ] Add manager/employee counts to staffing editor
- [ ] Add requiresStaffing to role configuration
- [ ] Update staffing display and editing

### Phase 4: Hierarchy Visualization
- [ ] Create hierarchy tree component
- [ ] Add sidebar for role management
- [ ] Implement drag-and-drop for hierarchy
- [ ] Show owner at top
- [ ] Visual connections between roles and managers

### Phase 5: UI/UX Improvements
- [ ] Update floor plan editor for bar/kitchen
- [ ] Update staffing editor for new structure
- [ ] Create hierarchy visualization page
- [ ] Add role management sidebar
- [ ] Update translations

## 5. API Changes

### Zone API
- Add bar fields to create/update zone
- Add zoneType validation
- Kitchen zones: no minimum order allowed

### Staffing API
- Update staffing rules structure
- Validate manager/employee counts
- Check role.requiresStaffing

### Role API
- Add requiresStaffing and canManage fields
- Add managerRoleId for hierarchy
- Validate hierarchy (no cycles, owner is root)

## 6. UI Components

### New Components
- `BarZoneEditor` - Bar-specific fields
- `KitchenZoneEditor` - Kitchen staffing only
- `HierarchyTree` - Visual tree representation
- `RoleSidebar` - Role management sidebar
- `StaffingManagerEditor` - Manager/employee counts

### Updated Components
- `ZoneEditor` - Support bar/kitchen types
- `StaffingEditor` - Manager/employee counts
- `RoleCard` - Show hierarchy connections
- `RolesTab` - Add hierarchy view

## 7. Translations

### New Keys
- `zone.barNumber`
- `zone.barName`
- `zone.barSeats`
- `zone.barMinimumPrice`
- `zone.isKitchen`
- `zone.zoneType`
- `role.requiresStaffing`
- `role.canManage`
- `role.managerRoleId`
- `staffing.managers`
- `staffing.employees`
- `hierarchy.owner`
- `hierarchy.manages`
- `hierarchy.treeView`

## 8. Testing

### Unit Tests
- Zone creation with bar/kitchen types
- Staffing rules with managers/employees
- Hierarchy validation
- Role configuration

### Integration Tests
- Floor plan with bar and kitchen zones
- Staffing assignment with hierarchy
- Hierarchy visualization

### E2E Tests
- Create bar zone with all fields
- Create kitchen zone with staffing
- Configure role hierarchy
- Assign staffing with managers/employees

