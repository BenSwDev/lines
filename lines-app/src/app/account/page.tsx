import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";
import { AccountPage } from "@/modules/account";
import { prisma } from "@/core/integrations/prisma/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser } from "@/core/auth/session";
import { listVenues } from "@/modules/venues/actions/listVenues";

export default async function AccountRoute() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const [user, venuesResult] = await Promise.all([
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

  const venuesList = venuesResult.success && "data" in venuesResult ? venuesResult.data || [] : [];

  return (
    <DashboardLayout
      user={{
        name: user.name,
        email: user.email,
        role: user.role
      }}
      venues={venuesList}
    >
      <AccountPage user={user} />
    </DashboardLayout>
  );
}
