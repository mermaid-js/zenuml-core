/**
 * Unified layout mathematical calculation utility class
 * Contains all core distance, width and position calculation functions
 * Based on new geometric data interfaces, providing clear mathematical models
 */

import { ParticipantGeometry, FragmentGeometry, MessageGeometry } from "./GeometryTypes";
import { UnifiedAnchor } from "./UnifiedAnchor";
import { FRAGMENT_PADDING_X, FRAGMENT_MIN_WIDTH, LIFELINE_WIDTH, ARROW_HEAD_WIDTH, OCCURRENCE_WIDTH } from "./Constants";

/**
 * Core layout mathematical calculation class
 * All calculations are based on pure geometric data, independent of complex context objects
 */
export class LayoutMath {
  
  // ==================== Basic Distance Calculations ====================
  
  /**
   * Calculate the center distance between two participants
   * @param from Starting participant
   * @param to Target participant
   * @returns Distance (positive means right, negative means left)
   */
  static participantDistance(from: ParticipantGeometry, to: ParticipantGeometry): number {
    return to.centerPosition - from.centerPosition;
  }

  /**
   * Calculate interaction width (for message rendering)
   * @param source Source participant
   * @param target Target participant
   * @returns Interaction width
   */
  static interactionWidth(source: ParticipantGeometry, target: ParticipantGeometry): number {
    const sourceAnchor = UnifiedAnchor.fromParticipantGeometry(source);
    const targetAnchor = UnifiedAnchor.fromParticipantGeometry(target);
    return Math.abs(sourceAnchor.edgeOffset(targetAnchor));
  }


  // ==================== Participant Layout Calculations ====================

  /**
   * Calculate the left boundary of participant
   * @param participant Participant geometry data
   * @returns Left boundary position
   */
  static participantLeft(participant: ParticipantGeometry): number {
    return participant.centerPosition - participant.halfWidth;
  }

  /**
   * Calculate the right boundary of participant
   * @param participant Participant geometry data
   * @returns Right boundary position
   */
  static participantRight(participant: ParticipantGeometry): number {
    return participant.centerPosition + participant.halfWidth;
  }

  /**
   * Calculate the full width of participant
   * @param participant Participant geometry data
   * @returns Full width
   */
  static participantWidth(participant: ParticipantGeometry): number {
    return participant.halfWidth * 2;
  }

  // ==================== Fragment Layout Calculations ====================

  /**
   * Calculate Fragment border padding
   * @param borderDepth Border depth (nesting level)
   * @returns Border padding object
   */
  static fragmentBorderPadding(borderDepth: number): { left: number; right: number } {
    const padding = FRAGMENT_PADDING_X * borderDepth;
    return { left: padding, right: padding };
  }

  /**
   * Calculate Fragment base offset
   * @param leftParticipant Leftmost participant
   * @param borderDepth Border depth
   * @returns Base offset
   */
  static fragmentBaseOffset(leftParticipant: ParticipantGeometry, borderDepth: number): number {
    const borderPadding = this.fragmentBorderPadding(borderDepth);
    return borderPadding.left + leftParticipant.halfWidth;
  }

  /**
   * Calculate Fragment activation layer correction offset
   * @param leftParticipant Leftmost participant
   * @param originParticipant Origin participant (with activation layers)
   * @returns Activation layer correction offset
   */
  static fragmentActivationLayerCorrection(
    leftParticipant: ParticipantGeometry,
    originParticipant: ParticipantGeometry
  ): number {
    const leftAnchor = UnifiedAnchor.fromParticipantGeometry({
      ...leftParticipant,
      activationLayers: 0, // Left participant does not consider activation layers
    });
    const originAnchor = UnifiedAnchor.fromParticipantGeometry(originParticipant);
    return leftAnchor.centerToCenter(originAnchor);
  }

  /**
   * Calculate Fragment total offset
   * @param leftParticipant Leftmost participant
   * @param originParticipant Origin participant
   * @param borderDepth Border depth
   * @returns Total offset
   */
  static fragmentTotalOffset(
    leftParticipant: ParticipantGeometry,
    originParticipant: ParticipantGeometry,
    borderDepth: number
  ): number {
    // If same participant, return base offset directly
    if (leftParticipant.name === originParticipant.name) {
      return this.fragmentBaseOffset(leftParticipant, borderDepth);
    }

    // Cross-participant composite transformation
    const baseOffset = this.fragmentBaseOffset(leftParticipant, borderDepth);
    const layerCorrection = this.fragmentActivationLayerCorrection(leftParticipant, originParticipant);
    return baseOffset + layerCorrection;
  }

  // ==================== Width Calculations ====================

  /**
   * Calculate participant span width
   * @param leftParticipant Leftmost participant
   * @param rightParticipant Rightmost participant
   * @returns Participant span width
   */
  static participantSpanWidth(
    leftParticipant: ParticipantGeometry,
    rightParticipant: ParticipantGeometry
  ): number {
    const distance = this.participantDistance(leftParticipant, rightParticipant);
    return distance + leftParticipant.halfWidth + rightParticipant.halfWidth;
  }

  /**
   * Calculate Fragment total width
   * @param leftParticipant Leftmost participant
   * @param rightParticipant Rightmost participant
   * @param borderDepth Border depth
   * @param extraWidth Extra width (e.g. extra width from self messages)
   * @returns Fragment total width
   */
  static fragmentTotalWidth(
    leftParticipant: ParticipantGeometry,
    rightParticipant: ParticipantGeometry,
    borderDepth: number,
    extraWidth: number = 0
  ): number {
    const participantSpan = this.participantSpanWidth(leftParticipant, rightParticipant);
    const borderPadding = this.fragmentBorderPadding(borderDepth);
    const totalBorderWidth = borderPadding.left + borderPadding.right;
    
    return Math.max(
      participantSpan + totalBorderWidth + extraWidth,
      FRAGMENT_MIN_WIDTH
    );
  }

