import type { User, Session, Account } from "@prisma/client";

export type { User, Session, Account };

export type UserRole = "user" | "admin";

export type UserWithoutPassword = Omit<User, "password">;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};
