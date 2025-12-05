# Steve Jobs–Level Design Vision Review

**Generated:** 2025-01-15  
**Agent:** #19 - Chief Product & Design Visionary Bot  
**Scope:** Complete UI/UX Analysis & Redesign Proposal

---

## Executive Summary

The Lines application demonstrates solid technical foundations with Next.js 15, TypeScript, and RTL support. However, the design system lacks the cohesive vision and emotional connection that transforms good software into exceptional experiences. This review identifies critical design gaps and proposes a comprehensive redesign that elevates the product to world-class standards.

**Current State:** Functional but fragmented design language with inconsistent patterns, mixed component libraries, and missed opportunities for delight and clarity.

**Vision:** A unified, emotionally resonant design system that feels intuitive, delightful, and purposefully crafted—where every interaction reinforces trust and efficiency.

---

## Cognitive Load Analysis

### 1. Component Library Duplication

**Issue:** Two separate Button components exist (`components/ui/button.tsx` and `shared/ui/Button.tsx`) with different APIs and styling approaches.

**Impact:**

- Developers face decision paralysis: "Which button should I use?"
- Inconsistent visual appearance across the app
- Increased maintenance burden
- User confusion from inconsistent interactions

**Solution:**

- Consolidate to a single, well-designed Button component
- Create clear usage guidelines
- Establish component hierarchy: `shared/ui` for primitives, `components/ui` for shadcn extensions

### 2. Information Density in Calendar View

**Issue:** CalendarTab component presents multiple controls (view switcher, date navigation, compression toggle) without clear visual hierarchy.

**Impact:**

- Users must scan multiple controls to understand available actions
- Cognitive overhead when switching between day/week/month views
- Missing progressive disclosure for advanced features

**Solution:**

- Group related controls visually
- Use icon + tooltip pattern for secondary actions
- Implement contextual help for view switching
- Add keyboard shortcuts for power users

### 3. Mixed Language in UI

**Issue:** Sidebar and some components mix Hebrew and English inconsistently (e.g., "Venue נוכחי", "החלף Venue").

**Impact:**

- Breaks user mental model
- Creates confusion about system language
- Reduces professional appearance

**Solution:**

- Enforce full i18n coverage
- Create translation audit tool
- Establish language consistency rules

---

## Visual Hierarchy Assessment

### 1. Landing Page Hero Section

**Current:** Hero uses gradient text and badges but lacks clear focal point hierarchy.

**Vision:**

- Establish clear visual flow: Badge → Headline → Description → CTA → Features
- Increase headline size and weight for impact
- Use subtle animation to guide eye movement
- Implement scroll-triggered reveals for feature cards

**Implementation:**

```tsx
// Enhanced Hero with better hierarchy
<h1 className="mb-4 text-6xl font-extrabold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">
  ניהול אירועים חוזרים
  <br />
  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
    בצורה פשוטה וחכמה
  </span>
</h1>
```

### 2. Dashboard Sidebar

**Current:** Sidebar groups lack visual separation and hierarchy.

**Vision:**

- Implement clear section dividers with subtle backgrounds
- Use typography scale: Group labels (text-xs uppercase tracking-wide), menu items (text-sm)
- Add active state indicators with left border accent
- Implement smooth transitions for state changes

### 3. Venue Cards Grid

**Current:** VenueCardModern has good hover states but cards feel isolated.

**Vision:**

- Create visual connection between related cards
- Implement staggered entrance animations
- Use consistent spacing rhythm (8px base unit)
- Add subtle shadow elevation system

---

## Clarity & Readability Issues

### 1. Typography Scale Inconsistency

**Issue:** No defined typography scale; components use arbitrary sizes (text-3xl, text-5xl, text-lg).

**Fix:** Establish typography system:

```ts
// Design tokens for typography
const typography = {
  display: {
    "2xl": "text-7xl font-extrabold leading-none tracking-tight",
    xl: "text-6xl font-extrabold leading-tight tracking-tight",
    lg: "text-5xl font-bold leading-tight tracking-tight"
  },
  heading: {
    "1": "text-4xl font-bold leading-tight tracking-tight",
    "2": "text-3xl font-semibold leading-tight tracking-tight",
    "3": "text-2xl font-semibold leading-snug tracking-tight",
    "4": "text-xl font-semibold leading-snug"
  },
  body: {
    lg: "text-lg leading-relaxed",
    base: "text-base leading-relaxed",
    sm: "text-sm leading-normal",
    xs: "text-xs leading-normal"
  }
};
```

