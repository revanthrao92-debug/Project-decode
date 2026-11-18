import Link from "next/link";
import { sectionSlug } from "@/lib/decodes";
import { getLayout } from "@/lib/headlines";
import SeeOnGlobe from "./SeeOnGlobe";
import {
  formatTime,
  RegionTag,
  StoryArt,
  StoryLink,
  StoryMeta,
} from "./StoryParts";

export default async function NewsGrid() {
  const { lead, rail, latest, rows, focus, updated } = await getLayout();

  if (!lead) {
    return (
      <div id="latest" className="mx-auto w-full max-w-6xl px-5 py-14 lg:px-8">
        <p className="text-[0.9375rem] text-ink-soft">
          The news desk is catching up. Check back in a few minutes.
        </p>
      </div>
    );
  }

  return (
    <div id="latest" className="mx-auto w-full max-w-6xl px-5 lg:px-8">
      {/* ---------- top stories ---------- */}
      <section className="py-10 lg:py-14">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
          <h2 className="display text-[1.6rem]">Top stories</h2>
          <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
            Updated {formatTime(updated)}
          </span>
        </div>

        <div className="grid gap-8 pt-7 lg:grid-cols-3 lg:gap-10">
          <article className="lg:col-span-2">
            <StoryArt story={lead} className="mb-4 aspect-[16/9]" />
            <RegionTag>{lead.region === "india" ? "India" : "World"}</RegionTag>
            <h3 className="display mt-3 text-[clamp(1.8rem,3.6vw,2.7rem)]">
              <StoryLink story={lead} />
            </h3>
            {lead.summary && (
              <p className="mt-3 max-w-xl text-[0.975rem] leading-relaxed text-ink-soft">
                {lead.summary}
              </p>
            )}
            <div className="mt-4">
              <StoryMeta story={lead} />
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-4">
              <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
                Read the full story at {lead.source} ↗
              </p>
              {lead.place && <SeeOnGlobe place={lead.place} />}
            </div>
          </article>

          <div className="flex flex-col divide-y divide-line lg:border-l lg:border-line lg:pl-8">
            {rail.map((story) => (
              <article key={story.id} className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-[1.0625rem] font-semibold leading-snug">
                  <StoryLink story={story} />
                </h3>
                {story.summary && (
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                    {story.summary}
                  </p>
                )}
                <div className="mt-2.5">
                  <StoryMeta story={story} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- latest ---------- */}
      {latest.length > 0 && (
        <section className="border-t border-line py-10 lg:py-12">
          <div className="flex items-baseline justify-between gap-4 pb-5">
            <h2 className="display text-[1.6rem]">The latest</h2>
            <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
              India and the world
            </span>
          </div>

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((story) => (
              <article key={story.id}>
                <StoryArt story={story} className="mb-3 aspect-[16/9]" />
                <StoryMeta story={story} />
                <h3 className="mt-2 text-[1.0625rem] font-semibold leading-snug">
                  <StoryLink story={story} />
                </h3>
                {story.summary && (
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                    {story.summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- country in focus ---------- */}
      {focus && (
        <section className="border-t border-line py-8 lg:py-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-5">
            <h2 className="display text-[1.4rem]">
              Country in focus: {focus.place}
            </h2>
            <SeeOnGlobe place={focus.place} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {focus.stories.map((story) => (
              <article key={story.id}>
                <StoryMeta story={story} />
                <h3 className="mt-2 text-[1rem] font-semibold leading-snug">
                  <StoryLink story={story} />
                </h3>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- section rows ---------- */}
      {rows.map(({ section, stories }) => {
        if (!stories.length) return null;
        return (
          <section
            key={section}
            className="grid gap-6 border-t border-line py-8 lg:grid-cols-[160px_1fr] lg:gap-10 lg:py-10"
          >
            <h2 className="display text-[1.4rem]">
              <Link
                href={`/section/${sectionSlug(section)}`}
                className="underline-offset-4 hover:underline"
              >
                {section}
              </Link>
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {stories.map((story) => (
                <article key={story.id}>
                  <RegionTag>
                    {story.region === "india" ? "India" : "World"}
                  </RegionTag>
                  <h3 className="mt-2.5 text-[1rem] font-semibold leading-snug">
                    <StoryLink story={story} />
                  </h3>
                  {story.summary && (
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-soft">
                      {story.summary}
                    </p>
                  )}
                  <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft/80">
                    {story.source}
                    {formatTime(story.published)
                      ? ` · ${formatTime(story.published)}`
                      : ""}
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
