2025-12-05 – Lines Production App (Next.js 15) – Project Overview & Structure

---

## 1. Purpose of This Document

- **Goal**: Define the high-level architecture, folder structure, and responsibilities for the `lines-app` production application.
- **Source of truth**: This README is based on:
  - `information/PROJECT_STRUCTURE_GUIDE.md`
  - `information/PROJECT_DOCUMENTATION_OVERVIEW.md`
  - `information/DOCUMENTATION_MAINTENANCE_RULES.md`
  - `information/lines-mvp-information-v1.md`
- **Audience**: Developers and AI assistants (Cursor / GPT) implementing and maintaining the Lines production app.

This file explains **how the project must be structured** and **where each concern lives**, so that implementation can proceed in a modular, scalable, and production-ready way.

---

## 2. Technology & Architecture Overview

- **Frontend**: Next.js 15 (App Router), React, TypeScript (strict).
- **Architecture style**: Modular, feature-first:
  - `app/` – Routing layer only (pages, layouts, API route handlers).
  - `modules/` – Self-contained business features (UI, actions, services, schemas, types).
  - `core/` – Infrastructure, integrations, DB repositories, config, validation.
  - `shared/` – Reusable UI primitives and layout components.
  - `utils/` – Generic helpers (no domain logic).
  - `docs/` – Documentation as defined in the documentation overview.
- **Data & domain** (from `lines-mvp-information-v1.md`):
  - Venues and VenueDetails.
  - Menus.
  - Zones & Tables.
  - Lines and LineOccurrences (events).
  - Per-venue Calendar and Event Detail flows.

---

## 3. High-Level Directory Structure

At the top level, `lines-app` is expected to follow this structure (omitting some files for brevity):

```text
lines-app/
  package.json
  pnpm-lock.yaml
  tsconfig.json
  next.config.mjs
  vercel.json
  .eslintrc.cjs
  .prettierrc
  .env.example
  prisma/
    schema.prisma
    migrations/
  docs/
    ARCHITECTURE.md
    PROJECT_STRUCTURE_GUIDE.md
    MODULE_CREATION_GUIDE.md
    DATA_MODEL.md
    SYSTEM_REQUIREMENTS.md
    API_REFERENCE.md
    ROADMAP.md
    MILESTONES.md
    TASKS_BREAKDOWN.md
    QA_PLAN.md
    TEST_MATRIX.md
    DEPLOYMENT_GUIDE.md
    CI_CD_PIPELINE.md
    CHANGELOG.md
    DOCUMENTATION_MAINTENANCE_RULES.md
    specs/
      lines-mvp-information-v1.md
      FEATURE_SPECS/*.md
  src/
    app/
    core/
    modules/
    shared/
    utils/
  tests/
    unit/
    integration/
    e2e/
    setup.ts
    test-utils.tsx
```

The rest of this document explains what goes into each layer and how it connects to the Lines domain.

---

## 4. `src/app` – Next.js App Router (Routing Only)

**Rule**: No business logic in `app/`. Components here:
- Wire URL segments to feature modules in `src/modules`.
- Define layouts and page shells.
- Implement HTTP route handlers that delegate to services.

### 4.1 Core files

- `src/app/layout.tsx`
  - Root layout: sets RTL + Hebrew, dark theme, global providers (from `core`).
- `src/app/page.tsx`
  - Home (`/`): delegates to `@/modules/venues/ui/VenuesHomePage`.
- `src/app/globals.css`
  - Global styles, including dark theme base and layout primitives.

### 4.2 Workspace & venue routes

Based on the information architecture in `lines-mvp-information-v1.md`:

- `src/app/venues/[venueId]/layout.tsx`
  - Workspace shell per venue (sidebar, header, loading venue context).
- `src/app/venues/[venueId]/info/page.tsx`
  - Venue Info tab → `@/modules/venue-info/ui/VenueInfoTab`.
- `src/app/venues/[venueId]/settings/page.tsx`
  - Venue Settings tab → `@/modules/venue-settings/ui/VenueSettingsTab`.
