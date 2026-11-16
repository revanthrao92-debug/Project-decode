import { site } from "@/lib/site";
import LogoMark from "./LogoMark";

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
            <LogoMark className="w-[min(280px,62vw)] text-white" />
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
