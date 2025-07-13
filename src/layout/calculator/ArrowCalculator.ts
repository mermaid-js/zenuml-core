import Anchor2 from "@/positioning/Anchor2";
import { ArrowGeometry, ArrowLayoutResult, ParticipantArrowData } from "../geometry/ArrowGeometry";

/**
 * Pure mathematical arrow layout calculator
 * Contains no dependencies on Context or parsing logic
 * All calculations are based on pre-extracted geometric data
 */
export class ArrowCalculator {
  
  /**
   * Calculate complete arrow layout from pure geometric data
   * This replaces the context-dependent useArrow hook logic
   */
  calculateArrowLayout(geometry: ArrowGeometry): ArrowLayoutResult {
    const { origin, source, target } = geometry;
    
    // Create anchor objects for mathematical calculations (used internally only)
    const anchor2Origin = this.createAnchor(origin);
    const anchor2Source = this.createAnchor(source);
    const anchor2Target = this.createAnchor(target);
    
    // Pure mathematical calculations
    const interactionWidth = Math.abs(anchor2Source.edgeOffset(anchor2Target));
    const rightToLeft = this.isRightToLeft(source, target);
    const translateX = anchor2Origin.centerToEdge(
      !rightToLeft ? anchor2Source : anchor2Target
    );
    
    return {
      // Core layout fields (used by all components)
      interactionWidth,
      rightToLeft,
      translateX,
      
      // Metadata fields (used by specific components)
      isSelf: geometry.isSelfCall,
      originLayers: origin.activationLayers,
      sourceLayers: source.activationLayers,
      targetLayers: target.activationLayers,
    };
  }
  
  /**
   * Create Anchor2 instance from participant data
   * Pure mathematical transformation of geometric parameters
   */
  private createAnchor(participant: ParticipantArrowData): Anchor2 {
    return new Anchor2(participant.centerPosition, participant.activationLayers);
  }
  
  /**
   * Determine arrow direction based on participant positions
   * Pure mathematical comparison, no context traversal needed
   */
  private isRightToLeft(source: ParticipantArrowData, target: ParticipantArrowData): boolean {
    return target.centerPosition - source.centerPosition < 0;
  }
  
  /**
   * Calculate distance between two participants
   * Pure mathematical function based on positions
   */
  calculateDistance(from: ParticipantArrowData, to: ParticipantArrowData): number {
    return to.centerPosition - from.centerPosition;
  }
  
  /**
   * Check if this is a self-call based on participant names
   * Simple string comparison, no context needed
   */
  isSelfCall(source: string, target: string): boolean {
    return source === target;
  }
}