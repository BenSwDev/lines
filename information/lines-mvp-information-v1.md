2025-12-05 00:00 – Lines MVP → Production App (Next.js 15 App Router) – Business & UX Specification v1

## 1. Purpose & Scope

- **Goal**: Capture all business, UX, navigation, and data rules from the `Lines-MVP` project that are relevant for building the production application in `lines-app` using Next.js 15 App Router.
- **Audience**: Product, design, and engineering working on the production implementation (without reference to the legacy static code or its technical constraints).
- **Out of scope**: Implementation details of the MVP (HTML structure, JavaScript modules, storage key names, specific libraries). This document focuses on **what** the app must do and **how it behaves**, not **how it was originally implemented**.

## 2. Product Overview

- **Product**: A workspace for venue managers to manage:
  - **Venues** (places they operate).
  - **Contact and basic details** per venue.
  - **Menus** (documents like PDFs/images) per venue.
  - **Seating zones and tables** per venue.
  - **Lines** (recurring or one‑off event series) per venue, with:
    - Schedules (days of week, start/end times, frequencies).
    - Curated date lists.
    - Derived events (“occurrences”).
  - **Calendar** view per venue, reflecting all Line occurrences.
  - **Event Detail** view for a specific occurrence, with navigation.
- **Primary user persona**: Hebrew‑speaking venue manager (RTL UI), typically using desktop and mobile.
- **Data model**: Single‑tenant per browser/user in the MVP. For production we treat data as belonging to a single venue manager account (multi‑user sync is a future extension).

## 3. High-Level Feature Pillars

- **Home / Venues**
  - Shows all venues the manager created.
  - Allows creating a new venue.
  - Allows deleting a venue.
  - Provides an entry point (“Workspace”) into each venue’s management area.

- **Workspace (per venue)**
  - Shared shell with:
    - Header (brand).
    - Sidebar navigation for tabs.
    - Main content area for the active tab.
  - Tabs:
    - **Venue Info**: Basic contact details.
    - **Venue Settings**:
      - Menus (upload, edit, delete, preview).
      - Zones & tables (create, edit, delete).
    - **Lines**:
      - Overview grid of all Lines for the venue.
      - Individual Line Detail mode.
      - Event Detail mode for a specific occurrence.
    - **Calendar**:
      - Per‑venue calendar built from Line occurrences.
      - Legend and hour‑compression controls.

- **Event Detail (per Line occurrence)**
  - Dedicated page/card showing:
    - The Line context (name, colors, schedule).
    - The specific occurrence (date/time, status, whether expected/manual).
    - Metadata (subtitle, description, location, contact).
  - Supports sequential navigation between a Line’s occurrences.
  - Has a “Back” action that returns either to Lines or to Calendar, depending on how the user arrived.

## 4. Information Architecture – Next.js 15 App Router Concept

This section defines the **logical route hierarchy** and views; it is intentionally implementation‑agnostic but aligned with an App Router mental model.

- **Top-Level Segments**
  - **`/` – Home**
    - Lists venues.
    - Entry point for creating a venue.
  - **`/venues/[venueId]` – Workspace Shell**
    - Parent layout for all per‑venue workspace tabs.
    - Responsible for loading venue context and rendering the common sidebar.

- **Nested Segments under `/venues/[venueId]`**
  - **`/venues/[venueId]/info` – Venue Info tab**
    - Form for phone, email, address.
  - **`/venues/[venueId]/settings` – Venue Settings tab**
    - Contains nested sections:
      - Menus management.
      - Zones & tables management.
  - **`/venues/[venueId]/lines` – Lines tab**
    - Default Lines overview grid.
    - May surface sub‑modes as nested views or state (see section 7).
  - **`/venues/[venueId]/calendar` – Calendar tab**
    - Full calendar view for this venue.
    - Supports query parameters (conceptually) for:
      - `view`: calendar view id (`day`, `week`, `month`, `list`, etc.).
      - `date`: anchor date (ISO string).

