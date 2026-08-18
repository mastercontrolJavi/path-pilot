export function SummaryHeader({ summary }: { summary: string }) {
  return (
    <div className="report-section border-b border-primary/25 pb-12 pt-4">
      <p className="mb-5 font-mono text-xs uppercase tracking-[.18em] text-primary">You’ve arrived · Your career report</p>
      <h1 className="max-w-4xl text-4xl leading-tight md:text-6xl">A clearer view of where your experience can take you.</h1>
      <p className="mt-7 max-w-4xl text-lg leading-8 text-muted-foreground">{summary}</p>
    </div>
  );
}
