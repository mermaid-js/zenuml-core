import type { EmojiCache } from "./types";
import type { IconDefinition } from "@/svg/icons";
import { setKnownEmojis } from "./resolveEmoji";

const DEFAULT_SERVICE_URL = "https://icons.zenuml.com";
let serviceUrl = DEFAULT_SERVICE_URL;

export function setEmojiServiceUrl(url: string) {
  serviceUrl = url;
}

const memoryCache: EmojiCache = new Map();

/** Clear the in-memory emoji cache. Exported for testing. */
export function clearEmojiCache() {
  memoryCache.clear();
}

export async function fetchEmojis(names: string[]): Promise<EmojiCache> {
  const unique = [...new Set(names)];

  const uncached = unique.filter((n) => !memoryCache.has(n));
  if (uncached.length === 0) {
    return memoryCache;
  }

  try {
    const url = `${serviceUrl}/batch?emoji=${encodeURIComponent(uncached.join(","))}`;
    const response = await fetch(url);
    if (!response.ok) return memoryCache;

    const data: Record<string, IconDefinition & { unicode: string }> =
      await response.json();

    for (const [name, entry] of Object.entries(data)) {
      memoryCache.set(name, entry);
    }

    setKnownEmojis(memoryCache.keys());
  } catch {
    // Network failure — return whatever we have cached
  }

  return memoryCache;
}
