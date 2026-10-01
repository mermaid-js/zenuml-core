import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import {
  coordinatesAtom,
  enableNumberingAtom,
  rootContextAtom,
} from "@/store/Store";
import {
  fragmentHeaderLabel,
  fragmentHeaderWidth,
} from "@/positioning/FragmentHeaderWidth";
import {
  FRAGMENT_MIN_WIDTH,
  FRAGMENT_PADDING_X,
} from "@/positioning/Constants";
import { useEffect, useMemo, useState } from "react";
import { walkStatements } from "@/svg/walkStatements";
import {
  fragmentGuardKeyword,
  fragmentGuardWidth,
} from "@/positioning/FragmentGuardWidth";
import sequenceParser from "@/generated-parser/sequenceParser";
import Anchor2 from "@/positioning/Anchor2";
import { centerOf } from "../utils";
import { createStore, useAtomValue, useStore } from "jotai";
import type { AugmentedContext } from "@/parser/AntlrTypes";

type Store = ReturnType<typeof createStore>;

// Owner is installed on MessageContext/CreationContext's prototypes at
// runtime (see src/parser/Owner.js) — TS's inference for the ANTLR-generated
// classes doesn't see prototype patches applied from another file (see
// AntlrTypes.AugmentedContext's doc comment), so the narrowed context value
// is cast to this shape below.
interface OwnedContext extends AugmentedContext {
  Owner(): string | undefined;
}

// Helper function to calculate the depth/layers on a participant due to nested calls
const depthOnParticipant = (context: any, participant: any): number => {
  return context?.getAncestors((ctx: any) => {
    const isSync = (ctx: any) => {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    };
    if (isSync(ctx)) {
      return (ctx as unknown as OwnedContext).Owner() === participant;
    }
    return false;
  }).length;
};

const getLeftParticipant = (store: Store, context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(context);
  return allParticipants.find((p) => localParticipants.includes(p));
};

const getBorder = (store: Store, context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(context);
  return FrameBorder(frame);
};

const getOffsetX = (store: Store, context: any, origin: string) => {
  const coordinates = store.get(coordinatesAtom);
  const leftParticipant = getLeftParticipant(store, context) || "";
  const halfLeftParticipant = coordinates.half(leftParticipant);

  // If leftParticipant and origin are the same, no additional offset needed
  if (leftParticipant === origin || !origin) {
    return getBorder(store, context).left + halfLeftParticipant;
  }

  // Calculate the depth/layers for the origin participant to account for occurrence bar offset
  const originLayers = depthOnParticipant(context, origin);

  // Create anchors for both participants to calculate accurate distance
  const anchor2Origin = new Anchor2(
    centerOf(coordinates, origin),
    originLayers,
  );
  const anchor2LeftParticipant = new Anchor2(
    centerOf(coordinates, leftParticipant),
    0,
  );

  // Calculate the offset from the left participant to the origin, accounting for occurrence bar layers
  const distanceWithLayers =
    anchor2LeftParticipant.centerToCenter(anchor2Origin);

  return (
    distanceWithLayers + getBorder(store, context).left + halfLeftParticipant
  );
};
export const useFragmentData = (
  context: any,
  origin: string,
  header?: { label: string; number?: string },
) => {
  const store = useStore();
  const enableNumbering = useAtomValue(enableNumberingAtom);
  const headerLabel = header?.label;
  const headerNumber = header?.number;
  const headerMinWidth = useMemo(() => {
    if (headerLabel == null) return FRAGMENT_MIN_WIDTH;
    const infos = walkStatements(store.get(rootContextAtom)!);
    const own = infos.find((info) => info.statNode === context);
    let width = fragmentHeaderWidth(
      headerLabel,
      enableNumbering ? headerNumber : undefined,
    );
    if (own) {
      if (own.fragmentLabel)
        width = Math.max(
          width,
          fragmentGuardWidth(
            own.fragmentLabel,
            fragmentGuardKeyword(own.fragmentKind!, own.guardKeyword),
          ),
        );
      for (const section of own.fragmentSections ?? []) {
        if (section.guardKeyword)
          width = Math.max(
            width,
            fragmentGuardWidth(section.condition ?? "", section.guardKeyword),
          );
      }
      for (const info of infos) {
        if (
          info.kind !== "fragment" ||
          !info.number?.startsWith(`${own.number}.`)
        )
          continue;
        const number = headerNumber
          ? headerNumber + info.number.slice(own.number!.length)
          : undefined;
        const inset = (info.depth - own.depth) * FRAGMENT_PADDING_X * 2;
        width = Math.max(
          width,
          fragmentHeaderWidth(
            fragmentHeaderLabel(info.fragmentKind!),
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
          if (section.guardKeyword)
            width = Math.max(
              width,
              fragmentGuardWidth(
                section.condition ?? "",
                section.guardKeyword,
              ) + inset,
            );
        }
      }
    }
    return Math.max(FRAGMENT_MIN_WIDTH, width);
  }, [context, store, headerLabel, headerNumber, enableNumbering]);
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setCollapsed(false);
  }, [context]);

  const coordinates = store.get(coordinatesAtom);

  const allParticipants = coordinates.orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(context);
  const leftParticipant =
    allParticipants.find((p) => localParticipants.includes(p)) || "";

  const frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(context);
  const border = FrameBorder(frame);

  // Calculate offset using the updated function that accounts for occurrence bar layers
  const offsetX = getOffsetX(store, context, origin);
  const halfLeftParticipant = coordinates.half(leftParticipant);
  const paddingLeft = getBorder(store, context).left + halfLeftParticipant;

  const fragmentStyle = {
    // +1px for the border of the fragment
    transform: "translateX(" + (offsetX + 1) * -1 + "px)",
    width: TotalWidth(context, coordinates) + "px",
    minWidth: headerMinWidth + "px",
  };

  return {
    collapsed,
    toggleCollapse,
    offsetX,
    paddingLeft,
    fragmentStyle,
    border,
    halfLeftParticipant,
    leftParticipant,
  };
};
