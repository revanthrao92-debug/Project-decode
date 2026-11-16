"use client";

import { useCallback, useEffect, useState } from "react";
import LogoMark from "./LogoMark";

const KEY = "pd-intro-seen";
const DURATION = 1850; // the dot settles at ~84% of the 2.05s animation

export default function Intro() {
  const [phase, setPhase] = useState<"playing" | "leaving" | "done">("playing");

  const leave = useCallback(() => {
    sessionStorage.setItem(KEY, "1");
    setPhase((current) => (current === "done" ? current : "leaving"));
    window.setTimeout(() => setPhase("done"), 620);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // ?intro=1 replays the animation on demand, handy for reviewing it
    const forced = new URLSearchParams(window.location.search).has("intro");
    if (reduced || (!forced && sessionStorage.getItem(KEY) === "1")) {
      const skip = window.setTimeout(() => setPhase("done"), 0);
      return () => window.clearTimeout(skip);
    }
    const timer = window.setTimeout(leave, DURATION);
    return () => window.clearTimeout(timer);
  }, [leave]);

  // Tell the globe it can start rendering. Until then it stays unmounted, so
  // WebGL isn't burning the GPU behind an opaque overlay.
  useEffect(() => {
    if (phase !== "done") return;
    document.documentElement.dataset.introDone = "1";
    window.dispatchEvent(new Event("pd:intro-done"));
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-50 flex items-center justify-center bg-paper px-6 transition-opacity duration-500 ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <LogoMark
        animated
        title=""
        className={`w-[min(440px,78vw)] text-ink transition-transform duration-500 ${
          phase === "leaving" ? "scale-95" : "scale-100"
        }`}
      />

      <button
        type="button"
        onClick={leave}
        className="absolute right-5 top-5 rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
      >
        Skip
      </button>
    </div>
  );
}