- **Event and Line Detail Routing (conceptual)**
  - **`/venues/[venueId]/lines/[lineId]` – Single Line Detail**
    - Shows one Line and its list of occurrences.
  - **`/venues/[venueId]/events/[lineId]/[occurrenceId]` – Event Detail**
    - Represents a specific occurrence of a Line.
    - Accepts contextual query parameters for “back” behavior, e.g.:
      - `back=lines` or `back=calendar`.
      - Optional `view` + `date` when `back=calendar` to restore the calendar context.

- **Deep-Linking & State Restoration**
  - Any of the above routes should be **loadable directly** (hard refresh, external link).
  - On load, the app must:
    - Resolve the `venueId` and ensure the venue exists.
    - Resolve `lineId` and `occurrenceId` where applicable.
    - Activate the correct workspace tab (info/settings/lines/calendar).
    - Populate calendar state (view, date) when parameters are present.

## 5. Core Domain Model (Conceptual)

### 5.1 Venue

- **Fields (conceptual)**
  - `id`: unique identifier.
  - `name`: display name.
  - `createdAt`, `updatedAt`.
- **Relationships**
  - Has one **VenueDetails** record.
  - Has many **Menus**.
  - Has many **Zones**; each Zone has many **Tables**.
  - Has many **Lines**; each Line has many **Occurrences** (events).

### 5.2 VenueDetails

- **Fields**
  - `venueId` (FK).
  - `phone`: free‑text phone number (e.g. `05X-XXXXXXX`).
  - `email`: email address.
  - `address`: free‑text address (street, number, city).
- **Rules**
  - All fields optional, but when present should be valid per UI validation rules.
  - Updating details should be a simple “Save” action with a light‑weight feedback (e.g. temporary button text change or toast).

### 5.3 Menu (per venue)

- **Fields**
  - `id`
  - `venueId`
  - `name`: human‑readable menu name.
  - `fileName`
  - `fileType`: MIME type or extension descriptor.
  - `fileSize`
  - `fileData` / storage reference (implementation‑specific).
  - `uploadedAt`, `updatedAt`.
- **Behaviors**
  - **Create**:
    - Requires `name`.
    - Requires an attached file on creation.
  - **Edit**:
    - Allows renaming.
    - Allows replacing the file (new file marks as “new” in UI).
  - **Delete**:
    - Removes the menu for the venue.
  - **Preview**
    - If the file is an image, show inline preview thumbnail.
    - If not image, show a placeholder with initial and metadata (type, size).
  - **Download/Open**
    - Provide a direct open/download action for the stored document.

### 5.4 Zone & Table (per venue)

- **Zone fields**
  - `id`
  - `venueId`
  - `name`
  - `color`: identifying color for the zone.
  - `description` (optional).
  - `createdAt`, `updatedAt`.
- **Table fields**
  - `id`
  - `zoneId`
  - `name`: table name or number.
  - `seats`: optional integer capacity; `null`/empty for “unbounded”.
  - `notes` (optional).
  - `createdAt`, `updatedAt`.
- **Behaviors**
  - **Zone create/edit/delete** from Venue Settings.
  - **Table create/edit/delete** from within a Zone.
  - Zones list summaries should show:
    - Total tables and total capacity (derived).
    - Last updated time.
  - Empty states:
    - No zones → friendly “no zones yet” card with CTA to create the first zone.
    - Zone with no tables → empty hint with CTA to add the first table.

### 5.5 Line (per venue)

- **Concept**: A “Line” represents a recurring or one‑off series of events (occurrences) sharing a name, schedule, and color.
- **Fields**
  - `id`
  - `venueId`
  - `name`
  - `days`: array of weekday indices (0–6, Sunday to Saturday).
  - `startTime`, `endTime`: time strings in `HH:MM` (24‑hour).
  - `frequency`: one of:
    - `weekly`
    - `monthly`
    - `variable`
    - `oneTime`
  - `color`: one of a curated palette of 15 colors.
  - `occurrences`: array of **LineOccurrence**.
  - `createdAt`, `updatedAt`.
