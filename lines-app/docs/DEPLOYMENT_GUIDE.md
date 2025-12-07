2025-12-05 – Lines App – Deployment Guide

---

Describe how to deploy the Lines app to staging and production (Vercel, env vars, build commands).

This file must be updated for every new build/release according to `information/DOCUMENTATION_MAINTENANCE_RULES.md`.

---

## Local Development

1. Install dependencies:
   - `pnpm install`
2. Run dev server:
   - `pnpm dev`

## Build & Test Before Deployment

Run from the `lines-app` directory:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Vercel Deployment (High Level)

1. Create a new project in Vercel pointing to this repository and the `lines-app` subdirectory.
2. Configure environment variables:
   - `POSTGRES_PRISMA_URL` - Database connection string
   - `NEXTAUTH_SECRET` - NextAuth secret
   - `NEXTAUTH_URL` - Application URL
3. **Build Command**: Use `pnpm build:deploy` which runs:
   - `prisma generate` - Generate Prisma Client
   - `prisma migrate deploy` - Apply pending migrations
   - `next build` - Build Next.js application
4. **Install Command**: `pnpm install --frozen-lockfile`
5. Push to the `main` branch – Vercel will automatically build and deploy.

### Database Migrations

Migrations are automatically applied during deployment via the `build:deploy` script. The script runs `prisma migrate deploy` which:
- Applies all pending migrations to the production database
- Does not create new migrations (use `prisma migrate dev` locally)
- Is safe for production use

### CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:
- Runs on every push to `main` and pull requests
- Builds and tests the application
- Applies database migrations
- Deploys to Vercel (on main branch only)

### Current Production URL

- `https://lines-10qilj4im-ben-swissa.vercel.app`
