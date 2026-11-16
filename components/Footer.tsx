import Link from "next/link";
import LogoMark from "./LogoMark";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <LogoMark className="h-[38px] w-auto text-ink" />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-ink-soft">
            World news, decoded for readers in India. Built to be understood, not
            just scrolled.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:gap-16">
          <div>
            <p className="label">Sections</p>
            <ul className="mt-3 space-y-2 text-ink-soft">
              {site.sections.map((section) => (
                <li key={section}>
                  <Link href="/#latest" className="hover:text-ink">
                    {section}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">More</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-ink-soft hover:text-ink">
                  About
                </Link>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-soft hover:text-ink"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link href="/#latest" className="text-ink-soft hover:text-ink">
                  Decodes
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-4 text-[0.6875rem] text-ink-soft lg:px-8">
          <p>© Project Decode</p>
          <p>
            Headlines via Google News · Borders: Natural Earth
          </p>
        </div>
      </div>
    </footer>
  );
}
