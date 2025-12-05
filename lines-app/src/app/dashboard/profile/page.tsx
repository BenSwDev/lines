import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";
import { ProfilePage } from "@/modules/profile";
import { prisma } from "@/core/integrations/prisma/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser } from "@/core/auth/session";
import { listVenues } from "@/modules/venues/actions/listVenues";

export default async function DashboardProfile() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const [user, venues] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
    }),
    getCurrentUser().then((u) => (u ? listVenues() : { success: false, data: [] })),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  const venuesList = venues.success ? venues.data || [] : [];

  return (
    <DashboardLayout user={user} venues={venuesList}>
      <ProfilePage user={user} />
    </DashboardLayout>
  );
}

