import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import store, { coordinatesAtom } from "@/store/Store";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { useEffect, useState } from "react";
import Anchor2 from "@/positioning/Anchor2";
import { centerOf, depthOnParticipant } from "../utils";

export const getLeftParticipant = (context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(context);
  return allParticipants.find((p) => localParticipants.includes(p));
};

export const getBorder = (context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(context);
  return FrameBorder(frame);
};

export const getOffsetX = (context: any, origin: string) => {
  const coordinates = store.get(coordinatesAtom);
  const leftParticipant = getLeftParticipant(context) || "";
  const halfLeftParticipant = coordinates.half(leftParticipant);

  // If leftParticipant and origin are the same, no additional offset needed
  if (leftParticipant === origin || !origin) {
    console.debug(`left participant: ${leftParticipant} ${halfLeftParticipant}`);
    return getBorder(context).left + halfLeftParticipant;
  }

  // Calculate the depth/layers for the origin participant to account for occurrence bar offset
  const originLayers = depthOnParticipant(context, origin);

  // Create anchors for both participants to calculate accurate distance
  const anchor2Origin = new Anchor2(centerOf(origin), originLayers);
  const anchor2LeftParticipant = new Anchor2(centerOf(leftParticipant), 0);

  // Calculate the offset from the left participant to the origin, accounting for occurrence bar layers
  const distanceWithLayers = anchor2LeftParticipant.centerToCenter(anchor2Origin);

  return distanceWithLayers + getBorder(context).left + halfLeftParticipant;
};

export const getPaddingLeft = (context: any) => {
  const halfLeftParticipant = store
    .get(coordinatesAtom)
    .half(getLeftParticipant(context) || "");
  return getBorder(context).left + halfLeftParticipant;
};

export const getFragmentStyle = (context: any, origin: string) => {
  return {
    // +1px for the border of the fragment
    transform: "translateX(" + (getOffsetX(context, origin) + 1) * -1 + "px)",
    width: TotalWidth(context, store.get(coordinatesAtom)) + "px",
    minWidth: FRAGMENT_MIN_WIDTH + "px",
  };
};

export const useFragmentData = (context: any, origin: string) => {
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
  const offsetX = getOffsetX(context, origin);
  const halfLeftParticipant = coordinates.half(leftParticipant);
  const paddingLeft = getBorder(context).left + halfLeftParticipant;

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
