# PathPilot — Premium Redesign Brief for Claude Code

You are acting as three people at once: a **senior product designer**, a **senior UX/UI designer**, and a **senior full-stack engineer**. You are redesigning PathPilot end to end — landing, auth, wizard, upload, analysis, results, dashboard — into a premium tool that feels as considered as Linear, Arc, or Stripe's best surfaces, with its own identity.

Think through the full plan before writing code. Work in phases. Ship each phase in a working, buildable state.

---

## 0. Ground rules (read first, follow always)

1. **Redesign the experience, not the engine.** Do not change Supabase schema, auth providers, API routes, the AI prompt/analysis logic, or the report data shape unless a phase below explicitly says so. If a UI need requires a data change, stop and propose it before doing it.
2. **Preserve all analytics.** Keep every existing PostHog event. Add the new events listed in §9. Never remove `data-*` attributes or IDs that analytics depend on.
3. **One new runtime dependency allowed by default:** `motion` (import from `motion/react`). Anything else (charts, scroll libraries, icon packs) needs a written justification in your phase plan. Prefer hand-built SVG over chart libraries.
4. **Stack is fixed:** Next.js 16 (App Router), TypeScript, Tailwind v4 (CSS-first `@theme`), shadcn/ui, Supabase, Vercel AI SDK. Restyle shadcn primitives through tokens — do not fork them into one-off components.
5. **No generic AI-product tells.** Banned: purple/blue gradients, Inter, glassmorphism, identical rounded card grids, gradient blobs, sparkle icons, "✨ AI-powered" copy, ALL-CAPS eyebrow labels over every heading, `→` appended to every button, fade-up-on-scroll on every section, emoji in UI.
6. **Copy must be true.** Any claim about privacy, data retention, model training, timing ("in about 3 minutes"), or accuracy must match the actual code and the existing Privacy Policy/Terms. If unsure, use the softer claim and leave a `// COPY-CHECK:` comment.
7. **Quality floor (non-negotiable):** responsive 360px → 1920px, WCAG 2.2 AA contrast, full keyboard operation, visible focus, `prefers-reduced-motion` respected everywhere, no layout shift from fonts or loading states.

---

## 1. Product context

**What it is:** PathPilot reads a user's CV plus a short questionnaire and produces a personalized career report: role matches, salary ranges, skill-gap analysis, and a week-by-week job-search plan.

**Who it's for (in priority order):**
1. **Career changers** — 3–15 years into a career, know they want out, don't know where their experience transfers.
2. **Professionals in transition** — laid off, returning to work, relocating, or plateaued.
3. Recent grads (secondary; never the hero message).

**The core value prop the current site fails to say:** *Instead of 40 tabs of job boards, salary sites, Reddit threads, and "what can I do with my experience" searches, you get one route, built from your actual CV.*

**The emotional job:** the user arrives anxious and foggy. They should leave feeling *oriented* — "I know where I am, where I can go, and the next step." Every design decision serves that shift from fog to clarity.

---

## 2. Concept: wayfinding

The logo is a wayfinding mark. The whole product is a map.

| Surface | Metaphor | What it means in the UI |
|---|---|---|
| Landing | The trailhead | Shows the route before you commit |
| Wizard | The path | Each question is a waypoint on a visible line |
| Analysis | Surveying | The route draws itself as the analysis streams in |
| Results | The destination | Roles plotted on terrain; a plan as an itinerary |
| Dashboard | The journey log | Past reports and plan progress as log entries |

**The signature element is "the Route":** a single SVG line with waypoint nodes that appears on every core surface — drawn on the landing hero, threading the wizard rail, surveying during analysis, connecting destinations on results. This is where all boldness is spent. Everything around it is quiet, disciplined, and typographic.

Supporting texture: faint topographic contour lines, used in exactly two places (landing hero background, results terrain map) at ≤8% opacity. Nowhere else.

---

## 3. Design system

Implement as Tailwind v4 `@theme` tokens in `app/globals.css`. Every component uses tokens; no raw hex in components.

### 3.1 Color

The paper is a cool, slightly green survey-map white — deliberately *not* the warm cream every AI product uses.

