# Guided Tour Module

**Status:** ✅ Implemented  
**Version:** 1.0.0  
**Location:** `src/modules/guided-tour`

---

## Overview

The Guided Tour module provides a step-by-step interactive guidance system that works on real application screens. It helps users understand how to use the application by showing tooltips, highlights, and explanations directly on the actual pages.

This module is designed to:

- Guide users through the application setup process
- Explain key features on each page
- Provide short, clear, focused explanations
- Work seamlessly with the existing application structure
- Save progress in localStorage

---

## Features

### Core Features

1. **Real Screen Guidance**
   - Works on actual application pages (not separate demo pages)
   - Highlights specific elements with overlays
   - Shows contextual tooltips

2. **Step-by-Step Flow**
   - Structured tour flow: LINES → Roles → Map → Menus
   - Each page has multiple steps
   - Progress tracking with localStorage

3. **User-Friendly**
   - Short, clear explanations in Hebrew
   - Skip/Next/Previous navigation
   - Progress bar at the top
   - Responsive and RTL support

4. **Extensible**
   - Easy to add new pages and steps
   - Content-driven (JSON-like structure)
   - Modular architecture

---

## Module Structure

```
src/modules/guided-tour/
├── types.ts                    # TypeScript types
├── schemas/
│   └── tourSchemas.ts         # Zod validation schemas
├── services/
│   └── tourService.ts         # Business logic (localStorage, progress)
├── data/
│   └── tourContent.ts        # All tour steps and pages content
├── ui/
│   ├── TourProvider.tsx       # Context API provider
│   ├── TourOverlay.tsx        # Overlay with tooltips
│   ├── TourProgressBar.tsx    # Progress bar component
│   └── TourButton.tsx         # Button to start/stop tour
└── index.ts                   # Public exports
```

---

## Usage

### Basic Integration

The tour is automatically integrated into `DashboardLayout`. It detects the current page and provides a tour button in the header.

```tsx
import { TourProvider, TourOverlay, TourProgressBar, TourButton } from "@/modules/guided-tour";

// In your layout
<TourProvider pageId={currentPageId}>
  {/* Your content */}
  <TourOverlay />
  <TourProgressBar />
  <TourButton />
</TourProvider>;
```

### Adding Tour Steps to a Page

1. Add `data-tour` attributes to elements you want to highlight:

```tsx
<Button data-tour="lines-create-button">צור ליין חדש</Button>
```

2. Define the step in `tourContent.ts`:

```ts
{
  id: "lines-create-button",
  pageId: "lines",
  title: "צור ליין חדש",
  description: "לחץ כאן כדי ליצור ליין חדש...",
  targetSelector: '[data-tour="lines-create-button"]',
  position: "bottom"
}
```

---

## Tour Flow

The tour follows this order:

1. **LINES** (Order: 1)
   - `lines-intro` - Introduction to lines
   - `lines-create-button` - Create button
   - `lines-empty-state` - Empty state
   - `lines-card` - Line card

2. **Roles** (Order: 2)
   - `roles-intro` - Introduction to roles
   - `roles-departments` - Departments
   - `roles-hierarchy` - Hierarchy

3. **Map** (Order: 3)
   - `map-intro` - Introduction to map
   - `map-zones` - Zones
   - `map-tables` - Tables

4. **Menus** (Order: 4)
   - `menus-intro` - Introduction to menus
   - `menus-upload` - Upload menu
   - `menus-list` - Menu list

---

## API Reference

### TourProvider

Context provider that manages tour state.

**Props:**

- `children: ReactNode` - Child components
- `autoStart?: boolean` - Auto-start tour on mount
- `pageId?: TourPageId` - Current page ID

### useTour Hook

Hook to access tour state and actions.

**Returns:**

- `isActive: boolean` - Is tour currently active
- `currentStep: TourStep | null` - Current step
- `progress: TourProgress | null` - Tour progress
- `startTour(pageId?: TourPageId)` - Start tour
- `stopTour()` - Stop tour
- `nextStep()` - Go to next step
- `prevStep()` - Go to previous step
- `skipStep()` - Skip current step
- `completeStep()` - Mark step as completed
- `resetTour()` - Reset tour progress

### TourButton

Button component that starts/stops the tour for the current page.

Automatically detects the current page from the pathname.

---

## Data Model

### TourStep

```typescript
{
  id: TourStepId;
  pageId: TourPageId;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector
  position?: "top" | "bottom" | "left" | "right" | "center";
  nextStepId?: TourStepId;
  prevStepId?: TourStepId;
  skipable?: boolean;
}
```

### TourProgress

Stored in localStorage:

```typescript
{
  currentStepId: TourStepId | null;
  completedSteps: TourStepId[];
  currentPageId: TourPageId | null;
  startedAt: number | null;
  completedAt: number | null;
}
```

---

## Adding New Pages

1. Add page ID to `TourPageId` type in `types.ts`
2. Add page to `tourPages` array in `tourContent.ts`
3. Add steps to `tourSteps` array
4. Add `data-tour` attributes to page elements
5. Tour will automatically work for the new page

---

## Future Enhancements

- [ ] Add more pages (Info, Calendar, Reservations)
- [ ] Add video/gif demonstrations
- [ ] Add analytics tracking
- [ ] Add tour completion rewards
- [ ] Add tour customization per user

---

**Last Updated:** 2025-01-15
