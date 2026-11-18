import type { DecodeCard } from "@/lib/types";

export function Meta({ card }: { card: DecodeCard }) {
  return (
    <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
      {card.section} · {card.format} · {card.minutes} min
    </p>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-brand/15 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-brand-deep">
      {children}
    </span>
  );
}
