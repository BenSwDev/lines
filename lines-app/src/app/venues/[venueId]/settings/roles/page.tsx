import { RolesHierarchyPage } from "@/modules/roles-hierarchy/ui/RolesHierarchyPage";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { getCurrentUser } from "@/core/auth/session";

type RolesPageProps = {
  params: Promise<{
    venueId: string;
  }>;
};

export default async function RolesPage({ params }: RolesPageProps) {
  const { venueId } = await params;
  
  // Get venue to find owner
  const venueResult = await getVenue(venueId);
  const user = await getCurrentUser();
  
  const ownerUserId = venueResult.success && "data" in venueResult ? venueResult.data?.userId : undefined;
  const ownerName = user?.name || user?.email || "בעלים";

  return <RolesHierarchyPage venueId={venueId} ownerUserId={ownerUserId} ownerName={ownerName} />;
}
