import { getStyle } from "@/utils/messageStyling";
import type { EmojiCache, EmojiResolution } from "./types";
import { BUILTIN_EMOJIS } from "./builtinEmojis";

let knownEmojis: Set<string> = new Set(Object.keys(BUILTIN_EMOJIS));

export function setKnownEmojis(names: Iterable<string>) {
  knownEmojis = new Set(names);
}

function isEmojiCandidate(name: string): boolean {
  if (name.includes("-")) return false;
  return knownEmojis.has(name);
}

export function resolveBracketContent(raw: string): EmojiResolution {
  const result: EmojiResolution = {
    classNames: [],
    style: {},
    emojis: [],
    unicodes: [],
  };

  const values = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const value of values) {
    const colonMatch = value.match(/^:(.+):$/);
    if (colonMatch) {
      const name = colonMatch[1];
      result.classNames.push(name);
      result.emojis.push(name);
      continue;
    }

    result.classNames.push(value);

    const { textStyle } = getStyle([value]);
    if (Object.keys(textStyle).length > 0) {
      Object.assign(result.style, textStyle);
      continue;
    }

    if (isEmojiCandidate(value)) {
      result.emojis.push(value);
    }
  }

  return result;
}

/**
 * Get the Unicode character for an emoji shortcode.
 * Checks the runtime cache first, then falls back to the builtin map.
 * Returns the raw shortcode if no mapping is found.
 */
/**
 * Resolve [shortcode] patterns within free text (messages, conditions).
 * Replaces each [shortcode] with its emoji unicode character.
 */
export function resolveEmojiInText(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, (match, content) => {
    const resolution = resolveBracketContent(content);
    if (resolution.emojis.length > 0) {
      return resolution.emojis
        .map((name) => getEmojiUnicode(name))
        .join("");
    }
    return match; // Not an emoji — leave bracket text as-is
  });
}

export function getEmojiUnicode(
  shortcode: string,
  cache?: EmojiCache,
): string {
  const cached = cache?.get(shortcode);
  if (cached) return cached.unicode;
  return BUILTIN_EMOJIS[shortcode] || shortcode;
}
