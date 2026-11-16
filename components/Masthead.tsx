import Link from "next/link";
import LogoMark from "./LogoMark";
import Dateline from "./Dateline";
import { LiveDot, SearchIcon } from "./icons";
import { site } from "@/lib/site";

export default function Masthead() {
  return (
    <header className="border-b border-line">
      {/* utility bar */}
      <div className="border-b border-line/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-2 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft lg:px-8">
          <p className="flex items-center gap-2">
            <LiveDot />
            <Dateline />
            <span className="hidden sm:inline">· India edition</span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-ink"
            >
              Instagram <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* wordmark */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="mx-auto" aria-label="Project Decode, home">
          <LogoMark className="h-[46px] w-auto text-ink sm:h-[58px]" />
        </Link>
      </div>

      {/* sections */}
      <nav className="border-t border-line/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 overflow-x-auto px-5 lg:px-8">
          <ul className="flex items-center gap-6 py-3 text-[0.8125rem] font-medium whitespace-nowrap">
            {site.sections.map((section) => (
              <li key={section}>
                <Link
                  href="/#latest"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {section}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/#globe"
            className="hidden shrink-0 items-center gap-1.5 py-3 text-[0.8125rem] font-medium text-brand-deep sm:flex"
          >
            <SearchIcon />
            Search the globe
          </Link>
        </div>
      </nav>
    </header>
  );
}
