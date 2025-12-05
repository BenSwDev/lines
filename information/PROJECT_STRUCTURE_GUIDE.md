📘 PROJECT_STRUCTURE_VALIDATION_GUIDE.md

(For Cursor / GPT / Copilot / AI Assistants)

⸻

🧭 Objective

This document defines the reference architecture for validating a Next.js 15 (App Router) project built with a modular, feature-first, enterprise-grade structure.

When read by an AI assistant (Cursor / GPT / Copilot), it should:
	1.	Analyze the entire repository structure.
	2.	Compare it against the rules below.
	3.	Report any inconsistencies, violations, or files that should be refactored.
	4.	Suggest how to restructure files or folders to reach full modular and scalable perfection.

⸻

🧱 Reference Architecture Overview

Layer	Purpose
app/	Routing only — pages, layouts, and API route handlers that delegate logic to feature modules.
modules/	Core business features — each module is self-contained and includes UI, actions, services, schemas, and types.
core/	Infrastructure, providers, and shared backend utilities (DB, API clients, validation, auth, config).
shared/	Reusable UI and layout components across modules.
utils/	Generic helpers (formatters, date utilities, etc.).
docs/	Documentation, architecture guides, and changelogs.


⸻

🧩 Required Module Structure

Every feature must be located under:
src/modules/<feature-name>/

Each module must contain:

ui/         → React components (client)
actions/    → Server actions ("use server")
services/   → Business logic + data access via core repositories
schemas/    → Zod or validation schemas
types.ts    → Local TypeScript interfaces
index.ts    → Central export file
README.md   → Local documentation


⸻

⚙️ Validation Rules

1. App Router Layer
	•	Must not contain business logic.
	•	Only imports components or actions from modules.

2. Feature Isolation
	•	No module should import directly from another module.
	•	Shared logic must live in core/ or shared/.

3. Services
	•	Must not include UI logic.
	•	Must call only:
	•	@/core/db/... repositories
	•	@/core/auth or @/core/security
	•	@/core/integrations/...

4. Validation
	•	Each feature must define its own Zod schema.
	•	Validation must occur before any data persistence or API call.

5. Type Safety
	•	Strict TypeScript mode (no any).
	•	Each module maintains its own types.ts.

6. Integrations & Providers
	•	All external providers (e.g., Supabase, Firebase, Prisma) must live under src/core/integrations/<provider>/.
	•	No module may directly instantiate provider clients.
	•	core/db/ defines vendor-agnostic repositories and exposes implementations per provider.

7. Documentation Discipline
	•	Every new feature must include:
	•	Local README.md
	•	Entry in docs/CHANGELOG.md

8. Code Quality
	•	ESLint, Prettier, TypeScript strict, and tests (unit/integration/e2e) must pass.

⸻

📂 Ideal Directory Reference

src/
  app/
    (auth)/
    (dashboard)/
    (public)/
    api/
    globals.css
  modules/
    <feature>/
      ui/
      actions/
      services/
      schemas/
      types.ts
      index.ts
      README.md
  core/
    auth/
    security/
    db/
      repositories/
      supabase/
      prisma/
      mongo/
      index.ts
    integrations/
      supabase/
        client.ts
        auth.ts
        rbac.ts
    http/
    validation/
    config/
  shared/
    ui/
    layout/
  utils/
  docs/
    ARCHITECTURE.md
    PROJECT_STRUCTURE_GUIDE.md
    PROJECT_STRUCTURE_VALIDATION_GUIDE.md
    CHANGELOG.md


⸻

🧠 What AI Should Do

When this file exists, the assistant (Cursor / GPT / Copilot) must:
	1.	Scan the repository and compare its actual structure to this specification.
	2.	Report any deviations, such as:
	•	Missing folders or misplaced logic.
	•	Business logic inside /app/.
	•	Direct Supabase usage in modules.
	•	Missing schemas, types, or README files.
	3.	Propose refactor steps to achieve the perfect modular setup.
	4.	Identify orphan files (logic without a module).
	5.	Validate documentation presence (ARCHITECTURE.md, CHANGELOG.md, module READMEs).
	6.	Suggest new core providers if multiple data sources are detected.

⸻

✅ Validation Criteria Summary

Category	Perfect Condition
Modularity	Each feature isolated under /modules/<feature>
Routing	No logic inside /app/
Repositories	Defined in /core/db/repositories/
Providers	All vendor SDKs under /core/integrations/
Validation	Every module has schemas/ folder
Documentation	Every module has README.md and changelog entry
Shared UI	Exists under /shared/ui/
Type Safety	No any, strict mode enabled
AI-Friendly	Clear folder semantics and exports
Testing	Unit/integration tests structured per module


⸻

🧩 Expected AI Output

When running this validation, the AI assistant should output a structured report like:

PROJECT STRUCTURE VALIDATION REPORT

[OK] All modules follow required folder pattern.
[WARN] src/app/api/users/ contains business logic → move to modules/users/actions/
[WARN] Supabase client instantiated inside src/modules/leads/services → move to core/integrations/supabase/client.ts
[OK] All modules include README.md and schemas.
[SUGGESTION] Add repositories interfaces under core/db/repositories/.


⸻

🧾 Final Note

This guide represents the absolute reference standard for modular, maintainable, AI-compatible architecture.
Any deviation should be treated as a candidate for refactoring until full compliance is achieved.