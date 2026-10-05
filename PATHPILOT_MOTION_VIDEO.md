# PathPilot — Product Motion Film Brief for Claude Code

You are a **senior motion designer** and a **senior front-end engineer** building PathPilot's product launch film in code. The bar is Apple, Linear, Stripe, and Arc launch videos: real UI, precise timing, restrained type, and motion that explains the product instead of decorating it.

This film uses the redesign system in `PATHPILOT_REDESIGN.md`. Read that file first. Its tokens, typefaces, easing, and "the Route" concept are the source of truth here too.

Think through the full storyboard before writing code. Work in phases and show work at each checkpoint.

---

## 0. Ground rules

1. **Tool: Remotion 4** (React + TypeScript), in a self-contained `/video` folder with its own `package.json`. Do not add video dependencies to the main app.
2. **Every animation is frame-driven.** Use `useCurrentFrame`, `interpolate`, `spring`, `Sequence`, `Series`, and `TransitionSeries` only. No CSS transitions, no `motion/react`, no `setTimeout`, no time-based animation. They do not render correctly.
3. **Real UI only.** Recreate PathPilot screens pixel-faithfully from the redesign tokens and components. Import presentational components from the app if they are framework-agnostic; otherwise rebuild them in `/video/src/ui/`. No stock footage, no AI-generated video, no mock phones with reflections, no laptop renders.
4. **Banned:** lens flares, glitch effects, light leaks, particle bursts, RGB split, whoosh-everything transitions, bouncy overshoot on text, typewriter effects on headlines, spinning 3D logos, gradient blobs, emoji.
5. **Sample data is clearly illustrative.** Use the fixture persona below. Never present sample numbers as real platform statistics ("10,000 users", "93% accuracy").
6. **Readability rule:** any line of text holds on screen for at least `0.4s + 0.3s per word` before it moves or leaves.

---

## 1. The film in one sentence

A career changer goes from fog (forty tabs, no direction) to clarity (one route, three destinations, a plan), and the Route line is the thread that carries the eye through the whole thing.

**Emotional arc:** overwhelm → relief → confidence.
**Visual arc:** chaos of rectangles → a single line → a map → the logo.

---

## 2. Specs

| | Master | Social |
|---|---|---|
| Composition | `Film16x9` 1920×1080 | `Film9x16` 1080×1920 |
| Frame rate | 60fps | 30fps re-render |
| Duration | 45s (2700 frames @60) | same cut, re-staged layouts |
| Bonus | `HeroLoop` 1600×1000, 10s, seamless loop, silent — for the landing page hero | — |

- 9:16 is a **re-staged layout**, not a crop. Keep all text and key UI inside a 1080×1500 safe area (top 200px and bottom 220px clear for platform UI).
- Export: H.264 MP4 (CRF 18) for all; also a VP9 WebM for `HeroLoop`.

---

## 3. Visual language

- **Palette, type, radii, easing:** exactly as in the redesign brief (`paper #F3F4EF`, `forest #1F4D3A`, `moss #A9BFA0`, `blaze #E2A92B`, `ink #17211C`; Fraunces / General Sans / Fragment Mono). Load fonts with `@remotion/google-fonts` and `loadFont` from `@remotion/fonts` for local General Sans (`/video/public/fonts/GeneralSans-Variable.woff2`). Block rendering until fonts load (`delayRender`).
- **Easing:** `Easing.bezier(0.22, 1, 0.36, 1)` for entrances, `Easing.bezier(0.65, 0, 0.35, 1)` for the Route and camera. Springs: `{ damping: 200 }` for UI settling (no overshoot). Overshoot is allowed only on the blaze node landing, and only once.
- **Camera:** a single `Camera` wrapper component applies `perspective: 2400px` with animated `translate3d`, `scale`, and a maximum of 6° `rotateX` / 4° `rotateY`. This gives a calm 2.5D product-film feel. The camera is always moving slightly (slow drift of about 0.5% scale per second) so no frame feels frozen, but it never moves faster than the content.
- **Depth:** UI panels sit on paper with the one floating shadow token. Background `ContourField` sits at a deeper Z and parallaxes at 30% of the camera move.
- **Motion blur:** wrap only the two fast moves (tab collapse, final camera pull-back) in `CameraMotionBlur` from `@remotion/motion-blur`, 8 samples. Nowhere else.
- **Cursor:** a real macOS-style arrow cursor, moving on eased bezier paths (never linear), with a subtle 0.94 scale press on click. It appears only in the UI scenes.
- **Kinetic type:** Fraunces at 120–160px for statements. Words enter with a 12px rise + opacity over 18 frames, staggered 3 frames per word. Exit as a full line, never word by word.

