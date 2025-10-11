import type { IRStatement } from "@/ir/tree-types";
import { StatementKind } from "@/ir/tree-types";
import type { Coordinates } from "@/positioning/Coordinates";
import FrameBorder from "@/positioning/FrameBorder";
import { FrameBuilder } from "@/vm/FrameBuilder";
import { centerOf } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import { calculateLayersFromStatement } from "@/vm/geometry/layer-calculator";
import Anchor2 from "@/positioning/Anchor2";
import { Node, NodeUtils } from "@/vm/Node";
import { StatementVM } from "@/vm/StatementVM";

// Shared instances for geometry calculations
const frameBuilder = new FrameBuilder();

/**
 * Calculate origin layers by traversing up the fragment's parent chain
 * This counts how many messages target the origin participant in the parent context
 */
const calculateOriginLayers = (fragment: IRStatement, origin: string): number => {
  if (!fragment || !origin) return 0;
  
  // Use the shared layer calculation function, starting from the fragment's parent
  return calculateLayersFromStatement((fragment as any).parent, origin);
};

/**
 * Abstract base class for all fragment view models
 * Implements Node interface for consistent behavior with other structural units
 * Encapsulates fragment-specific logic for statement extraction, 
 * participant calculation, and geometry computation
 */
export abstract class FragmentVM extends Node {
  constructor(
    protected readonly ir: IRStatement,
    protected readonly origin: string
  ) {
    super();
    if (ir.kind !== StatementKind.Fragment) {
      throw new Error(`Expected fragment statement, got ${ir.kind}`);
    }
  }

  // Core abstract method - start with just statement extraction
  abstract getStatements(): IRStatement[];
  
  // Common functionality
  get fragmentType(): string {
    return this.ir.fragmentType || 'unknown';
  }
  
  get condition(): string | undefined {
    return this.ir.condition;
  }

  /**
   * Extract all participants involved in this fragment
   * Uses polymorphic extractDirectParticipants() for consistent behavior
   */
  getParticipants(): string[] {
    return this.extractDirectParticipants(); // 多态调用！
  }

  /**
   * Extract participants from this fragment's direct structure (polymorphic)
   * Handles fragment-specific participant extraction without conditional logic
   */
  extractDirectParticipants(): string[] {
    const participants = new Set<string>();

    // Handle ref fragments with explicit participants
    if (this.ir.fragmentType === 'ref' && this.ir.participants) {
      this.ir.participants.forEach((participant: string) => {
        participants.add(participant);
      });
    }

    // For other fragment types, extract from nested statements using polymorphism
    const statements = this.getStatements(); // 多态调用！
    statements.forEach(stmt => {
      if ([StatementKind.Message, StatementKind.Async, StatementKind.Creation, StatementKind.Return].includes(stmt.kind)) {
        // Extract from/to participants from messages
        if (stmt.from && stmt.from.trim() !== '') {
          participants.add(stmt.from);
        }
        if (stmt.to && stmt.to.trim() !== '') {
          participants.add(stmt.to);
        }
      }
    });

    return Array.from(participants);
  }

  /**
   * Calculate the height of this fragment including all contained blocks
   * Default implementation - subclasses can override for fragment-specific logic
   */
  getHeight(): number {
    // Fragments have a base height for the frame itself
    let totalHeight = 38;

    // Add height of contained statements
    if (this.ir.statements && this.ir.statements.length > 0) {
      this.ir.statements.forEach((stmt, index) => {
        const statementVM = StatementVM.create(stmt, this.origin);
        totalHeight += statementVM.getHeight();

        // Add spacing between statements
        if (index < this.ir.statements!.length - 1) {
          const nextStmt = this.ir.statements![index + 1];
          totalHeight += NodeUtils.getSpacingBetween(stmt, nextStmt);
        }
      });
    }

    return totalHeight;
  }
  
  

  /**
   * Compute the border for this fragment
   * Uses shared NodeUtils implementation for consistent behavior
   */
  computeBorder(): { left: number; right: number } {
    const frame = frameBuilder.buildFrameFromIRFragment(this.ir);
    return NodeUtils.computeBorderFromFrame(frame);
  }

  /**
   * Calculate the padding left for this fragment
   * Uses shared NodeUtils implementation for consistent behavior
   */
  computePaddingLeft(coordinates: Coordinates): number {
    const leftParticipant = this.getLeftParticipant(coordinates);
    const border = this.computeBorder();
    return NodeUtils.computePaddingLeft(leftParticipant, border, coordinates);
  }

  /**
   * Calculate the offset X for this fragment
   * Used for fragment positioning to account for origin layers and leftmost participant
   */
  computeOffsetX(coordinates: Coordinates): number {
    const leftParticipant = this.getLeftParticipant(coordinates);
    if (!leftParticipant) {
      return 0;
    }

    const halfLeftParticipant = coordinates.half(leftParticipant);
    const frame = frameBuilder.buildFrameFromIRFragment(this.ir);
    const border = FrameBorder(frame ?? null);

    if (!this.origin || leftParticipant === this.origin) {
      return border.left + halfLeftParticipant;
    }

    // Calculate origin layers based on fragment's parent context
    const originLayers = calculateOriginLayers(this.ir, this.origin);
    const anchor2Origin = new Anchor2(
      centerOf(coordinates, this.origin),
      originLayers,
      this.origin);
    const anchor2LeftParticipant = new Anchor2(
      centerOf(coordinates, leftParticipant),
      0,
      leftParticipant);

    const distanceWithLayers = anchor2LeftParticipant.centerToCenter(anchor2Origin);

    return distanceWithLayers + border.left + halfLeftParticipant;
  }



  /**
   * Build frame for this fragment using FrameBuilder
   */
  protected buildFrame(): any {
    return frameBuilder.buildFrameFromIRFragment(this.ir);
  }

  /**
   * Shared method for collecting statements using polymorphism for all statement types
   * This eliminates code duplication and conditional logic across all Fragment subclasses
   */
  protected collectFromStatements(stmts: IRStatement[], result: IRStatement[]): void {
    for (const stmt of stmts) {
      // Use StatementVM for polymorphic statement handling - no conditionals needed!
      const statementVM = StatementVM.create(stmt, this.origin);
      result.push(...statementVM.getStatements()); // 多态调用！
    }
  }
  
}
