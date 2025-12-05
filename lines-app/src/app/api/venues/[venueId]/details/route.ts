import { NextRequest } from "next/server";
import { venueDetailsService } from "@/modules/venue-info/services/venueDetailsService";
import { updateVenueDetailsSchema } from "@/modules/venue-info/schemas/venueDetailsSchemas";
import { successResponse, handleApiError, validationErrorResponse } from "@/core/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params;
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
    const { venueId } = await params;
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
