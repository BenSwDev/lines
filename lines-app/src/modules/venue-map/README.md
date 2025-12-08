# Venue Map Module

Manages venue floor plan maps with zones, tables, and special areas.

This module provides a comprehensive, mobile-first, accessible floor plan editor for creating and managing venue layouts.

## ✨ Features

### Core Features

- **Simple Mode (Default)**: Simplified interface perfect for beginners - easy to use for anyone, regardless of technical background
- **Advanced Mode**: Full-featured editor with all professional tools
- **Mobile-First Design**: Fully responsive, works perfectly on mobile, tablet, and desktop
- **Touch Gestures**: Full support for touch interactions (tap, double tap, long press, pinch, pan)
- **Accessibility**: WCAG AA compliant with ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized**: Lazy loading, memoization, and virtualization for smooth 60fps experience

### Editor Features

- Interactive floor plan editor with drag-and-drop
- Zones, tables, and special areas (entrance, exit, kitchen, restroom, etc.)
- Custom templates support
- Infinite canvas with pan and zoom
- Auto-linking: Elements automatically link to zones when moved inside them
- Snap-to-grid: All elements aligned to grid for clean layouts
- Contextual toolbar: Tools appear based on selection
- Empty states: Helpful guidance when starting fresh

### User Experience

- **Progressive Disclosure**: UI adapts to context - shows only what's needed
- **Loading States**: Skeleton loading for better perceived performance
- **Success Animations**: Visual feedback for successful actions
- **Error Handling**: Graceful error boundaries and user-friendly messages
- **Help System**: Contextual help panel with tips, shortcuts, and guides
- **Guided Tour**: Step-by-step onboarding for new users

## 📱 Mobile Support

The module is fully optimized for mobile devices:

- Touch-friendly controls (minimum 44x44px touch targets)
- Bottom sheet dialogs for mobile
- Responsive toolbars that adapt to screen size
- Gesture support (pinch to zoom, pan to move)
- Mobile-optimized element menus

## ♿ Accessibility

- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full keyboard support (Enter/Space to select, Arrow keys to move, etc.)
- **Screen Reader Support**: Proper semantic HTML and ARIA attributes
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Works with high contrast mode

## 🏗️ Architecture

### Modular Structure

```
venue-map/
├── hooks/                    # Custom hooks (useDevice, useResponsive, useGestures)
├── ui/
│   ├── FloorPlanCanvas/     # Canvas components (Viewport, Grid, TouchControls)
│   ├── Toolbar/             # Responsive toolbars (Mobile, Desktop)
│   ├── Elements/            # Element renderers (Table, Zone, SpecialArea, Lazy)
│   ├── Mobile/              # Mobile-specific components (BottomSheet, Gestures)
│   ├── Dialogs/             # Responsive dialogs
│   └── UX/                  # UX components (EmptyState, ContextualToolbar, HelpPanel, etc.)
├── actions/                  # Server actions (floorPlanActions, templateActions)
├── utils/                    # Utility functions (history, clipboard, alignment, performance, etc.)
├── config/                   # Design tokens and configuration
└── schemas/                  # Zod schemas for validation
```

### Key Components

- **FloorPlanEditorV2**: Main editor component
- **VenueMapPage**: Page wrapper with data loading
- **CanvasViewport**: Manages zoom, pan, and viewport
- **ElementRenderer**: Base renderer for all elements
- **ContextualToolbar**: Context-aware toolbar for selected elements
- **HelpPanel**: Help and documentation panel

## 🚀 Performance

- **Lazy Loading**: Elements loaded only when in viewport
- **Memoization**: Components memoized to prevent unnecessary re-renders
- **Code Splitting**: Components loaded on demand
- **Virtualization**: Large lists handled efficiently

## 📚 Documentation

- Component-level documentation in each file
- Architecture guide: `docs/FEATURE_SPECS/venue-map-refactor-roadmap.md`
- User guide: Available in Help Panel (accessible via Help button)

## 🔄 Refactoring Status

**Status**: ✅ Complete (Phase 5/5)

All refactoring phases completed:

- ✅ Phase 1: Foundation (Hooks, Canvas, Toolbar, Elements)
- ✅ Phase 2: Mobile Support (Bottom sheets, Touch gestures)
- ✅ Phase 3: Responsive Canvas & Performance
- ✅ Phase 4: UX Improvements (Progressive Disclosure, User Feedback, Onboarding)
- ✅ Phase 5: Polish & Testing (Accessibility, Performance, Documentation)

## 📝 Usage

```tsx
import { VenueMapPage } from "@/modules/venue-map/ui/VenueMapPage";

<VenueMapPage venueId={venueId} venueName={venueName} userId={userId} />;
```

## 🎯 Simple Mode

The Simple Mode is the default interface, designed to be intuitive and easy to use:

- Only essential buttons: Templates, Add Element, Save
- Clean, uncluttered toolbar
- Easy switching to Advanced Mode when needed
- Perfect for users of all ages and technical levels

## 🔧 Advanced Mode

Advanced Mode provides full professional tools:

- All toolbar options visible
- Bulk operations (align, distribute, group)
- Advanced editing options
- Layer management
- Export options
