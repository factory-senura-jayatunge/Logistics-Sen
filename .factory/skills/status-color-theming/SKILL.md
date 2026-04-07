---
name: status-color-theming
description: Ensure all status badges, indicators, and charts use CSS theme variables instead of hardcoded Tailwind colors. Use when adding new status types or auditing color consistency.
---

# Status Color Theming

Maintain consistent theming by using CSS variables for all status-related colors.

## When to Use

- Adding a new status type (e.g., new shipment status)
- Auditing the codebase for hardcoded colors
- After copying UI code from external sources
- When colors don't match between light/dark modes

## Theme Color Variables

Located in `frontend/app/globals.css`:

| Variable | Purpose | Light Mode | Dark Mode |
|----------|---------|------------|-----------|
| `--success` | Delivered, active, healthy | Green | Green |
| `--warning` | Processing, low stock, maintenance | Yellow/Amber | Yellow/Amber |
| `--info` | In transit, confirmed, en route | Blue | Blue |
| `--destructive` | Delayed, error, out of stock | Red | Red |
| `--neutral` | Pending, idle, inactive | Gray | Gray |
| `--chart-1` to `--chart-5` | Chart colors | Varies | Varies |

## Instructions

### 1. Find Hardcoded Colors

Run these grep commands to find violations:

```bash
# Find hardcoded Tailwind colors
rg "bg-(green|blue|red|yellow|orange|purple|gray|slate)-\d+" frontend/

# Find hardcoded hex colors
rg "#[0-9a-fA-F]{3,8}" frontend/ --glob "*.tsx"

# Find hardcoded RGB values
rg "rgb\(|rgba\(" frontend/
```

### 2. Update Status Color Maps

All status colors should be in `frontend/lib/utils.ts`:

```typescript
// CORRECT - using theme variables
export const shipmentStatusColors: Record<string, string> = {
  delivered: "bg-success/10 text-success border-success/20",
  in_transit: "bg-info/10 text-info border-info/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-neutral/10 text-neutral border-neutral/20",
}

// WRONG - hardcoded colors
export const badColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-200", // NO!
}
```

### 3. Import from utils.ts

Pages should import status colors, not define locally:

```typescript
// CORRECT
import { shipmentStatusColors } from "@/lib/utils"

// WRONG - duplicating in page
const statusColors = {
  delivered: "bg-green-500/10 text-green-600",
}
```

### 4. Update Chart Colors

Charts should use CSS variables:

```typescript
// CORRECT
const chartConfig = {
  delivered: { color: "var(--chart-2)" },
  in_transit: { color: "var(--chart-1)" },
}

// WRONG
const chartConfig = {
  delivered: { color: "#22c55e" },
}
```

### 5. Update Map Markers and Indicators

For inline styles or dynamic classes:

```typescript
// CORRECT - using theme class
<div className="bg-success rounded-full" />

// For inline styles, use CSS variable
<MapPolyline pathOptions={{ color: "var(--color-info)" }} />

// WRONG
<div className="bg-green-500 rounded-full" />
```

### 6. Add New Theme Variables (if needed)

If you need a new semantic color, add to `globals.css`:

```css
@theme inline {
  --color-new-status: var(--new-status);
}

:root {
  --new-status: oklch(0.6 0.15 200);
}

.dark {
  --new-status: oklch(0.7 0.12 200);
}
```

## Files to Check

Priority order for auditing:

1. `frontend/lib/utils.ts` - Status color definitions
2. `frontend/app/*/page.tsx` - List pages with badges
3. `frontend/app/*/[id]/page.tsx` - Detail pages
4. `frontend/app/dashboard/page.tsx` - Charts and KPIs
5. `frontend/components/*.tsx` - Shared components
6. `frontend/components/ui/map.tsx` - Map markers

## Verification

```bash
# Should return no results after fixing
rg "bg-(green|blue|red|yellow|orange|purple|gray|slate)-\d+" frontend/app frontend/components --glob "*.tsx"

# Check theme is applied
pnpm dev
# Toggle dark mode and verify colors change appropriately
```

## Common Patterns

| Status Type | Theme Class |
|-------------|-------------|
| Success/Delivered/Active | `bg-success/10 text-success` |
| Warning/Processing/Low | `bg-warning/10 text-warning` |
| Info/InTransit/EnRoute | `bg-info/10 text-info` |
| Error/Delayed/Critical | `bg-destructive/10 text-destructive` |
| Neutral/Pending/Idle | `bg-neutral/10 text-neutral` |
