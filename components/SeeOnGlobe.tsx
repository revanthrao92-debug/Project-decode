"use client";

/**
 * Spins the globe to a country and opens its panel. GlobeStage listens for the
 * event, so the news cards (server components) never import the globe.
 */
export default function SeeOnGlobe({ place }: { place: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("pd:focus-place", { detail: place }));
        document
          .getElementById("globe")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="text-[0.6875rem] uppercase tracking-[0.16em] text-brand-deep underline-offset-4 hover:underline"
    >
      See {place} on the globe →
    </button>
  );
}
