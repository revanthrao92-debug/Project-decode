import type { Continent } from "./types";

export const CONTINENTS: { name: Continent; lat: number; lng: number }[] = [
  { name: "Africa", lat: 2, lng: 20 },
  { name: "Asia", lat: 30, lng: 78 },
  { name: "Europe", lat: 52, lng: 18 },
  { name: "North America", lat: 45, lng: -100 },
  { name: "South America", lat: -15, lng: -60 },
  { name: "Oceania", lat: -25, lng: 140 },
];

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
