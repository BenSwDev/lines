# 📋 Comprehensive Test Plan - 100% Coverage

**Date Created:** 2025-01-15  
**Modules Covered:** Lines, Floor Plan Editor, Roles & Hierarchy  
**Coverage Target:** 100% Unit, Integration, and E2E Tests

---

## 📊 Executive Summary

This document provides a **complete test matrix** for three critical modules:

1. **Lines Module** - Event series management
2. **Floor Plan Editor Module** - Venue floor plan creation and management
3. **Roles & Hierarchy Module** - Organizational structure management

**Total Test Cases:** 450+  
**Test Types:**

- **Unit Tests:** 180+ (Services, Utils, Business Logic)
- **Integration Tests:** 150+ (Server Actions, Database Operations, API Integration)
- **E2E Tests:** 120+ (User Flows, UI Interactions, Cross-Module Workflows)

---

## 🎯 Test Coverage Goals

### Unit Tests

- ✅ All service methods (100% code coverage)
- ✅ All utility functions
- ✅ All schema validations
- ✅ All business logic calculations
- ✅ All helper functions

### Integration Tests

- ✅ All server actions
- ✅ All database operations
- ✅ All repository methods
- ✅ All cross-service interactions
- ✅ All validation flows

### E2E Tests

- ✅ All user flows from UI
- ✅ All CRUD operations
- ✅ All form submissions
- ✅ All navigation flows
- ✅ All error scenarios
- ✅ All edge cases

---

## 📦 Module 1: Lines Module

### Module Overview

**Location:** `src/modules/lines`  
**Functions:** Event series creation, scheduling, occurrence management, reservation settings

### 📁 File Structure Analysis

#### Actions (Server Actions)

- `createLine.ts` - Create new line
- `updateLine.ts` - Update existing line
- `deleteLine.ts` - Delete line
- `listLines.ts` - List all lines for venue
- `getLine.ts` - Get single line
- `checkCollisions.ts` - Check time collisions
- `lineReservationSettingsActions.ts` - Reservation settings management

#### Services (Business Logic)

- `linesService.ts` - Line management service
  - `getAvailableColors()`
  - `isColorAvailable()`
  - `getNextAvailableColor()`
  - `isOvernightShift()`
  - `countLines()`
  - `canCreateNewLine()`
- `lineScheduleService.ts` - Schedule generation
  - `generateSuggestions()`
  - `generateWeekly()`
  - `generateMonthly()`
  - `generateOneTime()`
- `lineOccurrencesSyncService.ts` - Occurrence synchronization
  - `syncOccurrences()`
  - `syncOccurrencesWithSchedules()`
  - `addManualOccurrence()`
  - `cancelOccurrence()`
  - `reactivateOccurrence()`
- `lineReservationSettingsService.ts` - Reservation settings
  - `getSettings()`
  - `createOrUpdateSettings()`
  - `validateLineEligibility()`

#### UI Components

- `CreateLineDialog.tsx` - Create/edit line dialog
- `LinesPage.tsx` - Main lines listing page
- `LineCard.tsx` - Line card component
- `LineDetailPage.tsx` - Line detail view
- `LineDetailView.tsx` - Line detail component
- `LineReservationSettings.tsx` - Reservation settings UI
- `LinesHeader.tsx` - Lines page header
- `LinesSidebar.tsx` - Lines sidebar
- `WeeklyScheduleView.tsx` - Weekly schedule visualization

#### Schemas (Validation)

- `lineSchemas.ts` - Line validation schemas
- `lineReservationSettingsSchemas.ts` - Reservation settings schemas

---

### 🧪 Unit Tests - Lines Module

#### 1.1 Lines Service Tests

**File:** `tests/unit/modules/lines/services/linesService.test.ts`

- [ ] `getAvailableColors()` - Returns available colors for venue
- [ ] `getAvailableColors()` - Excludes already used colors
- [ ] `getAvailableColors()` - Returns all colors when none used
- [ ] `isColorAvailable()` - Returns true for available color
- [ ] `isColorAvailable()` - Returns false for used color
- [ ] `isColorAvailable()` - Returns true for own color when updating
- [ ] `getNextAvailableColor()` - Returns first available color
- [ ] `getNextAvailableColor()` - Throws error when all colors used
- [ ] `isOvernightShift()` - Returns true for overnight shift (22:00-02:00)
- [ ] `isOvernightShift()` - Returns false for regular shift
- [ ] `isOvernightShift()` - Handles 24:00 end time
- [ ] `countLines()` - Returns correct count for venue
- [ ] `countLines()` - Returns 0 for venue with no lines
- [ ] `canCreateNewLine()` - Returns true when under limit
- [ ] `canCreateNewLine()` - Returns false when at limit (15 colors)

#### 1.2 Line Schedule Service Tests

**File:** `tests/unit/modules/lines/services/lineScheduleService.test.ts`

