"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem, RadioGroupRow } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Route, RouteLine, RouteNode } from "@/components/pp/route";
import { Waypoint, WaypointList } from "@/components/pp/waypoint";
import { ContourField } from "@/components/pp/contour-field";
import { MatchMeter } from "@/components/pp/match-meter";
import { RangeBar } from "@/components/pp/range-bar";
import { KeyHint } from "@/components/pp/key-hint";
import { stepVariants, useReducedMotion } from "@/lib/motion";
import { formatMoneyRange } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Color                                                               */
/* ------------------------------------------------------------------ */

const TOKENS = [
  ["paper", "Page background"],
  ["sheet", "Raised surfaces: panels, inputs, popovers"],
  ["fog", "Subtle fills, hover rows, skeletons"],
  ["contour", "Hairlines and contour lines (decorative)"],
  ["edge", "Control edges (≥3:1)"],
  ["ink", "Primary text"],
  ["ink-muted", "Secondary text"],
  ["ink-faint", "Meta text"],
  ["forest", "Primary actions, the Route, focus"],
  ["forest-deep", "Primary hover and pressed"],
  ["moss", "Completed waypoints, chart fills"],
  ["blaze", "You are here, once per screen"],
  ["danger", "Errors"],
  ["success", "Confirmation"],
] as const;

function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const c = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Token values come from the live stylesheet, read once on the client.
let tokenSnapshot: Record<string, string> | null = null;
const NO_TOKENS: Record<string, string> = {};
// Notify once after hydration so React swaps the empty server snapshot for real values.
const subscribeOnce = (onChange: () => void) => {
  const id = requestAnimationFrame(onChange);
  return () => cancelAnimationFrame(id);
};

function useTokens() {
  return useSyncExternalStore(
    subscribeOnce,
    () => (tokenSnapshot ??= Object.fromEntries(TOKENS.map(([name]) => [name, readToken(name)]))),
    () => NO_TOKENS
  );
}

