import { useCallback, useRef, useState } from "react";
import type { NewsItem } from "@/lib/news";

export type NewsStatus = "idle" | "loading" | "done" | "error";

/** Fetches headlines for a query. A newer request cancels the one before it. */
export function useNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<NewsStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    inFlight.current?.abort();
    setItems([]);
    setStatus("idle");
    setError(null);
  }, []);

  const load = useCallback(async (query: string) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setItems([]);
    setError(null);
    setStatus("loading");

    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? "Something went wrong.");
      setItems((payload.items ?? []) as NewsItem[]);
      setStatus("done");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      setStatus("error");
    }
  }, []);

  return { items, status, error, load, clear };
}
