import { measureTextWithFont } from "./WidthProviderFunc";

export const fragmentHeaderLabel = (kind: string): string => {
  const labels: Record<string, string> = {
    alt: "Alt",
    loop: "Loop",
    opt: "Opt",
    par: "Par",
    critical: "Critical",
    section: "Section",
    tcf: "Try",
    ref: "Ref",
  };
  return labels[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1);
};

/** Padding, icon column and title spacing, plus room for the number-to-icon gap. */
export const fragmentHeaderWidth = (label: string, number?: string) =>
  Math.ceil(
    32 +
      measureTextWithFont(label, "14px", "all-small-caps") * 1.1 +
      (number ? measureTextWithFont(number, "12px") + 15 : 0),
  );
