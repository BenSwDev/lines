import { MenusPage } from "@/modules/venue-menus/ui/MenusPage";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/core/auth/session";

type Props = {
  params: Promise<{ venueId: string }>;
};

export default async function VenueMenusPage({ params }: Props) {
  const { venueId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const venueResult = await getVenue(venueId);
  if (!venueResult.success || !("data" in venueResult) || !venueResult.data) {
    redirect("/dashboard");
  }

  return <MenusPage venueId={venueId} venueName={venueResult.data.name} />;
}
