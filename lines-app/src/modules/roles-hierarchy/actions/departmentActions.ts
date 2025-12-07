"use server";

import { departmentsService } from "../services/departmentsService";
import { createDepartmentSchema, updateDepartmentSchema } from "../schemas/departmentSchemas";
import { getCurrentUser } from "@/core/auth/session";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";
import { z } from "zod";

export async function listDepartments(venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => departmentsService.listDepartments(venueId),
      "Error fetching departments"
    );

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export async function getDepartment(id: string, venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => departmentsService.getDepartment(id),
      "Error fetching department"
    );

    if (!result.success) {
      return result;
    }

    // Verify department belongs to venue
    if (result.data && result.data.venueId !== venueId) {
      return { success: false, error: "Department not found" };
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export async function createDepartment(venueId: string, input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createDepartmentSchema.parse(input);

    const result = await withErrorHandling(
      () => departmentsService.createDepartment(venueId, validated),
      "Error creating department"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/roles`);
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export async function updateDepartment(id: string, venueId: string, input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateDepartmentSchema.parse(input);

    const result = await withErrorHandling(
      () => departmentsService.updateDepartment(id, venueId, validated),
      "Error updating department"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/roles`);
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export async function deleteDepartment(id: string, venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => departmentsService.deleteDepartment(id, venueId),
      "Error deleting department"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/roles`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export async function getDepartmentHierarchy(venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => departmentsService.getDepartmentHierarchy(venueId),
      "Error fetching department hierarchy"
    );

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}
