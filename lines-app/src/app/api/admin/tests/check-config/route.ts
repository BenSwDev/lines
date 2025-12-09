import { NextResponse } from "next/server";
import { isGitHubConfigured, getRepo } from "@/core/integrations/github";
import { isRedisConfigured } from "@/core/integrations/redis";

/**
 * Check configuration endpoint for debugging
 * Only accessible in development or via admin check
 */
export async function GET() {
  try {
    const githubRepo = getRepo();
    const githubConfigured = isGitHubConfigured();
    const redisConfigured = isRedisConfigured();

    // Get raw env vars (without values for security)
    const hasGitHubToken = !!process.env.GITHUB_TOKEN;
    const hasGitHubRepo = !!process.env.GITHUB_REPO;
    const hasRedisUrl = !!process.env.REDIS_URL;
    const hasKvUrl = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;

    return NextResponse.json({
      github: {
        configured: githubConfigured,
        hasToken: hasGitHubToken,
        hasRepo: hasGitHubRepo,
        repo: githubRepo || null,
        repoRaw: hasGitHubRepo ? "***" : null,
        tokenLength: hasGitHubToken ? process.env.GITHUB_TOKEN?.length || 0 : 0
      },
      redis: {
        configured: redisConfigured,
        hasRedisUrl,
        hasKvUrl
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

