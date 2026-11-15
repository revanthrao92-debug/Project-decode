import Link from "next/link";
import { site } from "@/lib/site";

export default function Nav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Project Decode, home">
          <span className="display flex items-start text-[1.75rem] leading-none">
            DECODE
            <span
              aria-hidden
              className="ml-[0.1em] mt-[0.68em] inline-block h-[0.17em] w-[0.17em] rounded-full bg-hot"
            />
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm sm:gap-7">
          <Link
            href="/#decodes"
            className="hidden text-ink-soft transition-colors hover:text-ink sm:block"
          >
            Decodes
          </Link>
          <Link
            href="/about"
            className="text-ink-soft transition-colors hover:text-ink"
          >
            About
          </Link>
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-deep hover:text-brand-deep"
          >
            Instagram <span aria-hidden>↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
