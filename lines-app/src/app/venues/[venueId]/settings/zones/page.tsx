import { ZonesPage } from "@/modules/zones/ui/ZonesPage";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/core/auth/session";

type Props = {
  params: Promise<{ venueId: string }>;
};

export default async function VenueZonesPage({ params }: Props) {
  const { venueId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const venueResult = await getVenue(venueId);
  if (!venueResult.success || !venueResult.data) {
    redirect("/dashboard");
  }

  return <ZonesPage venueId={venueId} venueName={venueResult.data.name} />;
}

