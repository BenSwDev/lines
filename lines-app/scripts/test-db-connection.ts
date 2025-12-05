import { prisma } from "../src/core/integrations/prisma/client";

async function testConnection() {
  try {
    console.log("🔗 Testing database connection...");

    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("✅ Query test passed:", result);

    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);

    await prisma.$disconnect();
    console.log("✅ Disconnected successfully");

    console.log("\n🎉 Database connection test PASSED!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection test FAILED:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
