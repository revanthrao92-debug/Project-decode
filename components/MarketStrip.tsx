import { getRupeeRates } from "@/lib/markets";

const SYMBOL: Record<string, string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "Pound",
  AED: "Dirham",
  JPY: "100 Yen",
};

/** A slim band of rupee rates. Hidden entirely if the rates are unavailable. */
export default async function MarketStrip() {
  const data = await getRupeeRates();
  if (!data || data.rates.length === 0) return null;

  const day = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${data.date}T00:00:00Z`));

  return (
    <section
      aria-label="Rupee exchange rates"
      className="border-y border-line bg-paper-2/60"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-7 gap-y-2 px-5 py-3 lg:px-8">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink">
          The rupee today
        </p>
        <ul className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1.5">
          {data.rates.map((rate) => {
            const up = rate.change > 0.005;
            const down = rate.change < -0.005;
            return (
              <li
                key={rate.code}
                className="flex items-baseline gap-1.5 text-[0.8125rem]"
              >
                <span className="text-ink-soft">{SYMBOL[rate.code] ?? rate.code}</span>
                <span className="font-semibold tabular-nums">
                  ₹{rate.value.toFixed(2)}
                </span>
                <span
                  className="text-[0.6875rem] tabular-nums text-ink-soft"
                  title="Change since the previous reference day"
                >
                  {up ? "▲" : down ? "▼" : "–"} {Math.abs(rate.change).toFixed(2)}%
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
          ECB reference rates · {day}
        </p>
      </div>
    </section>
  );
}