- **Color rules**
  - Each venue has a **fixed palette of 15 non‑conflicting colors**.
  - At most one Line per venue may use a given palette color at a time.
  - When creating a new Line:
    - The system picks a default available color.
    - If all 15 colors are already in use, Line creation is blocked until a color is freed (by future line deletion capabilities).
- **Schedule rules**
  - `days` must contain at least one day for suggestions to be generated.
  - `startTime` and `endTime` must be valid and form a usable range:
    - Times allowed: `00:00`–`23:59` or exactly `24:00` (for end‑of‑day).
    - `24:00` is allowed only as an end time with zero minutes.
    - Any invalid time is rejected with clear error messaging.
  - Overnight shifts:
    - If `endTime` is earlier than or equal to `startTime`, the event is considered to continue into the next day.
    - Calendar and labels add a `(+1)` indicator but visually anchor the event to the **start** day.

### 5.6 LineOccurrence (Event instance)

- **Concept**: A single scheduled or manual date for a Line.
- **Fields**
  - `id`
  - `lineId`
  - `venueId`
  - `date`: ISO date string (YYYY‑MM‑DD).
  - `startTime`, `endTime`: typically inherit from Line if not overridden.
  - `isExpected`: `true` for automatically suggested dates based on schedule; `false` for manually added dates.
  - `isActive`: `true`/`false` for whether the event is active vs. cancelled.
  - `title`: optional override event title; if absent, default is derived from Line name + date label.
  - `subtitle` (optional).
  - `description` (optional).
  - `location` (optional).
  - `contact` (optional).
  - `createdAt`, `updatedAt`.
- **Derived status (for display)**
  - `cancelled`: `isActive === false`.
  - `current`: now is between event start and end.
  - `ended`: event end time is in the past.
  - `upcoming`: future event.
  - Event status is presented with badge + label.

## 6. Key User Flows

### 6.1 Venues Home

- **List view**
  - Cards per venue showing:
    - Name.
    - Creation date.
    - Optional team placeholder (future).
  - Actions per card:
    - “Enter Workspace”: opens the workspace for that venue.
    - “Delete” (with confirmation): removes the venue and all its associated data (Lines, Menus, Zones, Tables, Events) for the user.
- **Empty state**
  - When there are no venues:
    - Show a prominent card explaining that there are no venues yet.
    - Main CTA: “Create new venue”.
- **Create venue**
  - Accessible from:
    - Main CTA in empty state.
    - Button on home toolbar.
  - Simple form:
    - Required: `name`.
  - After creation:
    - Venue appears in the list.
    - The creation dialog closes.

### 6.2 Workspace Navigation (per venue)

- **Sidebar tabs**
  - **Venue Info**.
  - **Venue Settings**.
  - **Lines**.
  - **Calendar**.
- **Behavior**
  - Switching tabs updates the **visible content** and should also be reflected in the URL (segment change).
  - When switching to **Calendar**, the calendar is initialized (if not already) for the active venue.
  - When switching to **Lines**, any Event Detail mode is cleared back to Lines overview.
  - A “Back to Home” action exits the workspace and returns to `/`, clearing the active venue and workspace state.
  - The last active venue may be restored automatically when the app reopens, but the route should be the source of truth for current tab and detail views.

### 6.3 Venue Info Tab

- **Form fields**
  - Read‑only venue name.
  - Editable:
    - Phone.
    - Email.
    - Address.
- **Save behavior**
  - On save:
    - Details are persisted against the venue.
    - A light success indication appears (e.g. temporary button label).

### 6.4 Venue Settings – Menus

