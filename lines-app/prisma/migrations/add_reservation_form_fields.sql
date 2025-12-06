-- Migration: Add reservation form fields and design
-- Date: 2025-01-15

-- Create reservation_form_fields table
CREATE TABLE IF NOT EXISTS reservation_form_fields (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reservation_settings_id TEXT NOT NULL REFERENCES reservation_settings(id) ON DELETE CASCADE,
  field_type VARCHAR(50) NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  validation_rules JSONB,
  options JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservation_form_fields_settings_id ON reservation_form_fields(reservation_settings_id);
CREATE INDEX IF NOT EXISTS idx_reservation_form_fields_order ON reservation_form_fields(reservation_settings_id, "order");

-- Create reservation_form_design table
CREATE TABLE IF NOT EXISTS reservation_form_design (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reservation_settings_id TEXT NOT NULL UNIQUE REFERENCES reservation_settings(id) ON DELETE CASCADE,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  secondary_color VARCHAR(7),
  background_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
  text_color VARCHAR(7) NOT NULL DEFAULT '#000000',
  button_color VARCHAR(7),
  button_text_color VARCHAR(7),
  border_radius VARCHAR(10) NOT NULL DEFAULT '8px',
  font_family VARCHAR(100),
  header_text TEXT,
  footer_text TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservation_form_design_settings_id ON reservation_form_design(reservation_settings_id);

