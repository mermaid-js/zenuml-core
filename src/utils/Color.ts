import colorString from "color-string";

export function brightnessIgnoreAlpha(color: string): number {
  const c = colorString.get.rgb(color) || [0, 0, 0];
  // assuming alpha is always 1 (see removeAlpha in Participant.tsx)
  const [r, g, b] = c;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function removeAlpha(color: string): string {
  const c = colorString.get.rgb(color) || [0, 0, 0];
  const [r, g, b] = c;
  return `rgb(${r}, ${g}, ${b})`;
}
