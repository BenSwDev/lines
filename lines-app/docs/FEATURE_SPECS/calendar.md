# Feature Specification: Calendar

**Status:** Core logic implemented, UI placeholder  
**Module:** `src/modules/calendar`  
**Route:** `/venues/[venueId]/calendar`

---

## Overview

Per-venue calendar view displaying all Line occurrences with:

- Multiple view types (day/week/month/list)
- Legend showing all lines with colors
- Hour compression toggle
- Click to navigate to Event Detail

Based on `information/lines-mvp-information-v1.md` section 6.10.

---

## Features

### Calendar Views

- Day, Week, Month, List
- Passed via `searchParams.view`
- Anchor date via `searchParams.date`

### Legend

- Horizontal scrollable list
- Shows each Line with color swatch + name
- Mobile-friendly

### Hour Compression

- Toggle to compress/expand visible hours
- When compressed: shows only range containing events + padding
- When expanded: full 24 hours

### Overnight Events

- Events with endTime ≤ startTime show `(+1)` indicator
- Anchored to start day on calendar

---

## API Endpoints

**`GET /api/venues/[venueId]/calendar?view=month&date=2025-12-05`**  
Returns all occurrences for venue with line context

---

**Last Updated:** 2025-12-05
