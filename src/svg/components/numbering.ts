import { measureTextWithFont } from "@/positioning/WidthProviderFunc";
import { esc } from "./svgUtils";

export function messageNumberWidth(number: string): number {
  return measureTextWithFont(number, "12px") + 8;
}

/** A 4px gutter stays outside the badge; its text has 4px padding on each side. */
export function renderMessageNumber(
  number: string | undefined,
  right: number,
  baseline: number,
): string {
  if (!number) return "";
  return `<rect x="${right - messageNumberWidth(number)}" y="${baseline - 12}" width="${messageNumberWidth(number)}" height="16" rx="2" class="message-number-bg"/>
  <text x="${right - 4}" y="${baseline}" text-anchor="end" class="seq-number">${esc(number)}</text>`;
}
