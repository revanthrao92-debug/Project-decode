"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const KEY = "pd-intro-seen";

export default function Intro() {
  const [phase, setPhase] = useState<"playing" | "leaving" | "done">("playing");

  const leave = useCallback(() => {
    sessionStorage.setItem(KEY, "1");
    setPhase((current) => (current === "done" ? current : "leaving"));
    window.setTimeout(() => setPhase("done"), 620);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(KEY) === "1") {
      const skip = window.setTimeout(() => setPhase("done"), 0);
      return () => window.clearTimeout(skip);
    }
    // If the video never reports an end (autoplay blocked, slow decode),
    // never hold the page hostage.
    const failsafe = window.setTimeout(leave, 3200);
    return () => window.clearTimeout(failsafe);
  }, [leave]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-50 flex items-center justify-center bg-paper transition-opacity duration-500 ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`w-[min(440px,76vw)] overflow-hidden rounded-[14px] bg-[#00d800] ring-1 ring-black/10 transition-transform duration-500 ${
          phase === "leaving" ? "scale-95" : "scale-100"
        }`}
      >
        <video
          className="block h-auto w-full"
          src="/logo-intro.mp4"
          poster="/logo-still.png"
          width={480}
          height={310}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onEnded={leave}
        />
        <noscript>
          <Image src="/logo-still.png" alt="" width={480} height={310} />
        </noscript>
      </div>

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
