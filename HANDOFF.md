# PathPilot — Legitimacy Pass Handoff

Scope: ship Privacy Policy, Terms of Service, a real footer, and an in-product
data disclosure. This is intentionally decoupled from the UI redesign — it's
copy + trust-signal work, not aesthetic work, so it can ship this week while
the design direction is still being decided. The pages are styled to match
the *current* site so nothing looks out of place; restyle them whenever the
redesign lands.

## Files to add

1. `src/app/(marketing)/privacy/page.tsx` — new file, full content included
2. `src/app/(marketing)/terms/page.tsx` — new file, full content included
3. `src/app/(marketing)/layout.tsx` — replaces the existing file (adds a real
   footer with Privacy/Terms/Contact links; header logic is unchanged)

## Placeholders — all resolved

- [x] `CONTACT_EMAIL` — set to `jvra0102@gmail.com` in `privacy/page.tsx`,
      `terms/page.tsx`, and the footer's `mailto:` link.
- [x] Footer builder credit links to `https://pathpilot.javiertpadilla.com`.
- [x] `GOVERNING_LAW` in `terms/page.tsx` — set to "the State of California,
      United States." This is fine to use even though you're currently in
      Mexico — governing law in a ToS is typically tied to where the
      operator has legal residence/domicile, not physical location day to
      day. Worth a quick double-check with a local resource (or a cheap
      Termly/Rocket Lawyer review) if PathPilot ever takes on real users at
      scale, since cross-border operator situations can get more nuanced
      than a template covers.

Nothing left blocking a clean ship.

## One code change: CV upload disclosure

Add a short data-use disclosure right at the point of anxiety — where the
user is about to hand over their CV — rather than only in the Privacy Policy
nobody reads. In `src/app/(app)/new/page.tsx`, inside the `StepCV` component,
add this directly under the intro paragraph (after the `<p>` that starts
"We'll analyze your experience..."):

```tsx
<p className="text-xs text-muted-foreground/80 mb-6">
  Your CV is processed by OpenAI to generate this analysis. We don&apos;t
  sell your data.{" "}
  <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
    Privacy Policy
  </Link>
</p>
```

This requires adding `import Link from "next/link";` to the top of that file
if it isn't already imported (it currently isn't — `new/page.tsx` doesn't
import `Link`).

## Not in scope for this pass (flag for later)

- **Account deletion flow.** The Privacy Policy promises deletion "within 30
  days" via emailing support. There's no self-serve delete button in the
  codebase yet. Manual-via-email is an honest, acceptable starting point —
  but it's the highest-leverage next feature for actually backing up what
  the policy claims.
- **Cookie/analytics disclosure.** Both pages currently state PathPilot uses
  no analytics or tracking. If analytics (Vercel Analytics, PostHog, etc.)
  gets added later, both pages need a cookie section added and this file
  should be revisited.
- **Legal review.** This is a solid, honest baseline — not a substitute for
  an actual lawyer if PathPilot ever takes payments or scales past a
  personal project.
