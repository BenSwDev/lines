# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - 2025-12-08

#### Floor Plan Enhancements
- **Bar and Kitchen as Regular Zones**: Converted bar and kitchen from special `VenueArea` entities to regular `Zone` entities
  - Bars can now have tables, seating, and all zone features
  - Bar-specific fields: `barNumber`, `barName`, `barSeats`, `barMinimumPrice`
  - Kitchen zones support staffing configuration (no minimum order)
  - Added `zoneType` field: `seating`, `bar`, `kitchen`
  - Added `isKitchen` boolean flag

#### Enhanced Staffing System
- **Manager/Employee Counts**: Updated staffing rules structure
  - Old: `{ roleId: string, count: number }`
  - New: `{ roleId: string, managers: number, employees: number }`
  - Support for legacy `count` field (automatically converted to `employees`)
- **Role-Based Staffing Configuration**:
  - Added `requiresStaffing` boolean to Role model
  - Only roles with `requiresStaffing = true` appear in staffing editor
  - Added `canManage` boolean to Role model
  - Roles with `canManage = true` can have managers assigned

#### Family Tree Hierarchy
- **Dynamic Hierarchy Management**:
  - Owner (Venue.userId) is displayed at root of hierarchy tree
  - Added `managerRoleId` to Role model for direct manager assignment
  - Managers can be assigned to any role (if manager has `canManage = true`)
  - Support for both `managerRoleId` (new) and `parentRoleId` (legacy)
  - Visual tree representation with owner at top
  - Beautiful hierarchy visualization with connecting lines
  - Sidebar for role management integrated into hierarchy view

#### UI Improvements
- **Zone Creation**: Updated StructureBuilder to create bar/kitchen as zones
- **Zone Editor**: Added bar-specific fields editor in ContentEditor
- **Staffing Editor**: Enhanced with separate manager/employee counters
- **Role Dialogs**: Added checkboxes for `requiresStaffing` and `canManage`
- **Hierarchy View**: 
  - Owner displayed with crown icon 👑
  - Manager badges for roles with `canManage`
  - Visual tree with connecting lines
  - Expand/collapse functionality

#### Database Changes
- Migration: `add_bar_kitchen_zones_and_hierarchy_fields`
  - Added `zone_type`, `is_kitchen`, `bar_number`, `bar_name`, `bar_seats`, `bar_minimum_price` to `zones` table
  - Added `manager_role_id`, `requires_staffing`, `can_manage` to `roles` table
  - Added foreign key constraint for `manager_role_id`
  - Added indexes for performance

#### Translations
- Added translations for:
  - `floorPlan.barSettings`, `floorPlan.barNumber`, `floorPlan.barName`, `floorPlan.barSeats`, `floorPlan.barMinimumPrice`
  - `floorPlan.kitchenNote`
  - `floorPlan.noRolesRequireStaffing`, `floorPlan.enableRequiresStaffing`
  - `staffing.managers`, `staffing.employees`
  - `hierarchy.owner`, `hierarchy.manages`, `hierarchy.treeView`

### Fixed
- **Prisma Update Error**: Fixed `updateElementPosition` to filter undefined values before Prisma update
  - Prevents "column 'new' does not exist" errors
  - Properly handles optional position/size updates

### Changed
- **Staffing Rules Structure**: Breaking change in staffing rules JSON format
  - Old format still supported via legacy `count` field
  - New format: `{ roleId, managers, employees }`
- **Zone Creation**: Bar and kitchen are now created as zones, not special areas
- **Hierarchy Building**: Updated to support family tree structure with owner at root

### Technical Details
- Updated Prisma schema with new fields
- Updated TypeScript types for Zone, Role, and StaffingRule
- Updated Zod schemas for validation
- Updated services and actions to handle new fields
- Enhanced UI components for new features
- All changes are backward compatible with legacy data
