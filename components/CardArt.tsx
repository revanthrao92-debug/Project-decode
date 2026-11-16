/**
 * Placeholder art for decode cards: a bar-code motif over a faint grid, which
 * reads as "data being decoded" rather than decoration. Deterministic per
 * seed, so a slug always gets the same composition and nothing shifts on
 * re-render.
 */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export default function CardArt({
  seed,
  className = "",
  bars = 26,
}: {
  seed: string;
  className?: string;
  /** fewer bars read better in small thumbnails */
  bars?: number;
}) {
  const h = hash(seed);
  const heights = Array.from(
    { length: bars },
    (_, i) => 16 + ((h >> (i % 20)) % 72),
  );
  const accent = h % bars;
  const dotX = 18 + ((h >> 7) % 64);
  const dotY = 22 + ((h >> 11) % 56);

  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-[10px] bg-paper-2 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(#e4e1da 1px, transparent 1px), linear-gradient(90deg, #e4e1da 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-between gap-[2px] px-[11%]">
        {heights.map((height, index) => (
          <span
            key={index}
            style={{
              height: `${height}%`,
              background:
                index === accent ? "var(--color-brand)" : "rgba(21,24,28,0.16)",
            }}
            className="min-w-[2px] flex-1 rounded-[1px]"
          />
        ))}
      </div>

      <span
        className="absolute h-[6px] w-[6px] rounded-full bg-hot"
        style={{ left: `${dotX}%`, top: `${dotY}%` }}
      />
    </div>
  );
}
