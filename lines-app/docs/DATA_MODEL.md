2025-12-05 – Lines App – Data Model

---

## Purpose

Complete entity definitions, field types, constraints, and relationships for the Lines production app.

Based on `information/lines-mvp-information-v1.md` section 5 (Core Domain Model).

---

## 1. Venue

Represents a physical location managed by the user.

| Field       | Type      | Nullable | Description                      |
|-------------|-----------|----------|----------------------------------|
| id          | String    | No       | Unique identifier (UUID/cuid)    |
| name        | String    | No       | Display name of the venue        |
| createdAt   | DateTime  | No       | Creation timestamp               |
| updatedAt   | DateTime  | No       | Last update timestamp            |

**Relationships:**
- Has one `VenueDetails` (1:1)
- Has many `Menu` (1:N)
- Has many `Zone` (1:N)
- Has many `Line` (1:N)

---

## 2. VenueDetails

Contact and location information for a Venue.

| Field    | Type   | Nullable | Description                         |
|----------|--------|----------|-------------------------------------|
| id       | String | No       | Unique identifier                   |
| venueId  | String | No       | Foreign key to Venue (unique)       |
| phone    | String | Yes      | Phone number (e.g., 05X-XXXXXXX)    |
| email    | String | Yes      | Email address                       |
| address  | String | Yes      | Full address text                   |

**Relationships:**
- Belongs to one `Venue` (1:1)

**Validation:**
- Email must be valid format when present
- Phone format is free-text (no strict validation)

---

## 3. Menu

Uploaded menu files per venue (PDF, images, etc.).

| Field      | Type     | Nullable | Description                       |
|------------|----------|----------|-----------------------------------|
| id         | String   | No       | Unique identifier                 |
| venueId    | String   | No       | Foreign key to Venue              |
| name       | String   | No       | Human-readable menu name          |
| fileName   | String   | No       | Original file name                |
| fileType   | String   | No       | MIME type (e.g., application/pdf) |
| fileSize   | Int      | No       | File size in bytes                |
| fileData   | String   | Yes      | Base64 or file storage reference  |
| uploadedAt | DateTime | No       | Upload timestamp                  |
| updatedAt  | DateTime | No       | Last update timestamp             |

**Relationships:**
- Belongs to one `Venue` (N:1)

**Behaviors:**
- Create requires file attachment
- Edit allows rename + optional file replacement
- Preview: inline for images, placeholder for others

---

## 4. Zone

Seating area within a venue.

| Field       | Type     | Nullable | Description                    |
|-------------|----------|----------|--------------------------------|
| id          | String   | No       | Unique identifier              |
| venueId     | String   | No       | Foreign key to Venue           |
| name        | String   | No       | Zone name (e.g., "Main Hall")  |
| color       | String   | No       | Visual identifier color (hex)  |
| description | String   | Yes      | Optional description           |
| createdAt   | DateTime | No       | Creation timestamp             |
| updatedAt   | DateTime | No       | Last update timestamp          |

**Relationships:**
- Belongs to one `Venue` (N:1)
- Has many `Table` (1:N)

**Derived fields (UI):**
- Total tables count
- Total capacity (sum of all table seats)

---

## 5. Table

Individual table within a Zone.

| Field     | Type     | Nullable | Description                         |
|-----------|----------|----------|-------------------------------------|
| id        | String   | No       | Unique identifier                   |
| zoneId    | String   | No       | Foreign key to Zone                 |
| name      | String   | No       | Table name/number (e.g., "T1")      |
| seats     | Int      | Yes      | Capacity (null = unbounded)         |
| notes     | String   | Yes      | Optional notes                      |
| createdAt | DateTime | No       | Creation timestamp                  |
| updatedAt | DateTime | No       | Last update timestamp               |

**Relationships:**
- Belongs to one `Zone` (N:1)

---

## 6. Line

A recurring or one-off event series.

| Field      | Type     | Nullable | Description                                      |
|------------|----------|----------|--------------------------------------------------|
| id         | String   | No       | Unique identifier                                |
| venueId    | String   | No       | Foreign key to Venue                             |
| name       | String   | No       | Line name                                        |
| days       | Int[]    | No       | Array of weekday indices (0=Sunday, 6=Saturday)  |
| startTime  | String   | No       | Time in HH:MM format (24-hour)                   |
| endTime    | String   | No       | Time in HH:MM format (24-hour, can be 24:00)     |
| frequency  | String   | No       | Enum: weekly, monthly, variable, oneTime         |
| color      | String   | No       | Unique color from 15-color palette (hex)         |
| createdAt  | DateTime | No       | Creation timestamp                               |
| updatedAt  | DateTime | No       | Last update timestamp                            |

**Relationships:**
- Belongs to one `Venue` (N:1)
- Has many `LineOccurrence` (1:N)

**Business Rules:**
- `days` must contain at least one day
- `startTime` and `endTime` must be valid times (00:00–23:59, or 24:00 for end only)
- Overnight: if endTime ≤ startTime, event continues into next day (+1)
- `color` must be unique per venue (max 15 lines per venue with unique colors)

**Frequency types:**
- `weekly`: repeats every week on selected days
- `monthly`: repeats monthly on selected days
- `variable`: custom curated dates
- `oneTime`: single occurrence

---

## 7. LineOccurrence

A single event instance (date) for a Line.

| Field       | Type     | Nullable | Description                                     |
|-------------|----------|----------|-------------------------------------------------|
| id          | String   | No       | Unique identifier                               |
| lineId      | String   | No       | Foreign key to Line                             |
| venueId     | String   | No       | Foreign key to Venue (denormalized for queries) |
| date        | String   | No       | ISO date (YYYY-MM-DD)                           |
| startTime   | String   | No       | Typically inherits from Line                    |
| endTime     | String   | No       | Typically inherits from Line                    |
| isExpected  | Boolean  | No       | true = auto-suggested, false = manual           |
| isActive    | Boolean  | No       | true = active, false = cancelled                |
| title       | String   | Yes      | Optional override title (defaults to Line name) |
| subtitle    | String   | Yes      | Optional subtitle                               |
| description | String   | Yes      | Optional description                            |
| location    | String   | Yes      | Optional location                               |
| contact     | String   | Yes      | Optional contact info                           |
| createdAt   | DateTime | No       | Creation timestamp                              |
| updatedAt   | DateTime | No       | Last update timestamp                           |

**Relationships:**
- Belongs to one `Line` (N:1)
- Belongs to one `Venue` (N:1)

**Derived Status (for UI):**
Status is computed at runtime based on:
- `isActive === false` → "Cancelled"
- Event ended (past endTime) → "Ended"
- Event ongoing (between start and end) → "Happening now"
- Event upcoming → "Upcoming"

**Constraints:**
- Unique constraint on (lineId, date) to prevent duplicate occurrences

---

## Relationships Summary

```
Venue
  ├── VenueDetails (1:1)
  ├── Menu (1:N)
  ├── Zone (1:N)
  │     └── Table (1:N)
  ├── Line (1:N)
        └── LineOccurrence (1:N)
```

---

## Database Provider

- **PostgreSQL** via Prisma
- Connection managed through `DATABASE_URL` environment variable
- Migrations tracked in `prisma/migrations/`

---

**Last Updated:** 2025-12-05  
**Status:** Fully defined, ready for Prisma implementation


