import { NextRequest } from "next/server";
import { venuesService } from "@/modules/venues/services/venuesService";
import { createVenueSchema } from "@/modules/venues/schemas/venueSchemas";
import { getCurrentUser } from "@/core/auth/session";
import {
  successResponse,
  handleApiError,
  validationErrorResponse,
  unauthorizedResponse
} from "@/core/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const venues = await venuesService.listUserVenues(user.id);
    return successResponse(venues);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validated = createVenueSchema.parse(body);

    const venue = await venuesService.createVenue(validated.name, user.id);

    return successResponse(venue, 201);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return validationErrorResponse(error as unknown as import("zod").ZodError);
    }
    return handleApiError(error);
  }
}