```css
@theme {
  /* Surfaces */
  --color-paper:      #F3F4EF;  /* page background — map paper */
  --color-sheet:      #FBFBF8;  /* raised surfaces: panels, inputs, popovers */
  --color-contour:    #D5DACE;  /* hairlines, borders, contour lines */
  --color-fog:        #E8EBE3;  /* subtle fills, hover rows, skeletons */

  /* Ink */
  --color-ink:        #17211C;  /* primary text (green-black, harmonizes with forest) */
  --color-ink-muted:  #55615A;  /* secondary text — must pass AA on paper */
  --color-ink-faint:  #85908A;  /* tertiary/meta only, never body copy */

  /* Brand */
  --color-forest:     #1F4D3A;  /* primary actions, the Route, focus rings */
  --color-forest-deep:#153729;  /* primary hover/pressed */
  --color-moss:       #A9BFA0;  /* secondary fills, completed waypoints, chart fills */

  /* Signal — used ONLY for "you are here" and the current step */
  --color-blaze:      #E2A92B;  /* trail-blaze marker */

  /* Feedback */
  --color-danger:     #A8432F;
  --color-success:    #2F6B4A;
}
```

Rules:
- Forest is the only action color. One primary button per view.
- Blaze appears at most once per screen (the current waypoint or the "you are here" marker). It is the eye's anchor.
- Charts use forest + moss + contour only. No rainbow palettes.
- Verify contrast for every text/background pair and fix tokens if any fail AA.

### 3.2 Typography

| Role | Face | Use |
|---|---|---|
| Display | **Fraunces** (variable; use `opsz` and `SOFT` axes) | Page titles, hero, destination names, big numbers in results |
| UI / body | **General Sans** (400, 500, 600) | Everything else |
| Data | **Fragment Mono** | Only salary figures, match percentages, dates in the journey log, and route coordinates. Never for labels or decoration. |

Loading: Fraunces and Fragment Mono via `next/font/google`. General Sans via `next/font/local` from `app/fonts/GeneralSans-Variable.woff2` (the user will place this file; if missing, stop and say so). Preload only display + body regular. `font-display: swap` with size-adjusted fallbacks so there is zero CLS.

Scale (rem, 16px base), modular ratio ~1.25 for UI, larger jumps for display:

```
--text-xs: 0.75rem    /* meta */
--text-sm: 0.875rem   /* secondary UI */
--text-base: 1rem     /* body */
--text-lg: 1.125rem   /* lead paragraphs */
--text-xl: 1.375rem   /* section titles (Fraunces) */
--text-2xl: 1.875rem  /* page titles (Fraunces) */
--text-3xl: 2.75rem   /* destination name (Fraunces) */
--text-hero: clamp(2.75rem, 6vw, 5rem) /* landing hero only */
```

Typographic rules:
- Fraunces display: `opsz` matched to size, weight 380–450, tracking −0.02em at hero size, line-height 1.02–1.1. Let the type be the hero — big, calm, confident.
- Body: General Sans 400, line-height 1.6, max line length 68ch.
- All numbers use `font-variant-numeric: tabular-nums`.
- Sentence case everywhere. No all-caps labels. No italicized or color-highlighted single words in headlines.

### 3.3 Space, radius, elevation

- Spacing on a 4px grid. Section rhythm on landing: 128px desktop / 80px mobile.
- **Radius encodes hierarchy, not one value for everything:** inputs and buttons 8px; panels 14px; the destination hero panel 20px; chips fully rounded; the Route nodes are circles.
- Elevation: almost flat. Hairline `--color-contour` borders do the structural work. One shadow token for floating layers only (popovers, dialogs, toasts): `0 1px 2px rgb(23 33 28 / .06), 0 8px 24px -8px rgb(23 33 28 / .14)`.
- Grid: 12 columns, 1200px max content width, 24px gutters; text-heavy pages cap at 720px.

### 3.4 Motion system

Create `lib/motion.ts` exporting these tokens and reuse them everywhere:

```ts
export const ease = {
  out: [0.22, 1, 0.36, 1],       // default for entrances
  inOut: [0.65, 0, 0.35, 1],     // route drawing, page transitions
} as const;

export const duration = {
  instant: 0.12, // press feedback
  fast: 0.18,    // hovers, toggles
  base: 0.28,    // wizard step transitions, panels
  slow: 0.52,    // section reveals that are earned
  route: 1.4,    // the Route drawing
} as const;

export const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;
```