- `src/app/venues/[venueId]/lines/page.tsx`
  - Lines tab → `@/modules/lines/ui/LinesTab`.
- `src/app/venues/[venueId]/calendar/page.tsx`
  - Calendar tab → `@/modules/calendar/ui/CalendarTab` (reads `view` and `date` from `searchParams`).

### 4.3 Line & Event detail routes

- `src/app/venues/[venueId]/lines/[lineId]/page.tsx`
  - Line Detail page → `@/modules/lines/ui/LineDetailPage`.
- `src/app/venues/[venueId]/events/[lineId]/[occurrenceId]/page.tsx`
  - Event Detail → `@/modules/events/ui/EventDetailPage`, reading context:
    - `back=lines | calendar`
    - `view`, `date` (when back=calendar).

### 4.4 API routes (HTTP façade)

HTTP handlers under `app/api` only:
- Parse input / auth.
- Call `services` from `modules`.
- Return typed responses.

Planned routes include (non-exhaustive):

- `src/app/api/venues/route.ts`
- `src/app/api/venues/[venueId]/route.ts`
- `src/app/api/venues/[venueId]/details/route.ts`
- `src/app/api/venues/[venueId]/menus/route.ts`
- `src/app/api/venues/[venueId]/menus/[menuId]/route.ts`
- `src/app/api/venues/[venueId]/zones/route.ts`
- `src/app/api/venues/[venueId]/zones/[zoneId]/tables/route.ts`
- `src/app/api/venues/[venueId]/lines/route.ts`
- `src/app/api/venues/[venueId]/lines/[lineId]/route.ts`
- `src/app/api/venues/[venueId]/lines/[lineId]/occurrences/route.ts`
- `src/app/api/venues/[venueId]/calendar/route.ts`

---

## 5. `src/modules` – Feature Modules

**Rule** (from `PROJECT_STRUCTURE_GUIDE.md`):

Each module lives at `src/modules/<feature>/` and must contain:
- `ui/` – React components.
- `actions/` – `"use server"` actions for Next.js.
- `services/` – Business logic, using `core/db` repositories.
- `schemas/` – Zod validation schemas.
- `types.ts` – Local TypeScript types.
- `index.ts` – Re-exports for the module.
- `README.md` – Local documentation.

### 5.1 Venues module – `src/modules/venues`

**Responsibility**: Home page, list venues, create/delete venues.

- `ui/`
  - `VenuesHomePage.tsx`
  - `VenueCard.tsx`
  - `VenueList.tsx`
  - `CreateVenueDialog.tsx`
  - `DeleteVenueDialog.tsx`
- `actions/`
  - `createVenue.ts`
  - `deleteVenue.ts`
  - `listVenues.ts`
- `services/`
  - `venuesService.ts` – cascades deletes, enforces venue-level rules.
- `schemas/`
  - `venueSchemas.ts` – validation for creating/updating venues.
- `types.ts`, `index.ts`, `README.md`.

### 5.2 Venue Info module – `src/modules/venue-info`

**Responsibility**: Venue contact details tab.

- `ui/VenueInfoTab.tsx`
- `actions/getVenueDetails.ts`, `actions/updateVenueDetails.ts`
- `services/venueDetailsService.ts`
- `schemas/venueDetailsSchemas.ts`
- `types.ts`, `index.ts`, `README.md`.

### 5.3 Venue Settings module – `src/modules/venue-settings`

**Responsibility**: Menus + Zones & Tables management.

- `ui/`
  - `VenueSettingsTab.tsx`
  - `MenusSection.tsx`, `MenuCard.tsx`, `MenuFormDialog.tsx`
  - `ZonesAndTablesSection.tsx`, `ZoneCard.tsx`, `ZoneFormDialog.tsx`
  - `TableRow.tsx`, `TableFormDialog.tsx`
