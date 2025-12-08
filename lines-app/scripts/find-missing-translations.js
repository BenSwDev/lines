const fs = require("fs");
const path = require("path");

// Read translation files
const enPath = path.join(__dirname, "../messages/en.json");
const hePath = path.join(__dirname, "../messages/he.json");

const enTranslations = JSON.parse(fs.readFileSync(enPath, "utf8"));
const heTranslations = JSON.parse(fs.readFileSync(hePath, "utf8"));

// Find all translation keys used in the codebase
const srcPath = path.join(__dirname, "../src");
const missingKeys = new Map(); // key -> { defaultValue: string, file: string, line: number, isHebrew: boolean }

// Recursively find all TypeScript/TSX files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (!file.startsWith(".") && file !== "node_modules" && file !== ".next") {
        findFiles(filePath, fileList);
      }
    } else if (
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".js") ||
      file.endsWith(".jsx")
    ) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Check if a string contains Hebrew characters
function containsHebrew(str) {
  return /[\u0590-\u05FF]/.test(str);
}

// Check if a key looks like a valid translation key (not a path, special value, etc.)
function isValidTranslationKey(key) {
  // Skip keys that look like paths
  if (key.startsWith("/") || key.includes("://")) {
    return false;
  }
  // Skip single character keys (likely typos or special values)
  if (key.length <= 1 && !key.match(/^[a-zA-Z]$/)) {
    return false;
  }
  // Skip keys that are just special characters
  if (/^[^a-zA-Z0-9]+$/.test(key)) {
    return false;
  }
  // Skip keys that look like variable names without namespace
  if (!key.includes(".") && key.length < 3) {
    return false;
  }
  // Skip common non-translation keys
  const skipKeys = [
    "zod",
    "development",
    "view",
    "date",
    "back",
    "edit",
    "cancel",
    "next",
    "table",
    "newFloorPlan",
    "createFloorPlan",
    "creating",
    "rectangle",
    "square",
    "lShape",
    "custom",
    "whatShapeIsYourVenue",
    "small",
    "medium",
    "large",
    "howBigIsYourVenue",
    "selectApproximateSize",
    "addZonesToYourVenue",
    "dragZonesToAdd",
    "addedZones",
    "noZonesYet",
    "clickButtonsAbove",
    "noSeatingZones",
    "goBackToAddZones",
    "configureTablesInZones",
    "numberOfTables",
    "seatsPerTable",
    "totalSeats",
    "almostDone",
    "reviewAndFinish",
    "summary",
    "zones",
    "tables",
    "seats",
    "floorPlanName",
    "linkToLines"
  ];
  if (skipKeys.includes(key)) {
    return false;
  }
  return true;
}

// Extract translation keys from a file
function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, lineNum) => {
    // Pattern: t("key", { defaultValue: "..." })
    const pattern = /t\(["']([^"']+)["']\s*,\s*\{[^}]*defaultValue:\s*["']([^"']+)["']/g;
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const key = match[1];
      const defaultValue = match[2];

      if (!isValidTranslationKey(key)) {
        continue;
      }

      if (!missingKeys.has(key)) {
        missingKeys.set(key, {
          defaultValue,
          file: filePath,
          line: lineNum + 1,
          hasDefaultValue: true,
          isHebrew: containsHebrew(defaultValue)
        });
      }
    }
  });
}

// Check if a key exists in translations (nested object)
function keyExists(obj, keyPath) {
  const parts = keyPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }
  return typeof current === "string" && current.length > 0;
}

