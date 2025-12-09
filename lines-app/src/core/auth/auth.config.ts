import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/core/integrations/prisma/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          };
        } catch {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error"
  },
  callbacks: {
    async jwt({ token, user, trigger, session: sessionData }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        // Clear impersonation on new login
        delete token.impersonating;
        delete token.originalUserId;
        delete token.originalUserEmail;
        delete token.originalUserName;
      }

      // Handle impersonation start/stop via session update
      if (trigger === "update" && sessionData) {
        if ("impersonate" in sessionData && sessionData.impersonate) {
          const impersonateData = sessionData.impersonate as {
            originalUserId: string;
            originalUserEmail: string;
            originalUserName: string | null;
            impersonatedUserId: string;
            impersonatedUserEmail: string;
            impersonatedUserName: string | null;
          };
          
          // Store original user info
          token.originalUserId = impersonateData.originalUserId;
          token.originalUserEmail = impersonateData.originalUserEmail;
          token.originalUserName = impersonateData.originalUserName;
          
          // Switch to impersonated user
          token.id = impersonateData.impersonatedUserId;
          token.impersonating = true;
        } else if ("stopImpersonation" in sessionData && sessionData.stopImpersonation) {
          // Restore original user
          if (token.originalUserId) {
            token.id = token.originalUserId as string;
            delete token.impersonating;
            delete token.originalUserId;
            delete token.originalUserEmail;
            delete token.originalUserName;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        
        // Add impersonation info if active
        type SessionUserWithImpersonation = typeof session.user & {
          isImpersonating?: boolean;
          originalUserId?: string;
          originalUserEmail?: string;
          originalUserName?: string | null;
        };

        const userWithImpersonation = session.user as SessionUserWithImpersonation;
        if (token.impersonating) {
          userWithImpersonation.isImpersonating = true;
          userWithImpersonation.originalUserId = token.originalUserId as string;
          userWithImpersonation.originalUserEmail = token.originalUserEmail as string;
          userWithImpersonation.originalUserName = token.originalUserName as string | null;
        } else {
          userWithImpersonation.isImpersonating = false;
        }
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};