- `actions/`
  - Menus: `listMenus.ts`, `createMenu.ts`, `updateMenu.ts`, `deleteMenu.ts`
  - Zones: `listZones.ts`, `createZone.ts`, `updateZone.ts`, `deleteZone.ts`
  - Tables: `createTable.ts`, `updateTable.ts`, `deleteTable.ts`
- `services/`
  - `menusService.ts`, `zonesService.ts`, `tablesService.ts`
- `schemas/menusSchemas.ts`, `zonesSchemas.ts`, `tablesSchemas.ts`
- `types.ts`, `index.ts`, `README.md`.

### 5.4 Lines module – `src/modules/lines`

**Responsibility**: Lines tab, Line creation/editing, color & schedule rules, occurrences generation.

- `ui/`
  - `LinesTab.tsx` – overview grid and empty states.
  - `LineCard.tsx` – color chip, schedule, frequency, status summary.
  - `LineFormDialog.tsx` – schedule, color, suggestions & manual dates.
  - `LineDetailPage.tsx` – line header + occurrences list.
- `actions/`
  - `listLines.ts`
  - `createLine.ts`
  - `updateLine.ts`
  - `getLineWithOccurrences.ts`
- `services/`
  - `linesService.ts` – validates Line data, enforces 15-color palette per venue.
  - `lineScheduleService.ts` – generates suggested dates from days + frequency.
  - `lineOccurrencesSyncService.ts` – normalizes suggestions + manual dates.
- `schemas/lineSchemas.ts` – time validation, overnight logic, color constraints.
- `types.ts`, `index.ts`, `README.md`.

### 5.5 Events module – `src/modules/events`

**Responsibility**: Event Detail view and occurrence-level logic.

- `ui/EventDetailPage.tsx`
- `actions/getEventDetail.ts`, `actions/getNeighborEvents.ts`
- `services/eventsService.ts` – derived status model:
  - cancelled / ended / happening now / upcoming.
- `schemas/eventSchemas.ts`
- `types.ts`, `index.ts`, `README.md`.

### 5.6 Calendar module – `src/modules/calendar`

**Responsibility**: Per-venue calendar, legend, hour compression, event interactions.

- `ui/`
  - `CalendarTab.tsx`
  - `CalendarToolbar.tsx`
  - `CalendarLegend.tsx`
  - `CalendarGrid.tsx`
- `actions/getVenueCalendarData.ts`
- `services/calendarService.ts`
  - Aggregates occurrences for a venue.
  - Applies overnight rules and hour compression.
- `schemas/calendarSchemas.ts`
- `types.ts`, `index.ts`, `README.md`.

### 5.7 Workspace shell module (optional) – `src/modules/workspace-shell`

**Responsibility**: Shared workspace shell for venue routes.

- `ui/WorkspaceLayout.tsx`
- `types.ts`, `index.ts`, `README.md`.

---

## 6. `src/core` – Infrastructure & Integrations

**Rule**: All DB access and external providers live here; modules call repositories and services exposed by `core`.

### 6.1 DB layer – `src/core/db`

- `src/core/db/repositories/`
  - `VenueRepository.ts`
  - `VenueDetailsRepository.ts`
  - `MenuRepository.ts`
  - `ZoneRepository.ts`
  - `TableRepository.ts`
  - `LineRepository.ts`
  - `LineOccurrenceRepository.ts`
- `src/core/db/prisma/`
  - `client.ts` – Prisma client, delegating to `core/integrations/prisma`.
  - `mappers.ts` – map Prisma models ↔ domain types.
- `src/core/db/index.ts`
  - Central exports for repositories.

### 6.2 Integrations – `src/core/integrations/prisma`

- `client.ts` – Singleton PrismaClient.
- `index.ts` – exports used by `core/db`.

### 6.3 Other core utilities

- `src/core/auth/` – session/auth helpers (future-ready).
- `src/core/security/` – RBAC / permissions (future-ready).
- `src/core/http/` – response helpers, error serialization.
- `src/core/validation/` – shared Zod helpers and patterns.
- `src/core/config/`
  - `env.ts` – typed environment variables.
  - `constants.ts` – global constants (e.g., palette size).

