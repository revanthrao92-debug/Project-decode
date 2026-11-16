import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";

export const metadata: Metadata = {
  title: "About",
  description:
    "Project Decode explains the world to readers in India — the story behind the headline, in plain language.",
};

export default function AboutPage() {
  return (
    <>
      <Masthead />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-5 py-14 lg:px-8 lg:py-20">
          <p className="label">About</p>
          <h1 className="display mt-3 text-[clamp(2.6rem,6vw,4.2rem)]">
            The world is loud.
            <br />
            We decode it.
          </h1>

          <div className="mt-10 space-y-6 text-[1.0625rem] leading-[1.75] text-ink-soft">
            <p>
              Project Decode started with a simple irritation: most world news
              tells you <em>what</em> happened and stops there. You finish the
              paragraph knowing the event, not the stakes. Why does a chip export
              ban matter? Who actually pays for a stronger rupee? What does a
              strait have to do with the price of a new phone?
            </p>
            <p>
              So we pick one story a day, take it apart, and put it back together
              in language that doesn&apos;t require a subscription to a think
              tank. Every decode answers three things: what happened, why it
              matters, and what to watch next.
            </p>
            <p>
              We write it for readers in India, which means we don&apos;t treat
              the country as a footnote. Trade, energy, technology, security,
              money and the diaspora — it all connects. We&apos;re not here to
              cover Indian politics; we&apos;re here to show you how the world
              reaches you.
            </p>
          </div>

          <div className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
            <div>
              <p className="label">The globe</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Every country is clickable. Pick one and you&apos;ll see what its
                outlets have been reporting for the last 48 hours.
              </p>
            </div>
            <div>
              <p className="label">The formats</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Explainer, deep dive, timeline, by the numbers, glossary. The
                format follows the story, not the other way round.
              </p>
            </div>
            <div>
              <p className="label">The rhythm</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                One decode a day on Instagram, longer pieces here. No infinite
                feed, no notifications shouting at you.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-line bg-paper-2/60 p-6">
            <p className="text-sm leading-relaxed text-ink-soft">
              Heads up: this is the first build. The decodes on the homepage are
              placeholders, and the Instagram link is waiting for its real
              handle.
            </p>
          </div>
        </article>
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
