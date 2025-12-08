import { NextRequest } from "next/server";
import { venuesService } from "@/modules/venues/services/venuesService";
import { successResponse, notFoundResponse, handleApiError } from "@/core/http";
import { auth } from "@/core/auth/auth";
import { isDemoUserId, isDemoVenueId } from "@/core/auth/demo";

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

    const venue = await venuesService.getVenue(venueId);

    if (!venue) {
      return notFoundResponse("Venue");
    }

    return successResponse(venue);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401
      });
    }

    // CRITICAL: Block demo users from accessing protected API
    if (isDemoUserId(session.user.id)) {
      return new Response(JSON.stringify({ error: "Demo users cannot access protected routes" }), {
        status: 403
      });
    }

    const { venueId } = await params;

    // CRITICAL: Block demo venues from being deleted via API
    if (isDemoVenueId(venueId)) {
      return new Response(
        JSON.stringify({ error: "Demo venues cannot be accessed via protected API" }),
        {
          status: 403
        }
      );
    }

    const venue = await venuesService.deleteVenue(venueId, session.user.id);
    return successResponse(venue);
  } catch (error) {
    return handleApiError(error);
  }
}