---

## 7. `src/shared` – Shared UI & Layout

**Rule**: Reusable, non-domain-specific components.

- `src/shared/ui/`
  - `Button.tsx`
  - `Card.tsx`
  - `Modal.tsx`
  - `FormField.tsx`
  - `Badge.tsx`
  - `Tabs.tsx`
  - `Tooltip.tsx`
- `src/shared/layout/`
  - `AppShell.tsx`
  - `SidebarNav.tsx`
  - `TopBar.tsx`

Modules compose these primitives into domain-specific UIs.

---

## 8. `src/utils` – Generic Helpers

Must contain only **generic**, reusable helpers (no Lines-specific business logic):

- `src/utils/date.ts` – generic date formatting/parsing.
- `src/utils/time.ts` – HH:MM validation, comparison, etc.
- `src/utils/i18n.ts` – RTL and Hebrew helpers.
- `src/utils/arrays.ts`, `src/utils/objects.ts` – common utilities.

Domain rules (overnight, color palette enforcement, event statuses) stay in `modules/*/services`.

---

## 9. `docs/` – Project Documentation Inside `lines-app`

Derived from `PROJECT_DOCUMENTATION_OVERVIEW.md` and `DOCUMENTATION_MAINTENANCE_RULES.md`:

- Architecture & infrastructure:
  - `docs/ARCHITECTURE.md`
  - `docs/PROJECT_STRUCTURE_GUIDE.md`
  - `docs/MODULE_CREATION_GUIDE.md`
  - `docs/DATA_MODEL.md`
- Specification & planning:
  - `docs/SYSTEM_REQUIREMENTS.md`
  - `docs/FEATURE_SPECS/*.md` (venues, venue-settings, lines, calendar, events).
  - `docs/API_REFERENCE.md`
- Development management:
  - `docs/ROADMAP.md`
  - `docs/MILESTONES.md`
  - `docs/TASKS_BREAKDOWN.md`
- Testing & quality:
  - `docs/QA_PLAN.md`
  - `docs/TEST_MATRIX.md`
- Operations & maintenance:
  - `docs/DEPLOYMENT_GUIDE.md`
  - `docs/CI_CD_PIPELINE.md`
  - `docs/CHANGELOG.md`
  - `docs/DOCUMENTATION_MAINTENANCE_RULES.md`
- MVP spec:
  - `docs/specs/lines-mvp-information-v1.md` – copy/reference of the business spec.

All new features and changes must be reflected in these documents according to the maintenance rules.

---

## 10. `tests/` – Testing Layout

Testing setup is aligned with the documentation testing section:

- `tests/unit/`
  - `lines/lineScheduleService.test.ts`
  - `lines/lineColorRules.test.ts`
  - `events/eventStatusModel.test.ts`
  - `calendar/calendarService.test.ts`
- `tests/integration/`
  - `api/venues.test.ts`
  - `api/lines.test.ts`
  - `api/calendar.test.ts`
- `tests/e2e/`
  - `workspace/venues.e2e.ts`
  - `workspace/lines.e2e.ts`
  - `workspace/calendar.e2e.ts`
  - `workspace/event-detail.e2e.ts`
- Test bootstrap:
  - `tests/setup.ts`
  - `tests/test-utils.tsx`

All new functionality must have appropriate coverage recorded in `docs/TEST_MATRIX.md`.

---

## 11. Next Steps for Implementation

1. Scaffold the directory structure described above inside `lines-app`.
2. Define the Prisma schema (`prisma/schema.prisma`) according to `DATA_MODEL.md` derived from `lines-mvp-information-v1.md`.
3. Implement feature modules one by one, following the module template (`ui/`, `actions/`, `services/`, `schemas/`, `types.ts`, `README.md`).
4. Keep `docs/` fully in sync with any architectural, API, or data model changes.
5. Ensure linting, formatting, tests, and build all pass before deployment to production.


