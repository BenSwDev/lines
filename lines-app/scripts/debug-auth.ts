import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function debugAuth() {
  const email = "demo@lines.app";
  const password = "demo123";

  console.log("🔍 Debugging authentication...\n");

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log("❌ User not found!");
    return;
  }

  console.log("✅ User found:");
  console.log("   Email:", user.email);
  console.log("   Has password:", !!user.password);
  console.log("   Password hash:", user.password?.substring(0, 20) + "...");

  // 2. Test password
  if (!user.password) {
    console.log("\n❌ User has no password!");
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hash }
    });
    console.log("✅ Password set");
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  console.log("\n🔍 Password check:");
  console.log("   Input:", password);
  console.log("   Valid:", isValid);

  if (!isValid) {
    console.log("\n❌ Password mismatch! Updating...");
    const newHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: newHash }
    });
    console.log("✅ Password updated");

    // Test again
    const updatedUser = await prisma.user.findUnique({
      where: { email }
    });
    const isValidNow = await bcrypt.compare(password, updatedUser!.password!);
    console.log("   Now valid:", isValidNow);
  }
}

debugAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
