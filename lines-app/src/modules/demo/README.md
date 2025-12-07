# Demo Module

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Route:** `/demo`

---

## Overview

The Demo module provides an interactive marketing demonstration experience for showcasing the Lines application. It presents a guided tour through 4 key feature areas with animated overlays, progress tracking, and clear call-to-action buttons.

This module is designed to:

- Showcase product features to potential customers
- Build confidence before registration
- Serve as a marketing tool for sales teams
- Provide a production-ready demo experience

---

## Module Structure

```
src/modules/demo/
  ui/
    ImmersiveDemo.tsx      - Main demo component
  actions/
    demoActions.ts         - Server actions (analytics, config)
  services/
    demoService.ts         - Business logic (analytics, data generation)
  schemas/
    demoSchemas.ts         - Zod validation schemas
  types.ts                 - TypeScript type definitions
  index.ts                 - Public exports
  README.md                - This file
```

---

## Features

### Current Implementation

1. **Interactive Step Navigation**
   - 4 predefined steps covering brand, calendar, automation, and handoff
   - Click-to-navigate between steps
   - Auto-advance button for sequential viewing
   - Progress bar with animated percentage

2. **Visual Elements**
   - Dark theme with gradient backgrounds
   - Glass-morphism effects (transparent cards with blur)
   - Animated overlay cards with rotation effects
   - Framer Motion animations for smooth transitions

3. **Call-to-Action**
   - "התחילו הדמיה חיה" - Next step button
   - "התחילו לעבוד עכשיו" - Registration link
   - Responsive design (mobile + desktop)

4. **RTL Support**
   - Full Hebrew language support
   - Right-to-left layout
   - Culturally appropriate content

### Future Expansion Points

See `TODO.md` for detailed expansion roadmap.

---

## Usage

### Basic Usage

```tsx
import { ImmersiveDemo } from "@/modules/demo";

export default function DemoPage() {
  return <ImmersiveDemo />;
}
```

### With Analytics Tracking

```tsx
"use client";

import { ImmersiveDemo } from "@/modules/demo";
import { trackDemoEvent } from "@/modules/demo";
import { useEffect } from "react";

export default function DemoPage() {
  useEffect(() => {
    trackDemoEvent({
      type: "step_viewed",
      stepId: "brand",
      timestamp: new Date()
    });
  }, []);

  return <ImmersiveDemo />;
}
```

---

## Components

### `ImmersiveDemo`

Main demo component that renders the full interactive experience.

**Props:** None (self-contained)

**State:**

- `activeStep` - Current step index (0-3)
- `currentStep` - Computed current step data
- `progress` - Progress percentage (0-100)

**Features:**

- Step navigation (click or button)
- Progress tracking
- Animated overlays
- Responsive layout

---

## Server Actions

### `trackDemoEvent(input: unknown)`

Track analytics events for demo interactions.

**Input Schema:**

```typescript
{
  type: "step_viewed" | "cta_clicked" | "demo_completed" | "registration_clicked",
  stepId?: string,
  timestamp: Date,
  metadata?: Record<string, unknown>
}
```

**Returns:**

```typescript
{ success: boolean, error?: string }
```

### `getDemoConfig()`

Get demo configuration (feature flags, A/B testing variants).

**Returns:**

```typescript
{
  success: boolean,
  data?: {
    enabled: boolean,
    autoAdvance: boolean,
    autoAdvanceDelay: number
  },
  error?: string
}
```

### `generateDemoData(userId: string)`

Generate sample data for interactive "Try it live" feature.

**Returns:**

```typescript
{ success: boolean, error?: string }
```

---

## Types

### `DemoStep`

```typescript
interface DemoStep {
  id: string;
  title: string;
  badge: string;
  description: string;
  bullets: string[];
}
```

### `OverlayCard`

```typescript
interface OverlayCard {
  title: string;
  body: string;
  icon: React.ReactNode;
  className: string;
}
```

### `DemoAnalyticsEvent`

```typescript
interface DemoAnalyticsEvent {
  type: "step_viewed" | "cta_clicked" | "demo_completed" | "registration_clicked";
  stepId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
```

---

## Integration

### Route Configuration

The demo page is configured as a public route in `middleware.ts`:

```typescript
const publicRoutes = ["/", "/demo", "/auth/login", "/auth/register", "/api/auth"];
```

### Navigation Links

The demo is linked from:

- Landing page Hero section (`/`)
- Footer quick links
- Header navigation (future)

---

## Styling

The demo uses:

- **Tailwind CSS** for all styling
- **Dark theme** with slate-950/900 gradients
- **Primary color** accents (indigo-500)
- **Glass-morphism** effects (backdrop-blur, transparent backgrounds)
- **Framer Motion** for animations

---

## Testing

### Manual Testing Checklist

- [ ] All 4 steps display correctly
- [ ] Navigation between steps works (click + button)
- [ ] Progress bar updates correctly
- [ ] Overlay cards animate properly
- [ ] CTA buttons link correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] RTL layout is correct
- [ ] Dark theme displays properly

### Future Test Coverage

- Unit tests for `demoService`
- Integration tests for server actions
- E2E tests for user flow
- Visual regression tests

---

## Performance

- **Client-side only** - No server-side rendering overhead
- **Lazy loading** - Framer Motion animations are optimized
- **Minimal bundle** - Only imports what's needed
- **No external API calls** - Fully self-contained

---

## Accessibility

### Current Status

- ✅ Semantic HTML structure
- ✅ Keyboard navigation (tab through steps)
- ✅ Screen reader friendly (proper headings)
- ⚠️ Color contrast (needs verification)
- ⚠️ Focus indicators (needs enhancement)

### Future Improvements

- Add ARIA labels for interactive elements
- Improve keyboard navigation
- Add skip-to-content link
- Enhance focus indicators

---

## Dependencies

- `next/link` - Navigation
- `react` - Core framework
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@/components/ui/badge` - Badge component
- `@/components/ui/button` - Button component

---

## Related Documentation

- `docs/FEATURE_SPECS/demo.md` - Full feature specification
- `docs/CHANGELOG.md` - Version history
- `TODO.md` - Future expansion roadmap

---

**Last Updated:** 2025-12-05
