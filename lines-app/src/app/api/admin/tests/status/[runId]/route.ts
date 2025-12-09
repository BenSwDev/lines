import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/core/auth/session";
import { getTestRunStatus } from "@/modules/admin-testing/actions/testActions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    await requireAdmin();

    const { runId } = await params;

    if (!runId) {
      return NextResponse.json(
        { success: false, error: "Run ID is required" },
        { status: 400 }
      );
    }

    const result = await getTestRunStatus(runId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      progress: result.progress
    });
  } catch (error: unknown) {
    console.error("Error getting test run status:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get test run status";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

