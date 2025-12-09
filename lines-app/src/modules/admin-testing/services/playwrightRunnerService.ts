import { exec } from "child_process";
import { promisify } from "util";
import type { TestResult } from "../types";

const execAsync = promisify(exec);

interface PlaywrightResult {
  status: "passed" | "failed";
  tests: Array<{
    title: string;
    status: "passed" | "failed" | "skipped";
    duration: number;
    error?: {
      message: string;
      stack?: string;
    };
    location?: {
      file: string;
      line: number;
      column: number;
    };
  }>;
}

export async function runPlaywrightTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
  duration: number;
}> {
  const startTime = Date.now();

  const baseURL =
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  // Set environment variables for production testing
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PLAYWRIGHT_TEST_BASE_URL: baseURL,
    NODE_ENV: "test",
    CI: "true"
  };

  try {
    // In Vercel, we need to use the direct path to node_modules/.bin
    const isVercel = !!process.env.VERCEL;
    let playwrightCommand: string;

    if (isVercel) {
      // In Vercel, try to use node_modules/.bin directly
      playwrightCommand = "node node_modules/@playwright/test/cli.js";
    } else {
      // Local development - use pnpm
      playwrightCommand =
        process.platform === "win32" ? "pnpm exec playwright" : "pnpm exec playwright";
    }

    // Run playwright with JSON reporter
    const { stdout } = await execAsync(
      `${playwrightCommand} test --config playwright.config.production.ts --reporter=json`,
      {
        cwd: process.cwd(),
        env,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 30 * 60 * 1000 // 30 minutes
      }
    );

    // Parse JSON output
    let jsonOutput: PlaywrightResult | null = null;

    try {
      // Playwright JSON reporter outputs to a file, but we can try to parse from stdout
      const jsonMatch = stdout.match(/\{[\s\S]*"status"[\s\S]*\}/);
      if (jsonMatch) {
        jsonOutput = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse Playwright JSON output:", e);
    }

    // If JSON parsing failed, parse from verbose output
    if (!jsonOutput) {
      const passedMatch = stdout.match(/(\d+) passed/);
      const failedMatch = stdout.match(/(\d+) failed/);
      const skippedMatch = stdout.match(/(\d+) skipped/);

      const total =
        (passedMatch ? parseInt(passedMatch[1]) : 0) +
        (failedMatch ? parseInt(failedMatch[1]) : 0) +
        (skippedMatch ? parseInt(skippedMatch[1]) : 0);

      return {
        total,
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
        results: [],
        duration: Date.now() - startTime
      };
    }

    const duration = Date.now() - startTime;

    // Convert Playwright results to our format
    const results: TestResult[] = jsonOutput.tests.map((test) => ({
      testFile: test.location?.file || "unknown",
      testName: test.title,
      status: test.status,
      duration: test.duration,
      error: test.error
        ? {
            message: test.error.message,
            stack: test.error.stack
          }
        : undefined
    }));

    const passed = results.filter((r) => r.status === "passed").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    return {
      total: results.length,
      passed,
      failed,
      skipped,
      results,
      duration
    };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    // If tests failed, try to parse the error
    const execError = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
      stack?: string;
    };
    if (execError.stdout || execError.stderr) {
      const output = execError.stdout || execError.stderr || "";
      const failedMatch = output.match(/(\d+) failed/);
      const passedMatch = output.match(/(\d+) passed/);

      return {
        total:
          (failedMatch ? parseInt(failedMatch[1]) : 0) +
          (passedMatch ? parseInt(passedMatch[1]) : 0),
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        skipped: 0,
        results: [
          {
            testFile: "unknown",
            testName: "Test execution failed",
            status: "failed",
            error: {
              message: execError.message || "Test execution failed",
              stack: execError.stack
            }
          }
        ],
        duration
      };
    }

    throw error;
  }
}
