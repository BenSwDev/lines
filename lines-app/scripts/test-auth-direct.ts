import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testAuth() {
  console.log("🔍 Testing authentication...\n");

  // 1. Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: "demo@lines.app" }
  });

  if (!user) {
    console.log("❌ User does not exist!");
    console.log("Creating user...");
    const password = await bcrypt.hash("demo123", 10);
    const newUser = await prisma.user.create({
      data: {
        email: "demo@lines.app",
        name: "Demo User",
        password,
        role: "user",
        emailVerified: new Date()
      }
    });
    console.log("✅ User created:", newUser.email);
  } else {
    console.log("✅ User exists:", user.email);
    console.log("   Has password:", !!user.password);
    console.log("   Password length:", user.password?.length || 0);
  }

  // 2. Test password verification
  const testPassword = "demo123";
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  console.log("\n🔍 Testing password hash...");
  console.log("   New hash length:", hashedPassword.length);

  if (user?.password) {
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log("   Password match:", isValid);
    if (!isValid) {
      console.log("   ❌ Password does not match!");
      console.log("   Updating password...");
      await prisma.user.update({
        where: { email: "demo@lines.app" },
        data: { password: hashedPassword }
      });
      console.log("   ✅ Password updated");
    }
  }

  // 3. Verify venue exists
  const venue = await prisma.venue.findUnique({
    where: { id: "demo-venue-1" }
  });

  if (!venue) {
    console.log("\n❌ Venue does not exist!");
    const finalUser = await prisma.user.findUnique({
      where: { email: "demo@lines.app" }
    });
    if (finalUser) {
      await prisma.venue.create({
        data: {
          id: "demo-venue-1",
          name: "דמו - מקום לדוגמה",
          userId: finalUser.id
        }
      });
      console.log("✅ Venue created");
    }
  } else {
    console.log("\n✅ Venue exists:", venue.name);
  }

  console.log("\n✅ Auth test complete!");
}

testAuth()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

