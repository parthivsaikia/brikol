# Fridge-to-Recipe App — Design Plan

## Subject & Audience
**Subject**: Transforming raw fridge ingredients into a cookable recipe.
**Audience**: Home cooks standing in their kitchen, phone in hand, possibly with messy hands.
**Primary Job**: Make the recipe *usable while cooking* — not just readable.

---

## Color Palette (4 core values)

| Name | Hex | Role |
|------|-----|------|
| `paper` | `#FAF9F6` | Warm off-white base — feels like a recipe card |
| `ink` | `#1C1C18` | Near-black with warmth — readable, not harsh |
| `basil` | `#2D5A27` | Deep herb green — primary action, trust, "fresh" |
| `basil-light` | `#E8F3E6` | 10% basil — subtle backgrounds, hover |
| `tomato` | `#C83D2A` | Warm accent — destructive, warnings, "heat" |
| `butter` | `#F5E6A0` | Warm yellow — highlights, "cooked" state |

**No grey scales.** Every neutral derives from `paper`/`ink` with opacity.

---

## Typography

**Single family**: `DM Sans` (geometric, friendly, excellent readability at small sizes)
- **Display**: DM Sans Variable, `wght@600..700`, tight tracking (-0.02em)
- **Body**: DM Sans Variable, `wght@400..500`, relaxed line-height (1.6)
- **Mono**: `DM Mono` for quantities, timers, measurements

**Type Scale** (fluid, clamp-based):
- `--text-xs`: 0.75rem / 1.4
- `--text-sm`: 0.875rem / 1.5
- `--text-base`: 1rem / 1.6
- `--text-lg`: 1.125rem / 1.5
- `--text-xl`: clamp(1.5rem, 4vw, 2rem) / 1.3
- `--text-2xl`: clamp(2rem, 5vw, 3rem) / 1.2
- `--text-3xl`: clamp(2.5rem, 6vw, 4rem) / 1.1

---

## Layout Concept

**Mobile-first, single-column flow** that expands on desktop.

```
┌─────────────────────────────────────┐
│  HERO: Title + ingredient summary   │  ← Sticky on scroll
├─────────────────────────────────────┤
│  SERVINGS SCALER (prominent)        │  ← Always visible
├─────────────────────────────────────┤
│  INGREDIENTS — collapsible cards    │  ← Check off as you prep
│  ┌─────────────────────────────┐    │
│  │ ☐ 3 eggs          [swaps ▼] │    │
│  │ ☐ 200g spinach      [swaps ▼] │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  STEPS — vertical timeline          │  ← Central interaction
│  ┌─○ 1. Prep everything      5min  │
│  │  ☐ Chop onion, beat eggs      │
│  ├─○ 2. Soften onion         3min  │
│  │  ☐ Cook until translucent     │
│  └─○ 3. Add spinach...            │
├─────────────────────────────────────┤
│  TIPS — inline cards                │
└─────────────────────────────────────┘
```

**Desktop (≥1024px)**: Two-column — Ingredients sidebar (sticky) + Steps main column.

---

## Interaction Principles

1. **No generic fade-in**. One orchestrated entrance: hero → scaler → ingredients → steps (staggered 80ms).
2. **Check = progress**. Checking a step fills the timeline connector.
3. **Swaps = disclosure**. Tap to expand inline, not modal.
4. **Scaler = live**. Quantities update instantly, no debounce.
5. **Cooking mode** (future): Tap timer to start countdown per step.

---

## What Makes This Distinctive

| Default Approach | Our Choice |
|------------------|------------|
| Card grid | Vertical timeline with connector line |
| Grey shadows | No shadows — paper texture via subtle border |
| All-caps labels | Sentence case, no eyebrows |
| Hover transitions on everything | Motion only on user action (check, expand, scale) |
| Modal for swaps | Inline disclosure, preserves context |
| Separate "cooking mode" | The default view *is* cooking mode |

---

## Motion Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--motion-fast` | 120ms | Button press, checkbox |
| `--motion-base` | 200ms | Expand/collapse, scale update |
| `--motion-slow` | 350ms | Page entrance stagger |
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Most easing |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Check animation pop |

---

## Accessibility Floor

- Focus visible: 2px solid `basil`, 2px offset
- Reduced motion: disable entrance stagger, keep functional motion
- Touch targets: ≥48×48px
- Color contrast: ≥4.5:1 all text
- Semantic HTML: `<ol>` for steps, `<ul>` for ingredients, `<aside>` for sidebar