Motion principles:
- **One orchestrated moment per page.** Landing: the hero Route draws once on load. Results: the destination reveal. Everything else is responsive motion (answers a user action) or nothing.
- Animate only `transform`, `opacity`, `stroke-dashoffset`, and `clip-path`. No animating width/height/top/left.
- Buttons: 0.98 scale on press (instant), no bounce.
- Use shared layout animations (`layoutId`) for elements that persist between states — e.g., the selected wizard answer morphs into its summary chip on the path rail.
- Page transitions within the app flow (wizard → upload → analysis → results): use the View Transitions API via Next.js where supported, falling back to a 180ms crossfade. Landing → app does not animate.
- `prefers-reduced-motion`: Route renders fully drawn, transitions become 120ms opacity fades, no parallax, no number tickers.

### 3.5 Iconography & imagery

- Lucide icons at 1.5px stroke, 18/20px, ink-muted by default. Use sparingly — text labels first.
- No stock photos, no 3D blobs, no illustrations of people. Imagery = the Route, contour lines, and real UI.

---

## 4. Shared components to build (in `components/pp/`)

Build these first; every page uses them.

1. **`Route`** — SVG path component. Props: `points`, `activeIndex`, `drawn` (boolean or 0–1 progress), `variant` ("hero" | "rail" | "survey" | "map"). Uses `pathLength` + `stroke-dashoffset` for drawing. Nodes: completed = moss fill, current = blaze ring with a slow 2.4s breathing pulse (disabled under reduced motion), upcoming = contour outline.
2. **`Waypoint`** — node + label pair used in rails and maps.
3. **`ContourField`** — static SVG topographic background, generated once (deterministic, seeded), exported as an inline SVG component. Not animated.
4. **`Stat`** — Fragment Mono figure + General Sans label. Supports ranges (`$78k–$110k`).
5. **`RangeBar`** — horizontal salary range with market median tick and the user's current pay marker if known.
6. **`MatchMeter`** — match % as a short segmented arc or bar; never a donut chart.
7. **`KeyHint`** — small keyboard shortcut chip (`↵`, `1`, `⌘K`) shown on desktop only.
8. **`EmptyState`** / **`ErrorState`** — consistent structure: what happened, what to do, one action.
9. **Restyled shadcn primitives:** Button (primary / secondary / quiet), Input, Textarea, RadioGroup-as-rows, Checkbox, Tabs, Dialog, Toast (Sonner), Tooltip, Skeleton. Skeletons must match the real layout's shape.

---

## 5. Page-by-page spec

### 5.1 Landing (`/`)

Goal: a career changer understands in 5 seconds what this does for them, and starts.

**Nav (sticky, 64px, paper with hairline bottom border after scroll):**
Logo · How it works · Sample report · Sign in · **Map my next move** (primary).

**Hero (left-aligned, two columns ≥1024px; stacked on mobile):**
- Headline (Fraunces, `--text-hero`): **"You know you want out. Here's where you can go."**
- Subhead (General Sans, `--text-lg`, ink-muted, max 52ch): "Upload your CV. PathPilot maps the roles your experience already fits, what they pay, the skills between you and them, and a week-by-week plan to get there."
- CTAs: **Map my next move** (primary) · See a sample report (secondary, scrolls to §sample).
- Trust line under CTAs (ink-faint, `--text-sm`): "Free while in beta. No credit card." *(COPY-CHECK against reality.)*
- **Right column — the signature moment:** a live Route over a faint `ContourField`. A blaze "you are here" node labeled *Operations coordinator · 6 yrs* draws a path (1.4s, `ease.inOut`) that branches to three destination nodes, each revealing a compact label after the line reaches it (staggered 120ms):
  - Product operations manager — 87% match — $95k–$125k
  - Customer success manager — 82% match — $78k–$110k
  - Implementation specialist — 79% match — $72k–$98k
  Hovering/focusing a destination thickens its branch and dims the others. On mobile the route draws vertically below the CTAs.

**"One route instead of 40 tabs" (the missing value prop):**
Two-column comparison, static, no animation. Left: a quiet, slightly chaotic stack of what people do today — job boards, salary sites, "transferable skills" listicles, Reddit threads, LinkedIn Learning searches — rendered as overlapping tab-shaped strips in fog/contour. Right: one clean excerpt of a PathPilot report. One sentence of copy: "Everything you'd piece together from a dozen sites, built from your actual experience."

