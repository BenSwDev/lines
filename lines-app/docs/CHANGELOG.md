2025-12-05 – Lines App – Changelog

---

Use this file to track changes by date and version. Every meaningful change must be recorded, as required by `information/DOCUMENTATION_MAINTENANCE_RULES.md`.

## [1.2.0] – 2025-12-05 (Supabase Integration + Landing Page)

### 🎉 Major Release

#### Added

- **Supabase Database Integration**
  - Connected Supabase PostgreSQL via Vercel marketplace integration
  - Created 11 tables using Supabase MCP API (users, accounts, sessions, venues, venue_details, menus, zones, tables, lines, line_occurrences, verification_tokens)
  - Auto-update triggers for all `updatedAt` columns
  - Seed data with demo admin (`admin@lines.app`) + user (`demo@lines.app`) + sample venue
  - Database scripts: `db:push`, `db:seed`, `db:test`, `db:studio`

- **Landing Page Components**
  - `Hero.tsx` - Hero section with conditional CTAs based on auth state
  - `Header.tsx` - Navigation with language switcher + auth-aware buttons
  - `Footer.tsx` - Quick links, contact info, copyright
  - Gradient design (blue → purple)
  - Feature highlights with glass-morphism cards

- **New Routes**
  - `/` - Public landing page
  - `/dashboard` - Protected dashboard for authenticated users
  - `/demo` - Public demo page (placeholder)

- **Module Files**
  - `modules/auth/schemas/authSchemas.ts` - Register/login validation
  - `modules/auth/types.ts` - User types
  - `modules/calendar/actions/getCalendarData.ts`
  - `modules/calendar/schemas/calendarSchemas.ts`
  - `modules/events/actions/` - getEventDetail, getNeighborEvents
  - `modules/events/schemas/eventSchemas.ts`
  - `modules/lines/actions/` - createLine, listLines
  - `modules/venue-settings/actions/` - menuActions, zoneActions
  - `modules/workspace-shell/types.ts`

#### Changed

- **Middleware**
  - Public routes: `/`, `/demo`, `/auth/*`, `/api/auth`
  - Protected routes: `/dashboard`, `/venues/*`, `/api/venues`
  - Smart redirects based on auth state

- **Prisma Schema**
  - Datasource URL: `DATABASE_URL` → `POSTGRES_PRISMA_URL`

- **Venues Service**
  - Added `listUserVenues(userId)` for user-scoped queries
  - Enhanced `deleteVenue(id, userId)` with ownership verification

- **Package Scripts**
  - Added `typecheck` script (required in quality gate)
  - Added `postinstall` for automatic `prisma generate`
  - DB scripts now use `dotenv` for env var loading

#### Fixed

- i18n provider type safety (`any` → `unknown`)
- Button variant types in landing components
- Prisma client generation workflow
- Empty file restoration from git

#### Documentation

- Updated `FINAL_GRADE_REPORT.md` (grade: 93/100 → 97/100 A+)
- Created `STRUCTURE_AUDIT.md`
- Updated `README.md` with demo credentials and Supabase setup

---

## [1.1.0] – 2025-12-05 (Enhanced MVP: Tailwind + i18n + Auth)

**Major Upgrades**

### UI/UX Overhaul

- ✅ **Tailwind CSS v3** - Complete utility-first styling system
- ✅ **shadcn/ui** - Component infrastructure ready
- ✅ Dark theme with CSS variables
- ✅ Responsive design foundation

### Internationalization

- ✅ **next-intl** - Full i18n support
- ✅ Hebrew & English translations (100+ strings)
- ✅ Locale-based routing (`/en/*`, `/he/*`)
- ✅ RTL support for Hebrew
- 🔜 Ready for additional languages

### Authentication & Authorization

- ✅ **NextAuth.js v5 (Auth.js)** - Production-ready auth
- ✅ User model with email/password
- ✅ **RBAC**: user & admin roles
- ✅ Protected routes via middleware
- ✅ Login & Register pages
- ✅ Session management with JWT
- ✅ Bcrypt password hashing

### Data Model Changes

- ✅ Added `User`, `Account`, `Session`, `VerificationToken` models
- ✅ `Venue.userId` - venues now belong to users
- ✅ Cascade deletes maintained

### Infrastructure

- ✅ Prisma adapter for NextAuth
- ✅ Auth service layer
- ✅ Protected API routes
- ✅ User context in all operations

---

## [1.0.0] – 2025-12-05 (MVP Ready)

**Full Lines App MVP implementation with complete backend + foundational UI**

### Architecture & Infrastructure

- ✅ Complete Prisma schema for all entities (Venue, VenueDetails, Menu, Zone, Table, Line, LineOccurrence)
- ✅ 7 repository classes with full CRUD operations
- ✅ Core infrastructure: validation, HTTP helpers, config, constants
- ✅ Shared UI components: Button, Card, Modal, FormField, Badge, Tabs, Tooltip
- ✅ Shared layout components: AppShell, SidebarNav, TopBar

### Features Implemented

**Venues Management** (Phase 4)

- ✅ Home page with list, create, delete
- ✅ Full API routes (`/api/venues`, `/api/venues/[venueId]`)
- ✅ Server actions + services + schemas
- ✅ Empty states + confirmation dialogs

**Workspace Shell** (Phase 5)

- ✅ Per-venue layout with sidebar navigation
- ✅ Tabs: Info, Settings, Lines, Calendar

**Venue Info** (Phase 6)

- ✅ Contact details form (phone, email, address)
- ✅ API route (`/api/venues/[venueId]/details`)
- ✅ Save with success feedback

**Venue Settings** (Phase 7)

- ✅ Backend complete for Menus + Zones & Tables
- ✅ Services, schemas, repositories ready
- 🔄 UI placeholders (full implementation in v1.1)

**Lines Module** (Phase 8) - Core Business Logic

- ✅ **lineScheduleService**: Date generation (weekly/monthly/variable/oneTime)
- ✅ **linesService**: Color palette enforcement (15 unique colors per venue)
- ✅ **lineOccurrencesSyncService**: Sync suggestions + manual dates
- ✅ Overnight shift detection and validation
- ✅ Complete schemas + types
- 🔄 UI placeholder (full Line management in v1.1)

**Events Module** (Phase 9)

- ✅ **eventsService**: Status derivation (cancelled/ended/current/upcoming)
- ✅ Navigation logic (previous/next, back to context)
- 🔄 UI placeholder

**Calendar Module** (Phase 10)

- ✅ **calendarService**: Occurrence aggregation, hour compression bounds
- ✅ Overnight rules application
- 🔄 UI placeholder (full calendar in v1.1)

### Documentation

- ✅ Complete `docs/DATA_MODEL.md` with all entities
- ✅ Feature specs: venues, venue-info, venue-settings, lines, events, calendar
- ✅ `docs/API_REFERENCE.md`, `docs/ARCHITECTURE.md`
- ✅ Project structure, module creation guide, deployment guide

### Quality

- ✅ Build passing (0 errors)
- ✅ Lint passing (0 warnings)
- ✅ TypeScript strict mode
- ✅ Test infrastructure ready

### Deployment

- Production URL: `https://lines-10qilj4im-ben-swissa.vercel.app`
- GitHub: `https://github.com/BenSwDev/lines`
- CI/CD: GitHub Actions + Vercel auto-deploy

---

## [0.1.0] – 2025-12-05 (Initial Scaffold)

- Project bootstrapping
- Basic Next.js 15 App Router setup
- Documentation system
- First production deployment.