- **Overview**
  - When no menus:
    - Empty state card with description and CTA to upload the first menu.
  - When menus exist:
    - Grid of cards, each showing:
      - Menu name.
      - File metadata (type & size).
      - Last updated date.
      - Inline preview (if image) or initial placeholder.
  - Actions per menu:
    - Edit (rename + optionally replace file).
    - Download / open.
    - Delete.
- **Menu creation/editing**
  - Form:
    - Name (required).
    - File (required on create, optional on edit).
  - On save:
    - List updates.
    - The modal closes.

### 6.5 Venue Settings – Zones & Tables

- **Zones list**
  - Each zone card shows:
    - Color swatch.
    - Name.
    - Optional description.
    - Summary of tables (e.g. count and capacity).
    - Last updated label.
  - Actions:
    - Edit Zone (name, color, description).
    - Delete Zone.
    - Add Table.
- **Tables list (per zone)**
  - Within each zone card:
    - List of small table entries:
      - Name.
      - Summary: capacity and notes, if any.
    - Actions per table:
      - Edit.
      - Delete.
- **Empty states**
  - No zones → “No zones yet” message + CTA.
  - Zone with no tables → inline hint encouraging adding tables.

### 6.6 Lines Overview

- **Header**
  - Title.
  - Description clarifying that Lines manage schedules, colors, and events.
  - Primary CTA: “Add Line”.
- **Empty state**
  - If no Lines exist for the venue:
    - Card with message and CTA to create first Line.
- **Line card content**
  - Identity:
    - Color chip (using the Line’s unique color).
    - Line name.
  - Metadata:
    - Days of week (in Hebrew).
    - Time range (`startTime → endTime`, with `(+1)` if overnight).
    - Frequency label (Hebrew).
    - Hex color badge.
    - Last updated date.
  - Status indicators:
    - Optional “Happening now” badge when there is an active occurrence at the current time.
  - Event summary:
    - Text like “X events total, Y active” (exact phrasing drawn from the MVP).
  - Actions:
    - “Edit” (pencil icon) → opens Line modal populated with existing data.
    - “Line page” → switches to Line Detail mode for this Line.
    - “View events” → opens Event Detail mode for this Line’s occurrences (disabled when there are 0 events).

### 6.7 Line Creation & Editing

- **Form sections**
  - Line name (required).
  - Days of week (multi‑select; at least one day recommended).
  - Start & end time:
    - Time pickers with 5‑minute steps.
    - Validation rules from section 7.1.
    - Overnight hint when end time crosses midnight.
  - Frequency:
    - Choice among: weekly, monthly, variable, one‑time.
  - Unique color:
    - Dropdown showing available palette colors as swatches.
    - If palette exhausted (15 used), explain that no colors are available and block creation.
  - Planned dates:
    - When no days selected:
      - Show an explanation that days must be selected first.
    - When days selected:
      - Show a compact primary date suggestion + summary.
      - Provide a dropdown listing all suggested dates in the near term.
      - Each suggested date shows:
        - Title (e.g. human date label).
        - Status badge derived from current status (ended/current/upcoming/cancelled).
        - Date/time description.
      - Each suggested date is **selected by default** and can be toggled individually.
  - Manual dates:
    - Toggle “Manual date”.
    - When enabled:
      - Show date picker and “Add date” button.
      - Additions create **manual occurrences** (isExpected = false).
      - Existing manual occurrences are listed with:
        - Date/time label.
        - Status label.
        - Delete button.
    - When disabled:
      - Manual controls are hidden, but existing manual occurrences are preserved logically.
- **Behavior on save**
  - Validation runs (see section 7).
  - If valid:
    - Line is created or updated.
    - Event suggestions and manual dates are normalized as occurrences.
    - Calendar is refreshed to reflect new events.
    - If Event Detail is currently open for this Line, its data is updated.

### 6.8 Line Detail Page (within workspace)

