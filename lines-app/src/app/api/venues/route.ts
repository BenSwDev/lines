import { NextRequest } from "next/server";
import { venuesService } from "@/modules/venues/services/venuesService";
import { createVenueSchema } from "@/modules/venues/schemas/venueSchemas";
import {
  successResponse,
  handleApiError,
  validationErrorResponse,
} from "@/core/http";

export async function GET() {
  try {
    const venues = await venuesService.listVenues();
    return successResponse(venues);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createVenueSchema.parse(body);
    
    const venue = await venuesService.createVenue(validated.name);
    
    return successResponse(venue, 201);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return validationErrorResponse(error as unknown as import("zod").ZodError);
    }
    return handleApiError(error);
  }
}

