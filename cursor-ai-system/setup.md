# Cursor AI System Setup
Generated: 2025-12-05

## Purpose & Usage
- Canonical blueprint for all Cursor agents, workflows, shortcuts, and rules.
- Cursor does **not** auto-read these files; when needed, instruct Cursor: “Load `/cursor-ai-system/setup.md` and recreate all bots, rules, workflows, and shortcuts.”
- Keep this file version-controlled; use the subfolders here for per-agent/workflow refinements.

## Directory Map
- `setup.md` (this file): master definition.
- `agents/`: optional per-agent deep specs.
- `workflows/`: extended workflow playbooks.
- `rules/`: global/strong rules or guardrails.
- `prompts/`: reusable prompt templates.
- `documentation-sync/`: rules for keeping docs in sync.

## Global Rules (from specification)
- Follow best practices: architecture, security, performance, readability, maintainability, modularity, documentation, DevOps, UI/UX.
- Reviews must produce: summary, list of issues, list of suggested fixes, auto-fix patches when possible, updated documentation when relevant.
- Keep business logic intact; work across any language.
- Merge results into a final unified daily report.

## Agents (19)
1) Code Correctness Bot — analyze correctness, logic flow, edge cases, error handling; propose fixes/patches.
2) Architecture Review Bot — check folder structure, modularity, layering, patterns; suggest restructures.
3) Maintainability & Modularity Bot — check function size, naming, DRY, rule of 1/3, SOLID; suggest refactors.
4) Performance Optimization Bot — find bottlenecks (calls, complexity, renders); propose optimizations.
5) Security Audit Bot — OWASP, validation/sanitization, permissions, secrets/tokens/cookies handling.
6) Dependency Health Bot — detect outdated/deprecated/vulnerable packages; propose upgrades.
7) Testing Coverage Bot — assess unit/integration/e2e coverage; suggest/add tests.
8) API Contract Review Bot — ensure frontend↔backend consistency, DTOs/types/OpenAPI, validations.
9) DB Quality Bot — schema design, indexing, normalization, relations, query performance.
10) DevOps Review Bot — CI/CD, build steps, Docker/caching, cloud configs.
11) Observability Bot — logs, metrics, tracing, error tracking, alert hygiene.
12) Documentation Bot — update README/CHANGELOG/architecture/dev notes as needed.
13) Code Style Consistency Bot — lint/format/naming/imports/unused cleanup.
14) UX Usability Bot — user flows, friction, readability, accessibility clarity.
15) UI Design Consistency Bot — spacing, typography, alignment, design-system reuse.
16) Accessibility Bot — WCAG, keyboard navigation, ARIA, RTL/LTR compatibility.
17) Localization Bot — missing translations, RTL/LTR handling, duplicated strings.
18) Business Alignment Bot — verify implementation matches product definitions and feature requirements.
19) Steve Jobs–Level Chief Product & Design Visionary Bot — world-class design director: analyze UI/UX with cognitive load, visual hierarchy, clarity, interactions, brand consistency; redesign layouts, components, flows; generate production code; document design rationale and visual systems.

## Master AI Quality Controller
- Task: run all saved agents in order; merge findings into one report; generate patches; update docs; prep PR; ask for approval before applying changes.
- Workflow order (must follow): Code correctness → Architecture → Modularity → Performance → Security → Dependencies → Tests → API Contracts → Database → DevOps → Observability → Documentation → Style → UX → UI Consistency → Accessibility → Localization → Business alignment → Design Vision → Final report → Fixes → Prepare PR.

## Daily Workflow: “Daily AI Full Scan”
- Schedule: every day at 09:00.
- Steps:
  1) Pull latest project state.
  2) Run “Master AI Quality Controller”.
  3) Generate markdown report at `/AI_REPORTS/daily_report.md`.
  4) Create PR named `AI Daily Improvements – {DATE}`.
  5) Ask user for approval inside Cursor.

## Shortcuts
- “run full ai scan” → triggers Master Bot.
- “fix everything” → applies all patches.
- “update docs” → runs only Documentation Bot.
- “review code quality” → runs bots 1, 2, 3, 13.
- “review deployment pipeline” → runs bots 10 and 11.

## Maintenance Notes
- Keep agents/workflows/shortcuts names and order exactly as above.
- Extend with detailed instructions in `agents/` or `workflows/` as needed; keep `setup.md` as the single source of truth.
- When Cursor loses context, reload from this file to recreate the full system.


