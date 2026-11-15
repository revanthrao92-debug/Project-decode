import { site } from "@/lib/site";

export default function FollowStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
      <div className="relative overflow-hidden rounded-[18px] bg-[#00d800] px-6 py-10 lg:px-12 lg:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-hot/20 blur-2xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.42em] text-ink/60">
              Project
            </p>
            <p className="display mt-1 text-[clamp(2.2rem,5vw,3.6rem)] text-white">
              Decode<span className="ml-[0.08em] inline-block h-[0.16em] w-[0.16em] rounded-full bg-hot align-baseline" />
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/80">
              One story a day, drawn apart and put back together. We post the
              decode on Instagram every evening.
            </p>
          </div>

          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            Follow on Instagram <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
