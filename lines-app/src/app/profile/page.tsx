import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";
import { ProfilePage } from "@/modules/profile";
import { prisma } from "@/core/integrations/prisma/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser } from "@/core/auth/session";
import { listVenues } from "@/modules/venues/actions/listVenues";

export default async function ProfileRoute() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const [user, venues] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email }
    }),
    getCurrentUser().then(async (u) =>
      u ? await listVenues() : { success: false as const, error: "Unauthorized" }
    )
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  const venuesList = venues.success && "data" in venues ? venues.data || [] : [];

  return (
    <DashboardLayout
      user={{
        name: user.name,
        email: user.email,
        role: user.role
      }}
      venues={venuesList}
    >
      <ProfilePage user={user} />
    </DashboardLayout>
  );
}
