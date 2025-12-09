import { promisify } from "util";
import { exec } from "child_process";
import type { TestResult } from "../types";

const execAsync = promisify(exec);

interface VitestResult {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numSkippedTests: number;
  testResults: Array<{
    name: string;
    status: "passed" | "failed" | "skipped";
    duration?: number;
    errors?: Array<{
      message: string;
      expected?: string;
      actual?: string;
      stack?: string;
    }>;
  }>;
}

export async function runVitestTests(
  testType: "unit" | "integration"
): Promise<{
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
  duration: number;
}> {
  const startTime = Date.now();
  const configFile = testType === "unit" 
    ? "vitest.config.unit.ts"
    : "vitest.config.integration.ts";

  const baseURL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  // Set environment variables for production testing
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    TEST_BASE_URL: baseURL,
    NODE_ENV: "test",
    CI: "true"
  };

  try {
    // Run vitest with JSON reporter
    const { stdout } = await execAsync(
      `pnpm exec vitest run --config ${configFile} --reporter=json --reporter=verbose`,
      {
        cwd: process.cwd(),
        env,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 30 * 60 * 1000 // 30 minutes
      }
    );

    // Parse JSON output (vitest outputs JSON to stdout when using json reporter)
    let jsonOutput: VitestResult | null = null;
    
    // Try to extract JSON from output
    const jsonMatch = stdout.match(/\{[\s\S]*"numTotalTests"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        jsonOutput = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse Vitest JSON output:", e);
      }
    }

    // If JSON parsing failed, parse from stderr or stdout
    if (!jsonOutput) {
      // Fallback: parse from verbose output
      const totalMatch = stdout.match(/(\d+) passed/);
      const failedMatch = stdout.match(/(\d+) failed/);
      const skippedMatch = stdout.match(/(\d+) skipped/);
      
      jsonOutput = {
        numTotalTestSuites: 0,
        numPassedTestSuites: 0,
        numFailedTestSuites: 0,
        numTotalTests: totalMatch ? parseInt(totalMatch[1]) : 0,
        numPassedTests: totalMatch ? parseInt(totalMatch[1]) : 0,
        numFailedTests: failedMatch ? parseInt(failedMatch[1]) : 0,
        numSkippedTests: skippedMatch ? parseInt(skippedMatch[1]) : 0,
        testResults: []
      };
    }

    const duration = Date.now() - startTime;

    // Convert Vitest results to our format
    const results: TestResult[] = jsonOutput.testResults.flatMap((suite) => {
      return suite.errors?.map((error) => ({
        testFile: suite.name,
        testName: suite.name,
        status: suite.status as "passed" | "failed" | "skipped",
        duration: suite.duration,
        error: {
          message: error.message,
          expected: error.expected,
          actual: error.actual,
          stack: error.stack
        }
      })) || [{
        testFile: suite.name,
        testName: suite.name,
        status: suite.status as "passed" | "failed" | "skipped",
        duration: suite.duration
      }];
    });

    return {
      total: jsonOutput.numTotalTests,
      passed: jsonOutput.numPassedTests,
      failed: jsonOutput.numFailedTests,
      skipped: jsonOutput.numSkippedTests,
      results,
      duration
    };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    
    // If tests failed, try to parse the error
    const execError = error as { stdout?: string; stderr?: string; message?: string; stack?: string };
    if (execError.stdout || execError.stderr) {
      const output = execError.stdout || execError.stderr || "";
      const failedMatch = output.match(/(\d+) failed/);
      const passedMatch = output.match(/(\d+) passed/);
      
      return {
        total: (failedMatch ? parseInt(failedMatch[1]) : 0) + (passedMatch ? parseInt(passedMatch[1]) : 0),
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        skipped: 0,
        results: [{
          testFile: "unknown",
          testName: "Test execution failed",
          status: "failed",
          error: {
            message: execError.message || "Test execution failed",
            stack: execError.stack
          }
        }],
        duration
      };
    }

    throw error;
  }
}

