/**
 * GitHub Actions service
 * Handles triggering workflows and checking their status via GitHub API
 */

const GITHUB_API_BASE = "https://api.github.com";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface TriggerWorkflowResponse {
  success: boolean;
  workflowRunId?: number;
  error?: string;
}

interface WorkflowRunStatus {
  id: number;
  status: "queued" | "in_progress" | "completed" | "cancelled";
  conclusion: "success" | "failure" | "cancelled" | null;
  html_url?: string;
}

/**
 * Get GitHub repository owner and name from environment
 */
function getGitHubRepo(): { owner: string; repo: string } | null {
  const repoString = process.env.GITHUB_REPO;
  if (!repoString) {
    return null;
  }

  const parts = repoString.split("/");
  if (parts.length !== 2) {
    return null;
  }

  return {
    owner: parts[0],
    repo: parts[1]
  };
}

/**
 * Make a GitHub API request with retry logic
 */
async function githubRequest(
  endpoint: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const repo = getGitHubRepo();
  if (!repo) {
    throw new Error("GITHUB_REPO environment variable is not set (format: owner/repo)");
  }

  const url = `${GITHUB_API_BASE}/repos/${repo.owner}/${repo.repo}${endpoint}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json"
        }
      });

      if (response.ok || attempt === retries - 1) {
        return response;
      }

      // Retry on 5xx errors
      if (response.status >= 500 && response.status < 600) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }

      // Don't retry on 4xx errors
      return response;
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
    }
  }

  throw new Error("GitHub API request failed after retries");
}

/**
 * Trigger a GitHub Actions workflow
 * @param testType - Type of tests to run (unit/integration/e2e/all)
 * @param runId - Unique test run ID to pass to the workflow
 * @returns Workflow run ID and status
 */
export async function triggerWorkflow(
  testType: "unit" | "integration" | "e2e" | "all",
  runId: string
): Promise<TriggerWorkflowResponse> {
  try {
    const repo = getGitHubRepo();
    if (!repo) {
      return {
        success: false,
        error: "GITHUB_REPO environment variable is not set (format: owner/repo)"
      };
    }

    // Trigger the workflow via GitHub API
    const response = await githubRequest("/actions/workflows/run-tests-on-demand.yml/dispatches", {
      method: "POST",
      body: JSON.stringify({
        ref: "main", // Branch to run on
        inputs: {
          test_type: testType,
          run_id: runId
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `GitHub API error: ${response.status} ${errorText}`
      };
    }

    // Wait a moment for the workflow run to be created, then fetch its ID
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the latest workflow run for this workflow
    const runsResponse = await githubRequest(
      "/actions/workflows/run-tests-on-demand.yml/runs?per_page=1"
    );
    if (!runsResponse.ok) {
      return {
        success: true
        // Even if we can't get the run ID, the workflow was triggered
      };
    }

    const runsData = (await runsResponse.json()) as {
      workflow_runs: Array<{ id: number; status: string }>;
    };
    const latestRun = runsData.workflow_runs?.[0];

    return {
      success: true,
      workflowRunId: latestRun?.id
    };
  } catch (error) {
    console.error("Error triggering GitHub workflow:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to trigger workflow"
    };
  }
}

/**
 * Get the status of a workflow run
 * @param runId - GitHub Actions workflow run ID
 */
export async function getWorkflowRunStatus(runId: number): Promise<WorkflowRunStatus | null> {
  try {
    const response = await githubRequest(`/actions/runs/${runId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = (await response.json()) as WorkflowRunStatus;
    return {
      id: data.id,
      status: data.status,
      conclusion: data.conclusion,
      html_url: data.html_url
    };
  } catch (error) {
    console.error(`Error getting workflow run status for ${runId}:`, error);
    return null;
  }
}
