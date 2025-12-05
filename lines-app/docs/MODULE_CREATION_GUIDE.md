2025-12-05 – Lines App – Module Creation Guide (Stub)

---

## Purpose

Explain, step by step, how to create a new feature module in `src/modules/<feature>/` following the project structure rules.

## Basic Steps

1. Create directory: `src/modules/<feature>/`.
2. Inside it, create:
   - `ui/`
   - `actions/`
   - `services/`
   - `schemas/`
   - `types.ts`
   - `index.ts`
   - `README.md`
3. Add routing that delegates to this module from `src/app/`.
4. Update `docs/FEATURE_SPECS/<feature>.md`, `docs/API_REFERENCE.md` (if APIs change), and `docs/CHANGELOG.md`.

See `information/PROJECT_DOCUMENTATION_OVERVIEW.md` for the full documentation rules. This file must be expanded with concrete examples as modules are implemented.
