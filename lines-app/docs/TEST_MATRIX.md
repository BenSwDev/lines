# 📋 Test Matrix - Lines App

**Last Updated:** 2025-01-15  
**Coverage:** Lines, Floor Plan Editor, Roles & Hierarchy Modules  
**Full Documentation:** See `docs/COMPREHENSIVE_TEST_PLAN.md`

---

## 📊 Summary Statistics

| Module                | Unit Tests | Integration Tests | E2E Tests | Total   |
| --------------------- | ---------- | ----------------- | --------- | ------- |
| **Lines**             | 45         | 35                | 8         | 88      |
| **Floor Plan Editor** | 35         | 40                | 10        | 85      |
| **Roles & Hierarchy** | 30         | 15                | 6         | 51      |
| **Cross-Module**      | -          | 3                 | -         | 3       |
| **TOTAL**             | **110**    | **93**            | **24**    | **227** |

_Note: These are test categories. Each category contains multiple specific test cases._

---

## 📦 Module 1: Lines Module

### Unit Tests (45 tests)

#### Lines Service (`linesService.test.ts`) - 15 tests

- ✅ `getAvailableColors()` - 3 scenarios
- ✅ `isColorAvailable()` - 3 scenarios
- ✅ `getNextAvailableColor()` - 2 scenarios
- ✅ `isOvernightShift()` - 3 scenarios
- ✅ `countLines()` - 2 scenarios
- ✅ `canCreateNewLine()` - 2 scenarios

#### Line Schedule Service (`lineScheduleService.test.ts`) - 14 tests

- ✅ `generateSuggestions()` - 6 scenarios (weekly/monthly/oneTime/variable/empty/horizon)
- ✅ `generateWeekly()` - 3 scenarios
- ✅ `generateMonthly()` - 3 scenarios
- ✅ `generateOneTime()` - 2 scenarios

#### Line Occurrences Sync Service (`lineOccurrencesSyncService.test.ts`) - 10 tests

- ✅ `syncOccurrences()` - 5 scenarios
- ✅ `syncOccurrencesWithSchedules()` - 1 scenario
- ✅ `addManualOccurrence()` - 2 scenarios
- ✅ `cancelOccurrence()` - 1 scenario
- ✅ `reactivateOccurrence()` - 1 scenario

#### Line Reservation Settings Service (`lineReservationSettingsService.test.ts`) - 9 tests

- ✅ `getSettings()` - 4 scenarios
- ✅ `createOrUpdateSettings()` - 2 scenarios
- ✅ `validateLineEligibility()` - 3 scenarios

#### Line Schemas (`lineSchemas.test.ts`) - 10 tests

- ✅ `createLineSchema` - 8 scenarios
- ✅ `updateLineSchema` - 2 scenarios

### Integration Tests (35 tests)

#### Create Line (`createLine.test.ts`) - 16 tests

- ✅ Basic creation - 5 scenarios (weekly/monthly/variable/oneTime)
- ✅ Occurrence generation - 3 scenarios
- ✅ Collision detection - 2 scenarios
- ✅ Authorization - 3 scenarios
- ✅ Color handling - 1 scenario
- ✅ Date handling - 2 scenarios

#### Update Line (`updateLine.test.ts`) - 15 tests

- ✅ Basic updates - 5 scenarios
- ✅ Schedule changes - 3 scenarios
- ✅ Occurrence regeneration - 2 scenarios
- ✅ Collision detection - 2 scenarios
- ✅ Authorization - 3 scenarios

#### Delete Line (`deleteLine.test.ts`) - 4 tests

- ✅ Basic deletion
- ✅ Cascading deletion
- ✅ Authorization (2 scenarios)

#### List Lines (`listLines.test.ts`) - 6 tests

- ✅ List all lines
- ✅ Include metadata
- ✅ Empty venue
- ✅ Authorization (2 scenarios)
- ✅ Sorting

#### Get Line (`getLine.test.ts`) - 6 tests

- ✅ Get with details
- ✅ Include occurrences
- ✅ Non-existent line
- ✅ Authorization (2 scenarios)
- ✅ Venue ownership

#### Check Collisions (`checkCollisions.test.ts`) - 8 tests

- ✅ Overlapping detection
- ✅ Same time collisions
- ✅ Partial overlaps
- ✅ Overnight shifts
- ✅ Multiple collisions
- ✅ Non-overlapping
- ✅ Inactive exclusion
- ✅ Collision details

#### Line Reservation Settings (`lineReservationSettingsActions.test.ts`) - 8 tests

- ✅ Get settings
- ✅ Create default settings
- ✅ Update settings
- ✅ Line eligibility validation
- ✅ Excluded line handling
- ✅ Disabled reservations handling
- ✅ Authorization
- ✅ Day schedules handling