  // ==================== Message Width Calculations ====================

  /**
   * Calculate message display width (text + creation adjustments, excluding arrows/occurrence)
   * This matches the behavior of coordinates.getMessageWidth()
   * @param messageGeometry Message geometry data
   * @returns Message display width
   */
  static messageWidth(messageGeometry: MessageGeometry): number {
    let totalWidth = messageGeometry.textWidth;

    // Add extra width for creation messages
    if (messageGeometry.messageType === "creation") {
      totalWidth += messageGeometry.to.halfWidth;
    }

    // NOTE: ARROW_HEAD_WIDTH + OCCURRENCE_WIDTH are handled separately in the calling logic
    return totalWidth;
  }

  /**
   * Calculate message total width including arrows and activation bars
   * @param messageGeometry Message geometry data
   * @returns Message total width including all visual elements
   */
  static messageWidthWithVisualElements(messageGeometry: MessageGeometry): number {
    return this.messageWidth(messageGeometry) + ARROW_HEAD_WIDTH + OCCURRENCE_WIDTH;
  }

  // ==================== Direction Utilities ====================

  /**
   * Determine the relative direction between two participants
   * @param from Starting participant
   * @param to Target participant
   * @returns true means right to left, false means left to right
   */
  static isRightToLeft(from: ParticipantGeometry, to: ParticipantGeometry): boolean {
    return to.centerPosition < from.centerPosition;
  }

  /**
   * Determine if it is a self message
   * @param from Starting participant
   * @param to Target participant
   * @returns Whether it is a self message
   */
  static isSelfMessage(from: ParticipantGeometry, to: ParticipantGeometry): boolean {
    return from.name === to.name;
  }

  // ==================== Fragment Offset and Transform Calculations ====================

  /**
   * Calculate fragment offset in global coordinate system
   * @param leftParticipant Leftmost participant
   * @param originParticipant Origin participant (where fragment starts)
   * @param borderDepth Border depth
   * @returns Fragment offset for CSS transform
   */
  static fragmentOffset(
    leftParticipant: ParticipantGeometry,
    originParticipant: ParticipantGeometry | null,
    borderDepth: number
  ): number {
    const baseOffset = this.fragmentBaseOffset(leftParticipant, borderDepth);
    
    // If same participant or no origin, return base offset directly
    if (!originParticipant || leftParticipant.name === originParticipant.name) {
      return baseOffset;
    }
    
    // Cross-participant spatial transformation
    const spatialCorrection = this.fragmentActivationLayerCorrection(leftParticipant, originParticipant);
    return baseOffset + spatialCorrection;
  }

  /**
   * Generate CSS transform string for fragment positioning
   * @param leftParticipant Leftmost participant
   * @param originParticipant Origin participant
   * @param borderDepth Border depth
   * @returns CSS transform string
   */
  static fragmentTransform(
    leftParticipant: ParticipantGeometry,
    originParticipant: ParticipantGeometry | null,
    borderDepth: number
  ): string {
    const offsetX = this.fragmentOffset(leftParticipant, originParticipant, borderDepth);
    return `translateX(${-(offsetX + 1)}px)`;
  }

  /**
   * Calculate fragment padding left (border + participant half width)
   * @param leftParticipant Leftmost participant
   * @param borderDepth Border depth
   * @returns Padding left value
   */
  static fragmentPaddingLeft(
    leftParticipant: ParticipantGeometry,
    borderDepth: number
  ): number {
    return this.fragmentBaseOffset(leftParticipant, borderDepth);
  }

  // ==================== Fragment Context Width Calculations ====================

  /**
   * Calculate fragment context total width
   * @param leftParticipant Leftmost participant
   * @param rightParticipant Rightmost participant
   * @param borderDepth Border depth
   * @param extraWidth Extra width (e.g. from self messages)
   * @returns Fragment context total width
   */
  static fragmentContextTotalWidth(
    leftParticipant: ParticipantGeometry,
    rightParticipant: ParticipantGeometry,
    borderDepth: number,
    extraWidth: number = 0
  ): number {
    const participantSpan = this.participantSpanWidth(leftParticipant, rightParticipant);
    const borderPadding = this.fragmentBorderPadding(borderDepth);
    const totalBorderWidth = borderPadding.left + borderPadding.right;
    
    return Math.max(
      participantSpan + totalBorderWidth + extraWidth,
      FRAGMENT_MIN_WIDTH
    );
  }

  /**
   * Calculate extra width due to self messages
   * @param selfMessages Array of self messages
   * @param rightParticipant Rightmost participant
   * @returns Maximum extra width needed
   */
  static selfMessageExtraWidth(
    selfMessages: MessageGeometry[],
    rightParticipant: ParticipantGeometry
  ): number {
    const widths = selfMessages.map(message => {
      const messageWidth = this.messageWidth(message);
      const distanceToRight = this.participantDistance(message.from, rightParticipant);
      const rightHalfWidth = rightParticipant.halfWidth;
      
      return messageWidth - distanceToRight - rightHalfWidth;
    });
    
    return Math.max(0, ...widths);
  }

  // ==================== Helper Calculation Methods ====================


  /**
   * Calculate CSS transform string
   * @param translateX X-axis offset
   * @returns CSS transform string
   */
  static generateTransformCSS(translateX: number): string {
    return `translateX(${translateX}px)`;
  }
}