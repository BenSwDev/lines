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
  const user = await requireAuth();

  if ((user as { role?: string }).role !== "admin") {
    redirect("/");
  }

  return user;
}

export function isAdmin(user: { role?: string }): boolean {
  return user?.role === "admin";
}
