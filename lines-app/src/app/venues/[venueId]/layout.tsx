import { auth } from "@/core/auth/auth";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { listVenues } from "@/modules/venues/actions/listVenues";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { redirect } from "next/navigation";
import { isDemoUserId, isDemoVenueId, validateDemoAccess } from "@/core/auth/demo";

export default async function VenueLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ venueId: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const { venueId } = await params;

  // CRITICAL: Check if this is a demo venue
  const isDemoVenue = isDemoVenueId(venueId);
  const isDemoUser = isDemoUserId(userId);

  // CRITICAL: Validate demo access
  const accessCheck = validateDemoAccess(userId, venueId, isDemoVenue || isDemoUser);
  if (!accessCheck.allowed) {
    if (isDemoVenue || isDemoUser) {
      redirect("/demo");
    } else {
      redirect("/dashboard");
    }
  }

  // CRITICAL: Real users must be authenticated for real venues
  if (!isDemoVenue && !session?.user) {
    redirect("/auth/login");
  }

  // CRITICAL: Demo venues should redirect to demo page
  if (isDemoVenue) {
    redirect("/demo");
  }

  // Real authenticated user - verify ownership
  // At this point, session must exist (we checked above)
  if (!session?.user) {
    redirect("/auth/login");
  }

  const [venueResult, venuesResult] = await Promise.all([getVenue(venueId), listVenues()]);

  if (!venueResult.success || !("data" in venueResult) || !venueResult.data) {
    redirect("/dashboard");
  }

  // CRITICAL: Ownership check - user must own the venue
  if (venueResult.data.userId !== userId) {
    redirect("/dashboard"); // Or 403 Forbidden
  }

  const venues = venuesResult.success && "data" in venuesResult ? venuesResult.data || [] : [];

  return (
    <DashboardLayout
      user={{
        name: session.user.name || null,
        email: session.user.email!
      }}
      venues={venues}
      currentVenue={venueResult.data}
    >
      {children}
    </DashboardLayout>
  );
}
