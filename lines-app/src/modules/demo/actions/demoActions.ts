/**
 * Demo Actions
 * 
 * Next.js Server Actions for the demo module.
 * Currently minimal as demo is primarily client-side,
 * but prepared for future server-side features.
 */

"use server";

import { demoService } from "../services/demoService";
import { demoAnalyticsEventSchema } from "../schemas/demoSchemas";
import { withErrorHandling } from "@/core/http/errorHandler";
import type { DemoAnalyticsEvent } from "../types";

/**
 * Track a demo analytics event
 * 
 * @param input - Analytics event data
 * @returns Success status
 */
export async function trackDemoEvent(input: unknown) {
  return withErrorHandling(async () => {
    const validated = demoAnalyticsEventSchema.parse(input);
    
    await demoService.trackEvent(validated as DemoAnalyticsEvent);
    
    return { success: true };
  }, "Failed to track demo event");
}

/**
 * Get demo configuration
 * 
 * @returns Demo configuration
 */
export async function getDemoConfig() {
  return withErrorHandling(
    async () => {
      const config = await demoService.getConfig();
      return { success: true, data: config };
    },
    "Failed to load demo configuration"
  );
}

/**
 * Generate demo data for a user
 * 
 * Future: Create sample data for interactive demo
 * 
 * @param userId - User ID to generate data for
 * @returns Success status
 */
export async function generateDemoData(userId: string) {
  return withErrorHandling(
    async () => {
      await demoService.generateDemoData(userId);
      return { success: true };
    },
    "Failed to generate demo data"
  );
}