**How it works (a real sequence, so numbering is allowed):**
Three steps along a horizontal Route on desktop, vertical on mobile:
1. Upload your CV — PDF or DOCX.
2. Answer a few questions — what you want, what you won't do, where you'll work.
3. Get your route — matches, pay, gaps, and a plan.
Each step shows a tiny real UI fragment, not an icon.

**Sample report (`#sample`):**
Render actual results components with fixture data (not a screenshot). Tabs: Destinations · Pay · Skill gaps · Plan. Fully interactive. This is the strongest conversion asset — make it feel like touching the real product.

**Who it's for:** three short columns — Changing careers / Between jobs / Starting out — each one sentence on what PathPilot gives that person. Career changers first and visually primary.

**Privacy (short, plain):** what happens to their CV, in two or three sentences, sourced from the Privacy Policy. Link to the policy.

**FAQ:** 5–6 questions max (accuracy of salaries, which countries/markets, data/privacy, how long it takes, cost, what if I have no degree). Accordion with smooth height via `motion` layout.

**Final CTA:** Fraunces line "Find out where your experience can take you." + primary button. Then a minimal footer (Privacy, Terms, contact).

### 5.2 Auth (`/login`, `/signup`)

- Split layout ≥1024px: left 480px form column on sheet; right a quiet `ContourField` with a single partially drawn Route ending in a blaze node. Mobile: form only.
- Keep existing providers exactly. Order: OAuth first if present, then email.
- Inline validation on blur, not on every keystroke. Errors say what's wrong and how to fix it.
- Magic-link/confirmation sent state: dedicated screen, the email address in Fragment Mono, "Open your email app" helper, resend with a 30s cooldown timer.
- After auth, return the user to where they were heading (preserve intended destination).

### 5.3 Wizard (questions)

The single most important flow to feel premium. **Do not change the question set, order logic, or stored values** — only presentation and copy polish. Include the education-status question (enrolled / graduated / no degree) if not yet present, wired to existing storage.

Layout ≥1024px:
- **Left rail (280px): the path.** A vertical `Route` with one waypoint per question. Answered waypoints show a short summary chip of the answer (via `layoutId` morph from the selected option). Clicking any answered waypoint jumps back to edit it. Current waypoint = blaze.
- **Center (max 640px): one question at a time.** Question in Fraunces `--text-2xl`; helper text in ink-muted explaining *why we ask* in one sentence.
- Top-right: "About 2 min left" estimate computed from remaining questions. No percentage bar.

Mobile: rail collapses to a compact horizontal segmented path at the top showing current/total; tap to open a sheet with all answers.

Interaction:
- Single-choice options render as full-width rows (not cards) with a `KeyHint` number on desktop. Selecting auto-advances after 220ms with the row confirming (check + forest left border) so the user sees what they chose.
- Multi-select shows a "Continue" button + `↵` hint.
- Text inputs autofocus; `↵` continues, `Shift+↵` newline for textareas.
- Back: button + `⌘←`/`Alt+←`. Never lose an answer.
- Step transition: outgoing question moves −24px and fades, incoming from +24px (`duration.base`, `ease.out`). Direction reverses when going back.
- Autosave every answer (existing storage; localStorage fallback if not signed in). Returning users resume at their last unanswered question with a small "Picked up where you left off" toast.
- Final review step: all answers as an editable summary, then the primary CTA "Build my route".

### 5.4 CV upload

- Drop zone styled as a map pin target: dashed contour border, large Fraunces prompt "Drop your CV here", secondary "or choose a file". Accept PDF/DOCX, max size per existing limit.
- On drag-over: border turns forest, zone scales 1.01, pin icon lifts.
- On drop: file row with name, size (Fragment Mono), and a progress line that is a mini Route drawing to completion.
- If the code already extracts text/structure, show a confirmation: "We found 6 years of experience and 14 skills" with an option to replace the file. If not, show filename + "Ready".
- Errors, each with a specific fix: wrong type, too large, no readable text (scanned PDF → "Export as a text PDF or upload a DOCX"), network failure (retry keeps the file).

### 5.5 Analysis (generating)

This is where most AI products feel cheap. Make it feel like surveying.

