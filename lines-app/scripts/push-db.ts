#!/usr/bin/env tsx
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Read .env.production
const envPath = path.join(process.cwd(), ".env.production");
const envContent = fs.readFileSync(envPath, "utf-8");

// Parse DATABASE_URL
const match = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

const databaseUrl = match[1].trim();

// Set env and run prisma
process.env.DATABASE_URL = databaseUrl;

console.log("🔗 Pushing schema to Supabase...");
execSync("npx prisma db push", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl }
});

console.log("✅ Schema pushed successfully!");
