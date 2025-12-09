import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test user...");

  const userPassword = await bcrypt.hash("demo123", 10);
  
  // Delete existing user if exists
  await prisma.user.deleteMany({ where: { email: "demo@lines.app" } });
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email: "demo@lines.app",
      name: "Demo User",
      password: userPassword,
      role: "user",
      emailVerified: new Date()
    }
  });

  console.log("✅ Created user:", user.email);

  // Delete existing venue if exists
  await prisma.venue.deleteMany({ where: { id: "demo-venue-1" } });

  // Create venue
  const venue = await prisma.venue.create({
    data: {
      id: "demo-venue-1",
      name: "דמו - מקום לדוגמה",
      userId: user.id
    }
  });

  console.log("✅ Created venue:", venue.name);

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
  console.log("\n✅ Test user ready!");
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

