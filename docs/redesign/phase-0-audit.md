# PathPilot redesign — Phase 0 audit

Audit date: 2026-10-01. No application code was changed in this phase.

## 1. What exists today

### Routes

| Route | Rendering | What it does |
|---|---|---|
| `/` | Server, **dynamic** (marketing layout calls `supabase.auth.getUser()`) | Centered hero, Inter, black/white, icon-card grids, "AI-powered" pill, `→` buttons |
| `/demo` | Server, dynamic | Sample analysis (Maya Chen, marketing graduate) rendered with the real result components |
| `/privacy`, `/terms` | Server, dynamic | Legal copy (Aug 18, 2026) |
| `/login`, `/signup` | Client, static | Email + password only. Signup → "Check your email" screen |
| `/auth/callback` | Route handler | Exchanges code, redirects to `next` (default `/dashboard`) |
| `/dashboard` | Server | Card grid of analyses with status badges |
| `/new` | Client, one page | Wizard: **CV first** (PDF ≤ 5 MB upload *or* paste ≥ 50 chars) → 10 questions → review → submit |
| `/analysis/[id]` | Server | `processing` → `AnalysisLoading` (polls every 3 s); `failed` → message + link to `/new`; `completed` → 7 stacked sections |
| `POST /api/analyze` | Route, `maxDuration = 60` | Validate → download PDF from storage → `pdf-parse` → truncate to 12k chars → insert row → **await `generateObject` synchronously** → save → return `{ analysisId }` |
| `GET /api/analyze/[id]` | Route | Status poll |
| `middleware.ts` | Every request | `getUser()`; protects `/dashboard`, `/new`, `/analysis`; bounces signed-in users off `/login`, `/signup` |

### Data flow (upload → AI → report)

1. `/new` keeps everything in React state. Nothing is saved until submit.
2. On submit: PDF uploads to the `cv-uploads` bucket at `{user_id}/{ts}-{rand}.pdf` (no progress events), then `POST /api/analyze`.
3. The server extracts text, inserts an `analyses` row (`status: processing`), and calls OpenAI (`gpt-4o` default) via the AI SDK's `generateObject` with `analysisResultSchema`.
4. The response returns only **after** generation finishes. The client then `router.push`es to `/analysis/[id]`. During generation the user sees a spinner inside the review step. The polling `AnalysisLoading` screen is reached only by revisiting a still-processing row.

### Report shape (`analysisResultSchema`, `src/lib/schemas.ts`)

```
summary: string                                  (a paragraph)
strengths[3]:     { name, score 1–10, evidence, why_it_matters }
career_paths[3]:  { title, fit_score 1–100, why_it_fits, why_it_is_realistic,
                    example_job_titles[5], best_for, tradeoff }
avoid_roles[2–3]: { role_type, reason }
action_plan[7]:   { step 1–7, title, details }     (one per day)
cv_rewrites[2–3]: { before, after, why_better }
confidence_note:  string
```

There is **no salary, no skill-gap, no week-by-week plan, no market/source, no responsibilities, and no "where roles are posted"** data.

### Database and storage

- `profiles`, `analyses` (`questionnaire jsonb`, `result jsonb`, `status`), `analysis_feedback`.
- RLS: select/insert/update own rows only. **No delete policy** on any table.
- Storage: private `cv-uploads` bucket with owner-scoped insert/select/delete.

### Auth

- Supabase email/password only. No OAuth, no magic link.
- `/login?redirect=` is honored. Signup does not pass `emailRedirectTo`, so confirmation lands on `/dashboard`.
- **Open redirects** in `/login` (`router.push(redirect)`) and `/auth/callback` (`${origin}${next}`). Flagged as a separate task, outside the redesign.

### Analytics

- Vercel Web Analytics (`<Analytics />` in the root layout), page views only.
- **No PostHog, no custom events, no `data-*` analytics hooks anywhere.**

### Styling and UI

- Tailwind v4, shadcn style `base-nova` (**Base UI primitives, not Radix**), Inter, neutral oklch tokens.
- Components hard-code `#FAFAFA`, `#0F0F0F`, `green-50`, `red-50`, `amber-50`, and blue/green/amber icon tints.
- `framer-motion@12.38` is already installed (same engine as `motion`).
- Primitives present: badge, button, card, dialog, dropdown-menu, input, label, progress, separator, skeleton, sonner, tabs, textarea.
- `FeedbackWidget` exists and writes to `analysis_feedback`, but **is never rendered**.

