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
2. Configure environment variables (e.g., `DATABASE_URL`).
3. Ensure the build command is `pnpm build` and install uses `pnpm`.
4. Push to the `main` branch – Vercel will automatically build and deploy.

### Current Production URL

- `https://lines-10qilj4im-ben-swissa.vercel.app`
