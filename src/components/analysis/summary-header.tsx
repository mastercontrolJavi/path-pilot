export function SummaryHeader({ summary }: { summary: string }) {
  return (
    <div
      data-reveal
      className="report-section border-b border-primary/25 pb-10 pt-2 sm:pb-12 sm:pt-4"
    >
      <p className="mb-5 font-mono text-xs uppercase tracking-[.18em] text-primary">
        You’ve arrived · Your career report
      </p>
      <h1 className="max-w-4xl text-3xl leading-tight sm:text-4xl md:text-6xl">
        A clearer view of where your experience can take you.
      </h1>
      <p className="mt-7 max-w-4xl text-base leading-7 sm:text-lg sm:leading-8 text-muted-foreground">
        {summary}
      </p>
    </div>
  );
}