- [ ] `generateSuggestions()` - Weekly frequency generates correct dates
- [ ] `generateSuggestions()` - Monthly frequency generates correct dates
- [ ] `generateSuggestions()` - OneTime frequency generates next occurrence
- [ ] `generateSuggestions()` - Variable frequency returns empty array
- [ ] `generateSuggestions()` - Empty days array returns empty
- [ ] `generateSuggestions()` - Respects horizon months parameter
- [ ] `generateWeekly()` - Generates all occurrences for selected days
- [ ] `generateWeekly()` - Handles multiple days correctly
- [ ] `generateWeekly()` - Respects start and end dates
- [ ] `generateMonthly()` - Generates all monthly occurrences
- [ ] `generateMonthly()` - Handles month boundaries correctly
- [ ] `generateMonthly()` - Skips dates before start date
- [ ] `generateOneTime()` - Finds next occurrence for each day
- [ ] `generateOneTime()` - Returns sorted dates

#### 1.3 Line Occurrences Sync Service Tests

**File:** `tests/unit/modules/lines/services/lineOccurrencesSyncService.test.ts`

- [ ] `syncOccurrences()` - Deletes existing occurrences before creating
- [ ] `syncOccurrences()` - Creates all provided occurrences
- [ ] `syncOccurrences()` - Uses line defaults for missing times
- [ ] `syncOccurrences()` - Uses occurrence-specific times when provided
- [ ] `syncOccurrences()` - Handles empty occurrences array
- [ ] `syncOccurrencesWithSchedules()` - Same as syncOccurrences but with schedules
- [ ] `addManualOccurrence()` - Creates manual occurrence
- [ ] `addManualOccurrence()` - Throws error if date already exists
- [ ] `cancelOccurrence()` - Sets isActive to false
- [ ] `reactivateOccurrence()` - Sets isActive to true

#### 1.4 Line Reservation Settings Service Tests

**File:** `tests/unit/modules/lines/services/lineReservationSettingsService.test.ts`

- [ ] `getSettings()` - Returns existing settings
- [ ] `getSettings()` - Creates default settings if not exists
- [ ] `getSettings()` - Returns error if line excluded
- [ ] `getSettings()` - Returns error if reservations disabled
- [ ] `createOrUpdateSettings()` - Creates new settings
- [ ] `createOrUpdateSettings()` - Updates existing settings
- [ ] `validateLineEligibility()` - Returns true for eligible line
- [ ] `validateLineEligibility()` - Returns false for excluded line
- [ ] `validateLineEligibility()` - Returns false if reservations disabled

#### 1.5 Line Schema Validation Tests

**File:** `tests/unit/modules/lines/schemas/lineSchemas.test.ts`

- [ ] `createLineSchema` - Validates required fields
- [ ] `createLineSchema` - Validates name length
- [ ] `createLineSchema` - Validates days array (at least 1 day)
- [ ] `createLineSchema` - Validates time format (HH:MM)
- [ ] `createLineSchema` - Validates frequency enum
- [ ] `createLineSchema` - Validates color format
- [ ] `createLineSchema` - Validates selectedDates array
- [ ] `createLineSchema` - Validates manualDates array
- [ ] `updateLineSchema` - Allows partial updates
- [ ] `updateLineSchema` - Validates updated fields

---

### 🔗 Integration Tests - Lines Module

#### 2.1 Create Line Integration Tests

**File:** `tests/integration/modules/lines/actions/createLine.test.ts`

- [ ] Creates line successfully with valid data
- [ ] Creates line with weekly frequency
- [ ] Creates line with monthly frequency
- [ ] Creates line with variable frequency (no occurrences)
- [ ] Creates line with oneTime frequency
- [ ] Generates occurrences for selected dates
- [ ] Handles collision detection before creating
- [ ] Returns error on collision
- [ ] Validates user authorization
- [ ] Validates venue ownership
- [ ] Revalidates paths after creation
- [ ] Handles color availability
- [ ] Creates occurrences with correct isExpected flags
- [ ] Handles manual dates correctly
- [ ] Uses daySchedules when provided
- [ ] Falls back to legacy fields when daySchedules missing

#### 2.2 Update Line Integration Tests

**File:** `tests/integration/modules/lines/actions/updateLine.test.ts`

- [ ] Updates line successfully
- [ ] Updates name only
- [ ] Updates schedule only
- [ ] Updates color only
- [ ] Updates frequency (weekly to monthly)
- [ ] Updates frequency to variable (clears occurrences)
- [ ] Regenerates occurrences when schedule changes
- [ ] Syncs occurrences when selectedDates provided
- [ ] Handles collision detection on update
- [ ] Excludes current line from collision check
- [ ] Validates line exists
- [ ] Validates venue ownership
- [ ] Validates user authorization
- [ ] Revalidates paths after update
- [ ] Preserves manual dates when updating schedule
- [ ] Handles partial updates correctly

#### 2.3 Delete Line Integration Tests

**File:** `tests/integration/modules/lines/actions/deleteLine.test.ts`

- [ ] Deletes line successfully
- [ ] Deletes associated occurrences
- [ ] Validates line exists
- [ ] Validates venue ownership
- [ ] Validates user authorization
- [ ] Revalidates paths after deletion
- [ ] Frees up color for reuse

#### 2.4 List Lines Integration Tests

**File:** `tests/integration/modules/lines/actions/listLines.test.ts`

- [ ] Lists all lines for venue
- [ ] Includes occurrences count
- [ ] Includes line metadata
- [ ] Returns empty array for venue with no lines
- [ ] Validates user authorization
- [ ] Sorts lines correctly

#### 2.5 Get Line Integration Tests