- Full-width canvas with a `Route` in `survey` variant drawing progressively, stage labels as waypoints:
  1. Reading your experience
  2. Finding transferable skills
  3. Matching roles
  4. Pricing the market
  5. Building your plan
- **Stages must reflect real progress.** If the analysis endpoint streams (or can stream with `streamObject` from the Vercel AI SDK without changing the output schema), advance stages on real events and reveal partial findings as they arrive (e.g., the first matched role name fading in under stage 3). If it can't stream, advance stages on a conservative time curve that never completes before the response arrives, and propose a streaming upgrade as a separate, opt-in task — do not implement it silently.
- Never show a fake percentage.
- At 30s: a calm line appears — "Still working. Detailed reports take up to a minute." At 90s: offer "Email me when it's ready" if email exists in the system; otherwise keep waiting with a retry option.
- Failure: specific message, "Try again" reuses the uploaded CV and answers — the user never re-enters anything.
- When complete: the survey Route resolves into the results page's destination map via a view transition.

### 5.6 Results (the destination)

The payoff. Should feel like opening a beautifully produced brief made only for them.

**Header:** "Your route" (small, ink-muted) above a one-sentence summary in Fraunces `--text-2xl` generated from the report data, e.g. "Your operations background points most strongly toward product operations." Date generated in Fragment Mono. Actions on the right: Download PDF · Share (only if supported) · Start a new route.

**Orchestrated moment — destination reveal (once per load):** the best-fit role panel (20px radius, sheet surface) settles in, its match meter fills (0.8s), and the salary range bar draws. Reduced motion: static.

**Sticky section nav** (desktop: left side; mobile: top horizontal scroller) with scroll-spy: Destinations · Pay · Skill gaps · Plan.

**Destinations:**
- A **terrain map**: `ContourField` background, roles plotted as waypoint nodes — x = match %, y = salary midpoint, labeled axes in plain words ("Better fit →" is the only arrow allowed; "Higher pay" on y). The user's current position is the blaze node. Routes draw from it to each role. Hover/focus a node → highlight its row below. Fully keyboard navigable; provide a table alternative for screen readers.
- Below the map, ranked role rows (not cards): role name (Fraunces), MatchMeter, salary range, 1-line "why you fit" from the report, expand for full detail (responsibilities, typical titles, where these roles are posted). Expansion uses `motion` layout.

**Pay:** RangeBar per role with market median tick; the user's current pay marker if known. Note the data source/market in plain words if the report includes it.

**Skill gaps:** for the selected destination (default: best fit), two columns — **You bring** (moss chips) and **To close** (rows with effort estimate and a suggested resource if present). Switching destination animates chips moving between columns via `layoutId` where skills overlap.

**Plan:** an itinerary. Week-by-week vertical Route with each week's tasks as checkboxes. **Checkbox state persists** (Supabase if the schema already supports it; otherwise localStorage and flag the schema addition as a proposal). Completed weeks turn moss. This is the retention hook.

**Fake-door slot (feature-flagged, off by default):** at the end of the plan, a quiet panel — "Get weekly matched job listings for this route" with a price and a primary button. Clicking fires `pricing_intent_clicked` with the price shown, then shows "We're opening this soon. Want early access?" with an email capture (or a one-click confirm if signed in). Price and copy live in one config file.

**PDF export:** print stylesheet or existing export, restyled — paper background off, forest + ink only, Fraunces titles, page breaks between sections.

### 5.7 Dashboard (the journey log)

- Title "Your journey" + primary "Start a new route".
- Reports listed as log entries in reverse chronological order, connected by a thin vertical Route: date (Fragment Mono), best-fit destination (Fraunces), top match %, and plan progress ("Week 2 of 6 · 5 of 14 tasks"). Click → results.
- Empty state: a single undrawn waypoint, "Your first route starts with your CV," and the primary CTA.
- Settings (account, delete data, sign out) behind the avatar menu. "Delete my data" must work exactly as the existing code/policy defines; confirmation dialog states what gets deleted.

### 5.8 System states

Design every one; none may fall back to default browser/Next.js UI:
404 ("This path doesn't go anywhere" + back to dashboard/home), global error boundary, offline banner, session expired (re-auth then return to same page), loading skeletons for dashboard and results, rate-limit/quota message if applicable.

---

## 6. Voice & microcopy

