Central Guide for Managing and Documenting a Modular Next.js 15 App Router Project

⸻

🎯 Purpose of This Document

This document defines, clearly and unambiguously:
  1. Which documents must exist in the project
  2. The purpose of each document
  3. What each should contain (structure and example)
  4. How Cursor and GPT should use them to develop features and automate work

⸻

🧭 Logical Structure of the Documentation System

Documents are divided into five main categories:

Category	Primary Goal	Main Outputs
🔹 Architecture & Infrastructure	Define the system’s skeleton and how everything is built	Project structure, modules, data
🔹 Specification & Planning	Define what the system does and how it behaves	System requirements, feature specs, API
🔹 Development Management	Organize the work in phases and in parallel	Roadmap, goals, tasks
🔹 Testing & Quality	Ensure everything works according to standards	Test plan, test matrix
🔹 Operations & Maintenance	Ensure things are built, tested, and deployed correctly	DevOps, versions, env vars


⸻

🧩 Full Breakdown by Category

⸻

🏗️ 1. Architecture & Infrastructure

1.1 ARCHITECTURE.md
Purpose: High-level system description.
Explains existing parts (Frontend, Backend, DB) and how they interact.

Example content:

# System Architecture
- Frontend: Next.js 15 (App Router)
- Backend: Node.js API Routes
- Database: PostgreSQL via Prisma
- Caching: Redis
- Authentication: NextAuth.js
- File Storage: AWS S3
- Flow:
  Client → Next.js Server → DB/External APIs


⸻

1.2 PROJECT_STRUCTURE_GUIDE.md
Purpose: Define folder structure, modularity, and internal code rules.
(You already have a full version of this ✅)

Example:

src/
  modules/
    <feature>/
      ui/
      actions/
      services/
      schemas/
      types.ts


⸻

1.3 MODULE_CREATION_GUIDE.md
Purpose: A precise technical guide for creating a new module, with clear steps.
Enables parallel development by both developers and Cursor.

Example:

# Creating a New Module
1. Create a new folder under src/modules/<feature>
2. Add files:
   - ui/
   - actions/
   - services/
   - schemas/
   - types.ts
3. Add the route under app/
4. Update CHANGELOG.md


⸻

1.4 DATA_MODEL.md
Purpose: Document data structures, tables, and relationships.

Example:

# Entity: User
- id (UUID)
- name (string)
- email (string, unique)
- role (enum: admin, user)
- createdAt (Date)

# Relationships
User (1) → (N) Posts


⸻

🧠 2. Specification & Planning

2.1 SYSTEM_REQUIREMENTS.md
Purpose: Document system functional and non-functional requirements.
This is the primary specification document.

Example:

# Functional Requirements
- The system shall allow sign-up and login.
- Users can update their personal profile.
- Role-based authorization.

# Non-functional
- Response < 300ms
- Availability 99.9%
- Support Dark/Light mode


⸻

2.2 FEATURE_SPECS/<feature>.md
Purpose: Document each feature separately.
Each feature gets its own file within the FEATURE_SPECS folder.

Example:

# Feature: Notifications
## Flow
1. Event is generated on the server
2. A notification is sent to the user
3. A log entry is recorded

## API
POST /api/notifications
Response: { success: true }


⸻

2.3 API_REFERENCE.md
Purpose: Full documentation of all endpoints.
Required by both Frontend and QA.

Example:

GET /api/users
- Description: Get all users
- Response: [{ id, name, email }]

POST /api/users
- Body: { name, email, password }


⸻

📆 3. Development Management

3.1 ROADMAP.md
Purpose: Present the overall plan in major phases.

Example:

# Phase 1: MVP
- Authentication
- Dashboard
- Database setup

# Phase 2: Expansion
- Roles & Permissions
- Notifications


⸻

3.2 MILESTONES.md
Purpose: Set milestones with dates and progress percentages.

Example:

| Milestone | Description | Target Date | Status |
|------------|--------------|--------------|---------|
| MVP Ready | 3 core modules | 2025-12-01 | 🟡 In Progress |
| Beta Launch | Public demo | 2026-02-01 | ⚪ Planned |