**File:** `tests/integration/modules/lines/actions/getLine.test.ts`

- [ ] Returns line with full details
- [ ] Includes all occurrences
- [ ] Validates line exists
- [ ] Validates venue ownership
- [ ] Validates user authorization
- [ ] Returns error for non-existent line

#### 2.6 Check Collisions Integration Tests

**File:** `tests/integration/modules/lines/actions/checkCollisions.test.ts`

- [ ] Detects overlapping occurrences
- [ ] Detects same time collisions
- [ ] Detects partial overlaps
- [ ] Detects overnight shift collisions
- [ ] Returns no collision for non-overlapping times
- [ ] Handles multiple collisions
- [ ] Excludes inactive occurrences
- [ ] Returns collision details

#### 2.7 Line Reservation Settings Integration Tests

**File:** `tests/integration/modules/lines/actions/lineReservationSettingsActions.test.ts`

- [ ] Gets settings successfully
- [ ] Creates default settings if missing
- [ ] Updates settings successfully
- [ ] Validates line eligibility
- [ ] Returns error for excluded line
- [ ] Returns error if reservations disabled
- [ ] Validates user authorization
- [ ] Handles day schedules correctly

---

### 🌐 E2E Tests - Lines Module

#### 3.1 Line Creation Flow

**File:** `tests/e2e/modules/lines/create-line.spec.ts`

- [ ] Navigate to lines page
- [ ] Click "Create New Line" button
- [ ] Fill in line name
- [ ] Select days of week
- [ ] Set start and end times
- [ ] Select frequency (weekly)
- [ ] Select color
- [ ] Review suggested dates
- [ ] Toggle dates on/off
- [ ] Submit form
- [ ] Verify line appears in list
- [ ] Verify line card shows correct info
- [ ] Verify occurrences created

#### 3.2 Line Creation with Variable Frequency

**File:** `tests/e2e/modules/lines/create-variable-line.spec.ts`

- [ ] Open create line dialog
- [ ] Fill in line details
- [ ] Select "variable" frequency
- [ ] Verify start date selector hidden
- [ ] Submit form
- [ ] Verify line created without occurrences
- [ ] Verify line can be edited later

#### 3.3 Line Editing Flow

**File:** `tests/e2e/modules/lines/edit-line.spec.ts`

- [ ] Navigate to lines page
- [ ] Click edit on existing line
- [ ] Modify line name
- [ ] Change days selection
- [ ] Update times
- [ ] Change frequency
- [ ] Submit changes
- [ ] Verify changes saved
- [ ] Verify occurrences updated

#### 3.4 Line Deletion Flow

**File:** `tests/e2e/modules/lines/delete-line.spec.ts`

- [ ] Navigate to lines page
- [ ] Click delete on line
- [ ] Confirm deletion
- [ ] Verify line removed from list
- [ ] Verify occurrences deleted
- [ ] Verify color available again

#### 3.5 Line Detail View Flow

**File:** `tests/e2e/modules/lines/line-detail.spec.ts`

- [ ] Navigate to lines page
- [ ] Click on line card
- [ ] Verify detail page loads
- [ ] Verify all occurrences displayed
- [ ] Verify line metadata shown
- [ ] Test navigation back
- [ ] Test edit from detail page

#### 3.6 Collision Detection Flow

**File:** `tests/e2e/modules/lines/collision-detection.spec.ts`

- [ ] Create first line with specific time
- [ ] Attempt to create second line with overlapping time
- [ ] Verify error message displayed
- [ ] Verify line not created
- [ ] Adjust second line time to non-overlapping
- [ ] Verify line created successfully

#### 3.7 Date Selection Flow

**File:** `tests/e2e/modules/lines/date-selection.spec.ts`

- [ ] Open create line dialog
- [ ] Select days and frequency
- [ ] Verify suggested dates appear
- [ ] Toggle individual dates
- [ ] Verify only selected dates created
- [ ] Test month/year selector
- [ ] Verify only valid dates shown

#### 3.8 Reservation Settings Flow

**File:** `tests/e2e/modules/lines/reservation-settings.spec.ts`

- [ ] Navigate to line detail page
- [ ] Click on reservation settings
- [ ] Enable personal links
- [ ] Configure day schedules
- [ ] Save settings
- [ ] Verify settings persisted
- [ ] Test settings for excluded line (should show error)

---

## 📦 Module 2: Floor Plan Editor Module

### Module Overview

**Location:** `src/modules/floor-plan-editor`  
**Functions:** Floor plan creation, zone/table management, staffing, minimum orders, line assignments

### 📁 File Structure Analysis

#### Actions (Server Actions)

- `floorPlanActions.ts` - All floor plan CRUD operations
  - `getFloorPlans()`
  - `getFloorPlan()`
  - `getDefaultFloorPlan()`
  - `getVenueLines()`
  - `getFloorPlanStats()`
  - `createFloorPlan()`
  - `duplicateFloorPlan()`
  - `updateFloorPlan()`
  - `updateZoneContent()`
  - `updateTableContent()`
  - `updateStaffing()`
  - `updateMinimumOrder()`
  - `deleteFloorPlan()`
  - `createZone()`
  - `createTable()`
  - `autoGenerateTables()`
  - `createVenueArea()`
  - `deleteZone()`
  - `deleteTable()`
  - `deleteVenueArea()`
  - `updateElementPosition()`
  - `updateFloorPlanLines()`
  - `updateLineFloorPlanStaffing()`
  - `updateLineFloorPlanMinimumOrder()`