### E2E Tests (8 tests)

- ✅ **Create Line Flow** - Full user flow from UI
- ✅ **Create Variable Line** - Variable frequency flow
- ✅ **Edit Line Flow** - Edit existing line
- ✅ **Delete Line Flow** - Delete with confirmation
- ✅ **Line Detail View** - View line details
- ✅ **Collision Detection** - UI collision handling
- ✅ **Date Selection** - Date picker interactions
- ✅ **Reservation Settings** - Settings UI flow

---

## 📦 Module 2: Floor Plan Editor Module

### Unit Tests (35 tests)

#### Floor Plan Service (`floorPlanService.test.ts`) - 17 tests

- ✅ `getFloorPlansByVenue()` - 3 scenarios
- ✅ `getFloorPlanById()` - 5 scenarios
- ✅ `getDefaultFloorPlan()` - 2 scenarios
- ✅ `createFloorPlan()` - 2 scenarios
- ✅ `updateFloorPlan()` - 1 scenario
- ✅ `deleteFloorPlan()` - 2 scenarios
- ✅ `setDefaultFloorPlan()` - 2 scenarios

#### Collision Detection (`collisionDetection.test.ts`) - 8 tests

- ✅ `doRectanglesCollide()` - 3 scenarios
- ✅ `checkRectangleCollision()` - 2 scenarios
- ✅ `calculateTableLayout()` - 3 scenarios

#### Line Floor Plan Service (`lineFloorPlanService.test.ts`) - 6 tests

- ✅ Staffing service - 3 scenarios
- ✅ Minimum order service - 3 scenarios

#### Floor Plan Schemas (`floorPlanSchemas.test.ts`) - 11 tests

- ✅ `createFloorPlanSchema` - 3 scenarios
- ✅ `updateFloorPlanSchema` - 1 scenario
- ✅ `createZoneSchema` - 1 scenario
- ✅ `createTableSchema` - 1 scenario
- ✅ `createVenueAreaSchema` - 1 scenario
- ✅ `updateZoneContentSchema` - 1 scenario
- ✅ `updateTableContentSchema` - 1 scenario
- ✅ `updateStaffingSchema` - 1 scenario
- ✅ `updateMinimumOrderSchema` - 1 scenario

### Integration Tests (40 tests)

#### Floor Plan CRUD (`floorPlanCRUD.test.ts`) - 12 tests

- ✅ Create - 2 scenarios
- ✅ Update - 1 scenario
- ✅ Delete - 1 scenario
- ✅ Duplicate - 1 scenario
- ✅ Set default - 1 scenario
- ✅ List - 1 scenario
- ✅ Get by ID - 1 scenario
- ✅ Get default - 1 scenario
- ✅ Authorization - 2 scenarios
- ✅ Non-existent - 1 scenario

#### Zone Management (`zoneManagement.test.ts`) - 10 tests

- ✅ Create - 2 scenarios
- ✅ Update content - 1 scenario
- ✅ Update position - 1 scenario
- ✅ Update size - 1 scenario
- ✅ Delete - 2 scenarios (with/without cascade)
- ✅ Collision detection - 1 scenario
- ✅ Multiple zones - 1 scenario

#### Table Management (`tableManagement.test.ts`) - 10 tests

- ✅ Create - 2 scenarios
- ✅ Update - 4 scenarios (content/position/size/rotation)
- ✅ Delete - 1 scenario
- ✅ Auto-generate - 1 scenario
- ✅ Collision detection - 1 scenario
- ✅ Tables outside zones - 1 scenario

#### Venue Area Management (`venueAreaManagement.test.ts`) - 5 tests

- ✅ Create - 1 scenario
- ✅ Update - 3 scenarios (position/size/rotation)
- ✅ Delete - 1 scenario

#### Staffing (`staffing.test.ts`) - 5 tests

- ✅ Zone staffing - 1 scenario
- ✅ Table staffing - 1 scenario
- ✅ Area staffing - 1 scenario
- ✅ Line-floor plan staffing - 1 scenario
- ✅ Validation - 1 scenario

#### Minimum Order (`minimumOrder.test.ts`) - 5 tests

- ✅ Zone minimum order - 1 scenario
- ✅ Table minimum order - 1 scenario
- ✅ Area minimum order - 1 scenario
- ✅ Line-floor plan minimum order - 1 scenario
- ✅ Validation - 1 scenario

#### Line Assignment (`lineAssignment.test.ts`) - 5 tests

- ✅ Assign lines - 1 scenario
- ✅ Unassign lines - 1 scenario
- ✅ Update assignments - 1 scenario
- ✅ Get assigned lines - 1 scenario
- ✅ Validation - 1 scenario

