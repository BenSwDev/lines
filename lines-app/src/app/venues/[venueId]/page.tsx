import { redirect } from "next/navigation";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { getCurrentUser } from "@/core/auth/session";
import { VenueDashboard } from "@/modules/venues/ui/VenueDashboard";

type Props = {
  params: Promise<{ venueId: string }>;
};

export default async function VenueDashboardPage({ params }: Props) {
  const { venueId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const venueResult = await getVenue(venueId);
  if (!venueResult.success || !("data" in venueResult) || !venueResult.data) {
    redirect("/dashboard");
  }

  return <VenueDashboard venue={venueResult.data} />;
}
