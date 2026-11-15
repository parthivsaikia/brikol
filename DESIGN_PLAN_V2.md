# Fridge-to-Recipe App — Design Plan v2 (Distinctive)

## Subject & Audience
**Subject**: Transforming raw fridge ingredients into a cookable recipe.
**Audience**: Home cooks standing in their kitchen, phone in hand, possibly with messy hands.
**Primary Job**: Make the recipe *usable while cooking* — not just readable.

---

## What's Wrong with v1 (Self-Critique)

| v1 Issue | Why It's Generic |
|----------|------------------|
| Identical rounded-xl cards everywhere | SaaS-card kit default |
| Border on everything | Decoration, not information |
| Meta badges row | "A · B · C" middle-dot template |
| Basil/tomato/butter palette | Warm-cream + terracotta = Anthropic tell |
| Fade-in stagger on everything | AI-generated motion default |
| ChefHat icon in 3 places | Clip art, not identity |

---

## Revised Design Plan

### Color Palette (5 core values — distinctive, not "warm")

| Name | Hex | Role |
|------|-----|------|
| `cream` | `#FFFDF7` | Base — warm but not yellowed |
| `charcoal` | `#1A1A16` | Text — softer than black |
| `sage` | `#5B8A5B` | Primary — muted herb, not bright green |
| `sage-deep` | `#3D6B3D` | Primary hover |
| `rust` | `#B84A3A` | Accent — dried chili, not tomato red |
| `honey` | `#E8B84D` | Highlight — warm gold, not butter yellow |
| `mist` | `#E8E6E0` | Subtle divider — 15% charcoal |

**No grey scale.** Every neutral = `cream`/`charcoal` with opacity.

### Typography

**Single family**: `Space Grotesk` (geometric, distinctive, excellent at display + body)
- **Display**: Space Grotesk Variable, `wght@600..700`, `wdth@100..125` (slightly wide), tight tracking (-0.03em)
- **Body**: Space Grotesk Variable, `wght@400..500`, normal width, line-height 1.65
- **Mono**: `Space Mono` for quantities, timers

**Type Scale** (fluid clamp):
- `--text-xs`: 0.75rem / 1.4
- `--text-sm`: 0.875rem / 1.5
- `--text-base`: 1rem / 1.65
- `--text-lg`: 1.125rem / 1.55
- `--text-xl`: clamp(1.75rem, 5vw, 2.5rem) / 1.2
- `--text-2xl`: clamp(2.25rem, 6vw, 3.5rem) / 1.1
- `--text-3xl`: clamp(3rem, 8vw, 5rem) / 1.05

### Layout Concept

**Mobile-first, content-first.** No cards. No borders unless they separate *meaningfully different* things.

```
┌─────────────────────────────────────┐
│  HERO: Recipe title (huge)          │  ← Sticky, bleeds edges
│  "Creamy Spinach Tomato Scramble"   │
│  1-line description                 │
├─────────────────────────────────────┤
│  SERVINGS — single prominent control│  ← Always visible, large touch target
│  [ - ]   2   [ + ]   Scaled from 2  │
├─────────────────────────────────────┤
│  INGREDIENTS — checklist cards      │  ← Check off as you prep
│  ┌─────────────────────────────┐    │
│  │ ☐ 3 eggs              ▼     │    │
│  │ ☐ 200g spinach        ▼     │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  STEPS — numbered timeline          │  ← Central interaction
│  1  Prep everything        5 min    │
│     Chop onion, beat eggs           │
│                                     │
│  2  Soften onion         3 min      │
│     Cook until translucent          │
└─────────────────────────────────────┘
```

**Desktop (≥1024px)**: Two-column split — Ingredients left (sticky), Steps right.

---

### The One Memorable Thing

**The hero title bleeds to viewport edges on mobile.** No container padding. It's the only element that does this. Everything else respects container.

```css
.hero-title {
  margin-left: calc(-1 * var(--container-padding));
  margin-right: calc(-1 * var(--container-padding));
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}
```

### Interaction Principles

1. **One entrance**: Hero title scales in (0.4s spring). Everything else appears instantly.
2. **Check = progress bar at top** (thin, 2px). Fills as you complete steps.
3. **Swaps = inline disclosure** (tap ingredient row to expand).
4. **Scaler = live**, quantities update with spring.
5. **No hover transitions** on mobile. Touch = immediate feedback.

---

### Motion Tokens (Minimal)

| Token | Value | Use |
|-------|-------|-----|
| `--motion-fast` | 120ms | Button press, checkbox |
| `--motion-base` | 200ms | Expand/collapse |
| `--motion-hero` | 500ms | Title entrance (spring) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Hero, check pop |
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Everything else |

---

### What Makes This Distinctive

| Default Approach | Our Choice |
|------------------|------------|
| Card grid | Borderless sections, separated by space + mist lines |
| Grey shadows | Zero shadows. Depth via layering + color |
| All-caps labels | Zero labels. Content speaks |
| Meta badges row | Inline: "Serves 2 · 15 min prep · 10 min cook" |
| Hover transitions | Motion only on *action* (check, expand, scale) |
| Modal for swaps | Inline row expansion, preserves context |
| Separate "cooking mode" | Default view *is* cooking mode |
| Clip art icons | Zero decorative icons. Only functional (chevron, check) |

---

### Accessibility Floor

- Focus visible: 2px solid `sage`, 2px offset `cream`
- Reduced motion: disable hero spring, keep functional motion
- Touch targets: ≥48×48px (scaler buttons 56×56)
- Color contrast: ≥4.5:1 all text
- Semantic HTML: `<ol>` for steps, `<ul>` for ingredients