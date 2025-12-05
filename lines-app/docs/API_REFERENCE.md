# Lines App - API Reference

**Last Updated:** 2025-12-05

---

## Venues

### `GET /api/venues`
List all venues

**Response:**
```json
{
  "success": true,
  "data": [{ "id": "...", "name": "...", "createdAt": "...", "updatedAt": "..." }]
}
```

### `POST /api/venues`
Create new venue

**Request:** `{ "name": "שם מקום" }`  
**Response:** Venue object

### `GET /api/venues/[venueId]`
Get single venue

### `DELETE /api/venues/[venueId]`
Delete venue (cascades to all related data)

---

## Venue Details

### `GET /api/venues/[venueId]/details`
Get venue contact details

### `PUT /api/venues/[venueId]/details`
Update venue details

**Request:**
```json
{
  "phone": "050-1234567",
  "email": "info@example.com",
  "address": "כתובת מלאה"
}
```

---

## Menus (Stub - Full Implementation in v1.1)

### `GET /api/venues/[venueId]/menus`
### `POST /api/venues/[venueId]/menus`
### `PUT /api/venues/[venueId]/menus/[menuId]`
### `DELETE /api/venues/[venueId]/menus/[menuId]`

---

## Zones & Tables (Stub - Full Implementation in v1.1)

### `GET /api/venues/[venueId]/zones`
### `POST /api/venues/[venueId]/zones`
### `POST /api/venues/[venueId]/zones/[zoneId]/tables`

---

## Lines (Stub - Full Implementation in v1.1)

### `GET /api/venues/[venueId]/lines`
### `POST /api/venues/[venueId]/lines`
### `PUT /api/venues/[venueId]/lines/[lineId]`
### `POST /api/venues/[venueId]/lines/[lineId]/occurrences`

---

## Events & Calendar (Stub - Full Implementation in v1.1)

### `GET /api/venues/[venueId]/events/[lineId]/[occurrenceId]`
### `GET /api/venues/[venueId]/calendar`

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": {
    "message": "הודעת שגיאה",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

**Common Status Codes:**
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Duplicate/Conflict
- 500: Server error
