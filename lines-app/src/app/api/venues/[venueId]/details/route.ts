import { NextRequest } from "next/server";
import { venueDetailsService } from "@/modules/venue-info/services/venueDetailsService";
import { updateVenueDetailsSchema } from "@/modules/venue-info/schemas/venueDetailsSchemas";
import { successResponse, handleApiError, validationErrorResponse } from "@/core/http";
import { isDemoVenueId } from "@/core/auth/demo";
import { getCurrentUser } from "@/core/auth/session";
import { isDemoUserId } from "@/core/auth/demo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params;

    // CRITICAL: Block demo venues from being accessed via API
    if (isDemoVenueId(venueId)) {
      return new Response(
        JSON.stringify({ error: "Demo venues cannot be accessed via protected API" }),
        {
          status: 403
        }
      );
    }

    const details = await venueDetailsService.getVenueDetails(venueId);
    return successResponse(details);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401
      });
    }

    // CRITICAL: Block demo users from accessing protected API
    if (isDemoUserId(user.id)) {
      return new Response(JSON.stringify({ error: "Demo users cannot access protected routes" }), {
        status: 403
      });
    }

    const { venueId } = await params;

    // CRITICAL: Block demo venues from being updated via API
    if (isDemoVenueId(venueId)) {
      return new Response(
        JSON.stringify({ error: "Demo venues cannot be accessed via protected API" }),
        {
          status: 403
        }
      );
    }

    const body = await request.json();
    const validated = updateVenueDetailsSchema.parse(body);

    const details = await venueDetailsService.updateVenueDetails(venueId, validated);

    return successResponse(details);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return validationErrorResponse(error as unknown as import("zod").ZodError);
    }
    return handleApiError(error);
  }
}
