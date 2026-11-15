"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LogoIntro() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="w-full max-w-[200px] overflow-hidden sm:max-w-[280px] lg:max-w-[380px] rounded-[14px] bg-[#00d800] ring-1 ring-black/10">
      {reduced ? (
        <Image
          src="/logo-still.png"
          alt="Project Decode"
          width={480}
          height={310}
          priority
          className="block h-auto w-full"
        />
      ) : (
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
          aria-label="Project Decode logo: the wordmark, then a red dot landing as a full stop"
        />
      )}
    </div>
  );
}
