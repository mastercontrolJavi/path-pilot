import type { ReactNode } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ContourField } from "@/components/pp/contour-field";
import { KeyHint } from "@/components/pp/key-hint";
import { Stat } from "@/components/pp/stat";
import { EmptyState, ErrorState } from "@/components/pp/states";
import { NodeDot } from "@/components/pp/waypoint";
import { duration, ease, spring } from "@/lib/motion";
import {
  AccordionDemo,
  BranchingDemo,
  ColorSwatches,
  ContrastTable,
  DataDemo,
  HeroRouteDemo,
  LoadingButton,
  OverlaysDemo,
  RadioRowsDemo,
  RailDemo,
  SmallChoicesDemo,
  StepTransitionDemo,
  SurveyDemo,
  TabsDemo,
} from "./demos";

const SECTIONS = [
  ["color", "Color"],
  ["type", "Type"],
  ["shape", "Space and shape"],
  ["motion", "Motion"],
  ["buttons", "Buttons"],
  ["fields", "Fields"],
  ["choices", "Choices"],
  ["tabs", "Tabs"],
  ["overlays", "Overlays"],
  ["feedback", "Feedback"],
  ["route", "The Route"],
  ["data", "Data"],
] as const;

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-contour py-14">
      <div className="mb-8 max-w-[68ch]">
        <h2 id={`${id}-title`} className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {note && <p className="mt-2 text-base text-ink-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Specimen({ caption, children, className }: { caption: string; children: ReactNode; className?: string }) {
  return (
    <figure className={className}>
      <figcaption className="mb-3 text-xs text-ink-muted">{caption}</figcaption>
      {children}
    </figure>
  );
}

const variants = ["primary", "secondary", "quiet", "destructive"] as const;

