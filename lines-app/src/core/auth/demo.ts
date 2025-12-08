/**
 * Demo Mode Detection & Isolation
 * Ensures demo mode is completely separated from authenticated routes
 */

/**
 * Check if current request is in demo mode
 */
export function isDemoMode(searchParams?: URLSearchParams | string): boolean {
  if (typeof searchParams === "string") {
    return searchParams.includes("demo=true");
  }
  if (searchParams) {
    return searchParams.get("demo") === "true";
  }
  return false;
}

/**
 * Check if user ID is a demo user ID
 */
export function isDemoUserId(userId: string | undefined | null): boolean {
  if (!userId) return false;
  return userId.startsWith("demo-");
}

/**
 * Check if venue ID is a demo venue ID
 */
export function isDemoVenueId(venueId: string | undefined | null): boolean {
  if (!venueId) return false;
  return venueId.startsWith("demo-venue-");
}

/**
 * Validate that demo users can only access demo venues
 */
export function validateDemoAccess(
  userId: string | undefined | null,
  venueId: string | undefined | null,
  isDemoMode: boolean
): { allowed: boolean; reason?: string } {
  const userIsDemo = isDemoUserId(userId);
  const venueIsDemo = isDemoVenueId(venueId);

  // Demo mode: only allow demo users accessing demo venues
  if (isDemoMode || userIsDemo || venueIsDemo) {
    if (!userIsDemo || !venueIsDemo) {
      return {
        allowed: false,
        reason: "Demo users can only access demo venues"
      };
    }
    return { allowed: true };
  }

  // Real mode: only allow real users accessing real venues
  if (userIsDemo || venueIsDemo) {
    return {
      allowed: false,
      reason: "Real users cannot access demo venues"
    };
  }

  return { allowed: true };
}