- **Content**
  - Line header (color chip, name).
  - Metadata row: days, time range, frequency, color badge.
  - List of occurrences (events) for the Line:
    - Each item shows:
      - Title.
      - Date/time description.
      - Status badge.
      - “View details” button that opens Event Detail for this occurrence.
- **Navigation**
  - “Edit” button → opens Line modal prefilled with this Line.
  - “Back” button → returns to Lines overview while preserving overall workspace state.

### 6.9 Event Detail Experience

- **Entry points**
  - From a Line card (“View events”) → opens Event Detail mode for first relevant occurrence.
  - From a Line Detail list (“Details” button) → opens Event Detail for that occurrence.
  - From Calendar (click on calendar event) → navigates to Event Detail for that occurrence with calendar context saved.
  - From deep link (URL containing venue, line, occurrence IDs) → opens Event Detail directly and hydrates the relevant venue and line.

- **Content**
  - Line context:
    - Color chip + Line name.
    - Days, time range, frequency.
  - Event summary:
    - Title (explicit or derived).
    - Date & time description (friendly label).
    - Status badge (cancelled/ended/current/upcoming).
    - Counter: “Event N of M in this Line”.
  - Chips:
    - “Planned date” vs “Manual date” tag (based on `isExpected`).
    - “Active” vs “Cancelled” tag.
  - Details section:
    - Subtitle.
    - Description.
    - Location.
    - Contact.
    - Each field shows `—` when empty.

- **Navigation & Back behavior**
  - **Back button**:
    - Returns to:
      - Calendar tab at the same view/date when user came from the calendar.
      - Lines view when user came from a Line context.
  - **Next/Previous buttons**:
    - Allow moving to the next/previous occurrence within the same Line.
    - Provide explanatory status text:
      - If both prev & next exist → “Free navigation between all events”.
      - If only one side exists → hints about reaching the start/end.
      - If neither exists → indicates it is the only event.

### 6.10 Calendar View

- **Per‑venue calendar**
  - Displays all occurrences for Lines in the active venue.
  - Reflects overnight rules (events anchored to start day with `(+1)` marker).
  - Supports multiple views (day/week/month/list).
  - For mobile month view:
    - Shows compact color initials for events.
    - Uses tooltips or similar mechanisms to reveal full details on interaction.

- **Legend**
  - Horizontal scrollable legend listing each Line with:
    - Color swatch.
    - Line name.
  - Responsive and mobile‑friendly.

- **Hour compression**
  - Control to “compress empty hours” / “expand hours”.
  - Behavior:
    - When compressed:
      - Calendar limits visible hours to the smallest range that contains events, with some safety padding.
    - When expanded:
      - Calendar shows full 24 hours again.
    - Toggle updates automatically when events change.

- **Interactions**
  - Clicking calendar events navigates to Event Detail with calendar context preserved (view, date) for back navigation.

## 7. Validation & Business Rules

### 7.1 Time & Schedule Validation

- Acceptable times:
  - Strings in `HH:MM` format (24‑hour).
  - Valid range: `00:00`–`23:59` and exactly `24:00`.
  - `24:00` allowed only as the end of a day; any `24:MM` with `MM != 00` is invalid.
- Any invalid time:
  - Is rejected immediately.
  - Shows appropriate error to the user.
  - Is **not** persisted and does not affect the calendar.
- Overnight detection:
  - When end time is less than or equal to start time and both are valid, the event is considered to span into the next day.

### 7.2 Date Suggestions & Manual Dates

- Suggestions:
  - Based on:
    - Selected weekdays.
    - Frequency (weekly, monthly, variable, one‑time).
    - An anchor date (today or configurable).
  - A limited horizon (e.g. up to end of current year, with per‑frequency limits) is used to keep lists reasonable.
  - Each suggested date:
    - Is **selected by default**.
    - Can be toggled individually; there are **no** “select all” / “clear all” bulk buttons in the final flow.
  - Changing frequency or schedule recalculates suggestions while preserving user intent wherever possible.