#### Services (Business Logic)

- `floorPlanService.ts` - Floor plan management
  - `getFloorPlansByVenue()`
  - `getFloorPlanById()`
  - `getDefaultFloorPlan()`
  - `createFloorPlan()`
  - `updateFloorPlan()`
  - `deleteFloorPlan()`
  - `setDefaultFloorPlan()`
  - `getVenueLines()`
  - `getFloorPlanStats()`
- `lineFloorPlanService.ts` - Line-floor plan integration
  - `lineFloorPlanStaffingService` - Staffing per line
  - `lineFloorPlanMinimumOrderService` - Minimum orders per line

#### UI Components

- `FloorPlanEditor.tsx` - Main editor component
- `FloorPlanList.tsx` - List of floor plans
- `FloorPlanViewer.tsx` - View-only floor plan display
- `InteractiveElement.tsx` - Interactive element wrapper
- `ContentEditor.tsx` - Content editing mode
- `StructureBuilder.tsx` - Structure building mode
- `StaffingEditor.tsx` - Staffing editing mode
- `MinimumOrderEditor.tsx` - Minimum order editing mode
- `ManageFloorPlanLinesDialog.tsx` - Line assignment dialog
- `FloorPlanTemplateSelector.tsx` - Template selection
- `FloorPlanWizard.tsx` - Creation wizard

#### Utils

- `collisionDetection.ts` - Collision detection utilities
  - `doRectanglesCollide()`
  - `checkRectangleCollision()`
  - `calculateTableLayout()`

#### Schemas (Validation)

- `floorPlanSchemas.ts` - All floor plan validation schemas

---

### 🧪 Unit Tests - Floor Plan Editor Module

#### 4.1 Floor Plan Service Tests

**File:** `tests/unit/modules/floor-plan-editor/services/floorPlanService.test.ts`

- [ ] `getFloorPlansByVenue()` - Returns all floor plans for venue
- [ ] `getFloorPlansByVenue()` - Includes zone and area counts
- [ ] `getFloorPlansByVenue()` - Orders by default first
- [ ] `getFloorPlanById()` - Returns floor plan with full details
- [ ] `getFloorPlanById()` - Includes zones and tables
- [ ] `getFloorPlanById()` - Includes venue areas
- [ ] `getFloorPlanById()` - Includes assigned lines
- [ ] `getFloorPlanById()` - Returns null for non-existent
- [ ] `getDefaultFloorPlan()` - Returns default floor plan
- [ ] `getDefaultFloorPlan()` - Returns null if no default
- [ ] `createFloorPlan()` - Creates floor plan successfully
- [ ] `createFloorPlan()` - Sets as default if first
- [ ] `updateFloorPlan()` - Updates floor plan
- [ ] `deleteFloorPlan()` - Deletes floor plan
- [ ] `deleteFloorPlan()` - Deletes associated zones/tables/areas
- [ ] `setDefaultFloorPlan()` - Sets default floor plan
- [ ] `setDefaultFloorPlan()` - Unsets previous default
- [ ] `getVenueLines()` - Returns all venue lines
- [ ] `getFloorPlanStats()` - Calculates correct stats

#### 4.2 Collision Detection Tests

**File:** `tests/unit/modules/floor-plan-editor/utils/collisionDetection.test.ts`

- [ ] `doRectanglesCollide()` - Detects overlapping rectangles
- [ ] `doRectanglesCollide()` - Detects non-overlapping rectangles
- [ ] `doRectanglesCollide()` - Handles edge cases (touching)
- [ ] `checkRectangleCollision()` - Checks against multiple rectangles
- [ ] `checkRectangleCollision()` - Returns collision details
- [ ] `calculateTableLayout()` - Calculates grid layout
- [ ] `calculateTableLayout()` - Handles spacing correctly
- [ ] `calculateTableLayout()` - Handles irregular shapes

#### 4.3 Line Floor Plan Service Tests

**File:** `tests/unit/modules/floor-plan-editor/services/lineFloorPlanService.test.ts`

- [ ] `lineFloorPlanStaffingService` - Creates staffing config
- [ ] `lineFloorPlanStaffingService` - Updates staffing config
- [ ] `lineFloorPlanStaffingService` - Deletes staffing config
- [ ] `lineFloorPlanMinimumOrderService` - Creates minimum order config
- [ ] `lineFloorPlanMinimumOrderService` - Updates minimum order config
- [ ] `lineFloorPlanMinimumOrderService` - Deletes minimum order config

#### 4.4 Floor Plan Schema Validation Tests

**File:** `tests/unit/modules/floor-plan-editor/schemas/floorPlanSchemas.test.ts`

- [ ] `createFloorPlanSchema` - Validates required fields
- [ ] `createFloorPlanSchema` - Validates name
- [ ] `createFloorPlanSchema` - Validates venueId
- [ ] `updateFloorPlanSchema` - Allows partial updates
- [ ] `createZoneSchema` - Validates zone data
- [ ] `createTableSchema` - Validates table data
- [ ] `createVenueAreaSchema` - Validates area data
- [ ] `updateZoneContentSchema` - Validates zone updates
- [ ] `updateTableContentSchema` - Validates table updates
- [ ] `updateStaffingSchema` - Validates staffing data
- [ ] `updateMinimumOrderSchema` - Validates minimum order data