⸻

3.3 TASKS_BREAKDOWN.md
Purpose: Break tasks into small units for parallel execution.

Example:

- [ ] Frontend: UI for login page
- [ ] Backend: validate user input
- [ ] Docs: update CHANGELOG


⸻

🧪 4. Testing & Quality

4.1 QA_PLAN.md
Purpose: Define testing strategy, test types, and tools.

Example:

# Test Types
- Unit: Jest
- Integration: Supertest
- E2E: Playwright

# Goals
- 100% passing tests before merge


⸻

4.2 TEST_MATRIX.md
Purpose: List all tests by module.

Example:

| Module | Test Type | Scenario | Expected | Result |
|---------|------------|-----------|-----------|--------|
| Auth | Unit | Login success | JWT token | ✅ |
| Auth | E2E | Wrong password | 401 | ✅ |


⸻

⚙️ 5. Operations & Maintenance

5.1 DEPLOYMENT_GUIDE.md
Purpose: Complete guide for deploying to different environments.

Example:

# Local Setup
npm install
npm run dev

# Production
vercel deploy


⸻

5.2 CI_CD_PIPELINE.md
Purpose: Describe the build and automated testing pipeline.

Example:

# GitHub Actions Workflow
1. Lint
2. Test
3. Build
4. Deploy to staging


⸻

5.3 CHANGELOG.md
Purpose: Ordered history of changes by date and version.

Example:

## [1.0.1] - 2025-10-30
- Added Notifications module
- Fixed login redirect bug


⸻

5.4 .ENV.EXAMPLE
Purpose: List of environment variables required to run the project.

Example:

DATABASE_URL=
NEXTAUTH_SECRET=
OPENAI_API_KEY=


⸻

🧠 How Cursor Will Use These Documents

Action Type	How Cursor Uses the Docs
Create a new feature	Reads MODULE_CREATION_GUIDE.md and scaffolds a full folder by the template.
Connect an API	Uses API_REFERENCE.md to know how to write fetch/route correctly.
Testing	Uses QA_PLAN.md to auto-generate which tests to create.
Suggest a refactor	Reads PROJECT_STRUCTURE_GUIDE.md to detect any rule violations.
Expand data	Checks DATA_MODEL.md to add fields consistently.
Create documentation	Updates CHANGELOG.md automatically based on actions performed.


⸻

📋 Summary of Required Documents

Category	File	Primary Role	Required / Recommended
Architecture	ARCHITECTURE.md	General system overview	Required
Architecture	PROJECT_STRUCTURE_GUIDE.md	Folder structure and development rules	Required
Architecture	MODULE_CREATION_GUIDE.md	How to create a new module	Required
Architecture	DATA_MODEL.md	Data model description	Required
Specification	SYSTEM_REQUIREMENTS.md	Overall system requirements	Required
Specification	FEATURE_SPECS/	Separate spec per feature	Required
Specification	API_REFERENCE.md	Full API documentation	Required
Management	ROADMAP.md	Phased plan and goals	Required
Management	MILESTONES.md	Milestones and dates	Recommended
Management	TASKS_BREAKDOWN.md	Task breakdown	Required
Testing	QA_PLAN.md	Testing strategy	Required
Testing	TEST_MATRIX.md	Module-by-module test list	Recommended
Operations	DEPLOYMENT_GUIDE.md	Deployment guide	Required
Operations	CI_CD_PIPELINE.md	Build pipeline documentation	Required
Operations	CHANGELOG.md	Version history	Required
Operations	.ENV.EXAMPLE	Environment variables	Required

⸻

🤖 AI System Specification (Cursor)
- Canonical source: `/cursor-ai-system/setup.md`.
- Supporting folders: `/cursor-ai-system/agents`, `/cursor-ai-system/workflows`, `/cursor-ai-system/rules`, `/cursor-ai-system/prompts`, `/cursor-ai-system/documentation-sync`.
- Cursor does not auto-read these files; explicitly instruct it to load from `setup.md` when recreating agents/workflows/shortcuts.


