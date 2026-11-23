import {
  FRAGMENT_MIN_WIDTH,
  FRAGMENT_PADDING_X,
  FRAME_TAB_CUT,
} from "./Constants";
import { fragmentGuardKeyword, fragmentGuardWidth } from "./FragmentGuardWidth";
import type { Coordinates } from "./Coordinates";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "./FrameBorder";
import { getLocalParticipantNames } from "./LocalParticipants";
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

export const fragmentTabWidth = (label: string, numberInset: number) =>
  26 +
  numberInset +
  measureTextWithFont(label, "14px", "all-small-caps") +
  4 +
  FRAME_TAB_CUT;

// The two frame borders and the space a DOM collapse control needs past the tab.
export const fragmentHeaderWidth = (label: string, number?: string) =>
  Math.ceil(
    fragmentTabWidth(
      label,
      number ? measureTextWithFont(number, "12px") + 14 : 0,
    ),
  ) + 8;

/** Minimum span of a fragment, including the titles and guards of its descendants. */
export const fragmentMinimumWidth = (
  own: import("@/svg/walkStatements").StatementInfo,
  infos: import("@/svg/walkStatements").StatementInfo[],
  coordinates: Coordinates,
  enableNumbering: boolean,
  headerLabel = own.fragmentHeaderLabel ??
    fragmentHeaderLabel(own.fragmentKind!),
  headerNumber = own.number,
) => {
  const participants = coordinates.orderedParticipantNames();
  const builder = new FrameBuilder(participants);
  const leftEdge = (info: import("@/svg/walkStatements").StatementInfo) => {
    const local = getLocalParticipantNames(info.statNode);
    const left = participants.find((name) => local.includes(name));
    if (!left) return 0;
    const border = FrameBorder(builder.getFrame(info.statNode));
    return coordinates.getPosition(left) - coordinates.half(left) - border.left;
  };
  const ownLeft = leftEdge(own);
  let width = FRAGMENT_MIN_WIDTH;
  for (const info of infos) {
    if (
      info.kind !== "fragment" ||
      (info !== own && !info.number?.startsWith(`${own.number}.`))
    )
      continue;
    const number = headerNumber
      ? headerNumber + info.number!.slice(own.number!.length)
      : undefined;
    const inset =
      info === own
        ? 0
        : leftEdge(info) -
          ownLeft +
          (info.depth - own.depth) * FRAGMENT_PADDING_X;
    width = Math.max(
      width,
      fragmentHeaderWidth(
        info === own
          ? headerLabel
          : (info.fragmentHeaderLabel ??
              fragmentHeaderLabel(info.fragmentKind!)),
        enableNumbering ? number : undefined,
      ) + inset,
    );
    if (info.fragmentLabel)
      width = Math.max(
        width,
        fragmentGuardWidth(
          info.fragmentLabel,
          fragmentGuardKeyword(info.fragmentKind!, info.guardKeyword),
        ) + inset,
      );
    for (const section of info.fragmentSections ?? []) {
      // Only alt guard rows are padded boxes; catch/finally labels are sized
      // by the SVG renderer.
      if (info.fragmentKind === "alt" && section.guardKeyword)
        width = Math.max(
          width,
          fragmentGuardWidth(section.condition ?? "", section.guardKeyword) +
            inset,
        );
    }
  }
  return width;
};
