import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: pnpm tsx scripts/make-user-admin.ts <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`ℹ️  User ${email} is already an admin`);
      process.exit(0);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "admin" }
    });

    console.log(`✅ Successfully updated ${email} to admin role`);
    console.log(`   User ID: ${updated.id}`);
    console.log(`   Name: ${updated.name || "N/A"}`);
    console.log(`   Role: ${updated.role}`);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

