import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import store, { coordinatesAtom } from "@/store/Store";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { useEffect, useState } from "react";
import { AllMessages } from "@/parser/MessageCollector";
import { OwnableMessageType } from "@/parser/OwnableMessage.ts";

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

/**
 * Calculate the visual width consumed by self-invocations between origin and target participant.
 * Self-invocations render visual arrows that consume horizontal space but aren't accounted for
 * in the basic distance calculation between participant centers.
 */
const getSelfInvocationWidthAdjustment = (
  context: any,
  origin: string,
  leftParticipant: string,
): number => {
  if (!origin || !leftParticipant || origin === leftParticipant) {
    return 0;
  }

  const coordinates = store.get(coordinatesAtom);
  const allParticipants = coordinates.orderedParticipantNames();
  const allMessages = AllMessages(context);

  // Get the indices of origin and leftParticipant to determine the range
  const originIndex = allParticipants.indexOf(origin);
  const leftParticipantIndex = allParticipants.indexOf(leftParticipant);

  if (originIndex === -1 || leftParticipantIndex === -1) {
    return 0;
  }

  // Determine the range of participants between origin and leftParticipant
  const startIndex = Math.min(originIndex, leftParticipantIndex);
  const endIndex = Math.max(originIndex, leftParticipantIndex);
  const participantsInRange = allParticipants.slice(startIndex, endIndex + 1);

  // Count self-invocations that affect the visual path
  let selfInvocationCount = 0;

  for (const message of allMessages) {
    // Check if it's a self-invocation (from === to)
    if (
      message.type === OwnableMessageType.SyncMessage &&
      message.from === message.to &&
      participantsInRange.includes(message.from || "")
    ) {
      selfInvocationCount++;
    }
  }

  // Each self-invocation contributes approximately 7px of visual width
  // This is the difference observed in the bug report
  const SELF_INVOCATION_VISUAL_WIDTH = 7;

  return selfInvocationCount * SELF_INVOCATION_VISUAL_WIDTH;
};

export const getOffsetX = (context: any, origin: string) => {
  const coordinates = store.get(coordinatesAtom);
  const leftParticipant = getLeftParticipant(context) || "";
  // TODO: consider using this.getParticipantGap(this.participantModels[0])
  const halfLeftParticipant = coordinates.half(leftParticipant);
  const selfInvocationAdjustment = getSelfInvocationWidthAdjustment(
    context,
    origin,
    leftParticipant,
  );

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

  const allParticipants = coordinates.orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(context);
  const leftParticipant =
    allParticipants.find((p) => localParticipants.includes(p)) || "";

  const frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(context);
  const border = FrameBorder(frame);

  // TODO: consider using this.getParticipantGap(this.participantModels[0])
  const halfLeftParticipant = coordinates.half(leftParticipant);
  const selfInvocationAdjustment = getSelfInvocationWidthAdjustment(
    context,
    origin,
    leftParticipant,
  );

  console.debug(`left participant: ${leftParticipant} ${halfLeftParticipant}`);
  console.debug(`self-invocation adjustment: ${selfInvocationAdjustment}px`);

  const offsetX =
    (origin ? coordinates.distance(leftParticipant, origin) : 0) +
    getBorder(context).left +
    halfLeftParticipant +
    selfInvocationAdjustment;
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
