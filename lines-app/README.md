# Lines App - Venue Management System

**Version:** v1.2.0 (Production-Ready + Live Database)  
**Status:** ✅ Live in Production with Supabase  
**Production URL:** https://lines-app.vercel.app  
**Database:** Supabase PostgreSQL (11 tables, seed data)

---

## 🎯 Overview

Lines is a production-ready venue management system for managing recurring events, schedules, and venue operations.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, NextAuth.js, and Prisma.

---

## ✨ Features

### 🔐 Authentication & Authorization

- ✅ User registration & login (email/password)
- ✅ Role-based access control (User/Admin)
- ✅ Protected routes via middleware
- ✅ JWT session management
- ✅ Bcrypt password hashing

### 🏢 Venue Management

- ✅ Create, view, delete venues
- ✅ User-scoped venues (users see only their own)
- ✅ Venue contact details (phone, email, address)
- ✅ Workspace shell with sidebar navigation

### 📋 Core Business Logic (Backend Ready)

- ✅ **Lines:** Schedule generation, color palette (15 unique colors), occurrences
- ✅ **Events:** Status derivation, navigation
- ✅ **Calendar:** Aggregation, overnight rules, hour compression
- ✅ **Settings:** Menus + Zones/Tables services

### 🎨 Design & UX

- ✅ Tailwind CSS v3 with dark theme
- ✅ Responsive design (mobile + desktop)
- ✅ RTL support for Hebrew
- ✅ shadcn/ui infrastructure ready
- ✅ Client-side i18n (Hebrew + English)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:push

# (Optional) Seed demo data
pnpm db:seed

# Start development server
pnpm dev
```

Visit http://localhost:3000

**Demo Credentials** (after seed):

- Admin: `admin@lines.app` / `admin123`
- User: `demo@lines.app` / `demo123`

---

## 📦 Project Structure

```
lines-app/
├── src/
│   ├── app/              # Next.js App Router (routing only)
│   ├── modules/          # Feature modules (7 modules)
│   │   ├── auth/         # Authentication
│   │   ├── venues/       # Venue management
│   │   ├── venue-info/   # Contact details
│   │   ├── venue-settings/ # Menus, Zones, Tables
│   │   ├── lines/        # Lines & occurrences
│   │   ├── events/       # Event detail
│   │   ├── calendar/     # Calendar views
│   │   └── workspace-shell/ # Shared workspace layout
│   ├── core/             # Infrastructure
│   │   ├── db/           # Repositories
│   │   ├── auth/         # Auth config
│   │   ├── validation/   # Zod helpers
│   │   ├── http/         # API utilities
│   │   └── config/       # Environment, constants
│   ├── shared/           # Reusable UI + layouts
│   └── utils/            # Generic helpers
├── docs/                 # Complete documentation
├── prisma/               # Database schema + migrations
└── tests/                # Unit, integration, e2e tests
```

---

## 🛠️ Development Scripts

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm start                # Start production server

# Quality
pnpm lint                 # Run ESLint
pnpm format:fix           # Format with Prettier
pnpm test                 # Run tests

# Database
pnpm db:generate          # Generate Prisma client
pnpm db:push              # Push schema to database
pnpm db:migrate           # Create migration
pnpm db:seed              # Seed demo data
pnpm db:test              # Test DB connection
pnpm db:studio            # Open Prisma Studio
```

---

## 🏗️ Architecture Principles

1. **Modular:** Each feature isolated in `src/modules/<feature>`
2. **Type-Safe:** Strict TypeScript + Zod validation
3. **Layered:** Clear separation (routing / UI / business / data)
4. **Documented:** Every module has README + specs in `docs/FEATURE_SPECS/`
5. **Tested:** Infrastructure for unit/integration/e2e tests

---

## 📚 Documentation

All documentation in `docs/`:

- `ARCHITECTURE.md` - System overview
- `DATA_MODEL.md` - Complete entity definitions
- `API_REFERENCE.md` - All endpoints
- `FEATURE_SPECS/` - Per-feature specifications
- `CHANGELOG.md` - Version history

---

## 🔄 Deployment

**Production:** Vercel (auto-deploy on push to `main`)

```bash
# Deploy to production
git add .
git commit -m "feat: your changes"
git push origin main
# Vercel auto-deploys
```

**CI/CD:** GitHub Actions runs on every push:

- Lint
- Tests
- Build

---

## 🎯 Current Version (v1.1.0)

**Implemented:**

- ✅ Full backend for all features
- ✅ Venues CRUD with full UI
- ✅ Workspace navigation
- ✅ Venue Info form
- ✅ Auth (login/register)
- ✅ User-scoped data

**Coming in v1.2:**

- 🔜 Lines full UI (forms, calendar integration)
- 🔜 Event detail pages
- 🔜 Menus & Zones/Tables UI
- 🔜 Email verification
- 🔜 OAuth providers

---

## 📄 License

Private - All Rights Reserved

---

**Built with ❤️ using Cursor AI + Next.js 15**
