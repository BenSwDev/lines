"use server";

import { prisma } from "@/core/integrations/prisma/client";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";
import type { FloorPlanElement } from "../ui/FloorPlanEditorV2";
import type { Prisma } from "@prisma/client";

export type FloorPlanTemplateItem = {
  id: string;
  userId: string;
  venueId?: string | null;
  name: string;
  description?: string | null;
  elements: FloorPlanElement[];
  defaultCapacity: number;
};

/**
 * Load all custom templates for a user (and optionally for a venue)
 */
export async function loadUserTemplates(userId: string, venueId?: string) {
  return withErrorHandling(async () => {
    const templates = await prisma.floorPlanTemplate.findMany({
      where: {
        userId,
        ...(venueId ? { venueId } : { venueId: null }) // Global templates or venue-specific
      },
      orderBy: { createdAt: "desc" }
    });

    const mappedTemplates = templates.map((t) => ({
      id: t.id,
      userId: t.userId,
      venueId: t.venueId,
      name: t.name,
      description: t.description,
            elements: (t.elements as unknown as FloorPlanElement[]),
      defaultCapacity: t.defaultCapacity || 0
    }));

    return { success: true, data: mappedTemplates };
  }, "Error loading templates");
}

/**
 * Save a custom template
 */
export async function saveTemplate(
  userId: string,
  name: string,
  elements: FloorPlanElement[],
  defaultCapacity: number = 0,
  description?: string,
  venueId?: string
) {
  try {
    const template = await prisma.floorPlanTemplate.create({
      data: {
        userId,
        venueId: venueId || null,
        name,
        description: description || null,
        elements: elements as unknown as Prisma.InputJsonValue,
        defaultCapacity
      }
    });

    revalidatePath(`/venues/${venueId || ""}/map`);
    return { success: true, data: template };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "errors.savingData" };
  }
}

/**
 * Delete a custom template
 */
export async function deleteTemplate(templateId: string, userId: string) {
  try {
    // Verify ownership
    const template = await prisma.floorPlanTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.floorPlanTemplate.delete({
      where: { id: templateId }
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "errors.deletingData" };
  }
}

/**
 * Update a custom template
 */
export async function updateTemplate(
  templateId: string,
  userId: string,
  updates: {
    name?: string;
    description?: string;
    elements?: FloorPlanElement[];
    defaultCapacity?: number;
  }
) {
  try {
    // Verify ownership
    const template = await prisma.floorPlanTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template || template.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await prisma.floorPlanTemplate.update({
      where: { id: templateId },
      data: {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.elements !== undefined && { elements: updates.elements as unknown as Prisma.InputJsonValue }),
        ...(updates.defaultCapacity !== undefined && { defaultCapacity: updates.defaultCapacity })
      }
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "errors.updatingData" };
  }
}

