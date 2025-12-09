import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/core/auth/session";
import { startTestRun } from "@/modules/admin-testing/actions/testActions";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { testType } = body;

    if (!testType || !["unit", "integration", "e2e", "all"].includes(testType)) {
      return NextResponse.json({ success: false, error: "Invalid test type" }, { status: 400 });
    }

    // Check if there's already a running test
    // (Simple rate limiting - only one test at a time)
    // In production, use Redis or database for this check

    const result = await startTestRun(testType);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      runId: result.runId,
      status: "queued"
    });
  } catch (error: unknown) {
    console.error("Error starting test run:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to start test run";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
