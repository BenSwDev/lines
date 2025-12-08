-- Enable Row Level Security (RLS) on all public tables
-- This migration enables RLS and creates policies for user-based access control

-- ============================================================================
-- AUTHENTICATION TABLES (NextAuth.js)
-- ============================================================================

-- Users: Users can only see and update their own record
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id);

-- Accounts: Users can only see their own accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid()::text = "userId");

-- Sessions: Users can only see their own sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid()::text = "userId");

-- Verification tokens: No RLS needed (temporary tokens)
-- But we'll enable it for security
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Note: Verification tokens are temporary and don't need user-based policies
-- They are managed by NextAuth and expire automatically

-- ============================================================================
-- VENUE & DETAILS
-- ============================================================================

-- Venues: Users can only access venues they own
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own venues"
  ON public.venues FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own venues"
  ON public.venues FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own venues"
  ON public.venues FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own venues"
  ON public.venues FOR DELETE
  USING (auth.uid()::text = "userId");

-- Venue Details: Users can only access details of venues they own
ALTER TABLE public.venue_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own venue details"
  ON public.venue_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = venue_details."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage own venue details"
  ON public.venue_details FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = venue_details."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- MENUS
-- ============================================================================

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view menus of own venues"
  ON public.menus FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = menus."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage menus of own venues"
  ON public.menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = menus."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- FLOOR PLANS
-- ============================================================================

ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view floor plans of own venues"
  ON public.floor_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = floor_plans."venue_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage floor plans of own venues"
  ON public.floor_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = floor_plans."venue_id"
      AND venues."userId" = auth.uid()::text
    )
  );

-- Floor Plan Templates: Users can only access their own templates
ALTER TABLE public.floor_plan_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON public.floor_plan_templates FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage own templates"
  ON public.floor_plan_templates FOR ALL
  USING (auth.uid()::text = "userId");

-- ============================================================================
-- SEATING: ZONES & TABLES
-- ============================================================================

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view zones of own venues"
  ON public.zones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = zones."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage zones of own venues"
  ON public.zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = zones."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tables of own venues"
  ON public.tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.zones
      JOIN public.venues ON venues.id = zones."venueId"
      WHERE zones.id = tables."zoneId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage tables of own venues"
  ON public.tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.zones
      JOIN public.venues ON venues.id = zones."venueId"
      WHERE zones.id = tables."zoneId"
      AND venues."userId" = auth.uid()::text
    )
  );

-- Venue Areas: Users can only access areas of venues they own
ALTER TABLE public.venue_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view venue areas of own venues"
  ON public.venue_areas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = venue_areas."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage venue areas of own venues"
  ON public.venue_areas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = venue_areas."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- LINES & OCCURRENCES
-- ============================================================================

ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lines of own venues"
  ON public.lines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = lines."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage lines of own venues"
  ON public.lines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = lines."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.line_occurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line occurrences of own venues"
  ON public.line_occurrences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = line_occurrences."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage line occurrences of own venues"
  ON public.line_occurrences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = line_occurrences."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- RESERVATION SETTINGS
-- ============================================================================

ALTER TABLE public.reservation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reservation settings of own venues"
  ON public.reservation_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = reservation_settings."venue_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage reservation settings of own venues"
  ON public.reservation_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = reservation_settings."venue_id"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.reservation_settings_line_exclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line exclusions of own venues"
  ON public.reservation_settings_line_exclusions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_settings_line_exclusions."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage line exclusions of own venues"
  ON public.reservation_settings_line_exclusions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_settings_line_exclusions."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.reservation_settings_day_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view day schedules of own venues"
  ON public.reservation_settings_day_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_settings_day_schedules."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage day schedules of own venues"
  ON public.reservation_settings_day_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_settings_day_schedules."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.reservation_form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view form fields of own venues"
  ON public.reservation_form_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_form_fields."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage form fields of own venues"
  ON public.reservation_form_fields FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_form_fields."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.reservation_form_design ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view form design of own venues"
  ON public.reservation_form_design FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_form_design."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage form design of own venues"
  ON public.reservation_form_design FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.reservation_settings
      JOIN public.venues ON venues.id = reservation_settings."venue_id"
      WHERE reservation_settings.id = reservation_form_design."reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- LINE RESERVATION SETTINGS
-- ============================================================================

ALTER TABLE public.line_reservation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line reservation settings of own venues"
  ON public.line_reservation_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE lines.id = line_reservation_settings."line_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage line reservation settings of own venues"
  ON public.line_reservation_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE lines.id = line_reservation_settings."line_id"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.line_reservation_day_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line day schedules of own venues"
  ON public.line_reservation_day_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.line_reservation_settings
      JOIN public.lines ON lines.id = line_reservation_settings."line_id"
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE line_reservation_settings.id = line_reservation_day_schedules."line_reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage line day schedules of own venues"
  ON public.line_reservation_day_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.line_reservation_settings
      JOIN public.lines ON lines.id = line_reservation_settings."line_id"
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE line_reservation_settings.id = line_reservation_day_schedules."line_reservation_settings_id"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- ROLES & HIERARCHY
-- ============================================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles of own venues"
  ON public.roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = roles."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage roles of own venues"
  ON public.roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = roles."venueId"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- LINE FLOOR PLAN STAFFING & MINIMUM ORDER
-- ============================================================================

ALTER TABLE public.line_floor_plan_staffing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line staffing of own venues"
  ON public.line_floor_plan_staffing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE lines.id = line_floor_plan_staffing."line_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage line staffing of own venues"
  ON public.line_floor_plan_staffing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE lines.id = line_floor_plan_staffing."line_id"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.line_floor_plan_minimum_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line minimum orders of own venues"
  ON public.line_floor_plan_minimum_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE lines.id = line_floor_plan_minimum_orders."line_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage line minimum orders of own venues"
  ON public.line_floor_plan_minimum_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.venues ON venues.id = lines."venueId"
      WHERE lines.id = line_floor_plan_minimum_orders."line_id"
      AND venues."userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- LINE OCCURRENCE STAFFING & MINIMUM ORDER
-- ============================================================================

ALTER TABLE public.line_occurrence_staffing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view occurrence staffing of own venues"
  ON public.line_occurrence_staffing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.line_occurrences
      JOIN public.venues ON venues.id = line_occurrences."venueId"
      WHERE line_occurrences.id = line_occurrence_staffing."occurrence_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage occurrence staffing of own venues"
  ON public.line_occurrence_staffing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.line_occurrences
      JOIN public.venues ON venues.id = line_occurrences."venueId"
      WHERE line_occurrences.id = line_occurrence_staffing."occurrence_id"
      AND venues."userId" = auth.uid()::text
    )
  );

ALTER TABLE public.line_occurrence_minimum_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view occurrence minimum orders of own venues"
  ON public.line_occurrence_minimum_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.line_occurrences
      JOIN public.venues ON venues.id = line_occurrences."venueId"
      WHERE line_occurrences.id = line_occurrence_minimum_orders."occurrence_id"
      AND venues."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage occurrence minimum orders of own venues"
  ON public.line_occurrence_minimum_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.line_occurrences
      JOIN public.venues ON venues.id = line_occurrences."venueId"
      WHERE line_occurrences.id = line_occurrence_minimum_orders."occurrence_id"
      AND venues."userId" = auth.uid()::text
    )
  );

