import { VenueMapPage } from "@/modules/venue-map/ui/VenueMapPage";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/core/auth/session";
import { isDemoVenueId, isDemoUserId, validateDemoAccess } from "@/core/auth/demo";

type Props = {
  params: Promise<{ venueId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VenueMapRoute({ params, searchParams }: Props) {
  const { venueId } = await params;
  const searchParamsObj = await searchParams;
  const user = await getCurrentUser();

  // CRITICAL: Check if this is demo mode
  const isInDemoMode = searchParamsObj?.demo === "true" || isDemoVenueId(venueId);
  const userIsDemo = isDemoUserId(user?.id);

  // CRITICAL: Validate demo access
  const accessCheck = validateDemoAccess(user?.id, venueId, isInDemoMode);
  if (!accessCheck.allowed) {
    if (isInDemoMode || userIsDemo) {
      redirect("/demo");
    } else {
      redirect("/dashboard");
    }
  }

  // CRITICAL: Real users must be authenticated
  if (!isInDemoMode && !user) {
    redirect("/auth/login");
  }

  // CRITICAL: Real users must own the venue
  if (!isInDemoMode && user) {
    const venueResult = await getVenue(venueId);
    if (!venueResult.success || !("data" in venueResult) || !venueResult.data) {
      redirect("/dashboard");
    }

    // Ownership check - user must own the venue
    if (venueResult.data.userId !== user.id) {
      redirect("/dashboard"); // Or 403 Forbidden
    }

    return (
      <VenueMapPage venueId={venueId} venueName={venueResult.data.name} userId={user.id || ""} />
    );
  }

  // Demo mode - use demo data (should be handled separately, but for now redirect to demo)
  redirect("/demo");
}
