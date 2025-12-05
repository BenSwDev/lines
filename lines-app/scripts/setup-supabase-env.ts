#!/usr/bin/env tsx
/**
 * Script to fetch Supabase connection string from Vercel and create .env.local
 */

import { execSync } from "child_process";
import * as fs from "fs";

async function main() {
  console.log("🔗 Setting up Supabase environment...");

  // Get project ref from supabase link
  const projectRef = "ejgahswhgvocxorqcree"; // From supabase link output

  // Build DATABASE_URL
  const databaseUrl = `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`;

  console.log("\n📝 Please complete the DATABASE_URL in Vercel Dashboard:");
  console.log(
    "   1. Go to: https://vercel.com/ben-swissa/lines-app/settings/environment-variables"
  );
  console.log("   2. Find POSTGRES_URL (from Supabase integration)");
  console.log("   3. Set DATABASE_URL to the same value");
  console.log("\n🔄 Then run: vercel env pull .env.local");
  console.log("\n✅ After that, run: pnpm db:push");
}

main().catch(console.error);
