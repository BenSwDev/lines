# Admin Testing Module

## Overview

This module provides an admin interface for running tests (Unit, Integration, E2E) on production and viewing formatted results.

## Features

- Run all test types (Unit, Integration, E2E) from admin dashboard
- View test results in real-time
- Export results as Markdown (failures only) for Cursor/GPT
- Test run history
- Progress tracking

## Structure

```
admin-testing/
├── ui/              # React components
├── actions/         # Server actions
├── services/         # Test execution services
├── types.ts         # TypeScript types
└── README.md       # This file
```

## Usage

Access the testing interface from the Admin Dashboard under the "Testing" tab.

## API Endpoints

- `POST /api/admin/tests/run` - Start a test run
- `GET /api/admin/tests/status/[runId]` - Get test run status
- `GET /api/admin/tests/results/[runId]` - Get test results

## Services

- `testRunnerService` - Runs Vitest (Unit/Integration)
- `playwrightRunnerService` - Runs Playwright (E2E)
- `testResultFormatter` - Formats results as Markdown

