import type { IconDefinition } from "@/svg/icons";

export interface EmojiResolution {
  /** CSS class names to add (always present) */
  classNames: string[];
  /** CSS style properties (from getStyle match) */
  style: Record<string, string>;
  /** Emoji shortcodes that resolved (for rendering) */
  emojis: string[];
  /** Unicode characters for fallback rendering */
  unicodes: string[];
}

/** Pre-fetched emoji SVG cache: shortcode → icon definition */
export type EmojiCache = Map<string, IconDefinition & { unicode: string }>;