---

## 4. Fixture persona (use everywhere)

- **Current:** Operations coordinator · 6 years
- **CV file:** `maria-reyes-cv.pdf` · 214 KB
- **Wizard answers:** "Changing careers" · "Remote or hybrid" · "$90k+" · "Graduated" · "Fewer meetings, more ownership"
- **Destinations:**
  - Product operations manager — 87% — $95k–$125k
  - Customer success manager — 82% — $78k–$110k
  - Implementation specialist — 79% — $72k–$98k
- **You bring:** Process design, Vendor management, SQL basics, Stakeholder communication, Forecasting
- **To close (for Product ops):** Product analytics (≈3 wks), Roadmap tooling (≈1 wk), Experiment design (≈2 wks)
- **Plan:** Week 1: "Rewrite CV around process wins", "List 20 target companies"; Week 2: "Finish product analytics course"…

---

## 5. Storyboard (timings @60fps)

Cut on music beats. Define `BPM` in `/video/src/timing.ts` and a `beat(n)` helper that returns the frame of beat n. Snap every scene boundary and every major hit to a beat. Target track tempo 96–108 BPM. The frame numbers below assume 100 BPM and must be re-snapped to the actual track.

### Scene 1 — "You are here" (0:00–0:04, f0–240)
Empty paper. A single blaze dot fades in at center (spring with one gentle overshoot). A small Fragment Mono label types in beside it — no, not typed — fades in: `Operations coordinator · 6 yrs`. Hold. Silence or a single soft tone.
**Purpose:** establish the person and the brand's signal color before anything else.

### Scene 2 — The fog (0:04–0:09, f240–540)
The camera pulls back. Browser-tab strips multiply around the dot: rectangles in fog and contour colors, each with a realistic search query or site title in General Sans 14px:
"what jobs can I do with operations experience" · "product ops salary remote" · "transferable skills list" · "r/careerguidance — I'm 31 and stuck" · "is a bootcamp worth it" · "customer success vs project manager" … up to about 40.
They arrive faster and faster (accelerating stagger), overlapping, slightly rotated (±3°), pushing the dot into the corner. The frame feels crowded on purpose.
Statement fades in over the chaos, Fraunces 140px: **"Changing careers usually means forty tabs."**

### Scene 3 — One route (0:09–0:13, f540–780)
On a beat hit, every tab collapses toward the dot (motion blur on) and compresses into a single forest line that extends from the blaze dot across the frame — the Route. The paper clears. A faint contour field fades in behind it.
Statement replaces the previous one: **"PathPilot gives you one route."**

### Scene 4 — Upload (0:13–0:18, f780–1080)
The camera follows the Route into the product. The upload screen assembles (panels settle in with a 4-frame stagger). The cursor drags `maria-reyes-cv.pdf` in. Drop zone turns forest, scales 1.01. On drop: the file row appears and its progress line draws as a mini Route. Confirmation fades in: "We found 6 years of experience and 14 skills."
Small caption bottom-left (General Sans 28px, ink-muted): "Start with your CV."

### Scene 5 — The path (0:18–0:25, f1080–1500)
Wizard screen. Left rail: a vertical Route with waypoints. Three questions play quickly (about 1.6s each): the cursor selects an option, the row confirms, and the answer morphs into a chip on the rail (shared-element interpolation of position and scale). The camera glides down the rail as waypoints turn moss. The current waypoint is blaze.
Caption: "Answer a few questions."

### Scene 6 — Surveying (0:25–0:30, f1500–1800)
Analysis screen. The Route draws across a wide canvas with five stage waypoints lighting up in sequence: Reading your experience → Finding transferable skills → Matching roles → Pricing the market → Building your plan. Contour lines emerge beneath the line as it travels, as if the terrain is being surveyed. At "Matching roles", the three role names fade in under the line one at a time.
No percentages. No spinner.

### Scene 7 — The destination (0:30–0:39, f1800–2340)
The survey canvas transforms into the results terrain map (match % on x, salary on y). From the blaze "you are here" node, three branches draw to the destination nodes, staggered by a beat each. Each destination label appears as its branch arrives.
Then a sequence of fast, precise beats, each about 1.2–1.5s, the camera pushing into each part:
1. The Product ops panel: MatchMeter fills to 87%, Fragment Mono figure counts up to `87%` and stops on the beat.
2. Salary RangeBar draws `$95k–$125k` with the median tick.
3. Skill gaps: chips slide into "You bring"; three rows appear under "To close" with effort estimates.
4. Plan: week 1 checkboxes tick (cursor click, check draws as a stroke).
Caption over the first beat: "See where you fit, what it pays, and what to close."

