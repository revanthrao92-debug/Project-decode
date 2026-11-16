import { timeAgo } from "@/lib/continents";
import type { NewsItem } from "@/lib/news";
import type { Selection } from "@/lib/types";
import CardArt from "./CardArt";
import { LiveDot } from "./icons";
import type { NewsStatus } from "./useNews";

const pill =
  "rounded-full border border-line bg-paper/85 px-3.5 py-1.5 text-xs text-ink-soft backdrop-blur-sm transition-colors hover:border-ink/30 hover:text-ink";

function Skeleton() {
  return (
    <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="border-t border-line py-4">
          <div className="h-3 w-full animate-pulse rounded bg-line" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-line/70" />
        </li>
      ))}
    </ul>
  );
}

function Headlines({ items }: { items: NewsItem[] }) {
  return (
    <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.url} className="border-t border-line py-3">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="group flex gap-3.5"
          >
            <CardArt
              seed={item.url}
              bars={10}
              className="h-[66px] w-[104px] shrink-0 rounded-md"
            />
            <span className="min-w-0">
              <span className="block text-[0.9375rem] font-medium leading-snug underline-offset-4 group-hover:underline">
                {item.title}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
                <span className="tabular-nums text-ink-soft/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.source}</span>
                {item.published && <span>· {timeAgo(item.published)}</span>}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function RegionPanel({
  selection,
  items,
  status,
  error,
  onRefresh,
  onReset,
}: {
  selection: Selection;
  items: NewsItem[];
  status: NewsStatus;
  error: string | null;
  onRefresh: () => void;
  onReset: () => void;
}) {
  return (
    <section className="border-y border-line bg-paper-2/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-line">
          <CardArt
            seed={`hero-${selection.query}`}
            className="h-[150px] rounded-none opacity-40 sm:h-[170px]"
          />
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-paper via-paper/70 to-paper/20 p-4 sm:p-5">
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onRefresh} className={pill}>
                Refresh
              </button>
              <button type="button" onClick={onReset} className={pill}>
                Back to globe
              </button>
            </div>

            <div>
              <p className="label flex items-center gap-2 text-hot">
                <LiveDot />
                Hot right now
              </p>
              <h2 className="display mt-1 text-[clamp(1.9rem,3.6vw,2.8rem)]">
                {selection.label}
              </h2>
              {selection.label !== selection.continent && (
                <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
                  {selection.continent}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6" aria-live="polite" aria-busy={status === "loading"}>
          {status === "loading" && <Skeleton />}

          {status === "error" && (
            <p className="rounded-xl border border-hot/30 bg-hot/5 p-4 text-sm text-ink-soft">
              {error}
            </p>
          )}

          {status === "done" && items.length === 0 && (
            <p className="text-sm text-ink-soft">
              Nothing fresh for {selection.label} in the last two days. Try a
              whole continent instead.
            </p>
          )}

          {status === "done" && items.length > 0 && <Headlines items={items} />}
        </div>
      </div>
    </section>
  );
}
