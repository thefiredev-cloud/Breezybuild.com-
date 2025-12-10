# BreezyBuild Tool of the Day Components

Homepage components for displaying daily AI tool content with rich, interactive features.

## Components Overview

### 1. FeaturedToolHero
**File:** `/components/home/FeaturedToolHero.tsx`

Large hero section displaying today's featured tool with all key information.

**Features:**
- Tool name with Fraunces display font
- Tagline and one-liner description
- Score badges (learning curve, ecosystem, maturity, cost value)
- CTA buttons (Try Tool, Read Guide)
- Optional date display
- Decorative gradient blob background

**Props:**
```typescript
interface FeaturedToolHeroProps {
  tool: ToolContent;
  showDateNavigation?: boolean; // Show date at bottom
}
```

**Usage:**
```tsx
import { FeaturedToolHero } from '@/components/home';

<FeaturedToolHero tool={toolData} showDateNavigation={true} />
```

---

### 2. ScoreBadges
**File:** `/components/home/ScoreBadges.tsx`

Compact horizontal row of score badges with circular progress indicators.

**Features:**
- Color-coded scores (red < 3, yellow = 3, green > 3)
- Circular progress visualization
- Learning Curve, Ecosystem, Maturity, Cost Value metrics
- Hover scale effect
- Responsive layout

**Props:**
```typescript
interface ScoreBadgesProps {
  scores: ScoreValues; // learning_curve, ecosystem, maturity, cost_value (1-5)
}
```

**Usage:**
```tsx
import { ScoreBadges } from '@/components/home';

<ScoreBadges scores={tool.scores} />
```

---

### 3. CommunitySignals
**File:** `/components/home/CommunitySignals.tsx`

Display community metrics and social proof.

**Features:**
- Community size display (e.g., "100k+ GitHub stars")
- Sentiment badge (positive, negative, mixed, neutral)
- Notable users as chips
- Key contributors list
- Icon indicators for each section

**Props:**
```typescript
interface CommunitySignalsProps {
  community: CommunityMetrics;
}
```

**Usage:**
```tsx
import { CommunitySignals } from '@/components/home';

<CommunitySignals community={tool.community} />
```

---

### 4. QuickStartPreview
**File:** `/components/home/QuickStartPreview.tsx`

Show preview of quick start guide steps with numbered circles.

**Features:**
- Numbered step circles with gradient
- Step titles and descriptions
- Optional tips display
- Connecting lines between steps
- "See all steps" link
- Configurable preview length

**Props:**
```typescript
interface QuickStartPreviewProps {
  steps: QuickStartStep[];
  toolSlug?: string; // For linking to full guide
  maxSteps?: number; // Default: 2
}
```

**Usage:**
```tsx
import { QuickStartPreview } from '@/components/home';

<QuickStartPreview
  steps={tool.quick_start_guide}
  toolSlug="cursor-ide"
  maxSteps={2}
/>
```

---

### 5. DateNavigation
**File:** `/components/home/DateNavigation.tsx`

Navigate between different tool days.

**Features:**
- Previous/Next arrows
- Current date display
- "Today" quick link (shows when not on today)
- Disabled state for navigation limits
- Mobile responsive (hides text on small screens)

**Props:**
```typescript
interface DateNavigationProps {
  currentDate: Date;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onToday?: () => void;
}
```

**Usage:**
```tsx
'use client'; // Required for state

import { DateNavigation } from '@/components/home';
import { useState } from 'react';

const [date, setDate] = useState(new Date());

<DateNavigation
  currentDate={date}
  hasPrevious={true}
  hasNext={false}
  onPrevious={() => setDate(/* previous day */)}
  onNext={() => setDate(/* next day */)}
  onToday={() => setDate(new Date())}
/>
```

---

### 6. ContentBoundary
**File:** `/components/home/ContentBoundary.tsx`

Visual separator between free and premium content.

**Features:**
- "Free Preview Ends Here" divider
- Blurred preview of next section
- Lock icon
- CTA to upgrade
- Decorative badge
- Gradient background

**Props:**
```typescript
interface ContentBoundaryProps {
  nextSectionTitle?: string; // Default: "Premium Content"
  pricingUrl?: string; // Default: "/pricing"
}
```

**Usage:**
```tsx
import { ContentBoundary } from '@/components/home';

<ContentBoundary
  nextSectionTitle="Advanced Use Cases"
  pricingUrl="/pricing"
/>
```

---

## TypeScript Types

**File:** `/types/tool-content.ts`

All TypeScript interfaces for tool content:

- `ToolContent` - Complete tool data structure
- `ScoreValues` - 1-5 scores for 4 metrics
- `UseCase` - Use case scenarios
- `QuickStartStep` - Step-by-step guide data
- `PricingTier` - Pricing information
- `AlternativeTool` - Competitor comparisons
- `CommunityMetrics` - Community data
- `DateNavigationProps` - Navigation props

---

## Example Layouts

### Full Homepage Layout
```tsx
import {
  FeaturedToolHero,
  DateNavigation,
  QuickStartPreview,
  CommunitySignals,
  ContentBoundary,
} from '@/components/home';

export default function HomePage({ tool }: { tool: ToolContent }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Hero */}
      <FeaturedToolHero tool={tool} showDateNavigation={true} />

      {/* Navigation */}
      <DateNavigation {...navigationProps} />

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <QuickStartPreview steps={tool.quick_start_guide} />
          <ContentBoundary />
        </div>

        <div className="space-y-8">
          <CommunitySignals community={tool.community} />
        </div>
      </div>
    </div>
  );
}
```

---

## Styling Guidelines

All components follow BreezyBuild design system:

**Colors:**
- Primary: `orange-500`, `orange-600`
- Accent: `amber-500`
- Neutral: `stone-*` palette
- Dark mode: Full support via `dark:` prefix

**Fonts:**
- Display headlines: `font-family: var(--font-fraunces)` or `text-display` class
- Body text: Inter (default)
- Code: JetBrains Mono

**Responsive:**
- Mobile-first approach
- Stack on small screens
- Grid layouts on larger screens
- Hide secondary text on mobile

**Animations:**
- Hover scale on cards
- Transition colors/transforms
- Smooth entrance animations
- Reduced motion support

---

## File Structure

```
/components/home/
├── index.ts                 # Barrel exports
├── FeaturedToolHero.tsx     # Hero section
├── ScoreBadges.tsx          # Score indicators
├── CommunitySignals.tsx     # Community metrics
├── QuickStartPreview.tsx    # Quick start steps
├── DateNavigation.tsx       # Date navigation
├── ContentBoundary.tsx      # Paywall separator
├── EXAMPLE_USAGE.tsx        # Usage examples
└── README.md                # This file

/types/
└── tool-content.ts          # TypeScript interfaces
```

---

## Dependencies

- **lucide-react**: Icons (ChevronLeft, ChevronRight, Calendar, Lock, etc.)
- **Next.js 14+**: App Router, Link, Image
- **Tailwind CSS 4**: Styling
- **TypeScript**: Type safety

---

## Best Practices

1. **Server Components by Default**: All components except `DateNavigation` are server components
2. **TypeScript**: Always pass proper types, no `any`
3. **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
4. **Performance**: Lazy load images, optimize fonts
5. **Dark Mode**: Test both light and dark themes
6. **Mobile**: Test on small screens

---

## See Also

- `/components/home/EXAMPLE_USAGE.tsx` - Full working examples
- `/app/layout.tsx` - Existing header/footer
- `/app/globals.css` - Design system tokens
