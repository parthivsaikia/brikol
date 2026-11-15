# Fridge to Recipe

Turn your fridge ingredients into an interactive, cookable recipe. Built for the Frontend Internship Assignment.

**Live demo:** https://brikol.parthivsaikia985.workers.dev

---

## Setup

```bash
# Install dependencies
npm install

# Add your API key
echo "OPENROUTER_API_KEY=sk-or-..." > .env
# Or use Google: GOOGLE_GENERATIVE_AI_API_KEY=...

# Start dev server
npm run dev
```

Open http://localhost:5173

---

## Usage

1. **Enter ingredients** — Free-form text: "3 eggs, half an onion, tomato, cheddar, spinach"
2. **Set servings** — Number of people
3. **Click Generate** — Recipe appears in ~3-5 seconds
4. **Cook interactively**:
   - ✅ Check off steps as you go (progress bar fills)
   - 🔢 Scale servings with +/- (quantities update live)
   - 🔄 Tap ingredient rows to see substitutes
   - ⌨️ Full keyboard support (Tab, Arrows, Space, Enter)
   - 🌙 Toggle dark mode

---

## Architecture

```
app/
├── lib/llm/
│   ├── ai.ts              # generateRecipe() — server action
│   ├── prompt.ts          # System prompt + examples
│   ├── response.ts        # Zod schemas for validation
│   ├── errors.ts          # Error classification + retry logic
│   ├── providers.ts       # Provider-agnostic (Google, OpenRouter)
│   ├── input.ts           # RecipeInput type
│   └── schema.ts          # UNITS constant
├── routes/
│   └── home.tsx           # Framework Mode: action + useActionData
├── components/
│   ├── recipe-display.tsx # Interactive recipe UI
│   ├── itemform.tsx       # Input form with pending UI
│   └── ui/                # Button, Input, Alert, Badge, etc.
├── app.css                # Design tokens + utilities
└── root.tsx               # Theme script + toaster
```

**Key decisions:**

- **Server action for LLM call** — API key never touches the browser
- **`generateObject` + Zod** — Guaranteed valid JSON, no parsing errors
- **React Router Framework Mode** — `action` + `useActionData` = no stale responses
- **Provider-agnostic** — Switch via `LLM_PROVIDER=openrouter|google` in `.env`

---

## Error Handling

| Failure Mode | Handling |
|--------------|----------|
| Malformed JSON | `generateObject` enforces schema; impossible by design |
| Wrong shape | Zod validation rejects; retry with repair prompt |
| Empty response | Detected; retry with backoff |
| Rate limited | Exponential backoff (1.5s → 3s); user-friendly message |
| Model hallucinates "cannot_make" | Detected if user provided ingredients; auto-retries |
| Network timeout | Classified as retryable; max 1 retry |

No crashes. No stale responses (server action tied to form submission).

---

## Design

- **Typography:** Space Grotesk (single family, display + body) + Space Mono for quantities
- **Palette:** Cream `#FFFDF7`, Charcoal `#1A1A16`, Sage `#5B8A5B`, Rust `#B84A3A`, Honey `#E8B84D`, Mist `#E8E6E0`
- **Layout:** Borderless sections, hero title bleeds viewport edges on mobile, inline meta
- **Motion:** One orchestrated hero entrance (500ms spring); functional motion only
- **Radius:** Consistent rounded-xl (1rem) on all interactive surfaces
- **Dark mode:** SSR-safe theme script, localStorage persistence, prefers-color-scheme

---

## Keyboard Navigation

| Element | Keys |
|---------|------|
| Step markers | `Space` / `Enter` to toggle complete |
| Servings scaler | `↑`/`→` increment, `↓`/`←` decrement |
| Ingredient rows | `Space` / `Enter` expand/collapse swaps |
| All buttons | `Tab` focus, visible `focus-ring` |

---

## AI Usage Note

Built with **opencode** (Nemotron 3 Ultra) as the primary AI assistant:

- Scaffolding: React Router project structure, TypeScript configs
- LLM service: Provider abstraction, structured output, error classification
- UI components: RecipeDisplay, ItemForm, design system components
- Design tokens: Color palette, typography, motion, radius scales
- Debugging: TypeScript errors, Tailwind v4 migration, build issues

All code was reviewed and understood before committing. No unexamined AI output was shipped.

---

## Known Limitations

- **Free tier rate limits:** OpenRouter ~10 req/min; bursts may hit 429
- **Model hallucinations:** Occasionally returns `cannot_make` despite valid ingredients (auto-retries once)
- **No session persistence:** Refresh loses the recipe (stretch: localStorage save/load)
- **No streaming:** Full recipe arrives at once (stretch: `streamObject`)
- **No refinement loop:** Can't say "make it spicier" and re-generate (stretch)
- **Single recipe type:** No meal categories, dietary filters, or shopping list export

---

## Time Spent

**~7 hours total**

| Phase | Time |
|-------|------|
| Setup + LLM service (provider-agnostic, structured output) | 2h |
| Interactive UI (RecipeDisplay, ItemForm, states) | 2h |
| Error handling + retry logic | 1h |
| Design system v2 (distinctive palette, typography, motion) | 1h |
| Dark mode + keyboard navigation | 1h |

---

## Deploy

Deployed to **Cloudflare Workers** via React Router's built-in adapter:

```bash
npm run build
# Deploy output in build/server to your platform
```

Environment variables needed in production:
- `OPENROUTER_API_KEY` (or `GOOGLE_GENERATIVE_AI_API_KEY`)
- `LLM_PROVIDER=openrouter` (optional, defaults to openrouter)
- `LLM_MODEL=openai/gpt-4o-mini` (optional)

---

## License

MIT — feel free to use for learning or as a starter.