### Baseline health

- `tsc` ✓
- `eslint`: 0 errors, 3 warnings (in `new/page.tsx`)
- `vitest`: 19/19 ✓
- `next build` ✓, but only after `npm install`, because local `node_modules` was missing `@vercel/analytics`.
- Build warnings:
  - `middleware` → `proxy` deprecation
  - Turbopack root inferred from a stray `C:\Users\jvra0\package-lock.json`

Baseline first-load client JS, gzipped (root chunks + route entry chunks):

| Route | KB | Route | KB |
|---|---|---|---|
| framework floor (root chunks) | ≈132 | `/login`, `/signup` | 304 |
| `/` | 157.5 | `/dashboard` | 212 |
| `/demo` | 169.6 | `/new` | 344 |
| `/privacy`, `/terms` | 157.5 | `/analysis/[id]` | 226 |

## 2. Where the brief and the code disagree

1. **The report doesn't contain pay, skill gaps, or a week-by-week plan.** The hero, Pay tab, Skill-gaps tab, terrain map (y = salary), RangeBar, "Pricing the market" stage, and the landing subhead all depend on data the AI doesn't produce today.
2. **The AI is told to target early-career users.** `SYSTEM_PROMPT` says "elite early-career career strategist… focus on entry-level or early-career accessible paths". The brief's primary audience is career changers 3–15 years in. Landing copy aimed at them would overpromise.
3. **There are no PostHog events to preserve.** Adding PostHog means a new dependency, a project key, and a Privacy Policy change. The policy already says "PathPilot does not currently use analytics tools", which has been inaccurate since Vercel Web Analytics shipped.
4. **Analysis does not stream and is fully synchronous** behind a 60 s cap. If generation exceeds 60 s the function is killed: the client never learns the `analysisId`, and the row stays `processing` forever. The README's "returns immediately and the client polls" claim is not true of the code.
5. **Wizard:**
   - No single-choice questions exist (2 multi-select, 8 free-text), so "auto-advance rows" only apply to the proposed education question.
   - No education question.
   - No autosave.
   - `/new` requires sign-in, so the "not signed in" path doesn't exist.
6. **Upload:**
   - PDF only; no DOCX parser.
   - Paste-text mode exists (keep it).
   - Scanned PDFs are only detected server-side after submit.
   - No pre-submit extraction, so "We found 6 years and 14 skills" can't be shown.
   - Upload happens at submit with no progress events, so a progress bar would be fake.
7. **"Email me when it's ready":** there's no email infrastructure beyond Supabase auth mail.
8. **Plan checkboxes, the fake-door waitlist, and self-serve "Delete my data" have no storage:**
   - No `plan_progress` column.
   - No waitlist table.
   - No delete RLS policy.
   - The policy defines deletion as an email request completed within 30 days.
9. **The performance budget is nearly consumed by the framework.** The Next 16 + React 19 root chunks are ≈132 KB gzipped, leaving ≈18 KB for the whole landing page.
10. **View Transitions are experimental.** Next 16 docs say "we strongly advise against using this feature in production".
11. **The General Sans file is missing.** This repo uses `src/app/`, so the path is `src/app/fonts/GeneralSans-Variable.woff2`.
12. **Contrast failures in the proposed tokens:**

    | Token pair | Ratio | Required |
    |---|---|---|
    | `ink-faint` on paper | 2.99 | 4.5 (text) |
    | `ink-faint` on sheet | 3.19 | 4.5 (text) |
    | blaze marker on paper | 1.91 | 3 (non-text) |
    | moss node on paper | 1.78 | 3 (non-text) |
    | contour as input border | 1.29–1.37 | 3 (non-text) |

    Proposed fixes:
    - Darken `ink-faint` to about `#6A746E`.
    - Give blaze and moss nodes a forest or ink stroke.
    - Add a `--color-edge` token, at least 3:1, for interactive borders. Contour stays decorative.

