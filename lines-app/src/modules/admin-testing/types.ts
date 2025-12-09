export type TestType = "unit" | "integration" | "e2e" | "all";

export type TestRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface TestRun {
  id: string;
  testType: TestType;
  status: TestRunStatus;
  startedAt: Date;
  completedAt?: Date;
  progress?: number;
  error?: string;
}

export interface TestResult {
  testFile: string;
  testName: string;
  status: "passed" | "failed" | "skipped";
  duration?: number;
  error?: {
    message: string;
    expected?: string;
    actual?: string;
    stack?: string;
  };
}

export interface TestSuiteResult {
  runId: string;
  testType: TestType;
  status: TestRunStatus;
  startedAt: Date;
  completedAt?: Date;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
  markdown: string;
  error?: string;
}

export interface TestRunRequest {
  testType: TestType;
}

