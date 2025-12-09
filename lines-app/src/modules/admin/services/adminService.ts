import { prisma } from "@/core/integrations/prisma/client";

export class AdminService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            venues: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        venues: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            venues: true
          }
        }
      }
    });
  }

  async updateUserRole(userId: string, role: "user" | "admin") {
    return prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }

  async deleteUser(userId: string) {
    // Delete user and all related data (cascade)
    return prisma.user.delete({
      where: { id: userId }
    });
  }

  async getAllVenues() {
    return prisma.venue.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        _count: {
          select: {
            lines: true,
            zones: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getVenueById(venueId: string) {
    return prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        lines: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        },
        zones: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }
      }
    });
  }

  async deleteVenue(venueId: string) {
    return prisma.venue.delete({
      where: { id: venueId }
    });
  }

  async getUserStats() {
    const [totalUsers, totalAdmins, totalVenues, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.venue.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalRegularUsers: totalUsers - totalAdmins,
      totalVenues,
      recentUsers
    };
  }
}

export const adminService = new AdminService();
