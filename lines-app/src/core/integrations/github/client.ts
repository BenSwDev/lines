/**
 * GitHub API Client
 * Core integration for GitHub API operations
 * Handles authentication, requests, and workflow management
 */

const GITHUB_API_BASE = "https://api.github.com";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface TriggerWorkflowResponse {
  success: boolean;
  workflowRunId?: number;
  error?: string;
}

export interface WorkflowRunStatus {
  id: number;
  status: "queued" | "in_progress" | "completed" | "cancelled";
  conclusion: "success" | "failure" | "cancelled" | null;
  html_url?: string;
}

/**
 * Get GitHub repository owner and name from environment
 */
function getGitHubRepo(): GitHubRepo | null {
  const repoString = process.env.GITHUB_REPO;
  if (!repoString) {
    console.warn("GITHUB_REPO environment variable is not set");
    return null;
  }

  // Remove quotes, whitespace, and line breaks
  const cleaned = repoString.replace(/^["']|["']$/g, "").replace(/\r\n|\r|\n/g, "").trim();
  
  if (!cleaned) {
    console.warn("GITHUB_REPO environment variable is empty after cleaning");
    return null;
  }
  
  const parts = cleaned.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    console.warn(`GITHUB_REPO format is invalid: "${repoString}" (expected format: owner/repo)`);
    return null;
  }

  return {
    owner: parts[0].trim(),
    repo: parts[1].trim()
  };
}

/**
 * Check if GitHub is configured
 */
export function isGitHubConfigured(): boolean {
  const token = process.env.GITHUB_TOKEN?.trim().replace(/\r\n|\r|\n/g, "");
  const repo = process.env.GITHUB_REPO?.trim().replace(/\r\n|\r|\n/g, "");
  
  const isConfigured = !!(token && repo);
  
  // Log in development to help debug
  if (process.env.NODE_ENV === "development") {
    console.log("GitHub configuration check:", {
      hasToken: !!token,
      hasRepo: !!repo,
      repoValue: repo || "undefined",
      isConfigured
    });
  }
  
  return isConfigured;
}

/**
 * Make a GitHub API request with retry logic
 */
async function githubRequest(
  endpoint: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<Response> {
  // Clean token - remove quotes, whitespace, and line breaks
  const rawToken = process.env.GITHUB_TOKEN;
  const token = rawToken?.trim().replace(/^["']|["']$/g, "").replace(/\r\n|\r|\n/g, "").trim();
  
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
 * @param workflowFile - Path to workflow file (e.g., "run-tests-on-demand.yml")
 * @param inputs - Workflow inputs
 * @param ref - Branch/ref to run on (default: "main")
 * @returns Workflow run ID and status
 */
export async function triggerWorkflow(
  workflowFile: string,
  inputs: Record<string, string>,
  ref: string = "main"
): Promise<TriggerWorkflowResponse> {
  try {
    // Get raw values for validation
    const rawToken = process.env.GITHUB_TOKEN;
    const rawRepo = process.env.GITHUB_REPO;
    const token = rawToken?.trim().replace(/\r\n|\r|\n/g, "");
    const repo = rawRepo?.trim().replace(/\r\n|\r|\n/g, "");
    
    // Early validation - check if GitHub is configured
    if (!token || !repo) {
      const missing: string[] = [];
      if (!token) missing.push("GITHUB_TOKEN");
      if (!repo) missing.push("GITHUB_REPO");
      
      console.error("GitHub integration validation failed:", {
        hasToken: !!token,
        hasRepo: !!repo,
        repoValue: repo || rawRepo || "undefined",
        tokenLength: token?.length || 0
      });
      
      return {
        success: false,
        error: `GitHub integration is not configured. Missing environment variables: ${missing.join(", ")}. Please set them in Vercel environment variables (Settings > Environment Variables > Production).`
      };
    }

    const repoInfo = getGitHubRepo();
    if (!repoInfo) {
      return {
        success: false,
        error: `GITHUB_REPO environment variable has invalid format. Current value: "${rawRepo || "undefined"}". Expected format: owner/repo (e.g., BenSwDev/lines)`
      };
    }

    // Trigger the workflow via GitHub API
    const response = await githubRequest(`/actions/workflows/${workflowFile}/dispatches`, {
      method: "POST",
      body: JSON.stringify({
        ref,
        inputs
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
      `/actions/workflows/${workflowFile}/runs?per_page=1`
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

/**
 * Get repository information
 */
export async function getRepo(): Promise<GitHubRepo | null> {
  return getGitHubRepo();
}

