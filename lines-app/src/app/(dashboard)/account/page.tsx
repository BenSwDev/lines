import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";
import { AccountPage } from "@/modules/account/ui/AccountPage";
import { prisma } from "@/core/integrations/prisma/client";

export default async function Account() {
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

  return <AccountPage user={user} />;
}

