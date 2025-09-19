import { formattedTextOf, labelRangeOfRef, labelRangeOfCondition, codeRangeOf } from "@/parser/helpers";
import { CodeRange } from "@/parser/CodeRange";
import { blockLength } from "@/utils/Numbering";
import { buildBlockVM } from "@/vm/block";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import Anchor2 from "@/positioning/Anchor2";
import { centerOf } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import { frameKeyOf } from "@/ir/frames";
import type { Coordinates } from "@/positioning/Coordinates";
import type { IRMessage } from "@/ir/messages";
import sequenceParser from "@/generated-parser/sequenceParser";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export interface RefVM {
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

export interface ConditionVM {
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

export interface AltVM {
  blockLengthAcc: number[];
  ifConditionVM: ConditionVM | null;
  ifBlockVM: any | null; // BlockVM
  elseIfBlocks: Array<{
    conditionVM: ConditionVM | null;
    blockVM: any | null; // BlockVM
  }>;
  elseBlockVM: any | null; // BlockVM
}

export type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'critical' | 'section' | 'tcf' | 'ref';

export interface FragmentData {
  type: FragmentType;
  localParticipantNames: string[];
  frameId: string; // Reference to frame in framesModel
  participantLayers: Record<string, number>; // Pre-computed participant depths
  context?: any; // Temporary: needed for width calculation until we extract message data
  // Additional fragment-specific data as needed
}

export interface FragmentPositioningVM {
  offsetX: number;
  paddingLeft: number;
  fragmentStyle: {
    transform: string;
    width: string;
    minWidth: string;
  };
  border: any;
  halfLeftParticipant: number;
  leftParticipant: string;
}

/**
 * Determine fragment type from context
 */
function determineFragmentType(context: any): FragmentType {
  if (context?.loop?.()) return 'loop';
  if (context?.alt?.()) return 'alt';
  if (context?.par?.()) return 'par';
  if (context?.opt?.()) return 'opt';
  if (context?.section?.()) return 'section';
  if (context?.critical?.()) return 'critical';
  if (context?.tcf?.()) return 'tcf';
  if (context?.ref?.()) return 'ref';
  throw new Error('Unknown fragment type');
}

/**
 * Compute participant layers for a fragment context
 */
function computeParticipantLayers(context: any): Record<string, number> {
  const participantLayers: Record<string, number> = {};
  const localParticipants = getLocalParticipantNames(context);
  
  localParticipants.forEach(participant => {
    participantLayers[participant] = depthOnParticipant(context, participant);
  });
  
  return participantLayers;
}

/**
 * Extract FragmentData from fragment context
 * This should be called once during parsing, not during rendering
 * The context is already a fragment context (e.g. AltContext, LoopContext, etc.)
 */
export function extractFragmentData(context: any): FragmentData {
  return {
    type: determineFragmentType(context),
    localParticipantNames: getLocalParticipantNames(context),
    frameId: frameKeyOf(context) || '',
    participantLayers: computeParticipantLayers(context),
    context, // Temporary: include context for width calculation
  };
}

/**
 * Build RefVM from ref context
 */
export function buildRefVM(context: any): RefVM | null {
  if (!context) return null;
  
  const refCtx = context?.ref?.();
  if (!refCtx) return null;
  
  const content = refCtx?.Content?.();
  const labelText = formattedTextOf(content) || "";
  const labelRange = labelRangeOfRef(refCtx);
  const codeRange = codeRangeOf(context);
  
  return {
    labelText,
    labelRange,
    codeRange,
  };
}

/**
 * Build ConditionVM from condition context
 */
export function buildConditionVM(context: any): ConditionVM | null {
  if (!context) return null;
  
  const labelText = formattedTextOf(context) || "";
  const labelRange = labelRangeOfCondition(context);
  const codeRange = codeRangeOf(context);
  
  return {
    labelText,
    labelRange,
    codeRange,
  };
}

/**
 * Build AltVM from alt context
 */
export function buildAltVM(context: any): AltVM | null {
  if (!context) return null;
  
  const alt = context.alt?.();
  if (!alt) return null;
  
  const ifBlock = alt.ifBlock?.();
  const elseIfBlocks = alt.elseIfBlock?.() || [];
  const elseBlock = alt.elseBlock?.()?.braceBlock?.()?.block?.();
  const blockInIfBlock = ifBlock?.braceBlock?.()?.block?.();
  
  // Helper functions
  function conditionFromIfElseBlock(block: any) {
    return block?.parExpr?.()?.condition?.();
  }

  function blockInElseIfBlock(block: any) {
    return block?.braceBlock?.()?.block?.();
  }
  
  // Build block length accumulator
  const blockLengthAcc: number[] = [blockInIfBlock ? blockLength(blockInIfBlock) : 0];
  if (elseIfBlocks.length > 0) {
    elseIfBlocks.forEach((block: any) => {
      const elseIfBlockContent = blockInElseIfBlock(block);
      blockLengthAcc.push(blockLengthAcc[blockLengthAcc.length - 1] + (elseIfBlockContent ? blockLength(elseIfBlockContent) : 0));
    });
  }
  
  // Build if condition and block VMs
  const ifCondition = conditionFromIfElseBlock(ifBlock);
  const ifConditionVM = buildConditionVM(ifCondition);
  const ifBlockVM = blockInIfBlock ? buildBlockVM(blockInIfBlock) : null;
  
  // Build elseIf blocks VMs
  const elseIfBlocksVM = elseIfBlocks.map((elseIfBlock: any) => {
    const condition = conditionFromIfElseBlock(elseIfBlock);
    const conditionVM = buildConditionVM(condition);
    const blockVM = blockInElseIfBlock(elseIfBlock) ? buildBlockVM(blockInElseIfBlock(elseIfBlock)) : null;
    
    return {
      conditionVM,
      blockVM,
    };
  });
  
  // Build else block VM
  const elseBlockVM = elseBlock ? buildBlockVM(elseBlock) : null;
  
  return {
    blockLengthAcc,
    ifConditionVM,
    ifBlockVM,
    elseIfBlocks: elseIfBlocksVM,
    elseBlockVM,
  };
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
      return ctx.Owner() === participant;
    }
    return false;
  }).length;
};
/**
 * Calculate offset using FragmentData (new VM pattern)
 */
