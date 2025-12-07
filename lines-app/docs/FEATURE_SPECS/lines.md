# Feature Specification: Lines Management

**Status:** Implemented  
**Module:** `src/modules/lines`  
**Routes:** `/venues/[venueId]/lines`, `/venues/[venueId]/lines/[lineId]`

---

## Overview

Lines represent recurring or one-off event series with schedules, colors, and curated dates.

Based on `information/lines-mvp-information-v1.md` sections 5.5, 5.6, 6.6, 6.7, 6.8.

---

## Core Concepts

### Line

A named event series with:

- Name
- Days of week (0-6, Sunday-Saturday)
- Start/end time (HH:MM, 24-hour, supports overnight via 24:00)
- Frequency (weekly/monthly/variable/oneTime)
- Unique color from 15-color palette

### Line Occurrence

A single event instance with:

- Date (ISO YYYY-MM-DD)
- isExpected (true = auto-suggested, false = manual)
- isActive (true = active, false = cancelled)
- Optional metadata (title, subtitle, description, location, contact)

---

## Business Rules

### Time Validation

- Valid times: `00:00` to `23:59`, or exactly `24:00`
- `24:00` allowed only as end time
- Overnight detection: if endTime ≤ startTime, event continues into next day
- Calendar shows `(+1)` indicator for overnight events

### Color Palette

- Exactly 15 unique colors per venue
- Each line must have unique color within venue
- No new line creation if all 15 colors in use

### Schedule & Suggestions

- `days` array must have at least one day
- Suggestions generated based on:
  - Selected weekdays
  - Frequency type
  - Anchor date (today by default)
  - Horizon (6 months by default)
- All suggestions selected by default, individually toggleable

### Manual Dates

- Can be added when manual toggle is on
- Must respect weekday rules
- Cannot duplicate existing occurrences

---

## UI Flows

### Lines Overview (`/venues/[venueId]/lines`)

- Grid of Line cards
- Each card shows: color chip, name, schedule, frequency, event summary
- "Happening now" badge if current occurrence active
- Actions: Edit, View Line Details, View Events

### Line Creation/Edit Dialog

- Name field
- Days selector (multi-select checkboxes)
- Time pickers (start/end)
- Frequency dropdown
- Color picker (available colors only)
- Suggested dates section with toggle/deselect per date
- Manual dates section (with toggle)

### Line Detail Page (`/venues/[venueId]/lines/[lineId]`)

- Line header with metadata
- List of all occurrences with status badges
- Edit + Back buttons
- **Line Reservation Settings** section (for lines that accept reservations)
  - Personal link settings (allow/require approval)
  - Waitlist management
  - Day-specific schedules (when personal links enabled)

---

## API Endpoints

**`GET /api/venues/[venueId]/lines`** - List lines with occurrences  
**`POST /api/venues/[venueId]/lines`** - Create line  
**`PUT /api/venues/[venueId]/lines/[lineId]`** - Update line  
**`DELETE /api/venues/[venueId]/lines/[lineId]`** - Delete line  
**`POST /api/venues/[venueId]/lines/[lineId]/occurrences`** - Bulk sync occurrences

---

## Key Services

### lineScheduleService

- `generateSuggestions(days, frequency, anchorDate, horizon)` → Date[]
- Handles weekly/monthly/variable/oneTime logic

### linesService

- Validates Line data
- Enforces color uniqueness
- Checks overnight rules

### lineOccurrencesSyncService

- Normalizes suggestions + manual dates into LineOccurrence records
- Marks each as isExpected true/false
- Prevents duplicates

### lineReservationSettingsService

- Manages per-line reservation settings
- Validates line eligibility (must accept reservations, not excluded)
- Handles day schedules for personal link bookings

---

## Line Reservation Settings

Each line that accepts reservations (not in exclusions) can have personalized reservation settings:

### Features

- **Personal Link Settings**
  - Enable/disable personal link bookings for this line
  - Require approval for bookings
- **Waitlist Management**
  - Enable/disable waitlist management for this line
- **Day Schedules** (when personal links enabled)
  - Configure booking time ranges per day of week
  - Set booking intervals
  - Add custom customer messages

### Business Rules

- Only available for lines that:
  - Venue accepts reservations (`acceptsReservations = true`)
  - Line is not in exclusions list
- Settings are created automatically when first accessed
- Day schedules only shown when personal links are enabled

### Server Actions

**`getLineReservationSettings(lineId: string)`**

- Get or create default settings for a line
- Returns error if line is excluded or reservations not enabled

**`updateLineReservationSettings(lineId: string, input: LineReservationSettingsInput)`**

- Update settings for a line
- Validates line eligibility before updating

---

**Last Updated:** 2025-01-15