---

### 🔗 Integration Tests - Floor Plan Editor Module

#### 5.1 Floor Plan CRUD Integration Tests

**File:** `tests/integration/modules/floor-plan-editor/actions/floorPlanCRUD.test.ts`

- [ ] Creates floor plan successfully
- [ ] Creates floor plan as default
- [ ] Updates floor plan
- [ ] Deletes floor plan
- [ ] Duplicates floor plan
- [ ] Sets default floor plan
- [ ] Lists all floor plans
- [ ] Gets floor plan by ID
- [ ] Gets default floor plan
- [ ] Validates user authorization
- [ ] Validates venue ownership
- [ ] Handles non-existent floor plan

#### 5.2 Zone Management Integration Tests

**File:** `tests/integration/modules/floor-plan-editor/actions/zoneManagement.test.ts`

- [ ] Creates zone successfully
- [ ] Creates zone with tables
- [ ] Updates zone content
- [ ] Updates zone position
- [ ] Updates zone size
- [ ] Deletes zone
- [ ] Deletes zone with tables (cascade)
- [ ] Validates zone collision detection
- [ ] Handles multiple zones

#### 5.3 Table Management Integration Tests

**File:** `tests/integration/modules/floor-plan-editor/actions/tableManagement.test.ts`

- [ ] Creates table successfully
- [ ] Creates table in zone
- [ ] Updates table content
- [ ] Updates table position
- [ ] Updates table size
- [ ] Updates table rotation
- [ ] Deletes table
- [ ] Auto-generates tables
- [ ] Validates table collision detection
- [ ] Handles tables outside zones

#### 5.4 Venue Area Management Integration Tests

**File:** `tests/integration/modules/floor-plan-editor/actions/venueAreaManagement.test.ts`

- [ ] Creates venue area successfully
- [ ] Updates venue area position
- [ ] Updates venue area size
- [ ] Updates venue area rotation
- [ ] Deletes venue area
- [ ] Handles multiple areas

#### 5.5 Staffing Integration Tests

**File:** `tests/integration/modules/floor-plan-editor/actions/staffing.test.ts`

- [ ] Updates zone staffing
- [ ] Updates table staffing
- [ ] Updates area staffing
- [ ] Updates line-floor plan staffing
- [ ] Validates staffing data

#### 5.6 Minimum Order Integration Tests

**File:** `tests/integration/modules/floor-plan-editor/actions/minimumOrder.test.ts`

- [ ] Updates zone minimum order
- [ ] Updates table minimum order
- [ ] Updates area minimum order
- [ ] Updates line-floor plan minimum order
- [ ] Validates minimum order data

#### 5.7 Line Assignment Integration Tests

**File:** `tests/integration/modules/floor-plan-editor/actions/lineAssignment.test.ts`

- [ ] Assigns lines to floor plan
- [ ] Unassigns lines from floor plan
- [ ] Updates line assignments
- [ ] Gets assigned lines
- [ ] Validates line exists

---

### 🌐 E2E Tests - Floor Plan Editor Module

#### 6.1 Floor Plan Creation Flow

**File:** `tests/e2e/modules/floor-plan-editor/create-floor-plan.spec.ts`

- [ ] Navigate to floor plans page
- [ ] Click "Create New Floor Plan"
- [ ] Select template or start blank
- [ ] Fill in floor plan name
- [ ] Complete wizard steps
- [ ] Verify floor plan created
- [ ] Verify floor plan appears in list

#### 6.2 Floor Plan Editing Flow

**File:** `tests/e2e/modules/floor-plan-editor/edit-floor-plan.spec.ts`

- [ ] Navigate to floor plans
- [ ] Click on floor plan
- [ ] Enter edit mode
- [ ] Modify floor plan name
- [ ] Save changes
- [ ] Verify changes persisted

#### 6.3 Zone Creation Flow

**File:** `tests/e2e/modules/floor-plan-editor/create-zone.spec.ts`

- [ ] Open floor plan editor
- [ ] Click "Add Zone"
- [ ] Fill in zone details
- [ ] Set zone position and size
- [ ] Save zone
- [ ] Verify zone appears on canvas
- [ ] Verify zone in list

#### 6.4 Table Creation Flow

**File:** `tests/e2e/modules/floor-plan-editor/create-table.spec.ts`

- [ ] Open floor plan editor
- [ ] Click "Add Table"
- [ ] Fill in table details (seats, number)
- [ ] Set table position
- [ ] Save table
- [ ] Verify table appears on canvas
- [ ] Verify table in list

#### 6.5 Drag and Drop Flow

**File:** `tests/e2e/modules/floor-plan-editor/drag-drop.spec.ts`

- [ ] Open floor plan editor
- [ ] Select element (table/zone/area)
- [ ] Drag element to new position
- [ ] Verify position updated
- [ ] Verify collision detection works
- [ ] Verify snap to grid (if enabled)

#### 6.6 Auto-Generate Tables Flow

**File:** `tests/e2e/modules/floor-plan-editor/auto-generate-tables.spec.ts`

