import { NextRequest } from "next/server";
import { venuesService } from "@/modules/venues/services/venuesService";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/core/http";
import { auth } from "@/core/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> },
) {
  try {
    const { venueId } = await params;
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
  { params }: { params: Promise<{ venueId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { venueId } = await params;
    const venue = await venuesService.deleteVenue(venueId, session.user.id);
    return successResponse(venue);
  } catch (error) {
    return handleApiError(error);
  }
}