- Manual dates:
  - Can only be added when the manual toggle is on.
  - Manual occurrences must:
    - Respect day‑of‑week rules (dates must match selected weekdays when applicable).
    - Avoid duplicates (same date as an existing occurrence should be rejected or prevented).

### 7.3 Line Color Palette

- Exactly 15 curated colors per venue (not using red/white/black or primary branding).
- Colors must remain unique per active Line in a venue.
- When all colors are in use:
  - The UI clearly explains that no additional Lines can be created until a color is freed.

### 7.4 Event Status Model

- Status is derived from:
  - `isActive` (cancelled vs. not).
  - Current date/time vs. occurrence time range.
- Priority:
  - If `isActive === false` → “Cancelled”.
  - Else if event ended → “Ended”.
  - Else if currently ongoing → “Happening now”.
  - Else → “Upcoming”.
- Statuses are consistently used on:
  - Lines overview cards (aggregated counts).
  - Line Detail list.
  - Event Detail page.
  - Date suggestion dropdown.

## 8. State & Persistence (Conceptual)

- **Per‑venue data**
  - Venues, VenueDetails, Lines, Occurrences, Menus, Zones, Tables, and any cached calendar optimizations are logically scoped by `venueId`.
- **Session behavior**
  - The last active venue can be automatically reopened on subsequent visits.
  - Deep links (routes with IDs) must always be authoritative over any local “last venue” memory.
- **Production note**
  - Implementation may move from browser‑only storage (as in the MVP) to a backend database; this must preserve:
    - Per‑venue scoping.
    - Correct hydration of routes from IDs.
    - Reproducible event derivation from Lines.

## 9. UX & Design Guidelines

- **Language & direction**
  - Entire app is RTL and Hebrew‑first.
  - All labels, statuses, and helper text should be presented in Hebrew (as in the MVP).
- **Visual style**
  - Dark theme base with explicit color variables for backgrounds, borders, and text.
  - Card‑based layout (e.g., `cardx` style) for content groups.
  - Buttons and badges use semantic color distinctions for primary actions and statuses.
- **Responsiveness**
  - Mobile view:
    - Sidebar becomes top/bottom navigation or collapsible.
    - Calendar uses compact month/list views with abbreviated content and tooltips.
    - Legends and horizontal lists are scrollable.
  - Desktop view:
    - Sidebar visible.
    - Rich calendar and detail layouts with enough whitespace.
- **Accessibility**
  - Clear, readable labels on inputs and buttons.
  - Tooltips / helper texts for advanced controls like calendar hours compression.
  - Badge colors with sufficient contrast.
  - Back navigation clearly indicates the target context (Lines vs Calendar).

## 10. Known Limitations (Inherited from MVP)

- There is **no dedicated standalone “Event management” page**:
  - Event editing is handled via the Line modal (for occurrences) and the Event Detail view (for display and navigation).
- Line deletion is not yet part of the flow:
  - In the MVP, Lines can be edited but not deleted; production may add deletion, but must then define rules for color reuse and event removal.
- Multi‑user collaboration and real‑time synchronization are out of scope for the initial production version.

## 11. How This Document Will Be Used in `lines-app`

- **Routing & layouts**
  - Will drive the design of App Router segments and nested layouts for:
    - Home (`/`).
    - Workspace shell (`/venues/[venueId]`).
    - Tabs under a venue (`info`, `settings`, `lines`, `calendar`).
    - Detail routes for Lines and Events.
- **Domain & API design**
  - Defines entities and relationships for database schemas and server APIs.
  - Clarifies derived calculations (event statuses, calendar time bounds, suggestions).
- **UI/UX**
  - Provides the structure for pages, modals, empty states, and navigation flows to be recreated in React components.

This is the **source of truth** for the production implementation based on the `Lines-MVP` behavior. Future versions of this document should extend this spec with backend concerns, roles/permissions, and multi‑user flows as those become relevant.



