import { NextRequest } from "next/server";
import { venuesService } from "@/modules/venues/services/venuesService";
import { successResponse, notFoundResponse, handleApiError } from "@/core/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
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
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params;
    const venue = await venuesService.deleteVenue(venueId);
    return successResponse(venue);
  } catch (error) {
    return handleApiError(error);
  }
}

