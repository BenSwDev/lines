🧾 When to Create, Update, and Maintain Each Document

📘 Save this document as
docs/DOCUMENTATION_MAINTENANCE_RULES.md

⸻

🔹 Phase 1 – Before Writing Any Code

At this stage, define the vision, architecture, and project foundation.
Goal: create the documents that set direction and standards for everything that follows.

File	Action	When and Why
ARCHITECTURE.md	🟢 Create	As soon as the main tech stack is chosen (Next.js, DB, etc.) to define the overall system structure.
PROJECT_STRUCTURE_GUIDE.md	🟢 Create	At the very beginning, before any code — to ensure a fixed folder structure and a consistent way of working.
DATA_MODEL.md	🟢 Create	Before creating the first DB or Prisma schema. Required so that every entity is documented from day one.
SYSTEM_REQUIREMENTS.md	🟢 Create	Right after the initial scoping — to define what the system must and must not do.
ROADMAP.md	🟢 Create	Once initial development goals are set (MVP → Alpha → Beta → Production).
MODULE_CREATION_GUIDE.md	🟢 Create	After one correct module template is defined (Template Feature) — to replicate it for all other features.


⸻

🔹 Phase 2 – Initial Development (MVP Phase)

This is when core code foundations are implemented.
Documents are updated whenever new code, new structure, or architectural changes are introduced.

File	Action	When and Why
FEATURE_SPECS/<feature>.md	🟢 Create	Before starting development of any new feature. Describes logic, UI, and API for that feature.
API_REFERENCE.md	🟡 Update	Whenever a route, endpoint, or server action is added or changed.
DATA_MODEL.md	🟡 Update	With every DB or data model change (e.g., adding a status column).
ROADMAP.md	🟡 Update	At the end of every sprint (usually bi-weekly) — to reflect what was completed and what was deferred.
MILESTONES.md	🟢 Create	When team/sprint work begins. Update at the end of each phase.
TASKS_BREAKDOWN.md	🟢 Create	At the start of every sprint or when a new feature is added.
CHANGELOG.md	🔁 Update	With every meaningful merge, module addition, API change, or significant bug fix.
.ENV.EXAMPLE	🟢 Create / 🟡 Update	When new environment variables are introduced (API keys, DB URL, secrets).


⸻

🔹 Phase 3 – Integration and Testing (Integration & QA Phase)

At this stage the system runs and we begin testing and improving.

File	Action	When and Why
QA_PLAN.md	🟢 Create	When there are enough features to test (typically at the end of MVP).
TEST_MATRIX.md	🟢 Create	When initial tests (unit/integration/e2e) are started.
CI_CD_PIPELINE.md	🟢 Create	When the first automated build or test pipeline is added (GitHub Actions / Jenkins).
QA_PLAN.md	🟡 Update	Whenever new test types are added (e.g., visual testing or performance).
TEST_MATRIX.md	🔁 Update	With every feature change or test addition.


⸻

🔹 Phase 4 – Deployment (Deployment / Staging / Production)

Here, operational documents become critical.

File	Action	When and Why
DEPLOYMENT_GUIDE.md	🟢 Create	Right before the first deployment to staging or production. Include install, build, and env setup instructions.
CI_CD_PIPELINE.md	🟡 Update	When new pipeline stages are added (e.g., automatic deploy or rollback).
CHANGELOG.md	🔁 Update	With every version released to production. Include date, version, and contents.
ROADMAP.md	🔁 Update	When a significant phase is completed (e.g., “Beta Released”).


⸻

🔹 Phase 5 – Maintenance and Continuous Improvements (Post-Launch / Continuous Development)

During this phase we maintain, add features, improve performance, and optimize.

File	Action	When and Why
FEATURE_SPECS/<feature>.md	🔁 Update	When functionality is added to an existing feature or its flow changes.
API_REFERENCE.md	🔁 Update	Whenever an endpoint or response changes structurally.
DATA_MODEL.md	🔁 Update	When an entity is added or removed.
QA_PLAN.md	🔁 Update	When a new module is added for testing.
TEST_MATRIX.md	🔁 Update	After every QA cycle (end of sprint).
CHANGELOG.md	🔁 Must update	On every release, bug fix, or major refactor.
ROADMAP.md / MILESTONES.md	🟡 Update	Quarterly or after completing a version.


⸻

⚙️ General Rules for Document Updates

Rule	Explanation
✏️ “If it isn’t written — it didn’t happen.”	Every code, architecture, or DB change must be documented immediately.
🧠 Cursor learns from docs, not code.	To guide the AI, it must read up-to-date documents.
🔄 Change → Double update.	If you changed a feature: update both FEATURE_SPECS and CHANGELOG.
🔍 Tests always with documentation.	Every new test must be recorded in TEST_MATRIX.
🧱 New release → Update three documents:	1️⃣ CHANGELOG.md  2️⃣ ROADMAP.md  3️⃣ DEPLOYMENT_GUIDE.md
💡 Don’t create files without reason.	Every new file must be predefined in PROJECT_STRUCTURE_GUIDE or in the OVERVIEW.


⸻

🧠 How Cursor Uses This in Real Time

Event	Cursor Action	Involved File
New module creation	Reads MODULE_CREATION_GUIDE.md to build the skeleton.	MODULE_CREATION_GUIDE.md
DB change	Updates the schema in DATA_MODEL.md and opens a PR with code adjustments.	DATA_MODEL.md
API change	Creates/updates endpoints and updates the documentation.	API_REFERENCE.md
Failed build	Checks CI_CD_PIPELINE.md to understand build stages.	CI_CD_PIPELINE.md
Writing tests	Uses QA_PLAN.md and TEST_MATRIX.md to know what to test.	QA_PLAN.md / TEST_MATRIX.md
New release	Adds a version in CHANGELOG.md and updates milestones.	CHANGELOG.md / ROADMAP.md


⸻

🧾 Frequency Summary

Frequency	Primary Files
🕐 One-time (project setup)	ARCHITECTURE.md, PROJECT_STRUCTURE_GUIDE.md, SYSTEM_REQUIREMENTS.md
🔁 Weekly	ROADMAP.md, MILESTONES.md, CHANGELOG.md, TASKS_BREAKDOWN.md
🧪 On any change in code / API / DB	DATA_MODEL.md, FEATURE_SPECS, API_REFERENCE.md
⚙️ On every new build / release	CI_CD_PIPELINE.md, DEPLOYMENT_GUIDE.md, CHANGELOG.md
🧠 Monthly or quarterly	QA_PLAN.md, TEST_MATRIX.md