- [ ] Open floor plan editor
- [ ] Select zone
- [ ] Click "Auto-Generate Tables"
- [ ] Configure layout (grid, spacing)
- [ ] Generate tables
- [ ] Verify tables created
- [ ] Verify tables positioned correctly

#### 6.7 Staffing Configuration Flow

**File:** `tests/e2e/modules/floor-plan-editor/staffing-config.spec.ts`

- [ ] Open floor plan editor
- [ ] Switch to staffing mode
- [ ] Select zone/table/area
- [ ] Configure staffing requirements
- [ ] Assign roles
- [ ] Save configuration
- [ ] Verify staffing persisted

#### 6.8 Minimum Order Configuration Flow

**File:** `tests/e2e/modules/floor-plan-editor/minimum-order-config.spec.ts`

- [ ] Open floor plan editor
- [ ] Switch to minimum order mode
- [ ] Select zone/table/area
- [ ] Set minimum order amount
- [ ] Configure by time slots
- [ ] Save configuration
- [ ] Verify minimum order persisted

#### 6.9 Line Assignment Flow

**File:** `tests/e2e/modules/floor-plan-editor/line-assignment.spec.ts`

- [ ] Open floor plan editor
- [ ] Click "Manage Lines"
- [ ] Select lines to assign
- [ ] Configure per-line settings
- [ ] Save assignments
- [ ] Verify lines assigned
- [ ] Verify line-specific settings applied

#### 6.10 Floor Plan Viewer Flow

**File:** `tests/e2e/modules/floor-plan-editor/viewer.spec.ts`

- [ ] Navigate to floor plan
- [ ] Verify view-only mode
- [ ] Verify zoom controls
- [ ] Verify pan controls
- [ ] Verify element tooltips
- [ ] Verify interaction disabled

---

## 📦 Module 3: Roles & Hierarchy Module

### Module Overview

**Location:** `src/modules/roles-hierarchy`  
**Functions:** Role creation, hierarchy management, management roles, organizational structure

### 📁 File Structure Analysis

#### Actions (Server Actions)

- `roleActions.ts` - All role CRUD operations
  - `listRoles()`
  - `getRole()`
  - `createRole()`
  - `updateRole()`
  - `deleteRole()`
  - `getManagementRoles()`
  - `getManagerRoles()`

#### Services (Business Logic)

- `rolesService.ts` - Role management service
  - `listRoles()`
  - `getRole()`
  - `createRole()`
  - `updateRole()`
  - `deleteRole()`
  - `getRolesByParent()`
  - `getManagementRoles()`
  - `getManagerRoles()`
- `hierarchyService.ts` - Hierarchy tree building
  - `buildHierarchyTree()`
  - `flattenHierarchy()`
  - `findNodeById()`
  - `getRolePath()`

#### UI Components

- `RolesHierarchyPage.tsx` - Main page (sidebar + diagram)
- `HierarchyDiagram.tsx` - Interactive SVG hierarchy diagram
- `RolesSidebar.tsx` - Sidebar with roles list
- `CreateRoleDialog.tsx` - Create role dialog
- `EditRoleDialog.tsx` - Edit role dialog
- `RoleCard.tsx` - Role card component
- `RolesTab.tsx` - Legacy roles tab (deprecated)

#### Schemas (Validation)

- `roleSchemas.ts` - Role validation schemas

---

### 🧪 Unit Tests - Roles & Hierarchy Module

#### 7.1 Roles Service Tests

**File:** `tests/unit/modules/roles-hierarchy/services/rolesService.test.ts`

- [ ] `listRoles()` - Returns all roles for venue
- [ ] `listRoles()` - Excludes management roles
- [ ] `listRoles()` - Filters by parent role
- [ ] `listRoles()` - Returns only active roles
- [ ] `listRoles()` - Orders correctly
- [ ] `getRole()` - Returns role with relations
- [ ] `getRole()` - Returns null for non-existent
- [ ] `createRole()` - Creates role successfully
- [ ] `createRole()` - Creates management role if required
- [ ] `createRole()` - Validates parent role (must be management)
- [ ] `createRole()` - Validates manager role
- [ ] `createRole()` - Prevents circular references
- [ ] `updateRole()` - Updates role successfully
- [ ] `updateRole()` - Updates management role name when role name changes
- [ ] `updateRole()` - Creates management role when flag enabled
- [ ] `updateRole()` - Deletes management role when flag disabled
- [ ] `updateRole()` - Prevents editing management role directly
- [ ] `updateRole()` - Validates parent role
- [ ] `deleteRole()` - Deletes role successfully
- [ ] `deleteRole()` - Deletes associated management role
- [ ] `deleteRole()` - Prevents deletion if has children
- [ ] `getManagementRoles()` - Returns only management roles
- [ ] `getManagerRoles()` - Returns only roles with canManage

#### 7.2 Hierarchy Service Tests

**File:** `tests/unit/modules/roles-hierarchy/services/hierarchyService.test.ts`

