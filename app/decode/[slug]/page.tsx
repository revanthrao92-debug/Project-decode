import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardArt from "@/components/CardArt";
import { Meta, Tag } from "@/components/DecodeMeta";
import Footer from "@/components/Footer";
import Masthead from "@/components/Masthead";
import { decodes, decodesIn, getDecode, sectionSlug } from "@/lib/decodes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return decodes.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const card = getDecode((await params).slug);
  if (!card) return {};
  return { title: card.title, description: card.dek };
}

const PARTS = ["What happened", "Why it matters", "What to watch"];

export default async function DecodePage({ params }: Props) {
  const card = getDecode((await params).slug);
  if (!card) notFound();

  const related = decodesIn(card.section)
    .filter((other) => other.slug !== card.slug)
    .slice(0, 3);

  return (
    <>
      <Masthead />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
          <nav aria-label="Breadcrumb" className="label">
            <Link
              href={`/section/${sectionSlug(card.section)}`}
              className="hover:text-ink"
            >
              {card.section}
            </Link>
          </nav>

          <div className="mt-4">
            <Tag>{card.format}</Tag>
          </div>
          <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.6rem)]">
            {card.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            {card.dek}
          </p>
          <div className="mt-5">
            <Meta card={card} />
          </div>

          <CardArt seed={card.slug} className="mt-8 aspect-[16/9]" />

          <div className="mt-10 space-y-8 border-t border-line pt-8">
            {PARTS.map((part) => (
              <section key={part}>
                <h2 className="label">{part}</h2>
                <div className="mt-3 space-y-2" aria-hidden>
                  <div className="h-3 w-full rounded bg-line" />
                  <div className="h-3 w-11/12 rounded bg-line/70" />
                  <div className="h-3 w-3/5 rounded bg-line/50" />
                </div>
              </section>
            ))}
            <p className="rounded-2xl border border-line bg-paper-2/60 p-5 text-sm leading-relaxed text-ink-soft">
              This decode is still being written. The full piece will land here.
            </p>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mx-auto w-full max-w-6xl px-5 pb-14 lg:px-8 lg:pb-20">
            <h2 className="display border-t-2 border-ink pt-4 text-[1.4rem]">
              More in {card.section}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  href={`/decode/${other.slug}`}
                  className="group block"
                >
                  <Meta card={other} />
                  <p className="mt-2 text-[1rem] font-semibold leading-snug underline-offset-4 group-hover:underline">
                    {other.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