### 2. Color Contrast Issues

**Issue:** Some muted-foreground text may not meet WCAG AA standards in dark mode.

**Fix:** Audit all text colors and ensure 4.5:1 contrast ratio minimum.

### 3. Icon Sizing Inconsistency

**Issue:** Icons use various sizes (h-3, h-4, h-5, h-6) without clear system.

**Fix:** Establish icon size scale:

- xs: 12px (h-3)
- sm: 16px (h-4) - default
- md: 20px (h-5)
- lg: 24px (h-6)
- xl: 32px (h-8)

---

## Content Structure Analysis

### 1. Empty States Need Personality

**Current:** EmptyState component is functional but lacks emotional connection.

**Current Structure:**

- Icon
- Title
- Description
- Action button

**Improved Structure:**

- Animated illustration or icon
- Encouraging headline (not just "אין ליינים")
- Helpful description with next steps
- Primary action + secondary help link
- Optional: Progress indicator for onboarding

**Example:**

```tsx
<EmptyState
  icon={List}
  illustration="animated" // Add animated SVG
  title="בואו נתחיל!"
  description="ליינים הם הדרך שלך לנהל אירועים חוזרים. צור את הליין הראשון שלך כדי להתחיל."
  action={{
    label: "צור ליין ראשון",
    onClick: () => setIsCreateOpen(true)
  }}
  helpLink={{
    label: "למד עוד על ליינים",
    href: "/docs/lines"
  }}
/>
```

### 2. Error Messages Lack Context

**Issue:** Error toasts show generic messages without actionable guidance.

**Fix:** Implement contextual error messages with:

- Clear explanation of what went wrong
- Suggested action to resolve
- Link to help documentation if applicable

---

## Interaction Pattern Review

### 1. Button Interactions

**Current:** Buttons have basic hover states but lack micro-interactions.

**Vision:** Enhanced button interactions:

- Subtle scale on hover (scale-105)
- Ripple effect on click (for primary actions)
- Loading state with spinner animation
- Success state with checkmark animation
- Disabled state with reduced opacity and cursor-not-allowed