// Set a nested key in translations
function setNestedKey(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

// Get nested key value
function getNestedKey(obj, keyPath) {
  const parts = keyPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

console.log("🔍 Scanning codebase for translation keys...\n");

// Find all source files
const files = findFiles(srcPath);
console.log(`📁 Found ${files.length} source files\n`);

// Extract keys from all files
files.forEach((file) => {
  try {
    extractKeys(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`🔑 Found ${missingKeys.size} unique translation keys with defaultValue\n`);

// Find missing keys
const missingInEn = [];
const missingInHe = [];
const missingInBoth = [];

missingKeys.forEach((info, key) => {
  const existsInEn = keyExists(enTranslations, key);
  const existsInHe = keyExists(heTranslations, key);

  if (!existsInEn && !existsInHe) {
    missingInBoth.push({ key, ...info });
  } else if (!existsInEn) {
    missingInEn.push({ key, ...info });
  } else if (!existsInHe) {
    missingInHe.push({ key, ...info });
  }
});

console.log("📊 Missing translations summary:");
console.log(`   Missing in both: ${missingInBoth.length}`);
console.log(`   Missing in EN only: ${missingInEn.length}`);
console.log(`   Missing in HE only: ${missingInHe.length}\n`);

// Add missing keys to translation files
if (missingInBoth.length > 0 || missingInEn.length > 0) {
  console.log("➕ Adding missing keys to en.json...");
  missingInBoth.forEach(({ key, defaultValue, isHebrew }) => {
    // If defaultValue is Hebrew, use a reasonable English translation or the key name
    if (isHebrew) {
      // Try to infer English from key or use key as fallback
      const parts = key.split(".");
      const lastPart = parts[parts.length - 1];
      // Convert camelCase to Title Case
      const englishValue = lastPart
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      setNestedKey(enTranslations, key, englishValue);
    } else {
      setNestedKey(enTranslations, key, defaultValue);
    }
  });
  missingInEn.forEach(({ key, defaultValue, isHebrew }) => {
    if (isHebrew) {
      const parts = key.split(".");
      const lastPart = parts[parts.length - 1];
      const englishValue = lastPart
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      setNestedKey(enTranslations, key, englishValue);
    } else {
      setNestedKey(enTranslations, key, defaultValue);
    }
  });
}

if (missingInBoth.length > 0 || missingInHe.length > 0) {
  console.log("➕ Adding missing keys to he.json...");
  missingInBoth.forEach(({ key, defaultValue, isHebrew }) => {
    if (isHebrew) {
      // Use the Hebrew defaultValue
      setNestedKey(heTranslations, key, defaultValue);
    } else {
      // If defaultValue is English, we need to translate it
      // For now, use the key name or a placeholder
      const parts = key.split(".");
      const lastPart = parts[parts.length - 1];
      setNestedKey(heTranslations, key, `[${lastPart}]`);
    }
  });
  missingInHe.forEach(({ key, defaultValue, isHebrew }) => {
    if (isHebrew) {
      setNestedKey(heTranslations, key, defaultValue);
    } else {
      const parts = key.split(".");
      const lastPart = parts[parts.length - 1];
      setNestedKey(heTranslations, key, `[${lastPart}]`);
    }
  });
}

// Write updated translation files
if (missingInBoth.length > 0 || missingInEn.length > 0 || missingInHe.length > 0) {
  console.log("\n💾 Writing updated translation files...");
  fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2) + "\n", "utf8");
  fs.writeFileSync(hePath, JSON.stringify(heTranslations, null, 2) + "\n", "utf8");
  console.log("✅ Translation files updated!\n");
} else {
  console.log("✅ All translation keys are present!\n");
}

// Print detailed report
if (missingInBoth.length > 0 || missingInEn.length > 0 || missingInHe.length > 0) {
  console.log("📋 Detailed report:\n");

  if (missingInBoth.length > 0) {
    console.log(`Missing in both EN and HE (${missingInBoth.length}):`);
    missingInBoth.forEach(({ key, defaultValue, file, line, isHebrew }) => {
      const relFile = path.relative(process.cwd(), file);
      console.log(`  - ${key}`);
      console.log(`    Default: "${defaultValue}" ${isHebrew ? "(Hebrew)" : "(English)"}`);
      console.log(`    File: ${relFile}:${line}`);
    });
    console.log("");
  }

  if (missingInEn.length > 0) {
    console.log(`Missing in EN only (${missingInEn.length}):`);
    missingInEn.forEach(({ key, defaultValue, file, line, isHebrew }) => {
      const relFile = path.relative(process.cwd(), file);
      console.log(`  - ${key}`);
      console.log(`    Default: "${defaultValue}" ${isHebrew ? "(Hebrew)" : "(English)"}`);
      console.log(`    File: ${relFile}:${line}`);
    });
    console.log("");
  }

  if (missingInHe.length > 0) {
    console.log(`Missing in HE only (${missingInHe.length}):`);
    missingInHe.forEach(({ key, defaultValue, file, line, isHebrew }) => {
      const relFile = path.relative(process.cwd(), file);
      console.log(`  - ${key}`);
      console.log(`    Default: "${defaultValue}" ${isHebrew ? "(Hebrew)" : "(English)"}`);
      console.log(`    File: ${relFile}:${line}`);
    });
    console.log("");
  }
}

console.log("✨ Done!");
console.log(
  "\n⚠️  Note: Keys with English defaultValue in he.json are marked with [key] and need manual translation."
);
console.log(
  "⚠️  Note: Keys with Hebrew defaultValue in en.json have auto-generated English - please review and update."
);
