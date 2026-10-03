# PathPilot design system: "wayfinding"

PathPilot helps people see where their experience can take them, so the interface borrows from survey maps and trail markers. A cool paper ground, green-black ink and one forest action color carry the brand. Its signature element is **the Route**, a single drawn line with waypoint nodes that runs through every surface: drawn on the landing hero, threading the wizard rail, surveying during analysis, and linking destinations on the results map.

The code is the source of truth. This page explains the rules and points at the files.

| What | Where |
| --- | --- |
| Tokens (color, type, radius, shadow, layout, easing) | [`src/app/globals.css`](../src/app/globals.css), `@theme static` block |
| Motion tokens and helpers | [`src/lib/motion.ts`](../src/lib/motion.ts) |
| Fonts | [`src/app/fonts.ts`](../src/app/fonts.ts) |
| Signature components | [`src/components/pp/`](../src/components/pp/) |
| Base controls (shadcn on Base UI, restyled) | [`src/components/ui/`](../src/components/ui/) |
| Number, money and date formatting | [`src/lib/format.ts`](../src/lib/format.ts) |
| Live reference | `/design`, `/design/wizard`, `/design/results`, `/design/journey` (local and Vercel preview deploys only; production returns 404) |

## Principles

1. **Let the type be the hero.** Big, calm Fraunces headlines on plenty of paper. Decoration has to earn its place.
2. **One action color, one signal.** Forest means "do this". Blaze means "you are here". Nothing else competes.
3. **Hairlines, not boxes.** Contour-colored rules do the structural work. Surfaces are almost flat.
4. **One orchestrated moment per page.** Everything else moves only in answer to something the person did.
5. **Say what's true.** Copy describes what the product actually does. Unverified claims carry a `// COPY-CHECK:` comment until someone confirms them.

## Color

All colors are tokens in `globals.css`. Never write a raw hex value outside that file. Use the Tailwind utilities the tokens generate (`bg-paper`, `text-ink-muted`, `border-contour`, ...), or `var(--color-*)` in SVG paint.

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#f3f4ef` | Page background |
| `sheet` | `#fbfbf8` | Raised surfaces: panels, inputs, popovers |
| `fog` | `#e8ebe3` | Subtle fills, hover rows, skeletons |
| `contour` | `#d5dace` | Decorative hairlines and contour lines. **Not** for control edges |
| `edge` | `#7f8980` | Interactive control edges (≥3:1 on paper, sheet and fog, per WCAG 1.4.11) |
| `ink` | `#17211c` | Primary text |
| `ink-muted` | `#55615a` | Secondary text (5.9:1 on paper) |
| `ink-faint` | `#5f6a63` | Tertiary text and meta (≥4.6:1). The brief's `#85908A` failed AA and was darkened |
| `forest` | `#1f4d3a` | Primary actions, the Route, focus rings, links |
| `forest-deep` | `#153729` | Primary hover and pressed |
| `moss` | `#a9bfa0` | Secondary fills, completed waypoints, chart fills, text selection |
| `blaze` | `#e2a92b` | **Only** "you are here" and the current step |
| `danger` | `#a8432f` | Errors, destructive actions |
| `success` | `#2f6b4a` | Confirmations |

Rules:

- **Forest is the only action color**, with one primary button per view.
- **Blaze appears at most once per screen.** It is 1.9:1 on its own, so always pair it with a forest ring (the `current` node state does this).
- **Charts use forest, moss and contour only.** No rainbow palettes.
- Every text and background pair must pass WCAG AA. If a new pairing fails, fix the token rather than the one instance.
- shadcn's semantic names (`primary`, `muted`, `border`, `ring`, ...) are aliased to these tokens in the `@theme inline` and `:root` blocks, so stock primitives pick up the palette. Write new code with the PathPilot names.
- The palette is light-only. There is no dark mode yet.

## Typography

| Role | Face | Utility | Use |
| --- | --- | --- | --- |
| Display | Fraunces (variable: `opsz`, `SOFT`) | `font-display` | Page titles, hero, destination names, big result numbers |
| UI and body | General Sans | `font-sans` (default) | Everything else |
| Data | Fragment Mono | `font-mono` | Only salary figures, match percentages, journey-log dates and route coordinates. Never labels or decoration |

Fraunces and Fragment Mono load through `next/font/google`. General Sans is meant to be self-hosted at `src/app/fonts/GeneralSans-Variable.woff2`; the file isn't in the repo yet, so `--font-sans` falls back to the system UI stack until it is added (instructions are in `fonts.ts`). Every font variable in the stacks carries a fallback, because an unset `var()` would otherwise invalidate the whole `font-family`.

Scale (16px base):

| Token | Size | Use |
| --- | --- | --- |
| `text-xs` | 12px | Meta |
| `text-sm` | 14px | Secondary UI |
| `text-base` | 16px | Body |
| `text-lg` | 18px | Lead paragraphs |
| `text-xl` | 22px | Section titles (Fraunces) |
| `text-2xl` | 30px | Page titles (Fraunces) |
| `text-3xl` | 34–44px, fluid | Destination name, big page titles (Fraunces) |
| `text-hero` | 44–80px, fluid | Landing hero only |

