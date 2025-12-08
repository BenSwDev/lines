-- Migration: Add FloorPlan model and update related tables
-- This migration transforms the venue-map system to use FloorPlans

-- ============================================================================
-- STEP 1: Create floor_plans table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "floor_plans" (
    "id" TEXT NOT NULL,
    "venue_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_plans_pkey" PRIMARY KEY ("id")
);

-- Indexes for floor_plans
CREATE INDEX IF NOT EXISTS "floor_plans_venue_id_idx" ON "floor_plans"("venue_id");
CREATE INDEX IF NOT EXISTS "floor_plans_venue_id_is_default_idx" ON "floor_plans"("venue_id", "is_default");

-- Foreign key to venues
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_venue_id_fkey" 
    FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 2: Create floor_plan_lines junction table (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "floor_plan_lines" (
    "floor_plan_id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_plan_lines_pkey" PRIMARY KEY ("floor_plan_id", "line_id")
);

-- Indexes for floor_plan_lines
CREATE INDEX IF NOT EXISTS "floor_plan_lines_floor_plan_id_idx" ON "floor_plan_lines"("floor_plan_id");
CREATE INDEX IF NOT EXISTS "floor_plan_lines_line_id_idx" ON "floor_plan_lines"("line_id");

-- Foreign keys
ALTER TABLE "floor_plan_lines" ADD CONSTRAINT "floor_plan_lines_floor_plan_id_fkey" 
    FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "floor_plan_lines" ADD CONSTRAINT "floor_plan_lines_line_id_fkey" 
    FOREIGN KEY ("line_id") REFERENCES "lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 3: Add floor_plan_id to zones (keep venue_id for now during migration)
-- ============================================================================

ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "floor_plan_id" TEXT;

-- Create index for floor_plan_id
CREATE INDEX IF NOT EXISTS "zones_floor_plan_id_idx" ON "zones"("floor_plan_id");

-- Foreign key (nullable during migration)
ALTER TABLE "zones" ADD CONSTRAINT "zones_floor_plan_id_fkey" 
    FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 4: Add floor_plan_id to venue_areas
-- ============================================================================

ALTER TABLE "venue_areas" ADD COLUMN IF NOT EXISTS "floor_plan_id" TEXT;

-- Create index for floor_plan_id
CREATE INDEX IF NOT EXISTS "venue_areas_floor_plan_id_idx" ON "venue_areas"("floor_plan_id");

-- Foreign key (nullable during migration)
ALTER TABLE "venue_areas" ADD CONSTRAINT "venue_areas_floor_plan_id_fkey" 
    FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 5: Add custom_floor_plan_id to line_occurrences
-- ============================================================================

ALTER TABLE "line_occurrences" ADD COLUMN IF NOT EXISTS "custom_floor_plan_id" TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS "line_occurrences_custom_floor_plan_id_idx" ON "line_occurrences"("custom_floor_plan_id");

-- Foreign key
ALTER TABLE "line_occurrences" ADD CONSTRAINT "line_occurrences_custom_floor_plan_id_fkey" 
    FOREIGN KEY ("custom_floor_plan_id") REFERENCES "floor_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- STEP 6: Add staffing and content fields to zones and tables
-- ============================================================================

-- Zone: add staffing rules and zone number
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "zone_number" INTEGER;
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "staffing_rules" JSONB;

-- Tables: add staffing rules
ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "staffing_rules" JSONB;

-- ============================================================================
-- STEP 7: Create default floor plans for existing venues with zones/areas
-- ============================================================================

-- Insert default floor plan for each venue that has zones or venue_areas
INSERT INTO "floor_plans" ("id", "venue_id", "name", "description", "is_default", "is_locked", "created_at", "updated_at")
SELECT 
    'fp_' || v.id, 
    v.id, 
    'Default Floor Plan',
    'Automatically created from existing layout',
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "venues" v
WHERE EXISTS (SELECT 1 FROM "zones" z WHERE z."venue_id" = v.id)
   OR EXISTS (SELECT 1 FROM "venue_areas" va WHERE va."venue_id" = v.id)
ON CONFLICT DO NOTHING;

-- Update zones to use the default floor plan
UPDATE "zones" z
SET "floor_plan_id" = 'fp_' || z."venue_id"
WHERE z."floor_plan_id" IS NULL
  AND EXISTS (SELECT 1 FROM "floor_plans" fp WHERE fp.id = 'fp_' || z."venue_id");

-- Update venue_areas to use the default floor plan
UPDATE "venue_areas" va
SET "floor_plan_id" = 'fp_' || va."venue_id"
WHERE va."floor_plan_id" IS NULL
  AND EXISTS (SELECT 1 FROM "floor_plans" fp WHERE fp.id = 'fp_' || va."venue_id");

