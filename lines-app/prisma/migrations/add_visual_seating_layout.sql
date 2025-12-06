-- Migration: Add visual seating layout support
-- Date: 2025-01-15

-- Add layout data to Venue (stores the overall floor plan dimensions, scale, etc.)
ALTER TABLE venues ADD COLUMN IF NOT EXISTS layout_data JSONB;

-- Add visual properties to Zone
ALTER TABLE zones ADD COLUMN IF NOT EXISTS position_x DECIMAL(10, 2);
ALTER TABLE zones ADD COLUMN IF NOT EXISTS position_y DECIMAL(10, 2);
ALTER TABLE zones ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2);
ALTER TABLE zones ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2);
ALTER TABLE zones ADD COLUMN IF NOT EXISTS shape VARCHAR(50) DEFAULT 'rectangle';
ALTER TABLE zones ADD COLUMN IF NOT EXISTS polygon_points JSONB;

-- Add visual properties to Table
ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_x DECIMAL(10, 2);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_y DECIMAL(10, 2);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS rotation DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS shape VARCHAR(50) DEFAULT 'rectangle';
ALTER TABLE tables ADD COLUMN IF NOT EXISTS table_type VARCHAR(50) DEFAULT 'table';

-- Create new table for special areas
CREATE TABLE IF NOT EXISTS venue_areas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  area_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  position_x DECIMAL(10, 2) NOT NULL,
  position_y DECIMAL(10, 2) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  height DECIMAL(10, 2) NOT NULL,
  rotation DECIMAL(5, 2) DEFAULT 0,
  shape VARCHAR(50) DEFAULT 'rectangle',
  icon VARCHAR(100),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_areas_venue_id ON venue_areas(venue_id);
CREATE INDEX IF NOT EXISTS idx_zones_position ON zones(venue_id, position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_tables_position ON tables(zone_id, position_x, position_y);

