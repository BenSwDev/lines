import { VenuesHomePage } from "@/modules/venues";
import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen">
      <VenuesHomePage />
    </div>
  );
}
