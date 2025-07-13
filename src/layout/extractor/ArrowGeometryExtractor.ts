import { ArrowGeometry, ParticipantArrowData } from "../geometry/ArrowGeometry";
import { getParticipantCenter } from "@/positioning/GeometryUtils";
import { depthOnParticipant } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import sequenceParser from "@/generated-parser/sequenceParser";

/**
 * Extracts pure geometric data from context for arrow calculations
 * This is the only place that should touch the context object
 * All mathematical calculations should use the extracted data
 */
export class ArrowGeometryExtractor {
  
  /**
   * Extract all geometric data needed for arrow calculations
   * Replaces the context-dependent logic in useArrow
   */
  static extractArrowGeometry({
    context,
    origin,
    source,
    target,
  }: {
    context: any;
    origin: string;
    source: string;
    target: string;
  }): ArrowGeometry {
    
    // Extract geometric data for each participant
    const originData = this.extractParticipantData(context, origin);
    const sourceData = this.extractParticipantData(context, source);
    const targetData = this.extractParticipantData(context, target, true); // Use special logic for target
    
    return {
      origin: originData,
      source: sourceData,
      target: targetData,
      isSelfCall: source === target,
    };
  }
  
  /**
   * Extract geometric data for a single participant
   * Centralizes all context-dependent logic for participant data
   */
  private static extractParticipantData(
    context: any, 
    participantName: string, 
    isTarget: boolean = false
  ): ParticipantArrowData {
    
    const centerPosition = getParticipantCenter(participantName);
    const activationLayers = isTarget 
      ? this.depthOnParticipantForTarget(context, participantName)
      : depthOnParticipant(context, participantName);
    
    return {
      name: participantName,
      centerPosition,
      activationLayers,
    };
  }
  
  /**
   * Special depth calculation for target participants
   * Migrated from depthOnParticipant4Stat in useArrow.ts
   */
  private static depthOnParticipantForTarget(context: any, participant: any): number {
    if (!(context instanceof sequenceParser.StatContext)) {
      return 0;
    }

    // Get the first child by checking each possible child type
    const child = context.alt() || 
                  context.par() || 
                  context.opt() || 
                  context.critical() || 
                  context.section() || 
                  context.ref() || 
                  context.loop() || 
                  context.creation() || 
                  context.message() || 
                  context.asyncMessage() || 
                  context.ret() || 
                  context.divider() || 
                  context.tcf();
    
    if (!child) {
      return 0;
    }
    return depthOnParticipant(child, participant);
  }
}