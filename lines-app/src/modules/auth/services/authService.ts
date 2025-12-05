import { prisma } from "@/core/integrations/prisma/client";
import bcrypt from "bcryptjs";

export class AuthService {
  async createUser(data: { email: string; password: string; name?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: "user"
      }
    });
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async updateUserRole(userId: string, role: "user" | "admin") {
    return prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }
}

export const authService = new AuthService();

