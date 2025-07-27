import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { coordinatesAtom } from "@/store/Store";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { useEffect, useState } from "react";
import sequenceParser from "@/generated-parser/sequenceParser";
import Anchor2 from "@/positioning/Anchor2";
import { centerOf } from "../utils";
import { createStore, useStore } from "jotai";

type Store = ReturnType<typeof createStore>;

// Helper function to calculate the depth/layers on a participant due to nested calls
const depthOnParticipant = (context: any, participant: any): number => {
  return context?.getAncestors((ctx: any) => {
    const isSync = (ctx: any) => {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    };
    if (isSync(ctx)) {
      return ctx.Owner() === participant;
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
    console.debug(
      `left participant: ${leftParticipant} ${halfLeftParticipant}`,
    );
    return getBorder(store, context).left + halfLeftParticipant;
  }

  // Calculate the depth/layers for the origin participant to account for occurrence bar offset
  const originLayers = depthOnParticipant(context, origin);

  // Create anchors for both participants to calculate accurate distance
  const anchor2Origin = new Anchor2(centerOf(coordinates, origin), originLayers);
  const anchor2LeftParticipant = new Anchor2(centerOf(coordinates, leftParticipant), 0);

  // Calculate the offset from the left participant to the origin, accounting for occurrence bar layers
  const distanceWithLayers =
    anchor2LeftParticipant.centerToCenter(anchor2Origin);

  return (
    distanceWithLayers + getBorder(store, context).left + halfLeftParticipant
  );
};
export const useFragmentData = (context: any, origin: string) => {
  const store = useStore();
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
    minWidth: FRAGMENT_MIN_WIDTH + "px",
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
