import { formattedTextOf, labelRangeOfRef, labelRangeOfCondition, codeRangeOf } from "@/parser/helpers";
import { CodeRange } from "@/parser/CodeRange";
import { blockLength } from "@/utils/Numbering";
import { buildBlockVM } from "@/vm/block";
import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import Anchor2 from "@/positioning/Anchor2";
import { centerOf } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import { frameForContext, frameKeyOf } from "@/ir/frames";
import type { Coordinates } from "@/positioning/Coordinates";
import sequenceParser from "@/generated-parser/sequenceParser";

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

const resolveFragmentContext = (context: any) =>
  context?.loop?.() ||
  context?.alt?.() ||
  context?.par?.() ||
  context?.opt?.() ||
  context?.section?.() ||
  context?.critical?.() ||
  context?.tcf?.() ||
  context?.ref?.() ||
  context;

const getOffsetX = (
  fragmentContext: any,
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

  // Calculate the depth/layers for the origin participant to account for occurrence bar offset
  const originLayers = depthOnParticipant(fragmentContext, origin);

  // Create anchors for both participants to calculate accurate distance
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
): number => {
  // Temporary: Use the original TotalWidth function if context is available
  // This ensures we get the exact same width calculation including self-message handling
  if (fragmentData.context) {
    return TotalWidth(fragmentData.context, coordinates, frame);
  }

  // Fallback to simplified calculation (for when context is not available in the future)
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

  // TODO: Extract self-message width data during parsing to avoid context dependency
  const extraWidth = 0;

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
    width: TotalWidthFromData(fragmentData, coordinates, frame) + "px",
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

/**
 * Build FragmentPositioningVM from fragment context (legacy support)
 * @deprecated Use buildFragmentPositioningVM with FragmentData instead
 */
export function buildFragmentPositioningVMLegacy(
  context: any,
  origin: string,
  coordinates: Coordinates,
  framesModel: any,
): FragmentPositioningVM {
  const fragmentContext = resolveFragmentContext(context);

  const allParticipants = coordinates.orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(fragmentContext);
  const leftParticipant =
    allParticipants.find((p) => localParticipants.includes(p)) || "";

  const frame = frameForContext(framesModel, fragmentContext);
  const border = FrameBorder(frame);

  // Calculate offset using the updated function that accounts for occurrence bar layers
  const offsetX = getOffsetX(
    fragmentContext,
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
    width: TotalWidth(fragmentContext, coordinates, frame) + "px",
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
