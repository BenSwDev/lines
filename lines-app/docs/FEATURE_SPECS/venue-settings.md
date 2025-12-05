# Feature Specification: Venue Settings

**Status:** Implemented  
**Module:** `src/modules/venue-settings`  
**Route:** `/venues/[venueId]/settings`

---

## Overview

Venue Settings tab provides management for:
1. **Menus** - Upload, edit, delete, preview menu documents (PDF/images)
2. **Zones & Tables** - Define seating zones and tables with capacity

Based on `information/lines-mvp-information-v1.md` sections 5.3, 5.4, 6.4, 6.5.

---

## Sub-Feature: Menus

### UI Components
- MenusSection - Main container with list/grid
- MenuCard - Individual menu display with preview
- MenuFormDialog - Create/edit menu
- Empty state when no menus

### API Endpoints

**`GET /api/venues/[venueId]/menus`** - List all menus  
**`POST /api/venues/[venueId]/menus`** - Create menu (with file upload)  
**`PUT /api/venues/[venueId]/menus/[menuId]`** - Update menu  
**`DELETE /api/venues/[venueId]/menus/[menuId]`** - Delete menu

### Business Rules
- Menu name required
- File required on creation, optional on edit
- Preview inline for images, placeholder for PDFs

---

## Sub-Feature: Zones & Tables

### UI Components
- ZonesAndTablesSection - Main container
- ZoneCard - Zone with color, name, tables list, summary
- ZoneFormDialog - Create/edit zone
- TableFormDialog - Create/edit table
- Empty states for no zones / no tables

### API Endpoints

**Zones:**  
- `GET /api/venues/[venueId]/zones`
- `POST /api/venues/[venueId]/zones`  
- `PUT /api/venues/[venueId]/zones/[zoneId]`
- `DELETE /api/venues/[venueId]/zones/[zoneId]`

**Tables:**  
- `POST /api/venues/[venueId]/zones/[zoneId]/tables`
- `PUT /api/venues/[venueId]/zones/[zoneId]/tables/[tableId]`
- `DELETE /api/venues/[venueId]/zones/[zoneId]/tables/[tableId]`

### Business Rules
- Zone must have name and color
- Tables have name + optional seats (null = unbounded)
- Zone summary shows total tables + total capacity
- Deleting zone cascades to all its tables

---

**Last Updated:** 2025-12-05

