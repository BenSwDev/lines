import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lines.app" },
    update: {},
    create: {
      email: "admin@lines.app",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      emailVerified: new Date()
    }
  });

  console.log("✅ Created admin user:", admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@lines.app" },
    update: {},
    create: {
      email: "demo@lines.app",
      name: "Demo User",
      password: userPassword,
      role: "user",
      emailVerified: new Date()
    }
  });

  console.log("✅ Created demo user:", user.email);

  // Create sample venue for demo user
  const venue = await prisma.venue.upsert({
    where: { id: "demo-venue-1" },
    update: {},
    create: {
      id: "demo-venue-1",
      name: "דמו - מקום לדוגמה",
      userId: user.id
    }
  });

  console.log("✅ Created demo venue:", venue.name);

  // Create venue details
  await prisma.venueDetails.upsert({
    where: { venueId: venue.id },
    update: {},
    create: {
      venueId: venue.id,
      phone: "050-1234567",
      email: "info@demo-venue.com",
      address: "רחוב הדמו 123, תל אביב"
    }
  });

  console.log("✅ Created venue details");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Demo Credentials:");
  console.log("   Admin: admin@lines.app / admin123");
  console.log("   User:  demo@lines.app / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

