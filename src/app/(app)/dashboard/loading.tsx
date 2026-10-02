import { Skeleton } from "@/components/ui/skeleton";

/** Same shape as the journey log, so nothing jumps when it loads. */
export default function DashboardLoading() {
  return (
    <div aria-busy aria-label="Loading your journey" className="max-w-[46rem]">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
        <div>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-12 w-44" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-5 pb-10">
          <Skeleton className="mt-1 size-[22px] rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-72 max-w-full" />
            <Skeleton className="mt-3 h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
