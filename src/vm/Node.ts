import type { IRStatement } from "@/ir/tree-types";
import type { Coordinates } from "@/positioning/Coordinates";
import { _STARTER_ } from "@/constants";
import { centerOf } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import FrameBorder from "@/positioning/FrameBorder";

/**
 * Abstract base class for structural units in sequence diagrams
 * Uses polymorphism to let each subclass handle its own statement collection
 * This eliminates complex recursive logic with type checking
 * (blocks, fragments, etc.)
 */
export abstract class Node {
  /**
   * Each subclass implements this to collect its own statements
   * This eliminates the need for complex recursive logic with type checking
   */
  abstract getStatements(): IRStatement[];

  /**
   * Extract all participants involved in this node
   * Includes both direct message participants and nested participants
   */
  abstract getParticipants(): string[];

  /**
   * Extract participants from this node's direct content (polymorphic)
   * Each subclass implements this to handle its specific structure
   * This replaces the conditional logic in ParticipantExtractor
   */
  abstract extractDirectParticipants(): string[];

  /**
   * Calculate the vertical height of this node including all nested content
   * Each subclass implements this to calculate its own height polymorphically
   */
  abstract getHeight(): number;

  /**
   * Get all self-messages from this node using polymorphic getStatements()
   * A self-message is where from === to
   */
  getSelfMessages(): IRStatement[] {
    const statements = this.getStatements(); // 多态调用！
    return NodeUtils.getSelfMessages(statements);
  }

  /**
   * Get the leftmost participant in this node based on coordinate ordering
   */
  getLeftParticipant(coordinates: Coordinates): string {
    const participants = this.getParticipants();
    return NodeUtils.getLeftParticipant(participants, coordinates);
  }

  /**
   * Get the rightmost participant in this node based on coordinate ordering
   */
  getRightParticipant(coordinates: Coordinates): string | undefined {
    const participants = this.getParticipants();
    return NodeUtils.getRightParticipant(participants, coordinates, this.getRightParticipantFallback());
  }

  /**
   * Calculate the participant span for this node
   * Distance between leftmost and rightmost participants
   */
  computeParticipantSpan(coordinates: Coordinates): number {
    const leftParticipant = this.getLeftParticipant(coordinates);
    const rightParticipant = this.getRightParticipant(coordinates);
    return NodeUtils.computeParticipantSpan(leftParticipant, rightParticipant, coordinates);
  }

  /**
   * Compute the border for this node
   * Frame borders calculated using FrameBuilder - subclasses can override
   */
  computeBorder(): { left: number; right: number } {
    const frame = this.buildFrame();
    return NodeUtils.computeBorderFromFrame(frame);
  }

  /**
   * Compute extra width due to self messages in this node
   * Additional width needed to accommodate long self-message signatures
   */
  computeExtraWidthDueToSelfMessages(coordinates: Coordinates): number {
    const selfMessages = this.getSelfMessages(); // 使用多态的 getSelfMessages
    const rightParticipant = this.getRightParticipant(coordinates);
    return NodeUtils.computeExtraWidthDueToSelfMessages(selfMessages, rightParticipant, coordinates);
  }

  /**
   * Compute total width for this node
   * Combines participant span, borders, extra width, and minimum width constraints
   * Uses polymorphic methods for consistent behavior across all node types
   */
  computeWidth(coordinates: Coordinates, minWidth: number = 100): number {
    const participantSpan = this.computeParticipantSpan(coordinates);
    const border = this.computeBorder();
    const extraWidth = this.computeExtraWidthDueToSelfMessages(coordinates);
    return NodeUtils.computeTotalWidth(participantSpan, border, extraWidth, minWidth);
  }

  /**
   * Template methods that subclasses can override for specific behavior
   */
  protected getLeftParticipantFallback(): string | undefined {
    return undefined; // Default behavior
  }

  protected getRightParticipantFallback(): string | undefined {
    return undefined; // Default behavior
  }

  /**
   * Abstract method for frame building - must be implemented by subclasses
   */
  protected abstract buildFrame(): any;
}

/**
 * Utility functions for Node implementations
 */
export class NodeUtils {

