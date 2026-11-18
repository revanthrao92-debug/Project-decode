import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardArt from "@/components/CardArt";
import { Meta } from "@/components/DecodeMeta";
import Footer from "@/components/Footer";
import Masthead from "@/components/Masthead";
import { decodesIn, getSection, sections } from "@/lib/decodes";
import { getHeadlines, storiesIn } from "@/lib/headlines";
import {
  StoryArt,
  StoryLink,
  StoryMeta,
} from "@/components/StoryParts";

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return sections.map(({ slug }) => ({ section: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = getSection((await params).section);
  if (!section) return {};
  return {
    title: section.name,
    description: `Decodes from the ${section.name} desk at Project Decode.`,
  };
}

export default async function SectionPage({ params }: Props) {
  const section = getSection((await params).section);
  if (!section) notFound();

  const cards = decodesIn(section.name);
  const live = storiesIn(section.name, (await getHeadlines()).stories).slice(0, 18);

  return (
    <>
      <Masthead />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
            <h1 className="display text-[clamp(2rem,4vw,3rem)]">
              {section.name}
            </h1>
            <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
              {live.length} live {live.length === 1 ? "story" : "stories"}
              {cards.length > 0 &&
                ` · ${cards.length} ${cards.length === 1 ? "decode" : "decodes"}`}
            </span>
          </div>

          {live.length > 0 && (
            <div className="grid gap-x-8 gap-y-6 pt-7 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((story) => (
                <article key={story.id}>
                  {story.image && (
                    <StoryArt story={story} className="mb-3 aspect-[16/9]" />
                  )}
                  <StoryMeta story={story} />
                  <h2 className="mt-2 text-[1.0625rem] font-semibold leading-snug">
                    <StoryLink story={story} />
                  </h2>
                  {story.summary && (
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                      {story.summary}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {cards.length > 0 && (
            <h2 className="display mt-12 border-b border-line pb-3 text-[1.4rem]">
              Decodes
            </h2>
          )}

          <div className="grid gap-x-8 gap-y-8 pt-7 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <article key={card.slug}>
                <Link href={`/decode/${card.slug}`} className="group block">
                  <CardArt seed={card.slug} className="mb-3 aspect-[16/9]" />
                  <Meta card={card} />
                  <h2 className="mt-2 text-[1.0625rem] font-semibold leading-snug underline-offset-4 group-hover:underline">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                    {card.dek}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
