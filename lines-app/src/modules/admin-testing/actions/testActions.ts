"use server";

import { requireAdmin } from "@/core/auth/session";
import { runVitestTests } from "../services/testRunnerService";
import { runPlaywrightTests } from "../services/playwrightRunnerService";
import { formatTestResultsAsMarkdown } from "../services/testResultFormatter";
import type { TestType, TestSuiteResult, TestResult } from "../types";
import { randomUUID } from "crypto";

// In-memory storage for test runs (in production, use Redis or database)
const testRuns = new Map<string, TestSuiteResult>();

export async function startTestRun(testType: TestType): Promise<{ success: boolean; runId?: string; error?: string }> {
  try {
    await requireAdmin();

    const runId = randomUUID();
    const startedAt = new Date();

    // Initialize test run
    testRuns.set(runId, {
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
    });

    // Run tests asynchronously
    runTestsAsync(runId, testType).catch((error: unknown) => {
      console.error(`Test run ${runId} failed:`, error);
      const run = testRuns.get(runId);
      if (run) {
        run.status = "failed";
        run.error = error instanceof Error ? error.message : "Test execution failed";
      }
    });

    return { success: true, runId };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to start test run";
    return { success: false, error: errorMessage };
  }
}

async function runTestsAsync(runId: string, testType: TestType) {
  const run = testRuns.get(runId);
  if (!run) return;

  run.status = "running";

  try {
    let results: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      results: TestResult[];
      duration: number;
    };

    if (testType === "unit" || testType === "integration") {
      results = await runVitestTests(testType);
    } else if (testType === "e2e") {
      results = await runPlaywrightTests();
    } else {
      // Run all tests
      const [unitResults, integrationResults, e2eResults] = await Promise.all([
        runVitestTests("unit"),
        runVitestTests("integration"),
        runPlaywrightTests()
      ]);

      results = {
        total: unitResults.total + integrationResults.total + e2eResults.total,
        passed: unitResults.passed + integrationResults.passed + e2eResults.passed,
        failed: unitResults.failed + integrationResults.failed + e2eResults.failed,
        skipped: unitResults.skipped + integrationResults.skipped + e2eResults.skipped,
        results: [...unitResults.results, ...integrationResults.results, ...e2eResults.results],
        duration: unitResults.duration + integrationResults.duration + e2eResults.duration
      };
    }

    const completedAt = new Date();
    const suiteResult: TestSuiteResult = {
      runId,
      testType,
      status: results.failed > 0 ? "failed" : "completed",
      startedAt: run.startedAt,
      completedAt,
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      duration: results.duration,
      results: results.results,
      markdown: ""
    };

    suiteResult.markdown = formatTestResultsAsMarkdown(suiteResult);

    testRuns.set(runId, suiteResult);
  } catch (error: unknown) {
    run.status = "failed";
    run.error = error instanceof Error ? error.message : "Test execution failed";
    testRuns.set(runId, run);
  }
}

export async function getTestRunStatus(runId: string): Promise<{
  success: boolean;
  status?: string;
  progress?: number;
  error?: string;
}> {
  try {
    await requireAdmin();

    const run = testRuns.get(runId);
    if (!run) {
      return { success: false, error: "Test run not found" };
    }

    return {
      success: true,
      status: run.status,
      progress: run.status === "running" ? 50 : run.status === "completed" ? 100 : 0
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get test run status";
    return { success: false, error: errorMessage };
  }
}

export async function getTestRunResults(runId: string): Promise<{
  success: boolean;
  results?: TestSuiteResult;
  error?: string;
}> {
  try {
    await requireAdmin();

    const run = testRuns.get(runId);
    if (!run) {
      return { success: false, error: "Test run not found" };
    }

    if (run.status === "queued" || run.status === "running") {
      return { success: false, error: "Test run is still in progress" };
    }

    return {
      success: true,
      results: run as TestSuiteResult
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get test run results";
    return { success: false, error: errorMessage };
  }
}

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

    const runs = Array.from(testRuns.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, 20) // Last 20 runs
      .map((run) => ({
        runId: run.runId,
        testType: run.testType,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        total: run.total,
        passed: run.passed,
        failed: run.failed
      }));

    return { success: true, runs };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get test run history";
    return { success: false, error: errorMessage };
  }
}

