import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

function Constellation() {
  const route = "M35 355 C115 360 95 258 180 278 S265 195 335 220 S410 118 486 145 S540 82 580 58";

  return <div className="constellation relative mx-auto aspect-[4/3] max-w-[620px]" aria-hidden="true">
    <svg viewBox="0 0 620 460" className="h-full w-full overflow-visible">
      <defs><mask id="route-reveal"><path className="constellation-reveal" d={route} pathLength="1" fill="none" stroke="white" strokeWidth="7" /></mask></defs>
      <path d={route} fill="none" stroke="#1f4b3a" strokeWidth="2" strokeDasharray="3 8" mask="url(#route-reveal)" />
      {[[35,355],[112,325],[180,278],[258,246],[335,220],[410,161],[486,145],[540,92]].map(([x,y],i)=><circle className="constellation-waypoint" style={{animationDelay:`${420 + i * 150}ms`}} key={i} cx={x} cy={y} r={i<4?4:5} fill={i<3?"#faf7f2":"#1f4b3a"} stroke="#1f4b3a" strokeWidth="2"/>)}
      <g className="constellation-star" transform="translate(580 58)" fill="#1f4b3a"><path d="M0-24 5-6 24 0 5 6 0 24-5 6-24 0-5-6Z"/><circle r="9" fill="#faf7f2"/><circle r="5"/></g>
      <g className="constellation-sky"><circle cx="72" cy="96" r="2" fill="#6b6459"/><circle cx="280" cy="85" r="3" fill="#6b6459"/><circle cx="475" cy="330" r="2" fill="#6b6459"/></g>
    </svg>
    <p className="constellation-origin absolute bottom-4 left-12 font-mono text-[10px] uppercase tracking-[.22em] text-muted-foreground">Your experience</p>
    <p className="constellation-destination absolute right-0 top-3 font-mono text-[10px] uppercase tracking-[.22em] text-primary">A clear direction</p>
  </div>;
}

export default function LandingPage() {
  return <div>
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_.9fr]">
        <div>
          <p className="mb-7 font-mono text-xs uppercase tracking-[.18em] text-primary">Career direction, made personal</p>
          <h1 className="max-w-3xl text-6xl leading-[.98] tracking-[-.045em] md:text-7xl lg:text-[88px]">The next step is closer than it feels.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">PathPilot reads the story already inside your CV, then turns it into three realistic career paths and one calm plan for the week ahead.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="inline-flex h-12 items-center gap-3 rounded-full bg-primary px-6 text-sm font-medium text-white hover:-translate-y-0.5 hover:bg-[#173d2e]">Find my path <ArrowRight className="size-4"/></Link><Link href="/demo" className="inline-flex h-12 items-center rounded-full border px-6 text-sm font-medium hover:bg-[#f3eee6]">Read a sample report</Link></div>
          <p className="mt-5 text-xs text-muted-foreground">Free to try · About 10 minutes · Your data stays yours</p>
        </div><Constellation />
      </div>
    </section>

    <section id="how" className="border-y bg-[#f3eee6] px-6 py-24">
      <div className="mx-auto max-w-6xl"><div className="grid gap-12 md:grid-cols-[.8fr_1.2fr]"><div><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">The route</p><h2 className="mt-4 text-4xl leading-tight md:text-5xl">From uncertainty to a useful next move.</h2></div><div className="relative space-y-0 border-l border-primary/25">{[
        ["01","Bring what you have","Upload your CV or paste the text. No polishing required."],
        ["02","Add the missing context","Ten straightforward questions about how you want to work."],
        ["03","Arrive at a plan","Get evidence-backed strengths, three fitting routes and seven waypoints."],
      ].map(([n,t,d],i)=><div key={n} className="relative pb-12 pl-10 last:pb-0"><span className={`absolute -left-[6px] top-1 size-3 rounded-full border border-primary ${i===2?"bg-primary":"bg-[#f3eee6]"}`}/><p className="font-mono text-xs text-primary">{n}</p><h3 className="mt-2 text-2xl">{t}</h3><p className="mt-2 max-w-lg leading-7 text-muted-foreground">{d}</p></div>)}</div></div></div>
    </section>

    <section className="px-6 py-24 md:py-32"><div className="mx-auto max-w-6xl"><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">What waits at the end</p><div className="mt-5 grid gap-10 md:grid-cols-2"><h2 className="text-4xl leading-tight md:text-6xl">Not more options.<br/>A better sense of direction.</h2><div className="space-y-6">{["Your strengths, with evidence from your actual experience","Three career paths ranked by realistic fit","A seven-day plan designed to create momentum","CV rewrites that show what hiring teams need to see"].map(x=><p key={x} className="flex gap-4 border-b pb-5 text-base"><Check className="mt-1 size-4 shrink-0 text-primary"/>{x}</p>)}</div></div></div></section>
    <section className="bg-primary px-6 py-20 text-[#faf7f2]"><div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"><h2 className="max-w-2xl text-4xl leading-tight md:text-5xl">You don’t need the whole journey figured out.</h2><Link href="/signup" className="shrink-0 rounded-full bg-[#faf7f2] px-6 py-3 text-sm font-medium text-primary">Take the first step →</Link></div></section>
  </div>;
}
