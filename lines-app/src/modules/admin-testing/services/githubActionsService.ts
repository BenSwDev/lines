/**
 * GitHub Actions service
 * Wrapper around core GitHub integration for admin testing module
 * Uses core/integrations/github for all GitHub API operations
 */

import {
  triggerWorkflow as coreTriggerWorkflow,
  getWorkflowRunStatus as coreGetWorkflowRunStatus,
  type TriggerWorkflowResponse,
  type WorkflowRunStatus
} from "@/core/integrations/github";

/**
 * Trigger a GitHub Actions workflow for test execution
 * @param testType - Type of tests to run (unit/integration/e2e/all)
 * @param runId - Unique test run ID to pass to the workflow
 * @returns Workflow run ID and status
 */
export async function triggerWorkflow(
  testType: "unit" | "integration" | "e2e" | "all",
  runId: string
): Promise<TriggerWorkflowResponse> {
  return coreTriggerWorkflow("run-tests-on-demand.yml", {
    test_type: testType,
    run_id: runId
  });
}

/**
 * Get the status of a workflow run
 * @param runId - GitHub Actions workflow run ID
 */
export async function getWorkflowRunStatus(runId: number): Promise<WorkflowRunStatus | null> {
  return coreGetWorkflowRunStatus(runId);
}