- Plain, calm, specific. Second person. Active verbs. Sentence case.
- The action keeps its name through the flow: "Build my route" → analysis → "Your route is ready."
- Never: "Unlock your potential", "AI-powered insights", "supercharge", "journey" outside the dashboard title, "Oops".
- Errors: what happened + how to fix. No apologies, no vagueness.
- Helper text under each wizard question explains why it's asked, in ≤15 words.

---

## 7. Accessibility

- Contrast AA verified for every token pair used for text.
- Focus ring: 2px forest outline, 2px offset, on every interactive element; never removed.
- All SVG visualizations have accessible names and a text/table equivalent.
- Wizard is a proper form with labels, `aria-live="polite"` announcements for step changes and autosave.
- Analysis stages announced via `aria-live`.
- Hit targets ≥ 44×44px on touch.
- Reduced motion handled globally via a `useReducedMotion` wrapper in `lib/motion.ts`.

---

## 8. Performance budget

- LCP < 2.0s on landing (mobile, 4G), CLS < 0.05, INP < 200ms.
- Landing route JS < 150KB gzipped. Lazy-load the sample report and FAQ below the fold.
- Route/contour SVGs inline and lightweight (< 20KB each); no canvas, no WebGL.
- Fonts: subset Latin, preload 2 files max.
- Run `next build` and report bundle sizes per route at the end of each phase.

---

## 9. Analytics (PostHog) — add without removing existing events

`landing_cta_clicked` (location: hero/final/nav) · `sample_report_viewed` · `sample_tab_switched` · `signup_completed` · `wizard_started` · `wizard_step_completed` (step id) · `wizard_completed` · `cv_uploaded` (type, size bucket) · `cv_upload_failed` (reason) · `analysis_started` · `analysis_completed` (duration ms) · `analysis_failed` (reason) · `results_viewed` · `results_section_viewed` (section) · `plan_task_checked` · `pdf_downloaded` · `pricing_intent_clicked` (price) · `waitlist_joined`.

Centralize in `lib/analytics.ts` with typed event names.

---

## 10. Execution plan

Work phase by phase. At the end of each phase: run typecheck, lint, and `next build`; fix all errors; if you can take screenshots, capture 375px, 768px, and 1440px and critique them against §0, §3, and §6; then summarize what changed and what's next. Commit per phase.

**Phase 0 — Audit (no code changes).**
Map the current app: routes, components, data flow from upload → AI → report, report JSON shape, auth setup, existing PostHog events, existing fonts/styles. Output a short written plan: what you will touch per phase, risks, any data/schema proposals, and any copy claims that need verification. Wait for approval before Phase 1.

**Phase 1 — Foundation.**
Tokens (`@theme`), fonts, `lib/motion.ts`, `lib/analytics.ts`, restyled shadcn primitives, and all `components/pp/*` shared components. Build a hidden `/design` route showing every token and component in every state for review.

**Phase 2 — Landing.**
Full landing per §5.1 with fixture data for the hero and sample report.

**Phase 3 — Auth, wizard, upload.**
§5.2–5.4. Verify the full flow end to end with a real account and real CV.

**Phase 4 — Analysis and results.**
§5.5–5.6. Streaming upgrade only as a proposed, opt-in step. Fake-door flagged off.

**Phase 5 — Dashboard, system states, polish.**
§5.7–5.8, PDF styling, full accessibility pass, reduced-motion pass, performance pass against §8.

---

## 11. Definition of done

- [ ] A first-time visitor can explain what PathPilot does after 5 seconds on the hero.
- [ ] The "one route instead of 40 tabs" value prop is visible above the second scroll on desktop.
- [ ] The Route appears on landing, wizard, analysis, results, and dashboard, and feels like one continuous system.
- [ ] Each page has at most one non-user-triggered animation.
- [ ] No banned patterns from §0.5 anywhere in the app.
- [ ] Every flow is completable by keyboard alone.
- [ ] Reduced motion produces a complete, calm, static experience.
- [ ] No existing feature, data path, or analytics event broke.
- [ ] Every empty, loading, and error state is designed.
- [ ] Build passes, budgets in §8 are met, and screenshots at three breakpoints were reviewed.

Before declaring done, do a final "remove one accessory" pass: list three decorative things you could delete without losing meaning, and delete them.
