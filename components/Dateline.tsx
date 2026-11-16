"use client";

import { useEffect, useRef } from "react";

/**
 * Filled on the client only: the server must not bake a date into a
 * prerendered page, and a ref write avoids an extra render pass.
 */
export default function Dateline() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return <span ref={ref}>India edition</span>;
}
