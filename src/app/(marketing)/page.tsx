import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Compass,
  Sparkles,
  Target,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Upload your CV",
    description: "Drop in your PDF or paste your resume text. We'll read between the lines.",
  },
  {
    icon: MessageSquare,
    title: "Answer 10 questions",
    description: "Quick, thoughtful questions about what you want, need, and care about.",
  },
  {
    icon: Compass,
    title: "Get your path",
    description: "Receive 3 realistic career paths, your real strengths, and a 7-day action plan.",
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

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            For early-career professionals
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Stop guessing what
            <br />
            to apply for.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your CV, answer a few questions, and get 3 realistic career
            paths plus a 7-day action plan.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-colors shadow-sm"
          >
            Get my path
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FAFAFA] border border-border/50 flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-foreground/70" />
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-16">
            What you'll get
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="p-6 rounded-2xl bg-white border border-border/50 hover:border-border transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-border/50 flex items-center justify-center mb-4">
                  <prop.icon className="w-5 h-5 text-foreground/70" />
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
      <section className="py-20 px-6 bg-white border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            Ready to find your direction?
          </h2>
          <p className="text-muted-foreground mb-8">
            Takes about 10 minutes. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-colors shadow-sm"
          >
            Get my path
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
