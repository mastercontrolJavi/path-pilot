# PathPilot Phase 0 audit (second pass)

- **Date:** 2026-10-02
- **Brief:** `PATHPILOT_REDESIGN.md` (same brief that drove PR #20)
- **Code audited:** `origin/main` at `3ec6c50` ("docs: add design system guide (#21)"), read in this folder
- **Changes made:** none to application code. The only file added is `src/app/fonts/GeneralSans-Variable.woff2` (at the owner's request, untracked, not wired up yet).

## Summary

This brief has already been implemented once. The first Phase 0 audit (`docs/redesign/phase-0-audit.md`, 2026-10-01) led to decisions D1 to D10, Phases 1 to 5 were built on the `redesign` branch, and PR #20 merged on 2026-10-02. PR #21 then added `docs/design-system.md`. Vercel builds passed on both.

So this pass is a gap audit: what the brief asks for, what shipped, and what is left. Most of the brief is in production. What remains is:

1. inputs only the owner can provide (General Sans wiring is now unblocked, PostHog key and policy wording, fake-door storage, the streaming decision, what to do with PR #19);
2. a short list of code gaps, the largest being that the signed-in flow has **never been verified end to end** with real Supabase and OpenAI keys;
3. optional data proposals that would close the remaining feature gaps.

**Recommendation:** a gap-closing pass, not a rebuild.

---

## 1. The app today

### 1.1 Routes

| Route | Rendering | What it does |
|---|---|---|
| `/` | Server, dynamic (marketing layout and page call `getCurrentUser()`) | Landing per brief §5.1 |
| `/demo` | Server, dynamic | Full-page sample report with fixture data |
| `/privacy`, `/terms` | Server | Legal pages, restyled. Privacy updated 2026-10-02 |
| `/login`, `/signup` | Client forms in a split layout | Email and password. Email confirmation is off (#16); "Check your email" shows only if it is turned back on |
| `/auth/callback` | Route handler | Exchanges the code, redirects through `safeRedirectPath` |
| `/dashboard` | Server | Journey log of past routes |
| `/new` | Client | Wizard: CV, 11 questions, review. "Build my route" swaps the wizard for the analysis screen in place |
| `/analysis/[id]` | Server | `processing` (resumes the survey, stale after 5 min), `failed` (retry), `completed` (results) |
| `POST /api/analyze` | Route, `maxDuration = 300` | Validate, extract PDF text, insert row, `generateObject` synchronously, save, return `{ analysisId }` |
| `GET /api/analyze/[id]` | Route | Status check |
| `/design`, `/design/wizard`, `/design/results`, `/design/journey` | Server | Internal previews. 404 when `VERCEL_ENV === "production"`, `noindex` |
| `src/middleware.ts` | Every request | `getUser()`, protects `/dashboard`, `/new`, `/analysis`, bounces signed-in users off auth pages. Still named `middleware` (Next 16 wants `proxy`) |

### 1.2 Data flow (upload to report)

1. The wizard keeps answers in localStorage, keyed per user (`pp:*`). The CV file and pasted text are never stored on the device.
2. On "Build my route", a PDF uploads to the private `cv-uploads` bucket at `{user_id}/{ts}-{rand}.pdf`. The real "CV sent" moment advances the first stage.
3. `POST /api/analyze` validates with zod, downloads and extracts the PDF (`pdf-parse`), truncates to 12,000 characters, inserts an `analyses` row with `status: processing`, then calls OpenAI (`gpt-4o` unless `OPENAI_MODEL` is set) through `generateObject` and waits for the whole report.
4. The row is updated to `completed` (with `result`) or `failed` (with `error_message`). The response returns only after that.
5. The client confirms the status, shows "Your route is ready." and routes to `/analysis/[id]` after 900 ms (300 ms with reduced motion).
6. "Try again" re-posts the stored `cv_text` and `questionnaire` from the failed row, so nothing is re-entered. It creates a new row.

### 1.3 Report shape (`src/lib/schemas.ts`)

```
summary: string
strengths[3]:    { name, score 1-10, evidence, why_it_matters }
career_paths[3]: { title, fit_score 1-100, why_it_fits, why_it_is_realistic,
                   example_job_titles[5], best_for, tradeoff,
                   salary_estimate: { currency, low, high, period: year|hour, basis } | null,   (v2)
                   skills_you_bring[2-6],                                                    (v2)
                   skills_to_build[1-5]: { skill, effort: days|weeks|months, how } }         (v2)
avoid_roles[2-3]: { role_type, reason }
action_plan[7]:   { step 1-7, title, details }
cv_rewrites[2-3]: { before, after, why_better }
confidence_note:  string
```

Reports made before v2 are read through `normalizeAnalysisResult` (missing v2 keys become `null` / `[]`). There is no market median, no responsibilities, no "where these roles are posted", and the plan is 7 days, not week by week.

The questionnaire stores `education_status` as one of five option strings (production format from #17) plus `education_status_other`, `field_of_study` and `expected_graduation`. The prompt targets career changers and calibrates seniority to the CV.

### 1.4 Database and storage

- Tables: `profiles`, `analyses` (`questionnaire jsonb`, `result jsonb`, `status`, `error_message`), `analysis_feedback`.
- RLS: select, insert and update own rows. **No delete policy** on any table.
- Storage: private `cv-uploads` bucket with owner-scoped insert, select and delete.
- Migrations: `001_initial.sql`, `002_cv_uploads_storage_policy.sql`. No `003`.

### 1.5 Auth

- Supabase email and password only. No OAuth, no magic link.
- Signup sends `emailRedirectTo` back through `/auth/callback?next=...` and defaults new accounts to `/new`.
- Post-auth destinations are restricted to same-origin paths (`src/lib/safe-redirect.ts`).
- Session expiry: the `(app)` layout and middleware send signed-out users to `/login?redirect=<path>`. The analysis screen has a "You've been signed out" state that returns to `/new`.

### 1.6 Analytics

- Vercel Web Analytics (`<Analytics />` in the root layout) counts page views.
- `src/lib/analytics.ts` declares all 18 events from brief §9, typed, with a pluggable sink. **No sink is registered**, so in production every event is dropped. PostHog is not installed.
- CTAs carry `data-track="landing_cta_clicked"` and `data-track-location`, read by `TrackClicks`.

| Event | Emitted from |
|---|---|
| `landing_cta_clicked` | `TrackClicks` (hero, nav, final, demo page) |
| `sample_report_viewed` | `landing/lazy-sections.tsx` |
| `sample_tab_switched` | `report/sample-report.tsx` |
| `signup_completed` | `auth/signup-form.tsx` |
| `wizard_started`, `wizard_step_completed`, `wizard_completed` | `wizard/wizard.tsx` |
| `cv_uploaded`, `cv_upload_failed` | `wizard/submit-route.ts`, `wizard/cv-step.tsx` |
| `analysis_started` | `wizard/submit-route.ts`, `analysis/retry.ts` |
| `analysis_completed`, `analysis_failed` | `analysis/analysis-run.tsx` |
| `results_viewed`, `pdf_downloaded`, `plan_task_checked` | `results/results-view.tsx` |
| `results_section_viewed` | `results/section-nav.tsx` |
| `pricing_intent_clicked`, `waitlist_joined` | `results/fake-door.tsx` (flag off) |

### 1.7 Styling, fonts, motion

- Tokens in `src/app/globals.css` (`@theme static`), aliased onto shadcn's semantic names. Contrast fixes from the first audit are in: `ink-faint` darkened to `#5f6a63`, new `edge` token `#7f8980` for control borders. Light only.
- Fonts (`src/app/fonts.ts`): Fraunces (`opsz`, `SOFT`, preloaded) and Fragment Mono (not preloaded) via `next/font/google`. **General Sans is still a stub** (`generalSans = { variable: "" }`), so body text uses the system UI stack. The font file is now at `src/app/fonts/GeneralSans-Variable.woff2` but not wired up.
- Motion: `motion` installed (`motion/react`), tokens in `src/lib/motion.ts` mirrored as CSS easings, CSS-first `pp-*` animation classes, `MotionRoot` with `reducedMotion="user"`. `crossfade()` exists but **is not used anywhere**.
- shadcn style `base-nova` on `@base-ui/react` (not Radix).
- Full rules: `docs/design-system.md`.

### 1.8 Components

- `src/components/pp/`: `Route`, `RouteLine`, `RouteNode`, `NodeDot`, `Waypoint`, `WaypointList`, `ContourField`, `Stat`, `RangeBar`, `MatchMeter`, `KeyHint`, `EmptyState`, `ErrorState`, `MotionRoot`, `OfflineBanner`.
- `src/components/ui/`: accordion, badge, button (+ `button-variants.ts`), card, checkbox (+ row), dialog, dropdown-menu, input, label, logo, progress, radio-group (+ row and chip), separator, skeleton, sonner, tabs, textarea, tooltip.
- Feature folders: `landing/`, `auth/`, `wizard/`, `analysis/`, `report/` (shared by results and the sample report), `results/`, `app/` (header, account menu, delete dialog, journey log).

### 1.9 Health

- Vercel builds: green on #20 and #21.
- At the #20 merge (from the PR description): `tsc`, `eslint`, `next build` pass; Vitest 86 passed, 1 skipped (the live OpenAI test).
- First-load JS at merge, gzipped: landing 149.0 KB (budget 150), dashboard 174.7, `/new` 340.5, `/analysis` 313.3, login 233.3.
- Landing LCP at merge (lab): 0.89 to 1.18 s on a slow mobile profile with 4x CPU slowdown. CLS and INP were not reported. No field data.
- axe-core at merge: no violations on 13 pages at 1440 and 375 (one known false positive on the account menu popup).
- **Not re-run in this audit.** This folder has no `node_modules` yet (`npm ci` needed).
- **Never verified end to end.** Signed-in flows were checked through `/design/*` previews with fixtures and mock submits, not against real Supabase and OpenAI. Brief Phase 3 requires a real account and a real CV.

---

## 2. Brief vs shipped, section by section

Status key: **Done**, **Partial**, **Approved deviation** (agreed in D1 to D10), **Blocked** (needs the owner), **Missing**.

| § | Brief asks | Shipped | Status |
|---|---|---|---|
| 0.2 | Preserve PostHog events, add §9 | No PostHog existed. All 18 events emitted into a typed layer with no sink | **Blocked** (key and policy wording) |
| 0.3 | Only `motion` as a new runtime dependency | `motion` replaced `framer-motion`. No other additions | Done |
| 0.5 | No banned patterns | Scan clean. One arrow, "Better fit →", which the brief allows | Done |
| 0.7 | 360 to 1920, AA, keyboard, focus, reduced motion, no CLS | Checked at merge (axe, keyboard, screenshots) | Done, not re-run |
| 3.1 | Color tokens | In, with two contrast fixes and an `edge` token | Done |
| 3.2 | Fraunces, General Sans, Fragment Mono | Two of three loaded. General Sans file now present, not wired | **Partial** |
| 3.3 | Spacing, radius hierarchy, one shadow, 12-col 1200px grid | Tokens in. Minor: the `(app)` layout uses `max-w-6xl` (1152px) rather than `max-w-page` | Done (minor drift) |
| 3.4 | Motion tokens, one orchestrated moment per page, `layoutId`, page transitions | Tokens, reduced motion and `layoutId` morphs (wizard rail, skill gaps) in. **No page transition at all**: D8 approved a 180 ms crossfade instead of View Transitions, and it was never wired | **Missing** (crossfade) |
| 3.5 | Lucide at 1.5px, no stock imagery | Done | Done |
| 4 | Shared components and restyled primitives | All present, plus `/design` previews | Done |
| 5.1 | Landing | Nav, hero with drawn Route, 40-tabs comparison, how it works, interactive sample report (lazy), who it's for, privacy, 6 FAQs, final CTA, footer | Done, with approved copy deviations (trust line, "seven-day plan", "PDF, or paste the text") |
| 5.2 | Auth split layout, OAuth first, blur validation, confirmation screen with 30 s resend, return to destination | Done. No OAuth exists. Right panel shows the Route only, no `ContourField` (keeps §2's "exactly two places") | Done |
| 5.3 | Wizard rail, one question at a time, time left, rows with number keys, 220 ms auto-advance, Enter / Shift+Enter, Alt/⌘+←, ±24px transitions, autosave, resume toast, review, "Build my route" | All present. Education question uses #17's stored format and waits for Continue when it needs a follow-up | Done |
| 5.4 | Drop zone, drag-over state, progress line, "We found N years", specific errors | Drop zone and errors done. PDF only (5 MB), no DOCX. No pre-submit extraction. Upload happens at submit, so the "Ready" line is a confirmation, not upload progress | Approved deviation |
| 5.5 | Survey Route, real progress, 30 s and 90 s messages, retry without re-entry, resolve into results via view transition | Survey with 6 stages on an honest time curve (no streaming), wait messages, retry, stale detection. 90 s has no "email me" (no email infrastructure). Completion is a hard navigation | **Partial** (no transition; streaming awaiting approval) |
| 5.6 | Header, destination reveal, section nav, terrain map with table alternative, ranked rows, pay bars, skill gaps, plan checkboxes, fake door, PDF | All present. Extras: strengths, roles to skip, CV rewrites, confidence note, feedback widget. Gaps: no Share (reports are private); row detail lacks responsibilities and "where posted" (no data); pay bars have no median or current-pay marker (no data); plan is 7 days; progress is per browser | Done, with approved deviations |
| 5.7 | Journey log, empty state, avatar menu, delete my data | Done. Progress reads "2 of 7 days done". Delete is the policy's email request, with an option to clear browser data now | Done |
| 5.8 | 404, error boundary, offline, session expired, skeletons, rate limit | All but rate limit. Not needed until PR #19 lands; then a 429 would read "The analysis didn't start" | **Partial** |
| 6 | Voice and microcopy | Done. Repo rule: no em dashes in user-facing copy | Done |
| 7 | Accessibility | Done at merge | Done, not re-run |
| 8 | LCP < 2.0 s, CLS < 0.05, INP < 200 ms, landing JS < 150 KB | Landing 149.0 KB, lab LCP about 1 s. CLS and INP not reported, no field data. `/` is rendered per request | **Partial** (measurement) |
| 9 | Analytics events | Emitted, not recorded | **Blocked** |
| 10 | Phase 3: verify end to end with a real account and real CV | Not done (placeholder keys locally) | **Missing** |
| 11 | Definition of done, "remove one accessory" pass | Most items met. The accessory pass isn't recorded anywhere | **Missing** (unrecorded) |

---

## 3. Gaps

### 3.1 Blocked on the owner

1. **General Sans.** The file is now in place. Wiring it is a small code change in `fonts.ts` (Phase 1 below).
2. **PostHog.** Needs `NEXT_PUBLIC_POSTHOG_KEY` and approved Privacy Policy wording. The landing page has about 1 KB of JS budget left, so PostHog has to load after idle or first interaction, with landing events queued.
3. **Fake door.** Off. Even if switched on it records nothing: there is no sink and no storage. The price (`$9 a month`) is a placeholder.
4. **Streaming.** `docs/redesign/proposal-streaming.md` is waiting for a yes or no. It changes `/api/analyze` (not the schema or prompt).
5. **PR #19** ("Harden API against OpenAI cost abuse and basic DDoS"). Open and conflicting with `main`. It edits `/api/analyze` and `middleware.ts`, adds two Upstash dependencies, and introduces 429 responses.
6. **End-to-end verification.** Needs a Vercel preview with real keys, or the owner running the flow in production.

### 3.2 Code gaps (no data changes)

1. **Page crossfade (D8) not wired.** `crossfade()` in `src/lib/motion.ts` is unused and there is no `template.tsx`. Analysis to results jumps.
2. **`/` is rendered per request.** Middleware and the marketing layout both call Supabase `getUser()` on every landing request, only to choose `/new` vs `/signup` and "Dashboard" vs "Sign in". Static rendering would protect LCP. Touches auth plumbing, so it needs approval.
3. **Time estimates disagree.** Signup and the FAQ say "about five minutes"; the wizard's estimator starts at "About 6 min left" (368 s summed across steps).
4. **Rate-limit state.** A `rate_limited` failure kind with a specific message, needed only if PR #19 merges.
5. **Field performance.** CLS and INP were never reported; LCP only in the lab.
6. **Stale docs.** `README.md` describes early-career users, Framer Motion, "the API returns immediately and the client polls" (untrue) and an old folder structure. `HANDOFF.md` describes the legitimacy pass, which is done.
7. **Housekeeping.** `middleware.ts` to `proxy.ts` (Next 16 deprecation; coordinate with #19). The FAQ "no degree" COPY-CHECK can be cleared because its conditions have shipped.

### 3.3 Approved deviations (no action unless reopened)

- 7-day plan instead of week by week (D1).
- PDF or pasted text; no DOCX (would need a new dependency); no "We found N years and N skills" preview.
- No "Email me when it's ready" (no email infrastructure).
- No Share (reports are private, so a link would 404 for anyone else).
- No View Transitions (D8).
- Trust line "Free to use. No credit card." instead of "Free while in beta" (D9; nothing says beta).
- `ContourField` only on the landing hero and results map; auth shows the Route alone.
- Pay bars without median or current-pay markers: the report has no market median and the wizard asks for a pay goal, not current pay.
- Destination detail without responsibilities or "where posted" (no data; see P2).
- Plan progress in localStorage, so it's per browser (D4; see P1).

---

## 4. Plan per phase

Every phase ends with `tsc`, `eslint`, `vitest` and `next build`, a bundle-size comparison, screenshots at 375, 768 and 1440 reviewed against §0, §3 and §6, and one commit.

**Phase 1: Foundation**
- `src/app/fonts.ts`: load `./fonts/GeneralSans-Variable.woff2` with `next/font/local` (`weight: "200 700"`, `adjustFontFallback: "Arial"`, `display: "swap"`). Preload display and body regular only (two files max).
- Re-screenshot every page for reflow; check CLS stays at 0.
- `src/app/(app)/template.tsx` (or the equivalent for the app flow) using `crossfade(reduced)`.
- PostHog sink in `src/lib/analytics.ts`, loaded lazily, cookieless, only once the key and wording are approved. Privacy Policy update in the same commit.

**Phase 2: Landing**
- Copy: align the "five minutes" claims with the estimator.
- If approved: render the marketing pages statically and resolve the signed-in CTA another way.
- Lighthouse mobile runs against production (no new dependencies) for LCP, CLS and a TBT proxy for INP. Re-check the 150 KB budget after fonts and analytics.

**Phase 3: Auth, wizard, upload**
- Copy alignment only.
- End-to-end run on a preview deployment with real keys: sign up, real CV, report, retry path, sign out and back in.

**Phase 4: Analysis and results**
- Crossfade from "Your route is ready." into results.
- `rate_limited` failure state if PR #19 merges.
- If approved: streaming (P4), `plan_progress` (P1), role detail fields (P2), waitlist storage (P3).

**Phase 5: Dashboard, system states, polish**
- Refresh `README.md`, archive or update `HANDOFF.md`, clear resolved COPY-CHECK notes.
- Re-run axe and the keyboard checks.
- Walk the §11 checklist and record the "remove three accessories" pass in the PR.

---

## 5. Data and schema proposals (each needs explicit approval, per brief §0.1)

| # | Change | Unlocks | Cost and risk |
|---|---|---|---|
| P1 | Migration `003`: `analyses.plan_progress jsonb default '{}'` (existing update policy covers it) | Plan progress across devices and on the dashboard: the retention hook | Small. One migration, read and write in the plan component |
| P2 | Per career path: `responsibilities[3-4]`, `where_to_look[2-3]` (nullable, additive) | Full role detail in §5.6 | Longer output, so more latency and timeout risk. Prompt and tests change |
| P3 | `waitlist` table, insert-own RLS | A fake door that records interest | Small. Only worth it if the fake door goes on |
| P4 | Streaming with `streamObject`, same schema | Stages on real events, partial findings during analysis | About a day. Second error path. Overlaps with PR #19's edits |

Not recommended now: week-by-week plan (schema, prompt, UI and landing copy all change); DOCX upload (new dependency); self-serve deletion (needs delete RLS policies, a service-role route and a policy change).

---

## 6. Risks

- **Landing budget.** 149.0 of 150 KB. Any new client code on `/` breaks it. PostHog must load late, with landing events queued until it does.
- **Font swap.** General Sans metrics differ from the system fallback. Without a size-adjusted fallback, text reflows on load; every page needs re-checking.
- **Merge order.** PR #19, streaming, the rate-limit state and the `proxy.ts` rename all touch `/api/analyze` or `middleware.ts`. Decide #19 first.
- **Stuck analyses.** The request is synchronous for up to 300 s. If the browser disconnects and Vercel cancels the function, the row stays `processing` until the 5-minute stale rule marks it stopped. Streaming's save-on-finish has the same question.
- **Unverified production path.** Nothing has been run end to end with real keys since the redesign. A regression in upload, extraction or the v2 schema against OpenAI strict mode would only show up in production.
- **LLM pay figures.** They can be wrong. They carry "estimate" labels and a basis everywhere today; keep that in any new surface.
- **Local environment.** `.env.local` holds placeholders only, so local checks stop at the `/design/*` previews.

---

## 7. Copy claims to verify

| Claim | Where | Status |
|---|---|---|
| "Free to use. No credit card." | Hero, FAQ cost answer | True while there is no pricing. Terms say nothing about fees or beta. Keep unless "beta" is confirmed |
| "The analysis itself usually takes about a minute." | FAQ | Unverified for report v2. Measure from Vercel function durations for `/api/analyze` |
| "About five minutes" | Signup intro, FAQ | Conflicts with the wizard's "About 6 min left" |
| "Detailed reports can take a minute or two" / "up to five minutes" | Analysis wait messages | Consistent with the 300 s limit |
| Privacy blurb (OpenAI API, no training by default, Supabase with owner-only access, not sold, deletion on request) | Landing | Matches Privacy Policy §3 to §5 |
| "No custom events are sent today" | Privacy Policy COPY-CHECK | True now. Must change before PostHog |
| "Saved in your browser" section | Privacy Policy | Matches the localStorage keys (`pp:*`) and the delete dialog |
| "You'll be asked about your education... routes that hire on demonstrated skill are favored" | FAQ | True (education question plus prompt rule). Clear the COPY-CHECK |
| Pay "estimates" | Hero caption, FAQ, pay view, prompt | Consistent |
| "$9 a month" | Fake door config | Placeholder for the owner |
| Metadata and subhead "seven-day plan" | Root layout, landing | Matches the 7-day plan |

---

## 8. Decisions needed before Phase 1

1. **Scope:** gap-closing only (recommended), or a fuller rework of any section.
2. **Data proposals:** yes or no on P1, P2, P3, P4.
3. **Static landing:** approve the auth-plumbing change for `/`.
4. **Owner inputs:** PostHog key and policy wording; is "beta" true; fake-door price and whether to run it.
5. **PR #19:** merge first, rebase later, or close.
6. **Verification:** who runs the end-to-end check (a preview with real keys, or the owner in production).

---

## Appendix: earlier decisions (first Phase 0, approved 2026-10-01)

- **D1:** additive nullable v2 report fields (pay, skills you bring, skills to build); 7-day plan kept.
- **D2:** prompt retargeted to career changers, seniority calibrated to the CV.
- **D3:** typed `lib/analytics.ts` with no sink until a PostHog key and policy wording are approved.
- **D4:** plan progress in localStorage; migration `003` only if asked.
- **D5:** `maxDuration` 300 and stale `processing` (over 5 min) treated as failed with retry.
- **D6:** education question in schema and prompt.
- **D7:** landing under 150 KB initial gzipped JS (framework floor about 132 KB).
- **D8:** 180 ms crossfade only, no experimental View Transitions.
- **D9:** trust line "Free to use. No credit card."
- **D10:** owner supplies `src/app/fonts/GeneralSans-Variable.woff2`; system fallback until then.

---

## Done: PR #19 and Phase 1 (2026-10-02)

Decisions recorded (owner, 2026-10-02): gap-closing only; #19 first; P1 yes, P2 no, P3 yes (fake door stays off), P4 no; static landing yes (Phase 2, verify on a Vercel preview); "Free during beta. No credit card."; one time claim everywhere, measured from Vercel function durations (Phase 2/3); PostHog lazy, with the Privacy Policy change in the same commit.

**Baseline** after `npm ci` on `3ec6c50`: `tsc`, `eslint` clean; Vitest 86 passed, 1 skipped; `next build` passes (needs a `.env.local`; a copy of the example placeholders is enough). Landing initial JS 148.6 KB gzip (noModule polyfill excluded, as at the #20 merge).

**PR #19, merged as `b1d8fbe` (squash), production deploy READY.**
- Rebased onto `main`. Only `package.json` / `package-lock.json` conflicted (kept main's deps plus `@upstash/ratelimit` and `@upstash/redis`, lockfile regenerated).
- Added before merging: `rateLimitResponse()` in `src/lib/ratelimit.ts` fails open (an Upstash error lets the request through instead of a 500 on every page); `smartTruncateCv` only backs up to a boundary in the last 20% of the cutoff (an early "J. Smith" could have dropped most of a CV). Tests for both.
- Upstash env vars are **not set in Vercel**, so both limiters are off in production until `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are added (Vercel Marketplace, Upstash). Once they are, the Privacy Policy should list Upstash (it sees account IDs and IP addresses for rate limiting).

**Rate-limit state (§5.8), branch `gap-closing`, `bb26aca` + `0170a19`.** A 429 from `/api/analyze` or the middleware becomes `rate_limited`: "You've reached the limit for now. To keep PathPilot free during beta, there's a cap on how many routes can be built in a short time. You can try again after 3:42 PM. Your CV and answers are kept." The time comes from `X-RateLimit-Reset`. Previewable at `/design/wizard` (outcome "Rate limited").

**Phase 1, branch `gap-closing`, `63b0b48`.**
- General Sans via `next/font/local` (200 to 700, swap, Arial size-adjusted fallback). Two font preloads (Fraunces, General Sans). Landing CLS 0 in a local run.
- Crossfade (D8): `src/app/(app)/template.tsx`, 180 ms CSS fade when the first app segment changes, 120 ms linear under reduced motion, no animation on hard loads or arrival from the landing page. **Not seen in a browser**: the `(app)` group needs a signed-in session; checked as computed CSS only.
- PostHog: `src/lib/posthog-sink.ts` posts to the capture API (no SDK, no cookies, no autocapture), loaded on idle after the first event, events queued until then. Per-tab random ID in sessionStorage, report IDs scrubbed from paths, `$process_person_profile: false`. Verified in headless Chrome with requests intercepted. **No key was provided** (`[paste key here]`), so it stays off until `NEXT_PUBLIC_POSTHOG_KEY` (and optionally `NEXT_PUBLIC_POSTHOG_HOST`, default US) is set in Vercel.
- Privacy Policy updated in the same commit ("Page and product analytics", PostHog under "Who we share it with", session ID under "Saved in your browser").
- Checks: `tsc`, `eslint` clean; Vitest 100 passed, 1 skipped; `next build` passes.
- Initial JS, gzip, PostHog key set: landing 149.0 KB (budget 150), privacy 148.1, login 232.8, signup 234.1, demo 234.2. The sink is a separate 0.5 KB chunk.
- Screenshots at 375, 768 and 1440 (landing, privacy, login, rate-limited state) reviewed; no reflow issues seen.

**Not pushed.** `gap-closing` is local (3 commits on top of `b1d8fbe`). Next: Phase 2 (copy, static landing on a preview, measured analysis time, beta trust line), then P1 and P3 with Phase 4.
