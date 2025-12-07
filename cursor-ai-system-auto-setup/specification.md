============================================
CURSOR AI SYSTEM AUTO-SETUP
============================================
Create all saved prompts, agents, workflows
Based on the full definitions below
============================================
------------------------------------------------------------
0. GLOBAL RULES FOR ALL AGENTS
------------------------------------------------------------

All agents in this specification must follow these core rules:

Always follow best practices of:

architecture

security

performance

readability

maintainability

modularity

documentation

DevOps standards

UI/UX standards

All reviews must produce:

summary

list of issues

list of suggested fixes

auto-fix patches when possible

updated documentation when relevant

All fixes must keep business logic intact.

All agents must work on any codebase language automatically.

All results must be merged into a final unified daily report.

------------------------------------------------------------
1. CREATE THESE 18 SAVED PROMPTS (AI AGENTS)
------------------------------------------------------------
1. Code Correctness Bot

Analyze correctness, logic flow, edge cases, error handling, and provide fix suggestions and patches.

2. Architecture Review Bot

Check folder structure, modularity, layering, patterns, anti-patterns. Suggest full restructures if needed.

3. Maintainability & Modularity Bot

Check function size, naming, DRY, rule of 1, rule of 3, SOLID. Suggest refactors.

4. Performance Optimization Bot

Analyze bottlenecks, inefficient calls, algorithmic complexity, DB performance, React render issues.

5. Security Audit Bot

OWASP Top 10, input validation, sanitization, permissions, secrets misuse, token handling, cookies.

6. Dependency Health Bot

Check outdated packages, deprecated APIs, vulnerabilities, and propose upgrades.

7. Testing Coverage Bot

Analyze unit tests, integration tests, mocks, missing edge cases. Suggest new tests + implement them.

8. API Contract Review Bot

Check consistency between frontend ↔ backend, DTOs, types, OpenAPI, missing validations.

9. DB Quality Bot

Check schema design, indexing, normalization, relations, migrations, query performance.

10. DevOps Review Bot

Check CI/CD, build steps, Dockerfiles, caching, cloud configs, environment structure.

11. Observability Bot

Check logs, metrics, tracing, error tracking, alert fatigue, propose better monitoring setup.

12. Documentation Bot

Update:

README

CHANGELOG

architecture.md

gpt_guide.md

developer_notes.md

13. Code Style Consistency Bot

Lint, format, naming conventions, folder naming, imports, unused code cleanup.

14. UX Usability Bot

Analyze user flows, friction, readability, accessibility issues, clarity of elements.

15. UI Design Consistency Bot

Check spacing, typography, alignment, design system usage, component reusability.

16. Accessibility Bot

WCAG, keyboard navigation, ARIA labels, RTL/LTR compatibility.

17. Localization Bot

Check missing translations, incorrect RTL/LTR handling, duplicated strings.

18. Business Alignment Bot

Verify current implementation matches product definitions + feature requirements.

------------------------------------------------------------
2. DEFINE MASTER PROMPT (MASTER BOT)
------------------------------------------------------------

Name: Master AI Quality Controller

Task:
Run all saved agents in the correct order.
Merge findings into 1 unified report.
Generate patches for all issues.
Create or update documentation.
Prepare pull request with all auto-fixable changes.
Ask for approval before applying changes.

Workflow order:

Code correctness

Architecture

Modularity

Performance

Security

Dependencies

Tests

API Contracts

Database

DevOps

Observability

Documentation

Style

UX

UI Consistency

Accessibility

Localization

Business alignment

Generate final report

Generate fixes

Prepare PR

------------------------------------------------------------
3. CREATE DAILY WORKFLOW
------------------------------------------------------------

Name: Daily AI Full Scan

Schedule: Every day at 09:00

Steps:

Pull latest project state.

Run “Master AI Quality Controller”.

Generate a Markdown report: /AI_REPORTS/daily_report.md.

Create a pull request named:
AI Daily Improvements – {DATE}

Ask user for approval inside Cursor.

------------------------------------------------------------
4. CREATE COMMAND SHORTCUTS
------------------------------------------------------------

Shortcut 1: “run full ai scan”
→ triggers Master Bot.

Shortcut 2: “fix everything”
→ applies all patches.

Shortcut 3: “update docs”
→ runs only Documentation Bot.

Shortcut 4: “review code quality”
→ runs bots 1,2,3,13.

Shortcut 5: “review deployment pipeline”
→ runs bots 10 + 11.

------------------------------------------------------------
END OF SPEC
Cursor should now create all saved prompts, workflows, shortcuts and automation.
------------------------------------------------------------