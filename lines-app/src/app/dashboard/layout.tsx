import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { listVenues } from "@/modules/venues/actions/listVenues";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const venuesResult = await listVenues();
  const venues = venuesResult.success && "data" in venuesResult ? venuesResult.data || [] : [];

  return (
    <DashboardLayout
      user={{
        name: session.user.name || null,
        email: session.user.email!,
        role: (session.user as { role?: string }).role
      }}
      venues={venues}
    >
      {children}
    </DashboardLayout>
  );
}
