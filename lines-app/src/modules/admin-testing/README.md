# Admin Testing Module

## Overview

This module provides an admin interface for running tests (Unit, Integration, E2E) on production and viewing formatted results. Tests are executed via GitHub Actions workflows and results are stored in Redis.

## Architecture

### Flow

1. **Admin clicks "Run Tests"** → API endpoint in Vercel
2. **API endpoint triggers GitHub Actions workflow** via GitHub API
3. **GitHub Actions runs tests** (Unit/Integration/E2E)
4. **GitHub Actions sends results to webhook** in Vercel
5. **Webhook saves results to Redis**
6. **Admin interface reads from Redis** and displays results

### Components

- **Redis Client** (`src/core/integrations/redis/`) - Redis connection wrapper using `@vercel/kv`
- **Redis Test Storage** (`services/redisTestStorage.ts`) - Functions for saving/reading test runs
- **GitHub Actions Service** (`services/githubActionsService.ts`) - Triggers workflows via GitHub API
- **Test Actions** (`actions/testActions.ts`) - Server actions for starting runs and getting results
- **Webhook Endpoint** (`src/app/api/admin/tests/webhook/route.ts`) - Receives results from GitHub Actions

## Features

- Run all test types (Unit, Integration, E2E) from admin dashboard
- View test results in real-time
- Export results as Markdown (failures only) for Cursor/GPT
- Test run history (last 50 runs, 30-day TTL)
- Progress tracking
- Persistent storage in Redis (not in-memory)

## Structure

```
admin-testing/
├── ui/                        # React components
│   ├── TestingDashboard.tsx   # Main dashboard
│   ├── TestRunCard.tsx        # Individual test run card
│   └── TestResultsViewer.tsx  # Results viewer
├── actions/                   # Server actions
│   └── testActions.ts         # Start/get runs, get history
├── services/                  # Business logic
│   ├── redisTestStorage.ts    # Redis storage helpers
│   ├── githubActionsService.ts # GitHub API integration
│   ├── testRunnerService.ts   # Vitest runner (legacy, not used)
│   ├── playwrightRunnerService.ts # Playwright runner (legacy, not used)
│   └── testResultFormatter.ts # Markdown formatter
├── types.ts                   # TypeScript types
└── README.md                  # This file
```

## Usage

Access the testing interface from the Admin Dashboard under the "Testing" tab.

## API Endpoints

- `POST /api/admin/tests/run` - Start a test run (triggers GitHub Actions)
- `GET /api/admin/tests/status/[runId]` - Get test run status (from Redis)
- `GET /api/admin/tests/results/[runId]` - Get test results (from Redis)
- `POST /api/admin/tests/webhook` - Webhook to receive results from GitHub Actions (protected by WEBHOOK_SECRET)

## Environment Variables

Required environment variables:

- `KV_URL` - Vercel KV (Redis) connection string
- `KV_REST_API_URL` - Vercel KV REST API URL (alternative to KV_URL)
- `KV_REST_API_TOKEN` - Vercel KV REST API token
- `GITHUB_TOKEN` - GitHub personal access token (with `actions:write`, `workflow:write` permissions)
- `GITHUB_REPO` - Repository in format `owner/repo` (e.g., `username/repo-name`)
- `WEBHOOK_SECRET` - Secret token for webhook authentication
- `WEBHOOK_URL` - Full URL to webhook endpoint (for GitHub Actions secrets)
- `NEXT_PUBLIC_APP_URL` - Production app URL (for test configs)

## GitHub Actions Workflow

The workflow file (`.github/workflows/run-tests-on-demand.yml`) can be triggered:

- **Manually** via GitHub UI
- **Via API** from the admin interface

Workflow inputs:

- `test_type`: unit | integration | e2e | all
- `run_id`: Unique test run ID

## Services

### Redis Test Storage (`redisTestStorage.ts`)

- `saveTestRun(runId, data, ttlDays?)` - Save test run to Redis (default 30 days)
- `getTestRun(runId)` - Get a specific test run
- `getTestRunHistory(limit?)` - Get last N test runs (default 50)
- `deleteOldTestRuns(days)` - Cleanup old runs

### GitHub Actions Service (`githubActionsService.ts`)

- `triggerWorkflow(testType, runId)` - Trigger workflow via GitHub API
- `getWorkflowRunStatus(runId)` - Get workflow run status

## Memory Management

- **TTL:** Test runs stored for 30 days (automatic expiration)
- **History Limit:** Last 50 runs kept in history
- **Cleanup:** Old runs can be manually deleted via `deleteOldTestRuns()`

## Error Handling

- GitHub API failures → Retry logic (3 attempts with exponential backoff)
- Redis connection failures → Graceful fallback with error messages
- Webhook failures → GitHub Actions will retry
- Timeout handling → Maximum 60 minutes per workflow run

## Security

- All endpoints protected by `requireAdmin()` middleware
- Webhook protected by `WEBHOOK_SECRET` Bearer token
- GitHub token stored as environment variable (never in code)
- Redis access limited to Vercel environment
