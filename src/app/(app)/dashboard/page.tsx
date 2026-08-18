import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowUpRight, Plus } from "lucide-react";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function JourneyStar({ status }: { status: string }) {
  const done = status === "completed";
  return (
    <span
      title={status}
      className={`journey-star relative grid size-10 place-items-center ${done ? "text-primary" : "text-muted-foreground"}`}
    >
      <span className="journey-star-halo absolute inset-1 rounded-full border border-primary/0" />
      <svg viewBox="0 0 32 32" className="journey-star-mark size-7">
        <path
          d="M16 2l2.8 10.8L30 16l-11.2 3.2L16 30l-2.8-10.8L2 16l11.2-3.2Z"
          fill={done ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
      {status === "processing" && (
        <span className="absolute inset-1 animate-ping rounded-full border border-primary/30" />
      )}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, status, result, created_at, error_message")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });
  const has = analyses && analyses.length > 0;
  return (
    <div className="mx-auto max-w-5xl">
      <div
        data-reveal
        className="mb-10 flex flex-col items-start justify-between gap-6 sm:mb-14 sm:flex-row sm:items-end"
      >
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[.18em] text-primary">
            Your journeys
          </p>
          <h1 className="text-4xl md:text-5xl">A log of where you’ve been.</h1>
          <p className="mt-3 text-muted-foreground">
            Return to an earlier report or begin from where you are now.
          </p>
        </div>
        <Link
          href="/new"
          className="group/new inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:-translate-y-0.5 hover:bg-[#173d2e] sm:w-auto"
        >
          <Plus className="size-4 transition-transform duration-300 group-hover/new:rotate-90" />
          New analysis
        </Link>
      </div>
      {!has ? (
        <div className="border-y py-20 text-center">
          <JourneyStar status="pending" />
          <h2 className="mt-5 text-2xl">Your first journey starts here.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Bring your CV and ten minutes. We’ll help turn what you’ve done into
            a clear next direction.
          </p>
          <Link
            href="/new"
            className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 text-sm text-white"
          >
            Start my analysis
          </Link>
        </div>
      ) : (
        <div className="border-t">
          {analyses.map((a, i) => {
            const summary =
              a.status === "completed" && a.result?.summary
                ? a.result.summary.split(".")[0] + "."
                : a.status === "failed"
                  ? a.error_message || "This journey could not be completed."
                  : "Your report is being prepared…";
            return (
              <Link
                key={a.id}
                href={`/analysis/${a.id}`}
                data-reveal
                className="journey-entry group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b px-1 py-6 sm:gap-5 sm:px-3 md:grid-cols-[48px_140px_1fr_auto]"
              >
                <span className="hidden font-mono text-xs text-muted-foreground md:block">
                  {String(analyses.length - i).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {formatDate(a.created_at)}
                  </p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground md:hidden">
                    {a.status}
                  </p>
                </div>
                <div>
                  <p className="line-clamp-2 max-w-2xl text-sm leading-6 transition-colors duration-300 group-hover:text-primary">
                    {summary}
                  </p>
                  <p className="mt-1 hidden text-xs capitalize text-muted-foreground md:block">
                    {a.status}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <JourneyStar status={a.status} />
                  <ArrowUpRight className="journey-entry-arrow size-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
