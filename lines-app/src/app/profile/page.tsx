import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";
import { ProfilePage } from "@/modules/account/ui/ProfilePage";
import { prisma } from "@/core/integrations/prisma/client";

export default async function Profile() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return <ProfilePage user={user} />;
}