### Scene 8 — The logo (0:39–0:45, f2340–2700)
Hard pull-back (motion blur on). The entire results map shrinks to a small area, and the Route lines from it gather and simplify into the PathPilot wayfinding mark. Everything else clears to paper.
Wordmark in Fraunces fades in beside the mark. Below it, General Sans 40px: **"Know where your experience can take you."** Then `pathpilot.javiertpadilla.com` in Fragment Mono 28px, ink-muted. Hold the final frame for at least 2.5s.

### `HeroLoop` (separate composition, 10s)
Only the Scene 7 map moment, quieter: the blaze node pulses, three branches draw, labels appear, hold, branches retract, repeat. The first and last frames must be identical (verify by rendering both stills and diffing). No captions, no cursor, no camera tilt.

---

## 6. Sound

- The user will place a licensed track at `/video/public/audio/track.mp3`. If it is missing, build to a 100 BPM click (`/video/public/audio/click-100bpm.wav`, generate it) and keep timing configurable.
- Music character: minimal, warm, confident electronic or piano-led; builds from Scene 3 and resolves on Scene 8.
- Optional SFX at `/video/public/audio/sfx/` (user-supplied): soft UI ticks for checkbox and option selection, a low swell under the tab collapse. Keep SFX at least 12 dB under music. No whooshes.
- Fade music out over the final 1.5s. Audio must not clip (peak below −1 dBFS).

---

## 7. File structure

```
/video
  package.json
  remotion.config.ts
  src/
    Root.tsx                 # registers Film16x9, Film9x16, HeroLoop
    timing.ts                # BPM, beat(), scene boundaries
    tokens.ts                # colors, fonts, easing, springs (mirrors app tokens)
    fixtures.ts              # persona data from §4
    components/
      Camera.tsx
      Route.tsx              # frame-driven pathLength drawing
      ContourField.tsx
      Cursor.tsx
      KineticLine.tsx
      Caption.tsx
    ui/                      # pixel-faithful product screens
      UploadScreen.tsx
      WizardScreen.tsx
      AnalysisScreen.tsx
      ResultsMap.tsx
      ResultsPanels.tsx
    scenes/
      S1YouAreHere.tsx … S8Logo.tsx
    films/
      Film16x9.tsx
      Film9x16.tsx
      HeroLoop.tsx
  public/
    fonts/  audio/  logo/
```

Scenes take a `layout: "landscape" | "portrait"` prop so the 9:16 film re-stages instead of cropping.

---

## 8. Execution phases

**Phase 0 — Storyboard frames (no animation).**
Set up Remotion and tokens. Build each scene's key frame as a static layout. Render one still per scene with `npx remotion still` for both 16:9 and 9:16. Show them and critique against §0 and §3. Wait for approval.

**Phase 1 — Animatic.**
Full timing with blocking only: elements enter and exit in the right place and time, linear-ish placeholder motion, click track audio. Render a 30fps preview MP4. Check every text hold against the readability rule.

**Phase 2 — Final motion.**
Apply real easing, springs, camera, parallax, cursor paths, morphs, and motion blur. Snap to the real track.

**Phase 3 — Variants and polish.**
Re-stage the 9:16 film. Build `HeroLoop` and verify the seamless loop. Final audio mix. Render all deliverables.

After each phase, render stills at key moments (the first frame of each scene, plus frames 2400 and 2699) and view them. Fix anything that looks like a template before moving on.

---

## 9. Render commands (put in `package.json` scripts)

```bash
npm run studio          # npx remotion studio
npm run render:master   # npx remotion render Film16x9 out/pathpilot-16x9.mp4 --codec=h264 --crf=18
npm run render:social   # npx remotion render Film9x16 out/pathpilot-9x16.mp4 --codec=h264 --crf=18 --fps=30
npm run render:loop     # npx remotion render HeroLoop out/hero-loop.mp4 --codec=h264 --crf=20 && npx remotion render HeroLoop out/hero-loop.webm --codec=vp9
```

---

## 10. Definition of done

- [ ] Someone with the sound off understands what PathPilot does by second 13.
- [ ] The Route is visibly one continuous thread from Scene 1 to the logo.
- [ ] Every UI screen matches the redesign tokens exactly; nothing looks like a generic mockup.
- [ ] No banned effect from §0.4 appears anywhere.
- [ ] Every text line passes the readability hold rule.
- [ ] All scene boundaries land on beats of the actual track.
- [ ] The 9:16 version is re-staged with all text inside the safe area.
- [ ] `HeroLoop` first and last frames are identical.
- [ ] Final pass: name three things that could be removed without losing meaning, and remove them.