const getOffsetXFromData = (
  fragmentData: FragmentData,
  origin: string,
  borderLeft: number,
  leftParticipant: string,
  coordinates: Coordinates,
) => {
  if (!leftParticipant) {
    return borderLeft;
  }

  const halfLeftParticipant = coordinates.half(leftParticipant);

  // If leftParticipant and origin are the same, no additional offset needed
  if (leftParticipant === origin || !origin) {
    console.debug(
      `left participant: ${leftParticipant} ${halfLeftParticipant}`,
    );
    return borderLeft + halfLeftParticipant;
  }

  // Calculate the depth/layers for the origin participant using pre-computed data
  const originLayers = fragmentData.participantLayers[origin] || 0;

  // Create anchors for both participants to calculate accurate distance
  // This matches the original logic exactly
  const anchor2Origin = new Anchor2(
    centerOf(coordinates, origin),
    originLayers,
    origin,
  );
  const anchor2LeftParticipant = new Anchor2(
    centerOf(coordinates, leftParticipant),
    0,
    leftParticipant,
  );

  // Calculate the offset from the left participant to the origin, accounting for occurrence bar layers
  const distanceWithLayers =
    anchor2LeftParticipant.centerToCenter(anchor2Origin);

  return distanceWithLayers + borderLeft + halfLeftParticipant;
};

/**
 * Calculate total width using FragmentData (new VM pattern)
 * Temporarily uses the original TotalWidth function with context for accurate calculation
 */
const TotalWidthFromData = (
  fragmentData: FragmentData,
  coordinates: Coordinates,
  frame: any,
  messages: IRMessage[],
): number => {
  // Derive participants from fragment data for span; use frame for border and message scoping
  const allParticipants = coordinates.orderedParticipantNames();
  const localParticipants = fragmentData.localParticipantNames;
  const leftParticipant =
    allParticipants.find((p) => localParticipants.includes(p)) || "";
  const rightParticipant =
    allParticipants
      .slice()
      .reverse()
      .find((p) => localParticipants.includes(p)) || "";

  const border = FrameBorder(frame);

  // Calculate participant width
  const participantWidth =
    coordinates.distance(leftParticipant, rightParticipant) +
    coordinates.half(leftParticipant) +
    coordinates.half(rightParticipant);

  // Scope messages to this frame's code range when available
  let scopedMessages = messages;
  if (frame?.id) {
    const [startStr, stopStr] = String(frame.id).split(":");
    const start = parseInt(startStr, 10);
    const stop = parseInt(stopStr, 10);
    if (!Number.isNaN(start) && !Number.isNaN(stop)) {
      scopedMessages = messages.filter((m) => {
        const r = m.range;
        if (!r) return false;
        const [rs, re] = r;
        return rs >= start && re <= stop;
      });
    }
  }

  // Compute extra width considering only self messages inside this frame
  // Note: rightParticipant may be empty if locals are empty; in that case extraWidth = 0
  const extraWidth = rightParticipant
    ? Math.max(
        0,
        ...scopedMessages
          .filter((m) => m.from === m.to)
          .map(
            (m) =>
              coordinates.getMessageWidth(m as any) -
              coordinates.distance((m.from as string) || _STARTER_, rightParticipant) -
              coordinates.half(rightParticipant),
          ),
      )
    : 0;

  return (
    Math.max(participantWidth, FRAGMENT_MIN_WIDTH) +
    border.left +
    border.right +
    extraWidth
  );
};

/**
 * Build FragmentPositioningVM from fragment data (new VM pattern)
 */
export function buildFragmentPositioningVM(
  fragmentData: FragmentData,
  origin: string,
  coordinates: Coordinates,
  framesModel: any,
  messages: IRMessage[] = [],
): FragmentPositioningVM {
  const allParticipants = coordinates.orderedParticipantNames();
  const localParticipants = fragmentData.localParticipantNames;
  const leftParticipant =
    allParticipants.find((p) => localParticipants.includes(p)) || "";

  const frame = framesModel.byId[fragmentData.frameId];
  const border = FrameBorder(frame);

  // Calculate offset using pre-computed participant layers
  const offsetX = getOffsetXFromData(
    fragmentData,
    origin,
    border.left,
    leftParticipant,
    coordinates,
  );
  const halfLeftParticipant = leftParticipant
    ? coordinates.half(leftParticipant)
    : 0;
  const paddingLeft = border.left + halfLeftParticipant;

  const fragmentStyle = {
    // +1px for the border of the fragment
    transform: "translateX(" + (offsetX + 1) * -1 + "px)",
    width: TotalWidthFromData(fragmentData, coordinates, frame, messages) + "px",
    minWidth: FRAGMENT_MIN_WIDTH + "px",
  };

  return {
    offsetX,
    paddingLeft,
    fragmentStyle,
    border,
    halfLeftParticipant,
    leftParticipant,
  };
}
