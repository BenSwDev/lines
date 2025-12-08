/**
 * Cleanup Script - Delete Unused Files
 *
 * This script removes the deprecated venue-map module and related files
 * that have been replaced by the new floor-plan-editor module.
 *
 * Run with: node scripts/cleanup-unused-files.js
 */

const fs = require("fs");
const path = require("path");

// Files and directories to delete
const itemsToDelete = [
  // Deprecated venue-map module (entire folder) - ALREADY DELETED
  "src/modules/venue-map",

  // Deprecated venue-settings module (has broken imports from venue-map)
  "src/modules/venue-settings",

  // Old map page route - ALREADY DELETED
  "src/app/venues/[venueId]/map",

  // Old migration file if not applied - ALREADY DELETED
  "prisma/migrations/add_floor_plan_model.sql"
];

function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
        console.log(`  Deleted file: ${curPath}`);
      }
    });
    fs.rmdirSync(dirPath);
    console.log(`  Deleted folder: ${dirPath}`);
  }
}

function deleteItem(itemPath) {
  const fullPath = path.join(process.cwd(), itemPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  [SKIP] Not found: ${itemPath}`);
    return false;
  }

  const stats = fs.lstatSync(fullPath);

  if (stats.isDirectory()) {
    deleteFolderRecursive(fullPath);
    console.log(`[DELETED] Directory: ${itemPath}`);
    return true;
  } else {
    fs.unlinkSync(fullPath);
    console.log(`[DELETED] File: ${itemPath}`);
    return true;
  }
}

console.log("=".repeat(60));
console.log("Cleanup Script - Removing Deprecated venue-map Module");
console.log("=".repeat(60));
console.log("");

let deletedCount = 0;
let skippedCount = 0;

for (const item of itemsToDelete) {
  try {
    if (deleteItem(item)) {
      deletedCount++;
    } else {
      skippedCount++;
    }
  } catch (error) {
    console.error(`  [ERROR] Failed to delete ${item}: ${error.message}`);
  }
}

console.log("");
console.log("=".repeat(60));
console.log(`Summary: ${deletedCount} items deleted, ${skippedCount} items skipped`);
console.log("=".repeat(60));
