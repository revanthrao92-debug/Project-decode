import { bySection, latest, lead, rail } from "@/lib/decodes";
import type { DecodeCard } from "@/lib/types";
import CardArt from "./CardArt";

function Meta({ card }: { card: DecodeCard }) {
  return (
    <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
      {card.section} · {card.format} · {card.minutes} min
    </p>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-brand/15 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-brand-deep">
      {children}
    </span>
  );
}

export default function NewsGrid() {
  const sections = ["Finance", "Tech & AI"];

  return (
    <div id="latest" className="mx-auto w-full max-w-6xl px-5 lg:px-8">
      {/* ---------- top stories ---------- */}
      <section className="py-10 lg:py-14">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
          <h2 className="display text-[1.6rem]">Top stories</h2>
          <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
            Decoded daily
          </span>
        </div>

        <div className="grid gap-8 pt-7 lg:grid-cols-3 lg:gap-10">
          <article className="lg:col-span-2">
            <CardArt seed={lead.slug} className="mb-4 aspect-[16/9]" />
            <Tag>{lead.format}</Tag>
            <h3 className="display mt-3 text-[clamp(1.8rem,3.6vw,2.7rem)]">
              <a href="#latest" className="underline-offset-4 hover:underline">
                {lead.title}
              </a>
            </h3>
            <p className="mt-3 max-w-xl text-[0.975rem] leading-relaxed text-ink-soft">
              {lead.dek}
            </p>
            <div className="mt-4">
              <Meta card={lead} />
            </div>

            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
              {["What happened", "Why it matters", "What to watch"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-1 w-1 rounded-full bg-brand"
                    />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </article>

          <div className="flex flex-col divide-y divide-line lg:border-l lg:border-line lg:pl-8">
            {rail.map((card) => (
              <article key={card.slug} className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-[1.0625rem] font-semibold leading-snug">
                  <a
                    href="#latest"
                    className="underline-offset-4 hover:underline"
                  >
                    {card.title}
                  </a>
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                  {card.dek}
                </p>
                <div className="mt-2.5">
                  <Meta card={card} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- latest ---------- */}
      <section className="border-t border-line py-10 lg:py-12">
        <div className="flex items-baseline justify-between gap-4 pb-5">
          <h2 className="display text-[1.6rem]">The latest</h2>
          <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
            All decodes
          </span>
        </div>

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((card) => (
            <article key={card.slug}>
              <CardArt seed={card.slug} className="mb-3 aspect-[16/9]" />
              <Meta card={card} />
              <h3 className="mt-2 text-[1.0625rem] font-semibold leading-snug">
                <a
                  href="#latest"
                  className="underline-offset-4 hover:underline"
                >
                  {card.title}
                </a>
              </h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                {card.dek}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- section rows ---------- */}
      {sections.map((section) => {
        const cards = bySection(section);
        if (!cards.length) return null;
        return (
          <section
            key={section}
            className="grid gap-6 border-t border-line py-8 lg:grid-cols-[160px_1fr] lg:gap-10 lg:py-10"
          >
            <h2 className="display text-[1.4rem]">{section}</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {cards.map((card) => (
                <article key={card.slug}>
                  <Tag>{card.format}</Tag>
                  <h3 className="mt-2.5 text-[1rem] font-semibold leading-snug">
                    <a
                      href="#latest"
                      className="underline-offset-4 hover:underline"
                    >
                      {card.title}
                    </a>
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-soft">
                    {card.dek}
                  </p>
                  <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft/80">
                    {card.minutes} min read
                  </p>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
