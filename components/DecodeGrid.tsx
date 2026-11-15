import { decodes } from "@/lib/decodes";

export default function DecodeGrid() {
  return (
    <section id="decodes" className="border-t border-line bg-paper-2/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[clamp(1.9rem,3.4vw,2.8rem)]">
            Latest decodes
          </h2>
          <p className="label">Explainer · Deep dive · Timeline</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decodes.map((card) => (
            <article
              key={card.slug}
              className="group flex flex-col justify-between rounded-[14px] border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_18px_36px_-28px_rgba(21,24,28,0.5)]"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-brand-deep">
                    {card.format}
                  </span>
                  <span className="text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
                    {card.section}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug tracking-[-0.01em]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {card.dek}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                <span>{card.minutes} min read</span>
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  Read <span aria-hidden>→</span>
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          Placeholder titles — wired to <code>content/decodes/*.mdx</code> in
          phase B, so swapping in real pieces is a file drop.
        </p>
      </div>
    </section>
  );
}
