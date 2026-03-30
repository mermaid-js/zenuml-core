import { getStyle } from "@/utils/messageStyling";
import type { EmojiResolution } from "./types";

let knownEmojis: Set<string> = new Set();

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
