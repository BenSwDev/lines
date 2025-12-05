import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/**
 * HTTP utilities for API routes
 */

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  message: string,
  status = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details
      }
    },
    { status }
  );
}

/**
 * Handle Zod validation errors
 */
export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  return errorResponse(
    "שגיאת ולידציה",
    400,
    "VALIDATION_ERROR",
    error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message
    }))
  );
}

/**
 * Handle not found errors
 */
export function notFoundResponse(resource = "Resource"): NextResponse<ApiResponse> {
  return errorResponse(`${resource} לא נמצא`, 404, "NOT_FOUND");
}

/**
 * Handle unauthorized errors
 */
export function unauthorizedResponse(message = "אין הרשאה"): NextResponse<ApiResponse> {
  return errorResponse(message, 401, "UNAUTHORIZED");
}

/**
 * Handle forbidden errors
 */
export function forbiddenResponse(message = "גישה נדחתה"): NextResponse<ApiResponse> {
  return errorResponse(message, 403, "FORBIDDEN");
}

/**
 * Generic error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === "ZodError") {
      return validationErrorResponse(error as ZodError);
    }

    // Handle Prisma errors
    if (error.constructor.name === "PrismaClientKnownRequestError") {
      const prismaError = error as { code?: string };
      if (prismaError.code === "P2002") {
        return errorResponse("ערך כבר קיים במערכת", 409, "DUPLICATE");
      }
      if (prismaError.code === "P2025") {
        return notFoundResponse();
      }
    }

    return errorResponse(error.message, 500, "INTERNAL_ERROR");
  }

  return errorResponse("שגיאה לא צפויה", 500, "UNKNOWN_ERROR");
}
