import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/core/integrations/prisma/client";
import { authConfig } from "./auth.config";

// Generate a fallback secret if none is provided (for development/testing)
const getSecret = () => {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;
  // Fallback for development/testing - must be at least 32 characters
  return "test-secret-for-development-only-change-in-production-min-32-chars";
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: getSecret()
});
