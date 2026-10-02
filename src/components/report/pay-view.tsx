import type { CareerPath } from "@/lib/schemas";
import { RangeBar } from "@/components/pp/range-bar";

const STEP = 5000;

/** Typical pay per destination on one shared scale. Server-safe. */
export function PayView({ paths, animate = false }: { paths: CareerPath[]; animate?: boolean }) {
  const priced = paths.filter((p) => p.salary_estimate);

  if (priced.length === 0) {
    return (
      <p className="max-w-[62ch] py-6 text-base text-ink-muted">
        This report doesn&apos;t include pay estimates. Reports made from now on estimate pay for the location you
        give.
      </p>
    );
  }

  // One scale when every estimate shares a currency and period, so bars compare honestly.
  const units = new Set(priced.map((p) => `${p.salary_estimate!.currency}/${p.salary_estimate!.period}`));
  const lows = priced.map((p) => p.salary_estimate!.low);
  const highs = priced.map((p) => p.salary_estimate!.high);
  const isYearly = priced[0].salary_estimate!.period === "year";
  const domain: [number, number] | undefined =
    units.size === 1 && isYearly
      ? [Math.floor((Math.min(...lows) * 0.85) / STEP) * STEP, Math.ceil((Math.max(...highs) * 1.06) / STEP) * STEP]
      : undefined;

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col divide-y divide-contour border-b border-contour">
        {paths.map((path, i) => {
          const pay = path.salary_estimate;
          return (
            <li key={path.title} className="grid gap-x-10 gap-y-2 py-6 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
              <div>
                <h3 className="text-base font-medium text-ink">{path.title}</h3>
                {pay && <p className="mt-1 text-sm text-ink-muted">{pay.basis}</p>}
              </div>
              {pay ? (
                <RangeBar
                  low={pay.low}
                  high={pay.high}
                  currency={pay.currency}
                  period={pay.period}
                  domain={domain}
                  animate={animate}
                  delay={i * 0.12}
                />
              ) : (
                <p className="text-sm text-ink-muted">
                  No estimate: the location was too broad to estimate pay responsibly.
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 max-w-[62ch] text-sm text-ink-muted">
        Typical base pay at the level you could realistically enter. These are estimates, not live market data:
        check current listings before you negotiate.
      </p>
    </div>
  );
}