## 3. Decisions needed

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Report data | **A.** Keep the shape and design around it: Destinations · Strengths · 7-day plan · Watch-outs · CV lines. **B.** Additive "v2" fields per career path: `salary_estimate {currency, low, high, period, location_basis}`, `skills_you_bring[]`, `skills_to_build[{skill, effort, how}]`. Nullable, so old reports still render. Keep the 7-day plan. No DB migration (`result` is jsonb). | **B**, as a small "Phase 1b" before the landing, so landing copy is true when it ships. Salaries are labeled "AI estimate for {location}". The Terms already disclaim salary outcomes. |
| D2 | Prompt audience | Keep early-career focus, or calibrate seniority to the CV (career changers first, early-career still handled) | Retarget (prompt + tests). Without it the brief's positioning is untrue. |
| D3 | Analytics | **a.** PostHog: new dependency, key from you, lazy-loaded, cookieless/memory persistence, Privacy Policy update. **b.** Vercel `track()`: already installed, but custom events need a Pro plan. **c.** Typed `lib/analytics.ts` with a no-op sink until decided. | Build the typed layer in Phase 1 regardless. Enable PostHog when you provide `NEXT_PUBLIC_POSTHOG_KEY` and approve the policy wording. |
| D4 | Plan-progress storage | localStorage only, or migration `003`: `analyses.plan_progress jsonb default '{}'` (the existing update policy covers it) | localStorage in Phase 4. Approve `003` if you want progress on the dashboard across devices. |
| D5 | Analysis timeouts | Raise `maxDuration` 60 → 300 (Fluid Compute default) + client treats `processing` older than 5 min as failed, with retry | Yes. Config only, no logic change. |
| D6 | Education question | Add optional `education_status: enrolled \| graduated \| no_degree` to the questionnaire schema + one prompt line | Yes, together with D2. Collecting an answer the AI ignores would be dishonest. |
| D7 | JS budget | Keep "< 150 KB total" (needs CSS-only hero draw, Toaster moved out of the root layout, sample report/FAQ/motion lazy) or redefine as "≤ 25 KB landing-specific JS on top of the framework" | Try for < 150 KB *initial* (lazy chunks excluded). Report both numbers. |
| D8 | View Transitions | Native (experimental flag) or the brief's 180 ms crossfade fallback | Crossfade only via `template.tsx` + motion. Revisit when stable. |
| D9 | Trust line | "Free while in beta" (nothing says beta today) or "Free to use. No credit card." | The latter, unless you confirm "beta". |
| D10 | Font | You add `src/app/fonts/GeneralSans-Variable.woff2` (Fontshare, ITF Free Font License) | Needed before Phase 1 typography. I can build tokens/components first with a fallback stack. |

## 4. Phase plan (what each phase touches)

**Phase 1 — Foundation**

- `globals.css`:
  - Brief tokens in `@theme`, plus the contrast fixes from §2.12.
  - Re-point shadcn semantic variables (`--primary` → forest, `--border` → contour, `--ring` → forest…), so every existing component restyles without forking.
  - Remove the dark-mode block (not in scope).
  - Add global reduced-motion rules.
- `layout.tsx`:
  - Fraunces (`axes: ["opsz","SOFT"]`), Fragment Mono (no preload), General Sans (local).
  - Drop Inter.
  - Move `Toaster` into app/auth layouts.
- Swap `framer-motion` → `motion` (net zero dependencies).
- `next.config.ts`: `turbopack.root`.
- New `src/lib/motion.ts` (tokens + `useReducedMotion` wrapper) and `src/lib/analytics.ts` (typed events, adapter).
- `src/components/ui/*`: restyle button (primary/secondary/quiet, old variant names kept as aliases), input, textarea, tabs, dialog, sonner, skeleton. Add radio-group, checkbox, tooltip, accordion via the shadcn CLI. These are Base UI, already a dependency.
- `src/components/pp/*`: Route, Waypoint, ContourField, Stat, RangeBar, MatchMeter, KeyHint, EmptyState, ErrorState.
- `src/app/design/page.tsx`: noindex and unlinked.

**Phase 1b — Report v2 (only if D1 = B, D2, D6)**

- `schemas.ts`: nullable additive fields, `education_status`.
- `prompts.ts` and both test files.
- New career-changer sample fixture (ops coordinator, 6 years).
- `maxDuration` (D5).

**Phase 2 — Landing**

- `(marketing)/layout.tsx`: nav, footer.
- `(marketing)/page.tsx`: hero Route drawn with CSS (zero JS), "40 tabs" comparison, how it works, sample report (lazy; the same components Phase 4 uses), who it's for, privacy, FAQ, final CTA.
- `/demo` kept as the full-page sample (existing links point there).

**Phase 3 — Auth, wizard, upload**

