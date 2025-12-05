# Feature Specification: Venue Info

**Status:** Implemented  
**Module:** `src/modules/venue-info`  
**Route:** `/venues/[venueId]/info`

---

## Overview

The Venue Info tab allows users to view and edit basic contact information for a venue (phone, email, address).

Based on `information/lines-mvp-information-v1.md` section 6.3.

---

## UI Components

### VenueInfoTab

**Fields:**
- Venue name (read-only, displayed from venue context)
- Phone (optional, free-text)
- Email (optional, validated format)
- Address (optional, multi-line text)

**Actions:**
- Save button (persists changes)

**Behavior:**
- Fields load from VenueDetails (or empty if not set)
- On save: shows temporary success feedback
- Validation errors shown inline per field

---

## API Endpoints

### `GET /api/venues/[venueId]/details`

Returns VenueDetails for the venue (or null if not set).

### `PUT /api/venues/[venueId]/details`

**Request:**
```json
{
  "phone": "050-1234567",
  "email": "info@venue.com",
  "address": "רחוב X, עיר Y"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "venueId": "...",
    "phone": "050-1234567",
    "email": "info@venue.com",
    "address": "רחוב X, עיר Y"
  }
}
```

---

## Validation

- Email: valid format when provided
- Phone: no strict format (flexible)
- All fields optional

---

**Last Updated:** 2025-12-05