export function ColorSwatches() {
  const values = useTokens();
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      {TOKENS.map(([name, role]) => (
        <li key={name} className="flex items-start gap-3">
          <span
            className="size-11 shrink-0 rounded-control border border-contour"
            style={{ backgroundColor: `var(--color-${name})` }}
          />
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium text-ink">{name}</span>
            <span className="font-mono text-xs text-ink-faint uppercase">{values[name] ?? "…"}</span>
            <span className="text-xs text-ink-muted">{role}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const PAIRS: [fg: string, bg: string, min: number, use: string][] = [
  ["ink", "paper", 4.5, "Body text"],
  ["ink", "sheet", 4.5, "Text on panels"],
  ["ink-muted", "paper", 4.5, "Secondary text"],
  ["ink-muted", "fog", 4.5, "Secondary text on hover rows"],
  ["ink-faint", "paper", 4.5, "Meta text"],
  ["ink-faint", "sheet", 4.5, "Meta text on panels"],
  ["ink-faint", "fog", 4.5, "Meta text on fills"],
  ["sheet", "forest", 4.5, "Primary button label"],
  ["sheet", "forest-deep", 4.5, "Primary button, pressed"],
  ["forest", "paper", 4.5, "Links"],
  ["danger", "paper", 4.5, "Error text"],
  ["danger", "sheet", 4.5, "Error text on panels"],
  ["success", "paper", 4.5, "Success text"],
  ["ink", "moss", 4.5, "Text on moss chips"],
  ["edge", "sheet", 3, "Input border (non-text)"],
  ["edge", "fog", 3, "Input border on fog (non-text)"],
  ["forest", "paper", 3, "Focus ring, Route line (non-text)"],
  ["forest-deep", "blaze", 3, "Ring around the blaze node (non-text)"],
];

export function ContrastTable() {
  const values = useTokens();
  const ready = Object.keys(values).length > 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-contour text-ink-muted">
            <th className="py-2 pr-4 font-medium">Pair</th>
            <th className="py-2 pr-4 font-medium">Use</th>
            <th className="py-2 pr-4 font-medium">Needs</th>
            <th className="py-2 pr-4 font-medium">Ratio</th>
            <th className="py-2 font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map(([fg, bg, min, use]) => {
            const r = ready ? ratio(values[fg], values[bg]) : 0;
            const pass = r >= min;
            return (
              <tr key={`${fg}-${bg}-${min}`} className="border-b border-contour/70">
                <td className="py-2 pr-4">
                  <span
                    className="inline-flex items-center gap-2 rounded-[6px] border border-contour px-2 py-1"
                    style={{ backgroundColor: `var(--color-${bg})`, color: `var(--color-${fg})` }}
                  >
                    {fg} on {bg}
                  </span>
                </td>
                <td className="py-2 pr-4 text-ink-muted">{use}</td>
                <td className="py-2 pr-4 font-mono">{min}:1</td>
                <td className="py-2 pr-4 font-mono">{ready ? `${r.toFixed(2)}:1` : "…"}</td>
                <td className={cn("py-2 font-medium", pass ? "text-success" : "text-danger")}>
                  {ready ? (pass ? "Pass" : "Fail") : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

const STEPS = [
  { q: "What kind of work do you want to leave behind?", help: "So we don't route you back into it." },
  { q: "Where do you want to work?", help: "Pay and openings depend on the market." },
  { q: "What's your education status?", help: "Some routes ask for a degree; many don't." },
];

export function StepTransitionDemo() {
  const reduced = useReducedMotion();
  const [[step, dir], setStep] = useState<[number, number]>([0, 1]);
  const go = (delta: number) =>
    setStep(([s]) => [Math.min(STEPS.length - 1, Math.max(0, s + delta)), delta]);

  return (
    <div className="overflow-hidden rounded-panel border border-contour bg-sheet p-6">
      <div className="relative min-h-[96px]" aria-live="polite">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            variants={stepVariants(reduced)}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <p className="font-display text-2xl font-[400] text-ink">{STEPS[step].q}</p>
            <p className="mt-2 text-sm text-ink-muted">{STEPS[step].help}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="quiet" onClick={() => go(-1)} disabled={step === 0}>
          Back
        </Button>
        <span className="text-xs text-ink-muted">
          {step + 1} of {STEPS.length}
        </span>
        <Button onClick={() => go(1)} disabled={step === STEPS.length - 1}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export function LoadingButton({ variant }: { variant: "primary" | "secondary" | "quiet" | "destructive" }) {
  return (
    <Button variant={variant} disabled aria-busy>
      <Loader2 className="animate-spin" />
      Saving
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Choices                                                             */
/* ------------------------------------------------------------------ */

export function RadioRowsDemo() {
  return (
    <RadioGroup defaultValue="graduated" aria-label="Education status" className="max-w-xl">
      <RadioGroupRow value="enrolled" hint={<KeyHint>1</KeyHint>}>
        Currently studying
      </RadioGroupRow>
      <RadioGroupRow value="graduated" hint={<KeyHint>2</KeyHint>}>
        Graduated
      </RadioGroupRow>
      <RadioGroupRow value="no_degree" hint={<KeyHint>3</KeyHint>}>
        No degree
      </RadioGroupRow>
      <RadioGroupRow value="disabled" disabled hint={<KeyHint>4</KeyHint>}>
        Disabled option
      </RadioGroupRow>
    </RadioGroup>
  );
}

export function SmallChoicesDemo() {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-6">
      <RadioGroup defaultValue="remote" aria-label="Work setting" className="w-auto gap-3">
        {[
          ["remote", "Remote"],
          ["hybrid", "Hybrid"],
          ["onsite", "On site"],
        ].map(([value, label]) => (
          <Label key={value} className="cursor-pointer gap-3 font-normal">
            <RadioGroupItem value={value} />
            {label}
          </Label>
        ))}
      </RadioGroup>
      <div className="flex flex-col gap-3">
        <Label className="cursor-pointer gap-3 font-normal">
          <Checkbox /> Unchecked
        </Label>
        <Label className="cursor-pointer gap-3 font-normal">
          <Checkbox defaultChecked /> Checked
        </Label>
        <Label className="gap-3 font-normal">
          <Checkbox disabled /> Disabled
        </Label>
        <Label className="gap-3 font-normal">
          <Checkbox disabled defaultChecked /> Disabled, checked
        </Label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export function TabsDemo() {
  return (
    <div className="flex flex-col gap-10">
      <Tabs defaultValue="destinations">
        <TabsList aria-label="Report sections">
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="pay">Pay</TabsTrigger>
          <TabsTrigger value="gaps">Skill gaps</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="destinations" className="text-ink-muted">Three roles your experience already fits.</TabsContent>
        <TabsContent value="pay" className="text-ink-muted">What each role pays where you want to work.</TabsContent>
        <TabsContent value="gaps" className="text-ink-muted">The skills between you and each role.</TabsContent>
        <TabsContent value="plan" className="text-ink-muted">Your first seven days, one task at a time.</TabsContent>
      </Tabs>
      <Tabs defaultValue="year">
        <TabsList variant="track" aria-label="Pay period">
          <TabsTrigger value="year">Yearly</TabsTrigger>
          <TabsTrigger value="hour">Hourly</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays                                                            */
/* ------------------------------------------------------------------ */

export function OverlaysDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger render={<Button variant="secondary" />}>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a new route?</DialogTitle>
            <DialogDescription>
              Your current report stays in your journey log. The new route starts from your CV again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="quiet" />}>Cancel</DialogClose>
            <DialogClose render={<Button />}>Start a new route</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="secondary" onClick={() => toast.success("Answer saved")}>
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.error("Upload didn't finish", { description: "Check your connection, then try again. Your file is still here." })
        }
      >
        Error toast
      </Button>
      <Button variant="secondary" onClick={() => toast("Picked up where you left off")}>
        Neutral toast
      </Button>

      <Tooltip>
        <TooltipTrigger render={<Button variant="quiet" size="icon" aria-label="How match is calculated" />}>
          <Info />
        </TooltipTrigger>
        <TooltipContent>How closely your experience lines up with the role</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function AccordionDemo() {
  return (
    <Accordion className="max-w-2xl">
      <AccordionItem value="time">
        <AccordionTrigger>How long does it take?</AccordionTrigger>
        <AccordionContent>
          <p>About five minutes of questions, then the analysis usually takes 30–60 seconds.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="markets">
        <AccordionTrigger>Which countries does it work for?</AccordionTrigger>
        <AccordionContent>
          <p>Any location you name. Pay figures are estimates for that location, not live market data.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export function ReplayFrame({ children, label = "Replay" }: { children: (key: number) => React.ReactNode; label?: string }) {
  const [key, setKey] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      {children(key)}
      <div>
        <Button variant="quiet" size="sm" onClick={() => setKey((k) => k + 1)}>
          {label}
        </Button>
      </div>
    </div>
  );
}

export function HeroRouteDemo() {
  return (
    <ReplayFrame label="Replay drawing">
      {(key) => (
        <Route
          key={key}
          variant="hero"
          width={640}
          height={180}
          points={[
            { x: 24, y: 140 },
            { x: 190, y: 120 },
            { x: 330, y: 60 },
            { x: 470, y: 90 },
            { x: 616, y: 36 },
          ]}
          activeIndex={0}
          animateOnMount
          stateOf={(i) => (i === 0 ? "current" : i === 4 ? "destination" : "upcoming")}
          label="Route from where you are to a destination role"
          className="h-auto w-full max-w-2xl"
        />
      )}
    </ReplayFrame>
  );
}

const ROLES = [
  { title: "Product operations manager", match: 87, low: 95000, high: 125000 },
  { title: "Customer success manager", match: 82, low: 78000, high: 110000 },
  { title: "Implementation specialist", match: 79, low: 72000, high: 98000 },
];

/** Branching composition (as on the hero and the results terrain map). */
export function BranchingDemo() {
  const [focus, setFocus] = useState<number | null>(null);
  const origin = { x: 60, y: 250 };
  const fork = { x: 200, y: 236 };
  const dest = [
    { x: 560, y: 70 },
    { x: 520, y: 170 },
    { x: 470, y: 260 },
  ];
  // Branches leave the fork nearly level, then bend toward their destination, so they never cross.
  const branch = (d: { x: number; y: number }) => [
    fork,
    { x: fork.x + (d.x - fork.x) * 0.45, y: fork.y + (d.y - fork.y) * 0.25 },
    d,
  ];
  return (
    <ReplayFrame label="Replay drawing">
      {(key) => (
        <div key={key} className="relative overflow-hidden rounded-panel border border-contour bg-paper">
          <ContourField className="absolute inset-0 size-full" seed={23} width={640} height={320} />
          <svg viewBox="0 0 640 320" className="relative h-auto w-full" role="img" aria-label="Routes to three roles">
            <RouteLine
              variant="hero"
              animateOnMount
              points={[origin, { x: 130, y: 247 }, fork]}
              style={{ "--route-duration": "0.5s" } as React.CSSProperties}
            />
            {dest.map((d, i) => (
              <RouteLine
                key={i}
                variant="hero"
                animateOnMount
                points={branch(d)}
                className={cn(
                  "transition-[opacity,stroke-width] duration-[180ms]",
                  focus !== null && focus !== i && "opacity-30",
                  focus === i && "[stroke-width:3]"
                )}
                style={{ "--route-duration": "0.9s", animationDelay: `${0.5 + i * 0.12}s` } as React.CSSProperties}
              />
            ))}
            <RouteNode x={origin.x} y={origin.y} state="current" r={7} />
            {dest.map((d, i) => (
              <RouteNode key={i} x={d.x} y={d.y} state="destination" r={7} revealDelay={1.4 + i * 0.12} />
            ))}
          </svg>
          <ul className="relative grid gap-px border-t border-contour bg-contour sm:grid-cols-3">
            {ROLES.map((role, i) => (
              <li key={role.title} className="bg-sheet">
                <button
                  type="button"
                  onMouseEnter={() => setFocus(i)}
                  onMouseLeave={() => setFocus(null)}
                  onFocus={() => setFocus(i)}
                  onBlur={() => setFocus(null)}
                  className="flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left [--focus-offset:-2px] hover:bg-fog"
                >
                  <span className="font-display text-base text-ink">{role.title}</span>
                  <span className="flex gap-3 font-mono text-sm text-ink-muted">
                    <span>{role.match}% match</span>
                    <span>{formatMoneyRange(role.low, role.high)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ReplayFrame>
  );
}

const STAGES = [
  "Reading your experience",
  "Finding your strengths",
  "Matching roles",
  "Estimating pay",
  "Building your plan",
];

export function SurveyDemo() {
  const [active, setActive] = useState(2);
  const points = STAGES.map((_, i) => ({ x: 30 + i * 145, y: i % 2 === 0 ? 46 : 26 }));
  return (
    <div className="flex flex-col gap-4">
      <Route
        variant="survey"
        width={640}
        height={72}
        points={points}
        activeIndex={active}
        label={`Analysis progress: ${STAGES[active]}`}
        className="h-auto w-full max-w-2xl"
      />
      <ol className="grid max-w-2xl grid-cols-5 gap-2 text-xs">
        {STAGES.map((s, i) => (
          <li key={s} className={cn(i === active ? "font-medium text-ink" : i < active ? "text-ink" : "text-ink-muted")}>
            {s}
          </li>
        ))}
      </ol>
      <label className="flex max-w-sm items-center gap-3 text-sm text-ink-muted">
        Stage
        <input
          type="range"
          min={0}
          max={STAGES.length - 1}
          value={active}
          onChange={(e) => setActive(Number(e.target.value))}
          className="flex-1 accent-forest"
        />
      </label>
    </div>
  );
}

export function RailDemo() {
  const [current, setCurrent] = useState(2);
  const items = [
    { label: "Your CV", answer: "cv-2026.pdf" },
    { label: "How you like to work", answer: "Structured, Analytical" },
    { label: "What matters most", answer: null },
    { label: "What you enjoy", answer: null },
    { label: "Review", answer: null },
  ];
  return (
    <WaypointList className="w-[280px]" aria-label="Questions">
      {items.map((item, i) => (
        <Waypoint
          key={item.label}
          state={i < current ? "done" : i === current ? "current" : "upcoming"}
          label={item.label}
          last={i === items.length - 1}
          onSelect={i < current ? () => setCurrent(i) : undefined}
        >
          {i < current && item.answer && (
            <span className="w-fit max-w-full truncate rounded-full bg-moss/45 px-2.5 py-0.5 text-xs text-ink">
              {item.answer}
            </span>
          )}
        </Waypoint>
      ))}
    </WaypointList>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

export function DataDemo() {
  return (
    <ReplayFrame label="Replay fill">
      {(key) => (
        <div key={key} className="grid gap-8 lg:grid-cols-2">
          <ul className="flex flex-col gap-4">
            {ROLES.map((role, i) => (
              <li key={role.title} className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink">{role.title}</span>
                <MatchMeter value={role.match} animate delay={i * 0.12} label={`Match for ${role.title}`} />
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-6">
            <RangeBar low={95000} high={125000} median={108000} current={64000} domain={[55000, 135000]} animate />
            <RangeBar low={78000} high={110000} median={92000} domain={[55000, 135000]} animate delay={0.12} />
          </div>
        </div>
      )}
    </ReplayFrame>
  );
}