Rules:

- Fraunces at weight 380–450 with tight tracking (−0.01em to −0.02em). `.font-display` sets `font-optical-sizing: auto` and a little `SOFT`.
- Body copy: line-height 1.6, max line length about 68ch.
- All numbers are tabular (set globally on `html`).
- Sentence case everywhere. No all-caps labels, no italic or color-highlighted single words in headlines.
- Money is formatted with `formatMoney` / `formatMoneyRange` (`$78k–$110k`, en dash) and dates with `formatDate`. Don't hand-format figures.

## Space, shape and elevation

- **Spacing** sits on Tailwind's 4px grid. Landing sections breathe at roughly 128px on desktop and 80px on mobile.
- **Radius encodes hierarchy:** `rounded-control` (8px) for inputs and buttons, `rounded-panel` (14px) for panels, `rounded-feature` (20px) for the destination hero panel only. Chips are fully rounded; Route nodes are circles.
- **Elevation is almost flat.** One shadow, `shadow-float`, for floating layers only: popovers, menus, dialogs and toasts. Panels use a `contour` hairline instead.
- **Layout:** `max-w-page` (1200px) for content, `max-w-text` (720px) for text-heavy pages such as Privacy and Terms. Use 24px gutters, with a 16px minimum on phones.
- **Touch targets** are at least 44×44px on coarse pointers (`pointer-coarse:min-h-11` on controls).

## Motion

Tokens live in `src/lib/motion.ts`, mirrored in CSS as `--ease-out-soft` and `--ease-route`.

| Token | Value | Use |
| --- | --- | --- |
| `ease.out` | `[0.22, 1, 0.36, 1]` | Default for entrances |
| `ease.inOut` | `[0.65, 0, 0.35, 1]` | Route drawing, page transitions |
| `duration.instant` | 120ms | Press feedback |
| `duration.fast` | 180ms | Hovers, toggles, page crossfade |
| `duration.base` | 280ms | Wizard step transitions, panels |
| `duration.slow` | 520ms | Section reveals that are earned |
| `duration.route` | 1.4s | The Route drawing |
| `spring` | stiffness 420, damping 34, mass 0.8 | The few things that should feel physical |

Rules:

- **One orchestrated moment per page.** Landing: the hero Route draws. Wizard: steps slide ±24px. Analysis: the survey line advances. Results: the best-fit panel settles and the map draws. Dashboard, 404 and legal pages have none.
- **Animate only** `transform`, `opacity`, `stroke-dashoffset` and `clip-path`.
- **Reach for CSS first.** The `pp-*` classes in `globals.css` (`pp-route-draw`, `pp-reveal`, `pp-settle`, `pp-draw-x`, `pp-fill`, `pp-pulse`) cover most needs without shipping JavaScript. Use `motion/react` only inside a `<MotionRoot>` on surfaces that already load it (wizard, analysis, results), never in shared layouts.
- **Reduced motion** is handled globally. The CSS media query collapses animation, drawings render fully drawn, and `MotionRoot` sets `reducedMotion="user"` so motion components drop to fades. Use `stepVariants(reduced)` and `crossfade(reduced)` rather than writing new variants.
- No fade-up on every section, no bounce, and no View Transitions (experimental in Next 16).

## The Route

[`route.tsx`](../src/components/pp/route.tsx) draws one line with `pathLength` and `stroke-dashoffset`. It's server-safe (no hooks).

- **Variants:** `hero` (landing), `rail` (wizard progress), `survey` (analysis stages), `map` (results terrain).
- **Node states:** `done` (moss, forest ring), `current` (blaze, forest ring, at most one per screen), `upcoming` (sheet, edge ring), `destination` (forest).
- **Props that matter:** `activeIndex` and `drawn` (0–1) for progress; `animateOnMount` for a CSS-only draw on first paint; `track` for the faint dashed road ahead; `label` for an accessible name. Without `label` the SVG is decorative, so pair it with a text equivalent.
- In HTML contexts (rails, logs, empty states) use `NodeDot`, `Waypoint` and `WaypointList` from [`waypoint.tsx`](../src/components/pp/waypoint.tsx).
- `RouteLine` and `RouteNode` compose several branches inside one SVG (landing hero, results map).

[`ContourField`](../src/components/pp/contour-field.tsx) is the topographic background, deterministic per seed. It's used in exactly two places (the landing hero and the results map), never animated and never above 8% opacity. Generated SVG stays under 20KB; the budget is enforced in `src/lib/__tests__/design-system.test.ts`.

## Components

### Signature (`src/components/pp/`)

