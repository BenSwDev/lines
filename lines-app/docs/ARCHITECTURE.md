# Lines App - System Architecture

**Last Updated:** 2025-12-05  
**Version:** v0.1.0 (Initial Scaffold) → v1.0.0 (MVP Ready)

---

## Technology Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Backend:** Next.js API Routes + Server Actions
- **Database:** PostgreSQL via Prisma ORM
- **Deployment:** Vercel
- **Package Manager:** pnpm
- **Testing:** Vitest (unit/integration), Playwright (e2e)
- **Linting:** ESLint, Prettier

---

## Architecture Layers

### 1. Routing Layer (`src/app`)

- **Purpose:** URL routing only, no business logic
- **Contents:** Pages, layouts, API route handlers
- **Pattern:** Delegates all logic to modules

### 2. Feature Modules (`src/modules`)

- **Purpose:** Self-contained business features
- **Pattern:** Each module has:
  - `ui/` - React components
  - `actions/` - Next.js server actions
  - `services/` - Business logic
  - `schemas/` - Zod validation
  - `types.ts` - TypeScript types
  - `index.ts` - Public exports
  - `README.md` - Module documentation

**Current Modules:**

- `venues` - Venue management (home page)
- `venue-info` - Contact details
- `venue-settings` - Menus, Zones & Tables
- `lines` - Line scheduling & occurrences
- `events` - Event detail & status
- `calendar` - Calendar views
- `workspace-shell` - Shared workspace layout

### 3. Core Infrastructure (`src/core`)

- **db/** - Database repositories (vendor-agnostic interfaces)
- **integrations/** - External providers (Prisma client)
- **validation/** - Shared Zod helpers
- **http/** - API response utilities
- **config/** - Environment variables, constants

### 4. Shared Components (`src/shared`)

- **ui/** - Reusable UI primitives (Button, Card, Modal, etc.)
- **layout/** - Layout components (AppShell, SidebarNav, TopBar)

### 5. Utilities (`src/utils`)

- **Generic helpers only** (date, time, i18n)
- No domain-specific logic

---

## Data Flow

```
User → UI Component → Server Action → Service → Repository → Database
                                    ↓
                              Validation (Zod)
```

For API routes:

```
HTTP Request → API Route Handler → Service → Repository → Database
                      ↓
               Validation (Zod)
```

---

## Domain Model

See `docs/DATA_MODEL.md` for full entity definitions.

**Core Entities:**

- Venue → VenueDetails (1:1)
- Venue → Menu (1:N)
- Venue → Zone → Table (1:N:N)
- Venue → Line → LineOccurrence (1:N:N)

---

## Design Principles

1. **Modularity:** Each feature isolated, no cross-module imports
2. **Type Safety:** Strict TypeScript, Zod validation everywhere
3. **Separation of Concerns:** Clear layers (routing/UI/business/data)
4. **RTL-First:** Hebrew UI, right-to-left layouts
5. **Documentation-Driven:** All changes reflected in docs immediately

---

## Future Enhancements

- Authentication & multi-user support
- Real-time collaboration
- Advanced calendar integrations (Google Calendar, etc.)
- Analytics & reporting
- Mobile app (React Native)
