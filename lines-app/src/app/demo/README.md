# Interactive Demo Guide Module

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Location:** `src/app/demo`  
**Languages:** Hebrew (עברית) & English

---

## Overview

A complete, LAYA-style interactive demo guide module for onboarding users. This module provides an auto-advancing, branching, story-driven experience with smooth animations and responsive design.

## Features

- ✅ **Full Internationalization (i18n)** - Hebrew & English support
- ✅ **Language switcher** - Switch languages on the fly
- ✅ **RTL/LTR support** - Automatic direction switching
- ✅ **LINES-specific content** - Real product features showcased
- ✅ **Auto-advancing slides** with configurable delays
- ✅ **Interactive branching** based on user choices
- ✅ **Smooth animations** using Framer Motion
- ✅ **Progress tracking** with visual indicators
- ✅ **Mobile-first responsive** design
- ✅ **Type-safe** with Zod validation
- ✅ **Accessible** with keyboard navigation

## Module Structure

```
src/app/demo/
├── components/
│   ├── DemoGuide.tsx          # Main orchestrator component
│   ├── DemoGuideWrapper.tsx    # Client wrapper with data loading
│   ├── Slide.tsx               # Individual slide renderer
│   ├── ProgressBar.tsx        # Progress visualization
│   └── QuestionCard.tsx        # Interactive question component
├── hooks/
│   ├── useDemoFlow.ts          # Flow state management
│   ├── useAutoAdvance.ts       # Auto-advance logic
│   └── useDemoProgress.ts      # Progress calculations
├── animations/
│   └── slideTransitions.ts     # Animation variants
├── data/
│   └── demoFlow.json           # Demo flow configuration
├── utils/
│   ├── demoSchema.ts           # Zod validation schemas
│   └── loadDemoFlow.ts         # Data loading utilities
├── styles/
│   └── demo.css                # LAYA-style CSS
└── page.tsx                    # Route handler
```

## Usage

The demo is automatically available at `/demo`. The page component loads the demo flow and renders the `DemoGuideWrapper`.

### Customizing Content

Edit `src/app/demo/data/demoFlow.json` to customize:

- Slide content (title, subtitle, content, emojis)
- Bilingual content (titleHe, contentHe, bulletsHe, etc.)
- Translation keys (titleKey, contentKey for i18n)
- Slide types (intro, content, feature, question, outro)
- Branching logic (question options and next slides)
- Auto-advance settings
- Gradients and styling

**Bilingual Support:**
- Use `titleHe`, `contentHe`, `bulletsHe` for Hebrew-specific content
- Use `titleKey`, `contentKey` to reference translation keys from `messages/*.json`
- Fallback to default `title`, `content` if language-specific version not found

### Adding New Slides

1. Add a new slide object to the `slides` array in `demoFlow.json`
2. Set the `id`, `type`, `title`, and other properties
3. Link slides using `nextSlide` property
4. For branching, use question slides with options

### Customizing Animations

Edit `src/app/demo/animations/slideTransitions.ts` to modify:

- Slide transition variants
- Animation timing
- Easing functions
- Stagger effects

## Configuration

### Demo Flow JSON Structure

```json
{
  "metadata": {
    "version": "1.0.0",
    "autoAdvance": true,
    "autoAdvanceDelay": 5000,
    "enableBranching": true
  },
  "slides": [
    {
      "id": "slide-id",
      "type": "intro|content|feature|question|outro",
      "emoji": "👋",
      "title": "Slide Title",
      "subtitle": "Optional Subtitle",
      "content": "Main content text",
      "gradient": "from-purple-500 via-pink-500 to-orange-500",
      "autoAdvance": true,
      "duration": 5000,
      "nextSlide": "next-slide-id"
    }
  ]
}
```

### Slide Types

- **intro**: Welcome slide with emoji and content
- **content**: Information slide with optional bullets
- **feature**: Feature highlight with optional highlights list
- **question**: Interactive branching with selectable options
- **outro**: Final slide with CTA buttons

## Hooks API

### `useDemoFlow(flow)`

Manages demo flow state and navigation.

**Returns:**
- `currentSlide` - Current slide object
- `currentSlideId` - Current slide ID
- `progress` - Progress percentage
- `goToSlide(id)` - Navigate to specific slide
- `goToNext()` - Go to next slide
- `goToPrevious()` - Go to previous slide
- `selectBranch(slideId, optionId)` - Select branching option
- `reset()` - Reset to first slide

### `useAutoAdvance(options)`

Handles auto-advance timing.

**Options:**
- `slide` - Current slide
- `enabled` - Enable/disable auto-advance
- `defaultDelay` - Default delay in ms
- `onAdvance` - Callback when advancing
- `pauseOnHover` - Pause on mouse hover

### `useDemoProgress(options)`

Calculates progress metrics.

**Returns:**
- `progress` - Current progress percentage
- `completionPercentage` - Completion based on visited slides
- `isFirstSlide` - Is on first slide
- `isLastSlide` - Is on last slide
- `canGoNext` - Can navigate forward
- `canGoPrevious` - Can navigate backward

## Styling

The module uses Tailwind CSS with custom LAYA-style gradients. Custom styles are in `styles/demo.css`.

### Customizing Gradients

Edit the `gradient` property in slide objects:

```json
{
  "gradient": "from-purple-500 via-pink-500 to-orange-500"
}
```

Use any Tailwind gradient classes.

## Accessibility

- ✅ Keyboard navigation (tab, enter, arrow keys)
- ✅ Focus indicators
- ✅ ARIA labels on interactive elements
- ✅ Screen reader friendly structure
- ✅ Semantic HTML

## Performance

- **Bundle Size:** ~46.7 kB
- **First Load JS:** 165 kB
- **Animations:** 60fps with hardware acceleration
- **Lazy Loading:** Components loaded on demand

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Analytics tracking integration
- [ ] A/B testing support
- [ ] Video/GIF demonstrations
- [ ] Multi-language support
- [ ] Admin configuration panel
- [ ] Demo analytics dashboard

## Related Documentation

- `docs/FEATURE_SPECS/demo.md` - Feature specification
- `docs/CHANGELOG.md` - Version history
- `docs/API_REFERENCE.md` - API documentation

---

**Last Updated:** 2025-01-16