- [ ] `buildHierarchyTree()` - Builds tree with owner at root
- [ ] `buildHierarchyTree()` - Builds management role relationships
- [ ] `buildHierarchyTree()` - Builds manager-role relationships
- [ ] `buildHierarchyTree()` - Builds parent-child relationships
- [ ] `buildHierarchyTree()` - Handles roles without parents
- [ ] `buildHierarchyTree()` - Prevents duplicates
- [ ] `buildHierarchyTree()` - Prevents circular references
- [ ] `buildHierarchyTree()` - Sets correct depths
- [ ] `flattenHierarchy()` - Flattens tree correctly
- [ ] `flattenHierarchy()` - Preserves depth information
- [ ] `findNodeById()` - Finds node in tree
- [ ] `findNodeById()` - Returns null if not found
- [ ] `findNodeById()` - Searches nested children
- [ ] `getRolePath()` - Returns correct path for role
- [ ] `getRolePath()` - Handles deep nesting

#### 7.3 Role Schema Validation Tests

**File:** `tests/unit/modules/roles-hierarchy/schemas/roleSchemas.test.ts`

- [ ] `createRoleSchema` - Validates required fields
- [ ] `createRoleSchema` - Validates name
- [ ] `createRoleSchema` - Validates color format
- [ ] `createRoleSchema` - Validates icon
- [ ] `createRoleSchema` - Validates parentRoleId
- [ ] `createRoleSchema` - Validates managerRoleId
- [ ] `updateRoleSchema` - Allows partial updates
- [ ] `updateRoleSchema` - Validates updated fields

---

### 🔗 Integration Tests - Roles & Hierarchy Module

#### 8.1 Role CRUD Integration Tests

**File:** `tests/integration/modules/roles-hierarchy/actions/roleCRUD.test.ts`

- [ ] Creates role successfully
- [ ] Creates role with management requirement
- [ ] Creates role with parent role
- [ ] Creates role with manager role
- [ ] Lists roles for venue
- [ ] Gets role by ID
- [ ] Updates role successfully
- [ ] Updates role management requirement
- [ ] Deletes role successfully
- [ ] Validates user authorization
- [ ] Validates venue ownership
- [ ] Handles non-existent role

#### 8.2 Hierarchy Management Integration Tests

**File:** `tests/integration/modules/roles-hierarchy/actions/hierarchyManagement.test.ts`

- [ ] Creates role hierarchy correctly
- [ ] Updates hierarchy relationships
- [ ] Deletes hierarchy node (with children)
- [ ] Prevents circular references
- [ ] Validates only management roles as parents
- [ ] Handles management role creation/deletion

#### 8.3 Management Roles Integration Tests

**File:** `tests/integration/modules/roles-hierarchy/actions/managementRoles.test.ts`

- [ ] Auto-creates management role when required
- [ ] Auto-deletes management role when not required
- [ ] Updates management role when role name changes
- [ ] Prevents direct editing of management role
- [ ] Gets all management roles for venue
- [ ] Validates management role relationships

---

### 🌐 E2E Tests - Roles & Hierarchy Module

#### 9.1 Role Creation Flow

**File:** `tests/e2e/modules/roles-hierarchy/create-role.spec.ts`

- [ ] Navigate to roles page
- [ ] Click "Create Role"
- [ ] Fill in role name
- [ ] Set description
- [ ] Select color
- [ ] Select icon
- [ ] Optionally select parent role
- [ ] Optionally enable management requirement
- [ ] Submit form
- [ ] Verify role created
- [ ] Verify role appears in sidebar
- [ ] Verify role appears in diagram

#### 9.2 Role Editing Flow

**File:** `tests/e2e/modules/roles-hierarchy/edit-role.spec.ts`

- [ ] Navigate to roles page
- [ ] Click edit on role
- [ ] Modify role name
- [ ] Update description
- [ ] Change color
- [ ] Change parent role
- [ ] Toggle management requirement
- [ ] Submit changes
- [ ] Verify changes saved
- [ ] Verify hierarchy updated

#### 9.3 Role Deletion Flow

**File:** `tests/e2e/modules/roles-hierarchy/delete-role.spec.ts`

- [ ] Navigate to roles page
- [ ] Click delete on role
- [ ] Confirm deletion
- [ ] Verify role removed
- [ ] Verify management role removed (if exists)
- [ ] Verify hierarchy updated

#### 9.4 Hierarchy Visualization Flow

**File:** `tests/e2e/modules/roles-hierarchy/hierarchy-visualization.spec.ts`

- [ ] Navigate to roles page
- [ ] Verify hierarchy diagram displays
- [ ] Verify owner at top
- [ ] Verify management roles above managed roles
- [ ] Verify manager-role relationships
- [ ] Click on node to select
- [ ] Verify selection in sidebar
- [ ] Test expand/collapse nodes
- [ ] Verify connecting lines

#### 9.5 Management Role Auto-Creation Flow

**File:** `tests/e2e/modules/roles-hierarchy/management-role-creation.spec.ts`

- [ ] Create role with management requirement
- [ ] Verify management role auto-created
- [ ] Verify management role in diagram
- [ ] Verify management role above managed role
- [ ] Disable management requirement
- [ ] Verify management role deleted
- [ ] Update role name
- [ ] Verify management role name updated

#### 9.6 Parent Role Selection Flow

**File:** `tests/e2e/modules/roles-hierarchy/parent-role-selection.spec.ts`

- [ ] Create role
- [ ] Open parent role selector
- [ ] Verify only management roles shown
- [ ] Select parent role
- [ ] Submit
- [ ] Verify hierarchy updated
- [ ] Verify role under parent in diagram

