# Feature Specification: Venues Management

**Status:** Implemented  
**Module:** `src/modules/venues`  
**Routes:** `/` (Home page)

---

## Overview

The Venues feature provides the home page and main entry point for the Lines app. Users can view all their venues, create new venues, and delete existing ones.

Based on `information/lines-mvp-information-v1.md` section 6.1.

---

## User Stories

1. As a venue manager, I want to see all my venues at a glance so I can choose which one to work with.
2. As a venue manager, I want to create a new venue quickly with just a name.
3. As a venue manager, I want to delete a venue when I no longer need it.
4. As a venue manager, I want to see when each venue was created.

---

## UI Components

### Venues Home Page (`/`)

**Layout:**
- Page title: "המקומות שלי" (My Venues)
- Grid of venue cards (responsive: 1 col mobile, 2-3 cols desktop)
- "Create Venue" button (primary action)

**Empty State:**
- Shown when no venues exist
- Message: "עדיין לא יצרת מקומות"
- Prominent CTA: "צור מקום ראשון"

### Venue Card

**Content:**
- Venue name (heading)
- Creation date (formatted Hebrew date)
- Placeholder for team info (future feature)

**Actions:**
- "כניסה למקום" (Enter Workspace) - primary button
- "מחיקה" (Delete) - danger button with confirmation

### Create Venue Dialog

**Fields:**
- Name (required, text input)

**Actions:**
- Save (validates name is not empty)
- Cancel

**Behavior:**
- On save: venue created, dialog closes, list refreshes
- Validation error shown inline if name empty

### Delete Venue Confirmation

**Content:**
- Warning message: "האם למחוק את המקום '[name]'?"
- Note: "כל הנתונים ייאבדו (ליינים, אירועים, תפריטים, וכו')"

**Actions:**
- Confirm delete (danger)
- Cancel

---

## API Endpoints

### `GET /api/venues`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "name": "שם המקום",
      "createdAt": "2025-12-05T10:00:00Z",
      "updatedAt": "2025-12-05T10:00:00Z"
    }
  ]
}
```

### `POST /api/venues`

**Request:**
```json
{
  "name": "שם המקום החדש"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "שם המקום החדש",
    "createdAt": "2025-12-05T10:00:00Z",
    "updatedAt": "2025-12-05T10:00:00Z"
  }
}
```

**Validation:**
- `name`: required, min 1 char, max 100 chars

### `DELETE /api/venues/[venueId]`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "שם המקום שנמחק"
  }
}
```

**Cascade:**
- Deletes all related VenueDetails, Menus, Zones, Tables, Lines, LineOccurrences (via Prisma cascade)

**Error Cases:**
- 404 if venue not found
- 500 on database error

---

## Business Rules

1. Venue name is required and must not be empty.
2. Venue deletion is permanent and cascades to all related entities.
3. No duplicate prevention (user can create multiple venues with same name).
4. Venues are ordered by creation date (newest first).

---

## Module Structure

```
src/modules/venues/
  ui/
    VenuesHomePage.tsx        - Main page component
    VenueCard.tsx             - Individual venue card
    VenueList.tsx             - Grid container for cards
    CreateVenueDialog.tsx     - Create dialog
    DeleteVenueDialog.tsx     - Delete confirmation
  actions/
    createVenue.ts            - Server action for create
    deleteVenue.ts            - Server action for delete
    listVenues.ts             - Server action for list
  services/
    venuesService.ts          - Business logic
  schemas/
    venueSchemas.ts           - Zod validation
  types.ts                    - TypeScript types
  index.ts                    - Public exports
  README.md                   - Module documentation
```

---

## Testing

**Unit Tests:**
- venuesService: create, delete, list operations
- Zod schemas: validation rules

**Integration Tests:**
- API routes: GET, POST, DELETE with valid/invalid data

**E2E Tests:**
- Create venue flow
- Delete venue with confirmation
- Empty state display
- Navigate to workspace

---

## Future Enhancements

- Team/collaboration placeholders (show team member count)
- Venue search/filter when list grows large
- Bulk operations (archive, export)
- Venue templates

---

**Last Updated:** 2025-12-05