| Component | Purpose |
| --- | --- |
| `Route`, `RouteLine`, `RouteNode` | The signature line and its nodes |
| `NodeDot`, `Waypoint`, `WaypointList` | Route nodes and connectors in HTML |
| `ContourField` | Static topographic background |
| `MatchMeter` | Match % as a short segmented bar. Never a donut |
| `RangeBar` | Salary range with optional median and current-pay markers |
| `Stat` | A Fragment Mono figure with a plain-language label |
| `EmptyState`, `ErrorState` | What happened, what to do, one action. `ErrorState` is `role="alert"`; pass `titleAs="h1"` when it is the whole page |
| `KeyHint` | Keyboard shortcut chip, fine pointers only; decorative, so put `aria-keyshortcuts` on the control |
| `MotionRoot` | Motion provider with `reducedMotion="user"` |
| `OfflineBanner` | Bottom `role="status"` bar while the browser is offline (app and auth layouts) |

### Base controls (`src/components/ui/`)

shadcn (base-nova) on `@base-ui/react`, restyled to the tokens. Highlights:

- **Button** (`button.tsx`, with classes in `button-variants.ts` so server components can style links): `primary` (forest, one per view), `secondary` (sheet with a contour edge), `quiet` (text only), `destructive`, `link`. Sizes `xs`–`lg` plus icon sizes. Press scales to 0.98; no arrows appended to labels.
- **RadioGroupRow / CheckboxRow:** full-width answer rows with number shortcuts, used by the wizard. A chosen row shows a check and a forest edge. `RadioGroupChip` is the compact variant.
- **Input, Textarea, Label:** validate on blur. Errors say what's wrong and how to fix it.
- **Dialog, DropdownMenu, Tooltip, sonner toasts:** the only floating layers, using `shadow-float`. Dialogs choose a safe initial focus, such as Cancel, before anything destructive.
- **Tabs, Accordion, Badge, Progress, Skeleton, Separator, Card**, and `Logo` (the wayfinding mark; `compact` on narrow screens).

When you add a shadcn component, restyle it to the tokens and keep imports pointing at `@/lib/utils`. Don't add the `cn` npm package.

## Accessibility

- WCAG 2.2 AA. At the redesign merge, axe-core ran clean on every public page and `/design` preview; the only flag was the account menu's portaled popup, a false positive.
- **Focus ring:** a 2px forest outline with a 2px offset on every interactive element. It's unlayered, so no utility can remove it. Shift it with `[--focus-offset:-2px]` when needed. Headings that script focuses (`tabindex="-1"`) show no ring.
- Every SVG visualization has an accessible name and a text or table equivalent.
- Each page has one `<h1>`, a `<main id="main">` and a skip link in the app shell. Don't nest `<aside>` inside `<main>`.
- Live regions: wizard step changes, autosave, analysis stages and form errors use `aria-live="polite"`.
- Print ("Save as PDF") drops the paper background, motion and app chrome; `print:hidden` hides UI-only elements.

## Voice and copy

- Plain, calm and specific. Second person, active verbs, sentence case.
- The action keeps its name through the flow: "Build my route" → analysis → "Your route is ready."
- Errors say what happened and how to fix it. No apologies, no vagueness, never "Oops".
- Wizard helper text explains why a question is asked, in 15 words or fewer (enforced in tests).
- **No em dashes in user-facing copy.** Watch for the SWC quirk: a JSX text node with an entity like `&apos;` that follows an `{expression}` loses its leading space, so build those strings in JS.
- Never: "Unlock your potential", "AI-powered insights", "supercharge", "journey" outside the dashboard title.

## Banned patterns

These read as generic AI-product tells and stay out of the app: purple or blue gradients, Inter, glassmorphism, identical rounded card grids, gradient blobs, sparkle icons, "✨ AI-powered" copy, ALL-CAPS eyebrow labels over every heading, → appended to every button, fade-up-on-scroll on every section, and emoji in the UI.

## Performance budget

- **Landing first-load JS under 150KB gzipped** (149.0KB at the redesign merge). Lazy-load below-the-fold islands (the sample report, FAQ) with a server-rendered fallback.
- **Keep the root lean.** Anything at the app root (`error.tsx`, client references in `not-found.tsx`, client components in the root layout) ships with every page, and Turbopack duplicates `next/link` per entry chunk. Scope error boundaries and app-only chrome to the `(app)` and `(auth)` groups.
- LCP under 2.0s on mobile 4G, CLS under 0.05, INP under 200ms.
- Preload at most two font files. Inline Route and contour SVGs stay under 20KB each; no canvas or WebGL.

## Adding to the system

1. **New color or size:** add a token to the `@theme static` block with a comment saying what it's for, and check contrast for every text pairing.
2. **New component:** put it in `pp/` if it's specific to PathPilot, or in `ui/` if it's a general control. Use tokens only, and add an example to `/design` (`src/app/design/demos.tsx`).
3. **New motion:** reuse the `motion.ts` tokens and confirm it isn't a second orchestrated moment on the page. Check it with reduced motion turned on.
4. Run `npx tsc --noEmit`, `npx eslint`, `npx vitest run` and `npx next build`, and compare first-load JS per route before and after.