  /**
   * Calculate spacing between two statements based on their types
   * - Async→async uses 16px spacing
   * - All other transitions use 19.5px spacing
   * (Creation messages are treated like sync messages)
   */
  static getSpacingBetween(current: IRStatement, next: IRStatement): number {
    const isCurrentAsync = current.kind === 'async' || current.kind === 'Async';
    const isNextAsync = next.kind === 'async' || next.kind === 'Async';

    // Async to async: 16px spacing
    if (isCurrentAsync && isNextAsync) {
      return 16;
    }

    // All other transitions (sync-sync, creation-sync, sync-creation, etc.): 19.5px spacing
    return 19.5;
  }

  /**
   * Get all self-messages from a list of statements
   * A self-message is where from === to
   */
  static getSelfMessages(statements: IRStatement[]): IRStatement[] {
    const selfMessages: IRStatement[] = [];

    for (const stmt of statements) {
      if (stmt.from === stmt.to && stmt.signature) {
        selfMessages.push(stmt);
      }
    }

    return selfMessages;
  }

  /**
   * Get the leftmost participant from a list of participants based on coordinate ordering
   */
  static getLeftParticipant(participants: string[], coordinates: Coordinates): string | undefined {
    // Use coordinates to find the leftmost participant
    const ordered = coordinates.orderedParticipantNames?.();

    const found = ordered.find((name) => participants.includes(name));
    return found || _STARTER_;
  }

  /**
   * Get the rightmost participant from a list of participants based on coordinate ordering
   */
  static getRightParticipant(participants: string[], coordinates: Coordinates): string | undefined {
    // Use coordinates to find the rightmost participant
    const ordered = coordinates.orderedParticipantNames?.() ?? [];
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
      if (participants.includes(ordered[i]!)) {
        return ordered[i];
      }
    }
    return _STARTER_;
  }

  /**
   * Calculate the participant span between leftmost and rightmost participants
   */
  static computeParticipantSpan(leftParticipant: string | undefined, rightParticipant: string | undefined, coordinates: Coordinates): number {
    if (!leftParticipant || !rightParticipant) {
      return 0;
    }

    const leftCenter = centerOf(coordinates, leftParticipant);
    const rightCenter = centerOf(coordinates, rightParticipant);
    const halfLeft = coordinates.half(leftParticipant);
    const halfRight = coordinates.half(rightParticipant);
    
    const span = rightCenter + halfRight - (leftCenter - halfLeft);
    return Math.max(0, span);
  }

  /**
   * Compute extra width due to self messages
   * Additional width needed to accommodate long self-message signatures
   */
  static computeExtraWidthDueToSelfMessages(selfMessages: IRStatement[], rightParticipant: string | undefined, coordinates: Coordinates): number {
    if (!rightParticipant || selfMessages.length === 0) {
      return 0;
    }

    const widths = selfMessages.map((stmt) => {
      let messageWidth = coordinates.getMessageWidth(stmt as any);

      // Fallback for when getMessageWidth returns 0
      if (messageWidth === 0 && stmt.signature) {
        messageWidth = stmt.signature.length * 8;
      }

      const fromParticipant = (stmt.from as string) || _STARTER_;
      const distanceToRight = coordinates.distance(fromParticipant, rightParticipant);
      const halfRight = coordinates.half(rightParticipant);
      
      return messageWidth - distanceToRight - halfRight;
    });

    return Math.max(0, ...widths);
  }

  /**
   * Compute border from a frame structure using FrameBorder
   * Handles null/undefined frames gracefully
   */
  static computeBorderFromFrame(frame: any): { left: number; right: number } {
    return FrameBorder(frame ?? null);
  }

  /**
   * Compute total width using standard calculation pattern
   * Combines participant span, borders, extra width, and minimum width
   */
  static computeTotalWidth(
    participantSpan: number,
    border: { left: number; right: number },
    extraWidth: number,
    minWidth: number = 100
  ): number {
    const baseWidth = Math.max(participantSpan, minWidth);
    return baseWidth + border.left + border.right + extraWidth;
  }

  /**
   * Compute padding left for positioning
   * Combines border left with half-width of leftmost participant
   */
  static computePaddingLeft(
    leftParticipant: string | undefined,
    border: { left: number; right: number },
    coordinates: Coordinates
  ): number {
    if (!leftParticipant) {
      return 0;
    }

    const halfLeft = coordinates.half(leftParticipant);
    return border.left + halfLeft;
  }
}
