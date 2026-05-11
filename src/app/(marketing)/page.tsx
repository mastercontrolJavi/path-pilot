import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Compass,
  Sparkles,
  Target,
  CalendarCheck,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Upload your CV",
    description:
      "Drop in your PDF or paste your resume text. We read between the lines to find patterns you might have missed.",
  },
  {
    icon: MessageSquare,
    title: "Answer 10 questions",
    description:
      "Quick, thoughtful questions about what you want, need, and care about. Takes about 5 minutes.",
  },
  {
    icon: Compass,
    title: "Get your paths",
    description:
      "Three realistic career paths, your real strengths with evidence, and a 7-day action plan.",
  },
];

const valueProps = [
  {
    icon: Sparkles,
    title: "Discover your real strengths",
    description:
      "Not generic traits. We identify what you're actually good at based on evidence from your experience.",
  },
  {
    icon: Target,
    title: "Find paths that actually fit",
    description:
      "Exactly 3 realistic career paths tailored to your background, not 100 random listings.",
  },
  {
    icon: CalendarCheck,
    title: "Get a plan for this week",
    description:
      "A concrete 7-day action plan so you know exactly what to do next. No more paralysis.",
  },
];

const socialProofItems = [
  "3 career paths",
  "Top strengths with evidence",
  "7-day action plan",
  "CV rewrites",
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="min-h-[85vh] flex items-center justify-center px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs font-mono text-muted-foreground mb-8">
            AI-powered · Free to try · Takes 10 minutes
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5">
            Find your next
            <br />
            career move.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Upload your CV. Answer 10 questions. Get 3 realistic paths and a
            7-day plan, powered by AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F0F0F] text-white font-medium text-base hover:bg-black/80 transition-colors shadow-sm"
            >
              Get started free →
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-foreground font-medium text-base hover:bg-accent transition-colors"
            >
              See a sample analysis
            </Link>
          </div>

          {/* Social proof bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {socialProofItems.map((item, i) => (
              <span key={item} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{item}</span>
                {i < socialProofItems.length - 1 && (
                  <span className="text-muted-foreground/30 text-xs">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#0F0F0F] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-16 text-white">
            How PathPilot works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative border border-white/10 rounded-2xl p-8 overflow-hidden"
              >
                {/* Large step number behind */}
                <span
                  className="absolute -top-4 -left-2 text-[120px] font-bold text-white leading-none select-none pointer-events-none"
                  style={{ opacity: 0.06 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative">
                  <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center mb-5">
                    <step.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-16">
            What you&apos;ll get
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="p-6 rounded-2xl bg-white border border-border hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0F0F0F] flex items-center justify-center mb-4">
                  <prop.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2">{prop.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 bg-[#0F0F0F]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Stop guessing. Start moving.
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            10 minutes from now you&apos;ll have a clearer picture of where to
            go next.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#0F0F0F] font-medium text-base hover:bg-white/90 transition-colors shadow-sm"
          >
            Get started - it&apos;s free
          </Link>
        </div>
      </section>
    </div>
  );
}
