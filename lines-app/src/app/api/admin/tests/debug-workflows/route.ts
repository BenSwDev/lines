import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/auth/session";
import { getRepo } from "@/core/integrations/github";

// We need to access the internal functions, so we'll make our own request
async function listWorkflows(repo: { owner: string; repo: string }) {
  const token = process.env.GITHUB_TOKEN?.trim().replace(/^["']|["']$/g, "").replace(/\r\n|\r|\n/g, "").trim();
  if (!token) {
    throw new Error("GITHUB_TOKEN not set");
  }

  const response = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/workflows`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Debug endpoint to check what workflows GitHub API returns
 */
export async function GET() {
  try {
    await requireAdmin();
    
    const repo = await getRepo();
    if (!repo) {
      return NextResponse.json(
        { error: "GITHUB_REPO not configured" },
        { status: 500 }
      );
    }

    // Get all workflows
    const data = await listWorkflows(repo) as {
      total_count: number;
      workflows: Array<{
        id: number;
        node_id: string;
        name: string;
        path: string;
        state: string;
        created_at: string;
        updated_at: string;
        url: string;
        html_url: string;
        badge_url: string;
      }>;
    };

    // Find our specific workflow
    const targetWorkflow = data.workflows.find((w) => 
      w.path.includes("run-tests-on-demand.yml")
    );

    return NextResponse.json({
      repo,
      totalWorkflows: data.total_count,
      workflows: data.workflows.map(w => ({
        id: w.id,
        name: w.name,
        path: w.path,
        state: w.state
      })),
      targetWorkflow: targetWorkflow ? {
        id: targetWorkflow.id,
        name: targetWorkflow.name,
        path: targetWorkflow.path,
        state: targetWorkflow.state
      } : null,
      searchPatterns: {
        exact: "run-tests-on-demand.yml",
        withSlash: "/run-tests-on-demand.yml",
        withWorkflows: "workflows/run-tests-on-demand.yml",
        withDotGithub: ".github/workflows/run-tests-on-demand.yml"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

