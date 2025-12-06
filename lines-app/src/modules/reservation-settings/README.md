# Reservation Settings Module

Manages reservation settings and configuration for venues.

## Overview

This module provides the foundation for the reservation system, allowing venue owners to configure:

- General reservation acceptance settings
- Personal link booking options
- Line exclusions (lines that don't accept reservations)
- Day-specific booking schedules with time ranges and intervals
- Waitlist management settings

## Module Structure

```
src/modules/reservation-settings/
  ui/
    ReservationSettingsTab.tsx    - Main settings UI component
  actions/
    reservationSettingsActions.ts - Server actions for CRUD operations
  services/
    reservationSettingsService.ts - Business logic layer
  schemas/
    reservationSettingsSchemas.ts - Zod validation schemas
  types.ts                        - TypeScript type definitions
  index.ts                        - Public exports
  README.md                       - This file
```

## Features

### General Settings

- Enable/disable reservations for the venue
- Enable/disable waitlist management

### Personal Link Settings

- Enable/disable personal link bookings
- Require approval for personal link bookings
- Manual registration only mode (when personal links are disabled)

### Line Exclusions

- Select which lines should not accept reservations
- Multi-select from all venue lines

### Day Schedules

- Configure booking time ranges for each day of the week
- Set booking intervals (optional)
- Add custom messages for customers (optional)

## Database Models

- `ReservationSettings` - Main settings (1:1 with Venue)
- `ReservationSettingsLineExclusion` - Lines excluded from reservations
- `ReservationSettingsDaySchedule` - Day-specific booking schedules

See `docs/DATA_MODEL.md` for complete schema details.

## Usage

```tsx
import { ReservationSettingsTab } from "@/modules/reservation-settings";

export default function ReservationsPage() {
  return <ReservationSettingsTab />;
}
```

## Route

`/venues/[venueId]/reservations`

## Related Documentation

- `docs/FEATURE_SPECS/reservations.md` - Full feature specification
- `docs/DATA_MODEL.md` - Database schema
- `docs/API_REFERENCE.md` - API endpoints
