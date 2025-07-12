import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import store, { coordinatesAtom } from "@/store/Store";
import {
  FRAGMENT_MIN_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import { useEffect, useState } from "react";
import { MessageCountingUtils } from "@/utils/MessageCountingUtils";

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
  // TODO: consider using this.getParticipantGap(this.participantModels[0])
  const halfLeftParticipant = coordinates.half(leftParticipant);
  const selfInvocationCount =
    MessageCountingUtils.getParticipantMessageDepth(context, origin) - 1;
  const selfInvocationAdjustment =
    selfInvocationCount * OCCURRENCE_BAR_SIDE_WIDTH;

  console.debug(`left participant: ${leftParticipant} ${halfLeftParticipant}`);
  console.debug(`self-invocation adjustment: ${selfInvocationAdjustment}px`);

  return (
    (origin ? coordinates.distance(leftParticipant, origin) : 0) +
    getBorder(context).left +
    halfLeftParticipant +
    selfInvocationAdjustment
  );
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
  const leftParticipant = getLeftParticipant(context) || "";
  const border = getBorder(context);
  const offsetX = getOffsetX(context, origin);
  const paddingLeft = getPaddingLeft(context);

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
    halfLeftParticipant: coordinates.half(leftParticipant),
    leftParticipant,
  };
};
