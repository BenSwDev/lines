import { auth } from "@/core/auth/auth";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { listVenues } from "@/modules/venues/actions/listVenues";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { redirect } from "next/navigation";

export default async function VenueLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ venueId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { venueId } = await params;

  const [venueResult, venuesResult] = await Promise.all([getVenue(venueId), listVenues()]);

  if (!venueResult.success || !("data" in venueResult) || !venueResult.data) {
    redirect("/dashboard");
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
