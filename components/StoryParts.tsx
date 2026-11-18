import type { ReactNode } from "react";
import type { Story } from "@/lib/rss";
import CardArt from "./CardArt";

const stamp = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata",
});

export const formatTime = (iso: string | null) =>
  iso ? `${stamp.format(new Date(iso))} IST` : null;

/** Outbound link to the publisher. Always credited, always a new tab. */
export function StoryLink({
  story,
  className = "underline-offset-4 hover:underline",
}: {
  story: Story;
  className?: string;
}) {
  return (
    <a
      href={story.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {story.title}
    </a>
  );
}

/** The publisher's own image when we may show it, else the placeholder art. */
export function StoryArt({
  story,
  className = "",
}: {
  story: Story;
  className?: string;
}) {
  if (!story.image) return <CardArt seed={story.id} className={className} />;
  return (
    <figure className={story.image.illustrative ? "mb-3" : ""}>
      <div
        className={`relative overflow-hidden rounded-[10px] bg-paper-2 ${className}`}
      >
        {/* Plain img: the host is allow-listed in lib/feeds.ts, not next/image config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.image.url}
          alt={story.image.alt ?? ""}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!story.image.illustrative && (
          <figcaption className="absolute bottom-0 right-0 rounded-tl-md bg-ink/70 px-2 py-0.5 text-[0.625rem] text-white">
            Image: {story.image.credit}
          </figcaption>
        )}
      </div>
      {story.image.illustrative && (
        <figcaption className="mt-1.5 text-[0.625rem] leading-snug text-ink-soft">
          Illustrative image ·{" "}
          <a
            href={story.image.pageUrl ?? story.image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {story.image.credit}
          </a>
          {story.image.licence && (
            <>
              {", "}
              <a
                href={story.image.licenceUrl ?? story.image.pageUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {story.image.licence}
              </a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}


export function StoryMeta({ story }: { story: Story }) {
  const when = formatTime(story.published);
  return (
    <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
      {story.topic ?? story.section}
      {story.place ? ` · ${story.place}` : ""} · {story.source}
      {when ? ` · ${when}` : ""}
    </p>
  );
}

export function RegionTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-brand/15 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-brand-deep">
      {children}
    </span>
  );
}