- `(auth)/layout.tsx` split layout. Login/signup restyle with `mode: "onTouched"`. Confirmation screen with resend and 30 s cooldown (`supabase.auth.resend`). `emailRedirectTo` so confirmation returns to `/new`.
- Break `new/page.tsx` into `components/wizard/*`: path rail with `layoutId` chips, question view, option rows, review, drop zone.
- localStorage autosave (answers only, keyed by user id, never the CV), keyboard shortcuts, `aria-live`.
- `constants.ts`: copy polish only (labels, ≤15-word helpers, career-changer placeholders). **Stored values unchanged.**

**Phase 4 — Analysis and results**

- Submit flips `/new` into a Survey view while the request runs.
  - Stage 1 ("Sending your CV") completes on the real upload event. Later stages advance on a conservative curve and resolve only on the real response.
  - Stage names come from the actual report sections.
- `AnalysisLoading` restyled with stale detection.
- "Try again" re-posts the stored `cv_text` + `questionnaire` from the failed row. The existing API already accepts this, so no API change.
- Results page:
  - Header with a templated one-liner from the best-fit path.
  - Destination reveal and section nav with scroll-spy.
  - Destinations map + ranked rows.
  - Strengths; Pay and gaps if v2.
  - Plan with checkboxes, watch-outs, CV lines, confidence note.
  - `FeedbackWidget` wired in.
  - Print stylesheet ("Print or save as PDF").
  - Fake door behind a flag, off.
- Streaming (`streamObject`, same schema) is written up as a proposal only.

**Phase 5 — Dashboard, system states, polish**

- Dashboard journey log, empty state.
- Avatar menu: account, "Delete my data" dialog → prefilled email per policy, sign out.
- `not-found.tsx`, `error.tsx`, `global-error.tsx`, offline banner, `loading.tsx` skeletons.
- Privacy and Terms restyle, plus the analytics wording fix.
- Accessibility, reduced-motion, and performance passes.

## 5. Risks

- **v2 output is longer:** more latency and more timeouts. Raising `maxDuration` matters. OpenAI strict structured outputs need `.nullable()`, not `.optional()`.
- **LLM salary figures can be wrong.** They must carry the estimate label and location basis everywhere they appear, including the hero fixture.
- **The JS budget is tight.** Any client island in the hero or nav eats most of the 18 KB headroom.
- **localStorage progress is per-device and per-browser.** The dashboard can't show progress from another device without D4's migration.
- **Base UI vs Radix:** shadcn examples online are mostly Radix. Generate primitives through the CLI with this repo's `base-nova` style.
- **The brief contradicts itself on order.** §5 lists "wizard → upload", while "How it works" and current code are CV-first. The ground rule says don't change order logic, so CV stays first.
- **TTFB on `/`:** middleware and the marketing layout each call Supabase `getUser()` on every landing request. Fixing this touches auth plumbing, so it's proposed in Phase 5 rather than done silently.

## 6. Copy claims to verify

| Claim in brief | Reality in code/policy | Proposed copy |
|---|---|---|
| "Free while in beta. No credit card." | No pricing, nothing says "beta" | "Free to use. No credit card." `// COPY-CHECK` |
| "…what they pay, the skills between you and them, and a week-by-week plan" | Not generated | If D1 = A: "…the roles your experience already fits, the strengths that carry over, and a 7-day plan to start." If B: pay/skills true; "week-by-week" → "a 7-day plan" |
| "PDF or DOCX" | PDF or pasted text | "PDF, or paste the text" |
| "We found 6 years of experience and 14 skills" | No pre-submit extraction | Filename + size + "Ready" |
| "Email me when it's ready" | No email infrastructure | Omit; keep waiting, with retry |
| "Pricing the market" stage | No market data | Stages named after real report sections |
| Policy: "does not currently use analytics tools" | Vercel Web Analytics is live | Update policy (and again if PostHog) |
| Landing privacy blurb | Policy: CV + answers go to OpenAI API (not used for training by default per OpenAI's API policy), stored in Supabase with owner-only RLS, never sold, deletion by email within 30 days | Use exactly these facts, link to `/privacy` |
| Timing | Questions "about 5 minutes" (current copy); analysis "30–60 seconds", hard cap 60 s today | Keep these; "About N min left" computed per question |
| "Delete my data" | Email request, ≤ 30 days | Dialog lists what's deleted + prefilled email |
| "Download PDF" / "Share" | Neither exists; reports are private to the account | "Print or save as PDF"; omit Share (link would 404 for anyone else) |
| FAQ: which markets? | Any location the user types; no market dataset | Say that plainly |
| FAQ: no degree? | Prompt ignores education today | Answer only after D6 ships |