### E2E Tests (10 tests)

- ✅ **Create Floor Plan** - Full creation flow
- ✅ **Edit Floor Plan** - Edit flow
- ✅ **Create Zone** - Zone creation
- ✅ **Create Table** - Table creation
- ✅ **Drag and Drop** - Element positioning
- ✅ **Auto-Generate Tables** - Auto-generation flow
- ✅ **Staffing Configuration** - Staffing setup
- ✅ **Minimum Order Configuration** - Minimum order setup
- ✅ **Line Assignment** - Line assignment flow
- ✅ **Floor Plan Viewer** - View-only mode

---

## 📦 Module 3: Roles & Hierarchy Module

### Unit Tests (30 tests)

#### Roles Service (`rolesService.test.ts`) - 21 tests

- ✅ `listRoles()` - 5 scenarios
- ✅ `getRole()` - 2 scenarios
- ✅ `createRole()` - 5 scenarios
- ✅ `updateRole()` - 6 scenarios
- ✅ `deleteRole()` - 3 scenarios

#### Hierarchy Service (`hierarchyService.test.ts`) - 9 tests

- ✅ `buildHierarchyTree()` - 8 scenarios
- ✅ `flattenHierarchy()` - 2 scenarios
- ✅ `findNodeById()` - 3 scenarios
- ✅ `getRolePath()` - 2 scenarios

#### Role Schemas (`roleSchemas.test.ts`) - 7 tests

- ✅ `createRoleSchema` - 6 scenarios
- ✅ `updateRoleSchema` - 2 scenarios

### Integration Tests (15 tests)

#### Role CRUD (`roleCRUD.test.ts`) - 12 tests

- ✅ Create - 4 scenarios
- ✅ List - 1 scenario
- ✅ Get - 1 scenario
- ✅ Update - 3 scenarios
- ✅ Delete - 1 scenario
- ✅ Authorization - 2 scenarios

#### Hierarchy Management (`hierarchyManagement.test.ts`) - 6 tests

- ✅ Create hierarchy - 1 scenario
- ✅ Update relationships - 1 scenario
- ✅ Delete node - 1 scenario
- ✅ Circular reference prevention - 1 scenario
- ✅ Management role validation - 1 scenario
- ✅ Management role lifecycle - 1 scenario

#### Management Roles (`managementRoles.test.ts`) - 6 tests

- ✅ Auto-create - 1 scenario
- ✅ Auto-delete - 1 scenario
- ✅ Name update - 1 scenario
- ✅ Direct edit prevention - 1 scenario
- ✅ Get all - 1 scenario
- ✅ Relationship validation - 1 scenario

### E2E Tests (6 tests)

- ✅ **Create Role** - Full creation flow
- ✅ **Edit Role** - Edit flow
- ✅ **Delete Role** - Delete flow
- ✅ **Hierarchy Visualization** - Diagram interactions
- ✅ **Management Role Auto-Creation** - Auto-creation flow
- ✅ **Parent Role Selection** - Parent selection flow

---

## 🔄 Cross-Module Integration Tests (3 tests)

- ✅ **Lines ↔ Floor Plan** - Line assignment to floor plans
- ✅ **Lines ↔ Roles** - Role usage in lines
- ✅ **Floor Plan ↔ Roles** - Role usage in floor plan staffing

---

## 📝 Test Status Legend

- ✅ **Planned** - Test case defined, ready for implementation
- 🟡 **In Progress** - Test case being implemented
- ✅ **Completed** - Test case implemented and passing
- ❌ **Failed** - Test case failing (needs fix)

---

## 🎯 Coverage Goals

| Type                  | Target | Current | Status     |
| --------------------- | ------ | ------- | ---------- |
| **Unit Tests**        | 100%   | 0%      | ⏳ Pending |
| **Integration Tests** | 100%   | 0%      | ⏳ Pending |
| **E2E Tests**         | 100%   | 0%      | ⏳ Pending |
| **Overall Coverage**  | 100%   | 0%      | ⏳ Pending |

---

## 📚 Reference

For detailed test specifications, scenarios, and implementation guidelines, see:

- **`docs/COMPREHENSIVE_TEST_PLAN.md`** - Complete test plan with all test cases
- **`docs/FEATURE_SPECS/`** - Feature specifications for each module
- **`docs/DOCUMENTATION_MAINTENANCE_RULES.md`** - Documentation maintenance rules

---

**Note:** This matrix should be updated whenever new tests are added or existing tests are modified. See `information/DOCUMENTATION_MAINTENANCE_RULES.md` for full guidelines.
