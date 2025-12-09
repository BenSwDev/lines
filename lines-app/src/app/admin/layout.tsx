import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { listVenues } from "@/modules/venues/actions/listVenues";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/integrations/prisma/client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch user from DB to ensure we have the latest role
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true }
  });

  // Use role from DB if available, otherwise fall back to session
  const userRole = dbUser?.role || (session.user as { role?: string }).role;
  
  if (userRole !== "admin") {
    redirect("/dashboard");
  }

  const venuesResult = await listVenues();
  const venues = venuesResult.success && "data" in venuesResult ? venuesResult.data || [] : [];

  return (
    <DashboardLayout
      user={{
        name: session.user.name || null,
        email: session.user.email!,
        role: userRole
      }}
      venues={venues}
    >
      {children}
    </DashboardLayout>
  );
}

