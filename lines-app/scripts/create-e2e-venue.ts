import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating E2E test venue...");

  // Get or create test user
  let user = await prisma.user.findUnique({
    where: { email: "demo@lines.app" }
  });

  if (!user) {
    console.log("❌ User demo@lines.app not found. Run db:test-user first.");
    process.exit(1);
  }

  // Delete existing test venue if exists
  await prisma.venue.deleteMany({ where: { id: "test-venue-e2e" } });

  // Create REAL venue (not demo) - ID doesn't start with "demo-"
  const venue = await prisma.venue.create({
    data: {
      id: "test-venue-e2e",
      name: "Test Venue E2E",
      userId: user.id
    }
  });

  console.log("✅ Created test venue:", venue.id, venue.name);

  // Create venue details
  await prisma.venueDetails.upsert({
    where: { venueId: venue.id },
    update: {},
    create: {
      venueId: venue.id,
      phone: "050-1234567",
      email: "test@venue.com",
      address: "Test Address"
    }
  });

  console.log("✅ Venue ready for E2E tests!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
