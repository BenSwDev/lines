2025-12-05 – Lines App – Changelog

---

Use this file to track changes by date and version. Every meaningful change must be recorded, as required by `information/DOCUMENTATION_MAINTENANCE_RULES.md`.

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
