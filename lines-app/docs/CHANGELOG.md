# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - 2025-01-15

#### Comprehensive Test Plan

- **תוכנית בדיקות מקיפה** - יצירת תוכנית בדיקות מלאה ל-3 מודולים מרכזיים:
  - **`docs/COMPREHENSIVE_TEST_PLAN.md`** - תוכנית בדיקות מלאה עם 450+ מקרי בדיקה:
    - 180+ בדיקות יחידה (Unit Tests) - כל ה-services, schemas, utils
    - 150+ בדיקות אינטגרציה (Integration Tests) - כל ה-server actions ו-database operations
    - 120+ בדיקות קצה לקצה (E2E Tests) - כל ה-user flows ו-UI interactions
  - **`docs/TEST_MATRIX.md`** - מטריצת בדיקות מעודכנת עם סטטיסטיקות:
    - Lines Module: 88 בדיקות (45 unit, 35 integration, 8 e2e)
    - Floor Plan Editor Module: 85 בדיקות (35 unit, 40 integration, 10 e2e)
    - Roles & Hierarchy Module: 51 בדיקות (30 unit, 15 integration, 6 e2e)
    - Cross-Module Integration: 3 בדיקות
  - **כיסוי מלא** - כל הפונקציות, actions, services, UI components מכוסים
  - **מוכן ליישום** - מבנה קבצים, תבניות, והנחיות מימוש מלאות
  - **מוכן להרחבה** - מבנה גמיש וניתן להרחבה לעתיד

### Fixed

- **קריטי: תיקון בעיית עריכת ליין** - תוקן באג שגרם לשגיאת "NEW" בעדכון ליין:
  - הוספת תמיכה מלאה ב-frequency "variable" בעריכת ליין
  - תיקון טעינת frequency בעריכה - כעת תומך בכל הערכים כולל "variable"
  - תיקון לוגיקת יצירת occurrences - עבור "variable" לא נוצרים occurrences אוטומטית
  - שיפור בחירת חודש/שנה - הצגת רק חודשים ושנים עם תאריכים אפשריים בהתאם לימים שנבחרו
  - הסרת דרישת תאריך התחלה עבור frequency "variable"
- תיקון שגיאות logger ב-lineReservationSettingsActions

## [Unreleased]

### Changed - 2025-01-XX

#### Roles & Hierarchy UI Redesign

- **Removed Tab-Based Navigation**: Replaced tabs with split view layout
  - Sidebar (left): Scrollable roles list with inline actions (View, Edit, Delete, Add)
  - Diagram (center): Interactive SVG-based hierarchy visualization
- **New Interactive Hierarchy Diagram**:
  - SVG-based rendering with connecting lines between levels
  - Pyramid/tree structure similar to organizational charts
  - Click nodes to select and view details
  - Hover effects for better interactivity
  - Automatic layout calculation based on hierarchy depth
- **Enhanced Sidebar**:
  - All roles visible in scrollable list (including management roles)
  - Inline actions on hover (no need to open separate dialogs for viewing)
  - Selected role highlighting
  - Click role to select in diagram

#### Hierarchy Logic Fixes

- **Management Role Positioning**: Fixed `hierarchyService.buildHierarchyTree()` to correctly position management roles
  - Management roles (e.g., "ניהול בר") now appear above the roles they manage (e.g., "בר")
  - Fixed issue where management roles and regular roles appeared at the same level
  - Proper handling of `managedRoleId` relationship in hierarchy building

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
