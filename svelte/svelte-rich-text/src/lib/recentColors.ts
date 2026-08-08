import { writable } from "svelte/store";

export const RECENT_COLORS_KEY = "fl-rich-text-recent-colors";
export const MAX_RECENT_COLORS = 20;

export const recentColorsStore = writable<string[]>([]);

try {
  const saved = localStorage.getItem(RECENT_COLORS_KEY);
  if (saved) recentColorsStore.set(JSON.parse(saved));
} catch {}
