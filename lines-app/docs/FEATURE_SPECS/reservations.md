# Feature Specification: Reservation Settings

**Status:** Implemented (Foundation)  
**Module:** `src/modules/reservation-settings`  
**Route:** `/venues/[venueId]/reservations`

---

## Overview

Reservation Settings provides the foundation for the reservation system, allowing venue owners to configure how their venue handles reservations before the actual reservation module is implemented.

Based on requirements for reservation infrastructure setup.

---

## Features

### 1. General Settings

- **Accept Reservations** - Enable/disable reservations for the venue
- **Manage Waitlist** - Enable/disable automatic waitlist management when capacity is full

### 2. Personal Link Settings

- **Allow Personal Link Bookings** - Enable/disable personal link booking system
- **Require Approval** - If personal links are enabled, require manual approval for bookings
- **Manual Registration Only** - When personal links are disabled, all reservations must be created manually from the system

### 3. Lines Exclusions

- Select which lines should not accept reservations
- Multi-select from all venue lines
- Excluded lines will not appear in reservation booking flows

### 4. Day Schedules

Configure booking time ranges for each day of the week (only when personal links are enabled):

- **Start Time** - Earliest time reservations can be made (HH:MM format)
- **End Time** - Latest time reservations can be made (HH:MM format)
- **Interval Minutes** (Optional) - Time intervals for booking slots (e.g., 30 minutes)
- **Customer Message** (Optional) - Custom message displayed to customers (e.g., "Entry for ages 18+ only")

---

## Database Models

### ReservationSettings

Main settings table (1:1 with Venue).

| Field                  | Type     | Nullable | Description                                  |
| ---------------------- | -------- | -------- | -------------------------------------------- |
| id                     | String   | No       | Unique identifier (cuid)                     |
| venueId                | String   | No       | Foreign key to Venue (unique)                |
| acceptsReservations    | Boolean  | No       | Whether venue accepts reservations           |
| allowPersonalLink      | Boolean  | No       | Whether personal link bookings are allowed   |
| requireApproval        | Boolean  | No       | Whether personal link bookings need approval |
| manualRegistrationOnly | Boolean  | No       | Whether only manual registration is allowed  |
| manageWaitlist         | Boolean  | No       | Whether waitlist management is enabled       |
| createdAt              | DateTime | No       | Creation timestamp                           |
| updatedAt              | DateTime | No       | Last update timestamp                        |

**Relationships:**

- Belongs to one `Venue` (1:1)
- Has many `ReservationSettingsLineExclusion` (1:N)
- Has many `ReservationSettingsDaySchedule` (1:N)

### ReservationSettingsLineExclusion

Lines that should not accept reservations.

| Field                 | Type     | Nullable | Description                        |
| --------------------- | -------- | -------- | ---------------------------------- |
| id                    | String   | No       | Unique identifier (cuid)           |
| reservationSettingsId | String   | No       | Foreign key to ReservationSettings |
| lineId                | String   | No       | Foreign key to Line                |
| createdAt             | DateTime | No       | Creation timestamp                 |

**Relationships:**

- Belongs to one `ReservationSettings` (N:1)
- Belongs to one `Line` (N:1)

**Constraints:**

- Unique constraint on (reservationSettingsId, lineId)

### ReservationSettingsDaySchedule

Day-specific booking schedules.

| Field                 | Type     | Nullable | Description                                       |
| --------------------- | -------- | -------- | ------------------------------------------------- |
| id                    | String   | No       | Unique identifier (cuid)                          |
| reservationSettingsId | String   | No       | Foreign key to ReservationSettings                |
| dayOfWeek             | Int      | No       | Day of week (0=Sunday, 1=Monday, ..., 6=Saturday) |
| startTime             | String   | No       | Start time (HH:MM format)                         |
| endTime               | String   | No       | End time (HH:MM format)                           |
| intervalMinutes       | Int      | Yes      | Booking interval in minutes (optional)            |
| customerMessage       | String   | Yes      | Custom message for customers (optional)           |
| createdAt             | DateTime | No       | Creation timestamp                                |
| updatedAt             | DateTime | No       | Last update timestamp                             |

**Relationships:**

- Belongs to one `ReservationSettings` (N:1)

**Constraints:**

- Unique constraint on (reservationSettingsId, dayOfWeek)
- dayOfWeek must be between 0 and 6
- endTime must be after startTime

---

## UI Components

- **ReservationSettingsTab** - Main settings page component
  - General settings section with switches
  - Personal link settings section (conditional)
  - Lines exclusions section with checkboxes
  - Day schedules section with time inputs and textarea (conditional)

---

## Server Actions

### `getReservationSettings(venueId: string)`

Get or create default reservation settings for a venue.

**Returns:**

- `{ success: true, data: ReservationSettingsWithRelations }` on success
- `{ success: false, error: string }` on error

### `updateReservationSettings(venueId: string, input: ReservationSettingsInput)`

Update reservation settings for a venue.

**Input:**

```typescript
{
  acceptsReservations: boolean;
  allowPersonalLink: boolean;
  requireApproval: boolean;
  manualRegistrationOnly: boolean;
  manageWaitlist: boolean;
  excludedLineIds: string[];
  daySchedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    intervalMinutes?: number | null;
    customerMessage?: string | null;
  }>;
}
```

**Returns:**

- `{ success: true, data: ReservationSettingsWithRelations }` on success
- `{ success: false, error: string }` on error

---

## Business Rules

1. **Default Settings**: When settings are first created, all options default to disabled/false except `manualRegistrationOnly` which defaults to `true`.

2. **Conditional Display**:
   - Personal link settings only shown when `acceptsReservations` is `true`
   - Day schedules only shown when both `acceptsReservations` and `allowPersonalLink` are `true`
   - Lines exclusions only shown when `acceptsReservations` is `true` and venue has lines

3. **Validation**:
   - Time ranges must be valid (endTime > startTime)
   - Line IDs in exclusions must belong to the venue
   - Day of week must be 0-6
   - Time format must be HH:MM (24-hour)

4. **Relationships**:
   - Settings are automatically created when first accessed
   - Deleting a venue cascades to delete its reservation settings
   - Deleting a line removes it from exclusions automatically

---

## Future Integration

This module provides the foundation for:

- Actual reservation booking module
- Personal link generation and management
- Waitlist management system
- Reservation approval workflow
- Customer-facing booking interface

---

**Last Updated:** 2025-01-15

