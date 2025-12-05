2025-12-05 – Lines App – Project Structure Guide (Stub)

---

## Purpose

Define the folder structure, modularity, and internal code rules for `lines-app`.

This project follows the reference architecture in `information/PROJECT_STRUCTURE_GUIDE.md`:

- `src/app/` – Routing only (pages, layouts, API handlers) that delegate to feature modules.
- `src/modules/` – Core business features (each with `ui/`, `actions/`, `services/`, `schemas/`, `types.ts`, `index.ts`, `README.md`).
- `src/core/` – Infrastructure, providers, DB repositories, validation, config.
- `src/shared/` – Reusable UI and layout components across modules.
- `src/utils/` – Generic helpers (no domain-specific logic).
- `docs/` – Documentation, architecture guides, and changelogs.

This file must be expanded into a full, project-specific version and kept aligned with the actual repository structure.

---

## Validation Rules (Summary)

- No business logic in `src/app/`.
- No module imports another module directly; shared logic goes to `core/` or `shared/`.
- All external providers (Prisma client, etc.) live under `src/core/integrations/`.
- Each module defines its own schemas and types and has a local `README.md`.

