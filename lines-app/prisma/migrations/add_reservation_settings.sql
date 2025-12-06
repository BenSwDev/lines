-- Migration: Add reservation settings
-- Date: 2025-01-15

-- Create reservation_settings table
CREATE TABLE IF NOT EXISTS reservation_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL UNIQUE REFERENCES venues(id) ON DELETE CASCADE,
  accepts_reservations BOOLEAN NOT NULL DEFAULT false,
  allow_personal_link BOOLEAN NOT NULL DEFAULT false,
  require_approval BOOLEAN NOT NULL DEFAULT false,
  manual_registration_only BOOLEAN NOT NULL DEFAULT true,
  manage_waitlist BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservation_settings_venue_id ON reservation_settings(venue_id);

-- Create reservation_settings_line_exclusions table
CREATE TABLE IF NOT EXISTS reservation_settings_line_exclusions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reservation_settings_id TEXT NOT NULL REFERENCES reservation_settings(id) ON DELETE CASCADE,
  line_id TEXT NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(reservation_settings_id, line_id)
);

CREATE INDEX IF NOT EXISTS idx_reservation_settings_line_exclusions_settings_id ON reservation_settings_line_exclusions(reservation_settings_id);
CREATE INDEX IF NOT EXISTS idx_reservation_settings_line_exclusions_line_id ON reservation_settings_line_exclusions(line_id);

-- Create reservation_settings_day_schedules table
CREATE TABLE IF NOT EXISTS reservation_settings_day_schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reservation_settings_id TEXT NOT NULL REFERENCES reservation_settings(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  interval_minutes INTEGER,
  customer_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(reservation_settings_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_reservation_settings_day_schedules_settings_id ON reservation_settings_day_schedules(reservation_settings_id);


