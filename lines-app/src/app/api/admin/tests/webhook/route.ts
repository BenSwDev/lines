import { NextRequest, NextResponse } from "next/server";
import { saveTestRun } from "@/modules/admin-testing/services/redisTestStorage";
import type { TestSuiteResult } from "@/modules/admin-testing/types";

/**
 * Webhook endpoint to receive test results from GitHub Actions
 * Protected by WEBHOOK_SECRET token authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${webhookSecret}`;
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { runId, testResults } = body;

    if (!runId || !testResults) {
      return NextResponse.json(
        { success: false, error: "Missing runId or testResults" },
        { status: 400 }
      );
    }

    // Validate testResults structure
    const suiteResult = testResults as TestSuiteResult;

    // Convert date strings to Date objects if needed
    const processedResult: TestSuiteResult = {
      ...suiteResult,
      startedAt:
        suiteResult.startedAt instanceof Date
          ? suiteResult.startedAt
          : new Date(suiteResult.startedAt),
      completedAt: suiteResult.completedAt
        ? suiteResult.completedAt instanceof Date
          ? suiteResult.completedAt
          : new Date(suiteResult.completedAt)
        : undefined
    };

    // Save to Redis
    const saved = await saveTestRun(runId, processedResult);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Failed to save test results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test results saved successfully"
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