export default function DesignPage() {
  return (
    <div className="mx-auto w-full max-w-page px-4 pb-24 sm:px-6">
      <header className="pt-16 pb-10">
        <p className="text-sm text-ink-muted">PathPilot, internal</p>
        <h1 className="mt-2 font-display text-3xl font-[400] tracking-[-0.02em] text-ink">Design system</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-ink-muted">
          Every token and shared component in its states. The Route carries the boldness; everything
          around it stays quiet.
        </p>
        <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-forest">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Section id="color" title="Color" note="A cool survey-map paper, green-black ink, one action color, and one signal used only for “you are here”.">
        <ColorSwatches />
        <h3 className="mt-12 mb-4 text-base font-medium text-ink">Contrast, measured live</h3>
        <p className="mb-4 max-w-[68ch] text-sm text-ink-muted">
          Two brief values were adjusted: ink-faint (#85908A measured 2.99:1) is now darker, and control edges
          use a new edge token because contour (1.3:1) is too faint for an input boundary. Blaze and moss
          nodes always carry a forest ring.
        </p>
        <ContrastTable />
      </Section>

      <Section id="type" title="Type" note="Fraunces for display, General Sans for everything else, Fragment Mono for data only.">
        <div className="flex flex-col gap-10">
          <Specimen caption="Hero — Fraunces, clamp(44–80px), weight 400, −0.02em">
            <p className="max-w-[16ch] font-display text-hero font-[400] text-ink">
              You know you want out. Here&apos;s where you can go.
            </p>
          </Specimen>
          <div className="grid gap-10 md:grid-cols-2">
            <Specimen caption="Destination — 3xl, 44px, weight 420">
              <p className="font-display text-3xl font-[420] tracking-[-0.015em] text-ink">Product operations manager</p>
            </Specimen>
            <Specimen caption="Page title — 2xl, 30px">
              <p className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink">Your route</p>
              <Specimen caption="Section title — xl, 22px" className="mt-6">
                <p className="font-display text-xl font-[420] text-ink">Skill gaps</p>
              </Specimen>
            </Specimen>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <Specimen caption="Lead — General Sans 18px">
              <p className="max-w-[52ch] text-lg text-ink-muted">
                Upload your CV. PathPilot maps the roles your experience already fits and a plan to get there.
              </p>
            </Specimen>
            <Specimen caption="Body — 16px / 1.6, max 68ch">
              <p className="max-w-[68ch] text-base text-ink">
                Your operations background shows up most clearly in how you run handoffs between teams. That is
                the core of product operations, and it is rarer than the job titles suggest.
              </p>
              <p className="mt-3 text-sm text-ink-muted">Secondary — 14px. Meta and helper text.</p>
              <p className="mt-1 text-xs text-ink-faint">Meta — 12px, ink-faint.</p>
            </Specimen>
          </div>
          <Specimen caption="Data — Fragment Mono, tabular figures">
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <Stat label="Typical pay" low={95000} high={125000} size="lg" />
              <Stat label="Match" value="87%" size="lg" />
              <Stat label="Generated" value="Oct 2, 2026" size="lg" />
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="shape" title="Space and shape" note="4px grid. Radius encodes hierarchy. Hairlines do the structural work; one shadow for floating layers only.">
        <div className="grid gap-12 lg:grid-cols-3">
          <Specimen caption="Spacing scale (px)">
            <ul className="flex flex-col gap-2">
              {[4, 8, 12, 16, 24, 32, 48, 80, 128].map((n) => (
                <li key={n} className="flex items-center gap-3">
                  <span className="w-8 font-mono text-xs text-ink-muted">{n}</span>
                  <span className="h-3 rounded-[2px] bg-moss" style={{ width: n }} />
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen caption="Radius">
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid size-20 place-items-center rounded-control border border-contour bg-sheet text-xs text-ink-muted">8 control</div>
              <div className="grid size-20 place-items-center rounded-panel border border-contour bg-sheet text-xs text-ink-muted">14 panel</div>
              <div className="grid size-20 place-items-center rounded-feature border border-contour bg-sheet text-xs text-ink-muted">20 feature</div>
              <div className="grid h-8 place-items-center rounded-full bg-moss/45 px-3 text-xs text-ink">chip</div>
            </div>
          </Specimen>
          <Specimen caption="Elevation">
            <div className="flex gap-4">
              <div className="flex h-24 flex-1 items-end rounded-panel border border-contour bg-sheet p-3 text-xs text-ink-muted">Panel: hairline only</div>
              <div className="flex h-24 flex-1 items-end rounded-panel border border-contour bg-sheet p-3 text-xs text-ink-muted shadow-float">Floating layer</div>
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="motion" title="Motion" note="One orchestrated moment per page. Everything else answers a person's action. Transform, opacity, dash offset and clip-path only.">
        <div className="grid gap-12 lg:grid-cols-2">
          <Specimen caption="Tokens (src/lib/motion.ts)">
            <table className="w-full text-left text-sm">
              <tbody>
                {Object.entries(duration).map(([k, v]) => (
                  <tr key={k} className="border-b border-contour/70">
                    <td className="py-2 pr-4 text-ink">duration.{k}</td>
                    <td className="py-2 font-mono text-ink-muted">{v * 1000}ms</td>
                  </tr>
                ))}
                {Object.entries(ease).map(([k, v]) => (
                  <tr key={k} className="border-b border-contour/70">
                    <td className="py-2 pr-4 text-ink">ease.{k}</td>
                    <td className="py-2 font-mono text-ink-muted">[{v.join(", ")}]</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-4 text-ink">spring</td>
                  <td className="py-2 font-mono text-ink-muted">
                    {spring.stiffness} / {spring.damping} / {spring.mass}
                  </td>
                </tr>
              </tbody>
            </table>
          </Specimen>
          <Specimen caption="Step transition (−24px out, +24px in; reverses on Back; fades only with reduced motion)">
            <StepTransitionDemo />
          </Specimen>
        </div>
      </Section>

      <Section id="buttons" title="Buttons" note="One primary per view. Press scales to 0.98, no bounce. No arrows appended.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-xs text-ink-muted">
                <th className="font-normal">Variant</th>
                <th className="font-normal">Default</th>
                <th className="font-normal">Focus</th>
                <th className="font-normal">Disabled</th>
                <th className="font-normal">Loading</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v}>
                  <td className="pr-4 text-sm text-ink capitalize">{v}</td>
                  <td className="pr-4"><Button variant={v}>Build my route</Button></td>
                  <td className="pr-4">
                    <Button variant={v} className="outline-2 outline-offset-2 outline-forest outline-solid">
                      Build my route
                    </Button>
                  </td>
                  <td className="pr-4"><Button variant={v} disabled>Build my route</Button></td>
                  <td><LoadingButton variant={v} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button variant="secondary" size="icon" aria-label="Download">
            <Download />
          </Button>
          <Button variant="quiet">
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          <Button variant="link">Read the privacy policy</Button>
        </div>
      </Section>

      <Section id="fields" title="Fields" note="Validation on blur. Errors say what's wrong and how to fix it.">
        <div className="grid max-w-3xl gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="d-email">Email</Label>
            <Input id="d-email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="d-loc">Where do you want to work?</Label>
            <Input id="d-loc" defaultValue="Remote, US East Coast" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="d-err">Email</Label>
            <Input id="d-err" type="email" defaultValue="maya@" aria-invalid aria-describedby="d-err-msg" />
            <p id="d-err-msg" className="text-sm text-danger">
              Add the part after the @, like maya@example.com.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="d-dis">Disabled</Label>
            <Input id="d-dis" disabled defaultValue="Locked while we read your CV" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="d-ta">What do you want to avoid in your next role?</Label>
            <Textarea id="d-ta" placeholder="Cold calling, night shifts, managing a large team…" />
            <p className="flex items-center gap-2 text-xs text-ink-muted">
              <KeyHint>↵</KeyHint> to continue, <KeyHint>Shift ↵</KeyHint> for a new line
            </p>
          </div>
        </div>
      </Section>

      <Section id="choices" title="Choices" note="Single-choice answers are full-width rows with a number shortcut. The row confirms with a check and a forest edge.">
        <div className="flex flex-col gap-10">
          <RadioRowsDemo />
          <SmallChoicesDemo />
        </div>
      </Section>

      <Section id="tabs" title="Tabs">
        <TabsDemo />
      </Section>

      <Section id="overlays" title="Overlays" note="Dialogs, toasts and tooltips are the only things that float.">
        <OverlaysDemo />
      </Section>

      <Section id="feedback" title="Feedback" note="Every empty, loading and error state says what happened and offers one action.">
        <div className="grid gap-12 lg:grid-cols-2">
          <Specimen caption="Skeleton, shaped like a destination row">
            <div className="flex flex-col gap-4 rounded-panel border border-contour bg-sheet p-5">
              <Skeleton className="h-7 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-2 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </Specimen>
          <Specimen caption="Accordion">
            <AccordionDemo />
          </Specimen>
          <Specimen caption="Empty state">
            <EmptyState
              title="Your first route starts with your CV"
              description="Upload it and answer a few questions. You'll get roles you fit, what they pay, and a plan."
              action={<Button>Start a new route</Button>}
            />
          </Specimen>
          <Specimen caption="Error state">
            <ErrorState
              title="We couldn't read text in that PDF"
              description="It may be a scanned image. Export it as a text PDF, or paste your CV text instead."
              action={<Button variant="secondary">Choose another file</Button>}
            />
          </Specimen>
        </div>
      </Section>

      <Section id="route" title="The Route" note="One line, everywhere: drawn on the landing hero, threading the wizard rail, surveying during analysis, connecting destinations on results.">
        <div className="flex flex-col gap-14">
          <Specimen caption="Node states">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink">
              {(["done", "current", "upcoming", "destination"] as const).map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <NodeDot state={s} size={22} />
                  <span className="capitalize">{s}</span>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen caption="Hero — draws once in 1.4s; nodes appear as the line reaches them">
            <HeroRouteDemo />
          </Specimen>
          <Specimen caption="Map — branches from “you are here”; focus a destination to thicken its branch">
            <BranchingDemo />
          </Specimen>
          <div className="grid gap-14 lg:grid-cols-[320px_1fr]">
            <Specimen caption="Rail — the wizard path; answered waypoints jump back">
              <RailDemo />
            </Specimen>
            <Specimen caption="Survey — analysis stages advance along the line">
              <SurveyDemo />
            </Specimen>
          </div>
          <Specimen caption="ContourField — static, seeded, 8% opacity. Landing hero and results map only.">
            <div className="relative h-64 overflow-hidden rounded-panel border border-contour bg-paper">
              <ContourField className="absolute inset-0 size-full" />
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="data" title="Data" note="Forest, moss and contour only. Figures in Fragment Mono.">
        <DataDemo />
      </Section>
    </div>
  );
}
