"use server";

import { rolesService } from "../services/rolesService";
import { createRoleSchema, updateRoleSchema } from "../schemas/roleSchemas";
import { getCurrentUser } from "@/core/auth/session";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";
import { z } from "zod";

export async function listRoles(venueId: string, parentRoleId?: string | null) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => rolesService.listRoles(venueId, parentRoleId ?? undefined),
      "Error fetching roles"
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

export async function getRole(id: string, venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(() => rolesService.getRole(id), "Error fetching role");

    if (!result.success) {
      return result;
    }

    // Verify role belongs to venue
    if (result.data && result.data.venueId !== venueId) {
      return { success: false, error: "Role not found" };
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export async function createRole(venueId: string, input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createRoleSchema.parse(input);

    const result = await withErrorHandling(
      () => rolesService.createRole(venueId, validated),
      "Error creating role"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/settings/roles`);
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

export async function updateRole(id: string, venueId: string, input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateRoleSchema.parse(input);

    const result = await withErrorHandling(
      () => rolesService.updateRole(id, venueId, validated),
      "Error updating role"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/settings/roles`);
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

export async function deleteRole(id: string, venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => rolesService.deleteRole(id, venueId),
      "Error deleting role"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/settings/roles`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export async function getManagementRoles(venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => rolesService.getManagementRoles(venueId),
      "Error fetching management roles"
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

export async function getManagerRoles(venueId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => rolesService.getManagerRoles(venueId),
      "Error fetching manager roles"
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
