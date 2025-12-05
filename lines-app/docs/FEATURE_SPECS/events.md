# Feature Specification: Event Detail

**Status:** Core logic implemented, UI placeholder  
**Module:** `src/modules/events`  
**Route:** `/venues/[venueId]/events/[lineId]/[occurrenceId]`

---

## Overview

Event Detail provides a dedicated view for a single Line occurrence with:

- Line context (name, color, schedule)
- Event-specific data (date, time, status)
- Navigation (previous/next within line, back to context)

Based on `information/lines-mvp-information-v1.md` sections 5.6, 6.9.

---

## Event Status Model

Status is derived at runtime from:

1. `isActive === false` → **"בוטל"** (Cancelled)
2. Event ended (past endTime) → **"הסתיים"** (Ended)
3. Event ongoing (between start and end) → **"מתקיים כעת"** (Happening now)
4. Event upcoming → **"עתידי"** (Upcoming)

Priority: cancelled > ended > current > upcoming

---

## Navigation Rules

**Back Button:**

- If came from calendar (`back=calendar`): return to calendar with view/date preserved
- Otherwise: return to Lines overview

**Next/Previous:**

- Navigate between occurrences within same Line
- Show status text based on availability

---

## API Endpoints

**`GET /api/venues/[venueId]/events/[lineId]/[occurrenceId]`**  
Returns occurrence with line and venue context

**`GET /api/venues/[venueId]/events/[lineId]/[occurrenceId]/neighbors`**  
Returns previous + next occurrences

---

**Last Updated:** 2025-12-05

