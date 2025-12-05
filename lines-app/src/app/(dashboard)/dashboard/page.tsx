import { redirect } from "next/navigation";
import { listVenues } from "@/modules/venues/actions/listVenues";
import { VenuesDashboard } from "@/modules/venues/ui/VenuesDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const venuesResult = await listVenues();
  const venues = venuesResult.success ? venuesResult.data || [] : [];

  if (venues.length === 0) {
    return <VenuesDashboard />;
  }

  // Redirect to first venue
  redirect(`/venues/${venues[0].id}/info`);
}

