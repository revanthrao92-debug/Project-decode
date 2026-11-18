import { cacheLife } from "next/cache";

export type Rate = {
  code: string;
  /** Rupees per unit (per 100 for JPY). */
  value: number;
  /** Percent change against the previous reference day. */
  change: number;
};

export type Rates = { date: string; rates: Rate[] };

const CURRENCIES: { code: string; unit: number }[] = [
  { code: "USD", unit: 1 },
  { code: "EUR", unit: 1 },
  { code: "GBP", unit: 1 },
  { code: "AED", unit: 1 },
  { code: "JPY", unit: 100 },
];

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Rupee exchange rates from the European Central Bank's daily reference rates
 * via Frankfurter (free, no key). Reference rates, not live trading prices, so
 * the strip says so. Refreshes hourly; returns null if the service is down.
 */
export async function getRupeeRates(): Promise<Rates | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60 * 60, expire: 24 * 60 * 60 });

  try {
    const start = isoDay(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));
    const symbols = CURRENCIES.map((c) => c.code).join(",");
    const res = await fetch(
      `https://api.frankfurter.dev/v1/${start}..?base=INR&symbols=${symbols}`,
      { cache: "no-store", signal: AbortSignal.timeout(8_000) },
    );
    if (!res.ok) throw new Error(`rates returned ${res.status}`);

    const body = (await res.json()) as {
      rates: Record<string, Record<string, number>>;
    };
    const days = Object.keys(body.rates).sort();
    if (days.length < 2) throw new Error("not enough rate history");
    const today = body.rates[days[days.length - 1]];
    const before = body.rates[days[days.length - 2]];

    return {
      date: days[days.length - 1],
      rates: CURRENCIES.filter((c) => today[c.code] && before[c.code]).map(
        ({ code, unit }) => {
          const now = unit / today[code];
          const prev = unit / before[code];
          return { code, value: now, change: ((now - prev) / prev) * 100 };
        },
      ),
    };
  } catch (error) {
    console.error("rupee rates failed", error);
    cacheLife({ stale: 30, revalidate: 120, expire: 600 });
    return null;
  }
}