**Code:**

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-md hover:shadow-lg"
        // ... other variants
      }
    }
  }
);
```

### 2. Card Interactions

**Current:** VenueCardModern has hover effects but lacks depth.

**Vision:**

- 3D lift effect on hover (translateY(-2px) + shadow increase)
- Smooth border color transition
- Subtle background gradient animation
- Click feedback with scale animation

### 3. Form Interactions

**Issue:** Form inputs lack clear focus states and validation feedback.

**Fix:**

- Enhanced focus ring with primary color
- Real-time validation with animated checkmarks/X icons
- Smooth error message appearance
- Success state with green accent

---

## Responsiveness & Accessibility

### 1. Mobile Navigation

**Issue:** Sidebar may not be optimized for mobile experience.

**Fix:**

- Implement drawer pattern for mobile
- Add swipe gestures for RTL
- Ensure touch targets are minimum 44x44px
- Test with real devices

### 2. Keyboard Navigation

**Issue:** Some interactive elements may not be keyboard accessible.

**Fix:**

- Audit all interactive elements
- Implement proper tab order
- Add keyboard shortcuts for common actions
- Ensure focus indicators are visible

### 3. Screen Reader Support

**Issue:** Some icons and decorative elements lack ARIA labels.

**Fix:**

- Add aria-label to all icon-only buttons
- Implement proper heading hierarchy
- Use semantic HTML elements
- Test with screen readers

---

## Brand Consistency

### 1. Color Palette

**Current:** Uses shadcn default colors which may not reflect brand identity.

**Vision:** Define brand color system:

```ts
const brandColors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    // ... full scale
    600: "#2563eb", // Main brand color
    900: "#1e3a8a"
  },
  accent: {
    // Purple for secondary actions
  },
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6"
  }
};
```

### 2. Logo & Branding

**Issue:** Logo is simple text gradient, lacks memorability.

**Vision:**

- Design distinctive logo mark
- Create logo variations (full, icon, wordmark)
- Establish logo usage guidelines
- Implement logo animation for loading states

### 3. Voice & Tone

**Issue:** Copy is functional but lacks personality.

**Vision:**

- Define brand voice (friendly, professional, empowering)
- Create tone guidelines
- Rewrite key messages with personality
- Add micro-copy that delights

---

## Component Reusability Opportunities

### 1. Extract StatCard Component

**Pattern Found:** Stats display repeated in VenuesDashboard and LinesTab.

**Extract to:**

```tsx
// shared/ui/StatCard.tsx
export function StatCard({ icon: Icon, value, label, trend, onClick }: StatCardProps) {
  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
          {trend && <TrendIndicator trend={trend} />}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Create PageHeader Component

**Pattern Found:** Page headers repeated across tabs with similar structure.

**Extract to:**

```tsx
// shared/layout/PageHeader.tsx
export function PageHeader({ title, description, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-2">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-muted-foreground">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
```

### 3. Unified Loading States

**Pattern Found:** Multiple loading skeleton implementations.

**Extract to:** Reusable Skeleton components with variants:

- SkeletonCard
- SkeletonList
- SkeletonTable
- SkeletonForm

---

## Modern Design Language Evaluation

### 1. Apple HIG Principles

**Current:** Basic adherence, missing polish.

**Opportunities:**

- Implement depth with subtle shadows and layers
- Use SF Pro-inspired typography (system fonts with proper weights)
- Add haptic-like feedback with animations
- Implement smooth page transitions
- Use blur effects for modals (backdrop-blur)

### 2. Material You Patterns

**Opportunities:**

- Implement dynamic color theming based on venue colors
- Use elevation system (0-24dp shadows)
- Add ripple effects to interactive elements
- Implement bottom sheets for mobile

### 3. Glassmorphism Opportunities

**Vision:** Use glassmorphism for:

- Modal overlays
- Sidebar backgrounds (subtle)
- Card hover states
- Navigation elements

**Implementation:**

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 4. SaaS UX Trends

**Opportunities:**

- Command palette (Cmd+K) for quick navigation
- Keyboard shortcuts overlay
- Onboarding tooltips with spotlight
- Progress indicators for multi-step processes
- Contextual help system

---

## Redesign Proposal

### Layout

#### 1. Landing Page

**New Structure:**

```
┌─────────────────────────────────────┐
│ Header (sticky, glass effect)      │
├─────────────────────────────────────┤
│                                     │
│  Hero Section                       │
│  - Animated gradient background     │
│  - Large, bold headline            │
│  - Clear CTA hierarchy             │
│  - Scroll indicator                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Features Grid (3 columns)          │
│  - Icon + illustration             │
│  - Hover animations                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Social Proof / Testimonials       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CTA Section                       │
│                                     │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

#### 2. Dashboard Layout

**New Structure:**

```
┌──────────┬──────────────────────────┐
│          │ Top Bar (sticky)         │
│ Sidebar  ├──────────────────────────┤
│ (drawer  │                          │
│  mobile) │  Main Content            │
│          │  - Page Header           │
│          │  - Breadcrumbs           │
│          │  - Content Area           │
│          │  - Action Bar (sticky)   │
│          │                          │
└──────────┴──────────────────────────┘
```

### Component Hierarchy

**New Structure:**

```
src/
├── shared/
│   ├── ui/              # Primitive components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layout/           # Layout components
│   │   ├── PageHeader.tsx
│   │   ├── AppShell.tsx
│   │   └── ...
│   └── patterns/        # Composite patterns
│       ├── StatCard.tsx
│       ├── EmptyState.tsx
│       └── ...
├── components/
│   └── ui/              # shadcn extensions
│       ├── button.tsx
│       └── ...
└── modules/
    └── [feature]/
        └── ui/          # Feature-specific
```

### Visual Flow

**Information Architecture:**

1. **Landing** → Clear value proposition → CTA
2. **Dashboard** → Venue selection → Quick actions
3. **Venue** → Tab navigation → Contextual actions
4. **Feature Pages** → Clear hierarchy → Primary action

**Navigation Flow:**

- Breadcrumbs for deep navigation
- Sidebar for primary navigation
- Command palette for power users
- Contextual actions in headers

### Interaction Design

**Micro-interactions:**

1. **Button clicks:** Scale + ripple
2. **Card hovers:** Lift + shadow increase
3. **Form focus:** Ring animation + label lift
4. **Page transitions:** Fade + slide
5. **Loading states:** Skeleton → content fade-in
6. **Success states:** Checkmark animation
7. **Error states:** Shake + red accent

**Animation Principles:**

- Duration: 200ms for micro, 300ms for transitions
- Easing: ease-out for entrances, ease-in for exits
- Stagger: 50ms delay for list items
- Spring: For playful interactions

### Typography & Spacing

**Typography Scale:**

```ts
const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"]
  },
  fontSize: {
    "display-2xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
    "display-xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
    "heading-1": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
    "heading-2": ["2.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
    "heading-3": ["1.875rem", { lineHeight: "1.4" }],
    "heading-4": ["1.5rem", { lineHeight: "1.5" }],
    "body-lg": ["1.125rem", { lineHeight: "1.75" }],
    body: ["1rem", { lineHeight: "1.75" }],
    "body-sm": ["0.875rem", { lineHeight: "1.5" }],
    caption: ["0.75rem", { lineHeight: "1.5" }]
  }
};
```

**Spacing System (8px base):**

```ts
const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem" // 96px
};
```

### Motion Design

**Animation Library:**

```ts
// animations.ts
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  stagger: (delay: number) => ({
    animationDelay: `${delay}ms`
  })
};
```

**Key Animations:**

1. **Page transitions:** Fade + slide
2. **Modal appearance:** Scale + fade
3. **List items:** Stagger fade-in
4. **Loading:** Pulse + skeleton
5. **Success:** Checkmark draw
6. **Error:** Shake + fade-in message

---

## Code Implementation

### 1. Enhanced Button Component

```tsx
// shared/ui/Button.tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-md hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 shadow-md hover:shadow-lg",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, success, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {success && !loading && (
          <svg
            className="h-4 w-4 animate-in zoom-in duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className={cn(loading && "opacity-0")}>{children}</span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 2. Enhanced Card Component

