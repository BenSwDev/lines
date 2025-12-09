import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return session.user;
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch user from DB to ensure we have the latest role
  const { prisma } = await import("@/core/integrations/prisma/client");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true, id: true, email: true, name: true }
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  const userRole = dbUser.role;

  if (userRole !== "admin") {
    redirect("/dashboard");
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: userRole
  };
}

export function isAdmin(user: { role?: string }): boolean {
  return user?.role === "admin";
}
