import { Skeleton } from "@/components/ui/skeleton";

/** Same shape as the results header and best-fit panel. */
export default function AnalysisLoading() {
  return (
    <div aria-busy aria-label="Loading your route" className="pb-16">
      <div className="max-w-[46rem] pt-2 pb-10">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-9 w-full" />
        <Skeleton className="mt-2 h-9 w-2/3" />
        <Skeleton className="mt-5 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-5/6" />
      </div>
      <div className="rounded-feature border border-contour bg-sheet p-6 md:p-10">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-3 h-11 w-2/3" />
        <div className="mt-8 grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="mt-6 h-6 w-3/4" />
      </div>
    </div>
  );
}