---

## 🔄 Cross-Module Integration Tests

### 10.1 Lines ↔ Floor Plan Integration

**File:** `tests/integration/cross-module/lines-floor-plan.test.ts`

- [ ] Assign line to floor plan
- [ ] Configure line-specific staffing
- [ ] Configure line-specific minimum orders
- [ ] Verify settings persist
- [ ] Unassign line from floor plan
- [ ] Verify settings cleaned up

### 10.2 Lines ↔ Roles Integration

**File:** `tests/integration/cross-module/lines-roles.test.ts`

- [ ] Create role for line staffing
- [ ] Assign role to line occurrence
- [ ] Verify role appears in line context
- [ ] Delete role used in line
- [ ] Verify graceful handling

### 10.3 Floor Plan ↔ Roles Integration

**File:** `tests/integration/cross-module/floor-plan-roles.test.ts`

- [ ] Create role
- [ ] Use role in floor plan staffing
- [ ] Verify role available in staffing editor
- [ ] Delete role used in staffing
- [ ] Verify error handling

---

## 📊 Test Execution Summary

### Test Execution Commands

```bash
# Run all unit tests
pnpm test:unit

# Run all integration tests
pnpm test:integration

# Run all E2E tests
pnpm test:e2e

# Run tests for specific module
pnpm test:unit -- modules/lines
pnpm test:integration -- modules/lines
pnpm test:e2e -- modules/lines

# Run with coverage
pnpm test:unit -- --coverage
```

### Coverage Targets

- **Unit Tests:** 100% coverage for all services, utilities, and business logic
- **Integration Tests:** 100% coverage for all server actions and database operations
- **E2E Tests:** 100% coverage for all user flows and UI interactions

### Test Files Structure

```
tests/
├── unit/
│   └── modules/
│       ├── lines/
│       │   ├── services/
│       │   ├── schemas/
│       │   └── utils/
│       ├── floor-plan-editor/
│       │   ├── services/
│       │   ├── schemas/
│       │   └── utils/
│       └── roles-hierarchy/
│           ├── services/
│           ├── schemas/
│           └── utils/
├── integration/
│   └── modules/
│       ├── lines/
│       │   └── actions/
│       ├── floor-plan-editor/
│       │   └── actions/
│       └── roles-hierarchy/
│           └── actions/
├── e2e/
│   └── modules/
│       ├── lines/
│       ├── floor-plan-editor/
│       └── roles-hierarchy/
└── cross-module/
    └── integration/
```

---

## ✅ Completion Checklist

### Phase 1: Setup & Infrastructure

- [ ] Create test directory structure
- [ ] Configure Vitest for unit tests
- [ ] Configure Vitest for integration tests
- [ ] Configure Vitest for E2E tests
- [ ] Set up test database
- [ ] Set up test utilities and mocks
- [ ] Configure coverage reporting

### Phase 2: Lines Module Tests

- [ ] Unit tests for all services
- [ ] Unit tests for all schemas
- [ ] Integration tests for all actions
- [ ] E2E tests for all user flows
- [ ] Achieve 100% coverage

### Phase 3: Floor Plan Editor Module Tests

- [ ] Unit tests for all services
- [ ] Unit tests for all utils
- [ ] Unit tests for all schemas
- [ ] Integration tests for all actions
- [ ] E2E tests for all user flows
- [ ] Achieve 100% coverage

### Phase 4: Roles & Hierarchy Module Tests

- [ ] Unit tests for all services
- [ ] Unit tests for all schemas
- [ ] Integration tests for all actions
- [ ] E2E tests for all user flows
- [ ] Achieve 100% coverage

### Phase 5: Cross-Module Tests

- [ ] Lines ↔ Floor Plan integration tests
- [ ] Lines ↔ Roles integration tests
- [ ] Floor Plan ↔ Roles integration tests

### Phase 6: Documentation & CI

- [ ] Update TEST_MATRIX.md
- [ ] Add test documentation
- [ ] Configure CI/CD to run tests
- [ ] Set up coverage reporting in CI
- [ ] Configure test failure notifications

---

## 🎯 Success Criteria

### ✅ Unit Tests

- All service methods have tests
- All utility functions have tests
- All schema validations have tests
- 100% code coverage achieved
- All edge cases covered

### ✅ Integration Tests

- All server actions have tests
- All database operations have tests
- All repository methods have tests
- All error scenarios covered
- All validation flows tested

### ✅ E2E Tests

- All user flows have tests
- All CRUD operations tested
- All form submissions tested
- All navigation flows tested
- All error scenarios tested

### ✅ Quality Metrics

- Tests run in < 5 minutes
- Tests are deterministic (no flaky tests)
- Tests are maintainable
- Tests have clear descriptions
- Tests follow best practices

---

## 📝 Notes

- **Test Data:** Use factories/fixtures for consistent test data
- **Mocks:** Mock external dependencies (database, API calls)
- **Cleanup:** Always clean up test data after tests
- **Isolation:** Each test should be independent
- **Naming:** Use descriptive test names
- **Documentation:** Document complex test scenarios

---

**Last Updated:** 2025-01-15  
**Status:** Planning Phase  
**Next Steps:** Begin implementation of test infrastructure and unit tests
