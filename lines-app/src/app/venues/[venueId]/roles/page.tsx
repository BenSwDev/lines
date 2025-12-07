import { RolesHierarchyPage } from "@/modules/roles-hierarchy/ui/RolesHierarchyPage";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser } from "@/core/auth/session";
import { listVenues } from "@/modules/venues/actions/listVenues";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { redirect } from "next/navigation";

type RolesPageProps = {
  params: Promise<{
    venueId: string;
  }>;
};

export default async function RolesPage({ params }: RolesPageProps) {
  const { venueId } = await params;
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const [venuesResult, venueResult] = await Promise.all([listVenues(), getVenue(venueId)]);

  const venues = venuesResult.success && "data" in venuesResult ? venuesResult.data || [] : [];
  const currentVenue = venueResult.success && "data" in venueResult ? venueResult.data : null;

  if (!currentVenue) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || null,
        email: user.email || ""
      }}
      venues={venues}
      currentVenue={currentVenue}
    >
      <RolesHierarchyPage venueId={venueId} />
    </DashboardLayout>
  );
}