```tsx
// shared/ui/Card.tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      interactive: {
        true: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 hover:border-primary/50",
        false: "shadow-sm"
      },
      elevation: {
        flat: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg"
      }
    },
    defaultVariants: {
      interactive: false,
      elevation: "sm"
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, elevation, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ interactive, elevation }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// Card sub-components remain the same but with enhanced styling
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card };
```

### 3. PageHeader Component

```tsx
// shared/layout/PageHeader.tsx
"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
```

### 4. StatCard Component

```tsx
// shared/patterns/StatCard.tsx
"use client";

import * as React from "react";
import { Card, CardContent } from "@/shared/ui/Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function StatCard({ icon: Icon, value, label, trend, onClick, className }: StatCardProps) {
  return (
    <Card interactive={!!onClick} onClick={onClick} className={cn("transition-all", className)}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground truncate">{label}</div>
          {trend && (
            <div
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}% {trend.label}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Design System Updates

### New Design Tokens

```ts
// src/core/config/design-tokens.ts
export const designTokens = {
  colors: {
    brand: {
      primary: "hsl(221.2 83.2% 53.3%)",
      secondary: "hsl(262.1 83.3% 57.8%)",
      accent: "hsl(280 100% 70%)"
    },
    semantic: {
      success: "hsl(142.1 76.2% 36.3%)",
      warning: "hsl(38 92% 50%)",
      error: "hsl(0 84.2% 60.2%)",
      info: "hsl(221.2 83.2% 53.3%)"
    }
  },
  spacing: {
    base: 8, // 8px base unit
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]
  },
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"]
    },
    scale: {
      "display-2xl": { size: "4.5rem", lineHeight: 1, letterSpacing: "-0.02em" },
      "display-xl": { size: "3.75rem", lineHeight: 1, letterSpacing: "-0.02em" },
      "heading-1": { size: "3rem", lineHeight: 1.2, letterSpacing: "-0.01em" },
      "heading-2": { size: "2.25rem", lineHeight: 1.3, letterSpacing: "-0.01em" },
      "heading-3": { size: "1.875rem", lineHeight: 1.4 },
      "heading-4": { size: "1.5rem", lineHeight: 1.5 },
      "body-lg": { size: "1.125rem", lineHeight: 1.75 },
      body: { size: "1rem", lineHeight: 1.75 },
      "body-sm": { size: "0.875rem", lineHeight: 1.5 },
      caption: { size: "0.75rem", lineHeight: 1.5 }
    }
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
  },
  animations: {
    duration: {
      fast: "150ms",
      base: "200ms",
      slow: "300ms"
    },
    easing: {
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  },
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px"
  }
};
```

### New Components to Add

1. **CommandPalette** - Cmd+K navigation
2. **Toast** - Enhanced with animations
3. **Tooltip** - Consistent tooltip system
4. **Progress** - Progress indicators
5. **Badge** - Enhanced badge variants
6. **Avatar** - User avatars with status
7. **Separator** - Visual dividers
8. **Skeleton** - Loading states (already exists, enhance)

---

## Documentation

### Design Rationale

**Why consolidate Button components?**

- Reduces cognitive load for developers
- Ensures visual consistency
- Simplifies maintenance
- Improves bundle size

**Why establish typography scale?**

- Creates visual hierarchy
- Improves readability
- Ensures consistency
- Makes design decisions faster

**Why add micro-interactions?**

- Provides immediate feedback
- Creates delight
- Guides user attention
- Reinforces actions

### Visual System Rules

**Spacing:**

- Use 8px base unit for all spacing
- Prefer spacing scale tokens over arbitrary values
- Maintain consistent rhythm

**Typography:**

- Use heading scale for titles (h1-h4)
- Use body scale for content
- Maintain line-height ratios
- Respect RTL text direction

**Colors:**

- Use semantic color tokens
- Maintain contrast ratios (WCAG AA minimum)
- Support dark mode
- Use brand colors sparingly

**Shadows:**

- Use elevation system (0-24)
- Apply shadows consistently
- Consider dark mode adjustments

### Component Behavior Specs

**Button:**

- States: default, hover, active, disabled, loading, success
- Transitions: 200ms ease-out
- Interactions: scale on hover, ripple on click
- Accessibility: keyboard focus, ARIA labels

**Card:**

- States: default, hover, selected
- Elevation: 0-24dp scale
- Interactions: lift on hover, click feedback
- Accessibility: semantic HTML, keyboard navigation

**PageHeader:**

- Always includes title
- Optional: description, action, breadcrumbs
- Responsive: stacks on mobile
- Accessibility: proper heading hierarchy

### Accessibility Notes

**Keyboard Navigation:**

- All interactive elements keyboard accessible
- Tab order follows visual flow
- Focus indicators visible (ring-2)
- Keyboard shortcuts for power users

**Screen Readers:**

- Semantic HTML throughout
- ARIA labels for icon-only buttons
- Proper heading hierarchy
- Live regions for dynamic content

**Color Contrast:**

- Minimum 4.5:1 for text
- 3:1 for UI components
- Tested in both light and dark modes

**Touch Targets:**

- Minimum 44x44px on mobile
- Adequate spacing between targets
- Visual feedback on touch

---

## Implementation Priority

### Phase 1: Foundation (Week 1)

1. ✅ Consolidate Button components
2. ✅ Establish design tokens
3. ✅ Create typography scale
4. ✅ Implement spacing system

### Phase 2: Components (Week 2)

1. ✅ Enhance Card component
2. ✅ Create PageHeader component
3. ✅ Extract StatCard pattern
4. ✅ Improve EmptyState

### Phase 3: Interactions (Week 3)

1. ✅ Add micro-interactions
2. ✅ Implement animations
3. ✅ Enhance loading states
4. ✅ Add success/error feedback

### Phase 4: Polish (Week 4)

1. ✅ Refine visual hierarchy
2. ✅ Improve accessibility
3. ✅ Add keyboard shortcuts
4. ✅ Final design audit

---

## Success Metrics

**User Experience:**

- Reduced time to complete tasks
- Increased user satisfaction
- Lower error rates
- Higher engagement

**Developer Experience:**

- Faster component development
- Reduced design decisions
- Consistent code patterns
- Better documentation

**Design Quality:**

- Visual consistency score
- Accessibility compliance
- Performance metrics
- Brand alignment

---

**End of Design Vision Review**

This comprehensive review provides a roadmap for transforming the Lines application into a world-class product with exceptional design, delightful interactions, and unwavering consistency. Every recommendation serves the ultimate goal: creating an experience that users love and trust.
