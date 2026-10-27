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
  fragmentMinimumWidth,
  fragmentHeaderWidth,
} from "@/positioning/FragmentHeaderWidth";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { useEffect, useMemo, useState } from "react";
import { walkStatements } from "@/svg/walkStatements";

import { depthOnParticipant } from "@/parser/depthOnParticipant";
import Anchor from "@/positioning/Anchor";
import { centerOf } from "../utils";
import { createStore, useAtomValue, useStore } from "jotai";

type Store = ReturnType<typeof createStore>;

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

export const getOffsetX = (store: Store, context: any, origin: string) => {
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
  const anchor2Origin = new Anchor(
    centerOf(coordinates, origin),
    originLayers,
  );
  const anchor2LeftParticipant = new Anchor(
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
  const coordinates = useAtomValue(coordinatesAtom);
  const headerLabel = header?.label;
  const headerNumber = header?.number;
  const headerMinWidth = useMemo(() => {
    if (headerLabel == null) return FRAGMENT_MIN_WIDTH;
    const infos = walkStatements(store.get(rootContextAtom)!);
    const own = infos.find((info) => info.statNode === context);
    return own
      ? fragmentMinimumWidth(
          own,
          infos,
          coordinates,
          enableNumbering,
          headerLabel,
          headerNumber,
        )
      : Math.max(
          FRAGMENT_MIN_WIDTH,
          fragmentHeaderWidth(
            headerLabel,
            enableNumbering ? headerNumber : undefined,
          ),
        );
  }, [context, store, headerLabel, headerNumber, enableNumbering, coordinates]);
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setCollapsed(false);
  }, [context]);

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
