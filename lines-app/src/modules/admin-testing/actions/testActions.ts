"use server";

import { requireAdmin } from "@/core/auth/session";
import { isGitHubConfigured } from "@/core/integrations/github";
import { triggerWorkflow } from "../services/githubActionsService";
import {
  saveTestRun,
  getTestRun,
  getTestRunHistory as getTestRunHistoryFromRedis
} from "../services/redisTestStorage";
import type { TestType, TestSuiteResult } from "../types";
import { randomUUID } from "crypto";

/**
 * Start a test run by triggering GitHub Actions workflow
 */
export async function startTestRun(
  testType: TestType
): Promise<{ success: boolean; runId?: string; error?: string }> {
  try {
    await requireAdmin();

    // Early validation - check GitHub configuration
    if (!isGitHubConfigured()) {
      return {
        success: false,
        error: "GitHub integration is not configured. Please set GITHUB_TOKEN and GITHUB_REPO environment variables in Vercel."
      };
    }

    const runId = randomUUID();
    const startedAt = new Date();

    // Initialize test run in Redis (status: queued)
    const initialRun: TestSuiteResult = {
      runId,
      testType,
      status: "queued",
      startedAt,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      results: [],
      markdown: ""
    };

    await saveTestRun(runId, initialRun);

    // Trigger GitHub Actions workflow
    const triggerResult = await triggerWorkflow(testType, runId);

    if (!triggerResult.success) {
      // Update status to failed
      const failedRun: TestSuiteResult = {
        ...initialRun,
        status: "failed",
        error: triggerResult.error || "Failed to trigger workflow"
      };
      await saveTestRun(runId, failedRun);

      return {
        success: false,
        error: triggerResult.error || "Failed to trigger GitHub Actions workflow"
      };
    }

    // Update status to running
    const runningRun: TestSuiteResult = {
      ...initialRun,
      status: "running"
    };
    await saveTestRun(runId, runningRun);

    return { success: true, runId };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to start test run";
    return { success: false, error: errorMessage };
  }
}

/**
 * Get the status of a test run
 */
export async function getTestRunStatus(runId: string): Promise<{
  success: boolean;
  status?: string;
  progress?: number;
  error?: string;
}> {
  try {
    await requireAdmin();

    const run = await getTestRun(runId);
    if (!run) {
      return { success: false, error: "Test run not found" };
    }

    // Determine progress based on status
    let progress = 0;
    if (run.status === "queued") progress = 10;
    else if (run.status === "running") progress = 50;
    else if (run.status === "completed") progress = 100;
    else if (run.status === "failed") progress = 0;

    return {
      success: true,
      status: run.status,
      progress
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get test run status";
    return { success: false, error: errorMessage };
  }
}

/**
 * Get the results of a completed test run
 */
export async function getTestRunResults(runId: string): Promise<{
  success: boolean;
  results?: TestSuiteResult;
  error?: string;
}> {
  try {
    await requireAdmin();

    const run = await getTestRun(runId);
    if (!run) {
      return { success: false, error: "Test run not found" };
    }

    if (run.status === "queued" || run.status === "running") {
      return { success: false, error: "Test run is still in progress" };
    }

    return {
      success: true,
      results: run
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get test run results";
    return { success: false, error: errorMessage };
  }
}

/**
 * Get test run history (last N runs)
 */
export async function getTestRunHistory(): Promise<{
  success: boolean;
  runs?: Array<{
    runId: string;
    testType: TestType;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    total: number;
    passed: number;
    failed: number;
  }>;
  error?: string;
}> {
  try {
    await requireAdmin();

    const runs = await getTestRunHistoryFromRedis();

    return { success: true, runs };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get test run history";
    return { success: false, error: errorMessage };
  }
}
