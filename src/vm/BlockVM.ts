import type { IRBlock, IRStatement } from "@/ir/tree-types";
import { FrameBuilder } from "@/vm/FrameBuilder";
import { _STARTER_ } from "@/constants.ts";
import { Node, NodeUtils } from "@/vm/Node";
import { StatementVM } from "@/vm/StatementVM";

// Shared instances for geometry calculations
const frameBuilder = new FrameBuilder();

/**
 * BlockVM class for calculating block-level metrics
 * Implements Node interface for consistent behavior with other structural units
 * Operates on IRBlock and provides participant analysis and width calculation support
 */
export class BlockVM extends Node {
  constructor(
    private readonly block: IRBlock,
    private readonly origin: string
  ) {
    super(); // 调用父类构造函数
    if (!block) {
      throw new Error('Block is required for BlockVM');
    }
  }

  /**
   * Get all statements from this block recursively
   * Uses polymorphism to delegate fragment handling to specific fragment classes
   */
  getStatements(): IRStatement[] {
    const statements: IRStatement[] = [];
    this.collectFromBlock(this.block.statements, statements);
    return statements;
  }

  /**
   * Collect statements from block using polymorphism for all statement types
   */
  private collectFromBlock(stmts: IRStatement[], result: IRStatement[]): void {
    for (const stmt of stmts) {
      // Use StatementVM for polymorphic statement handling - no conditionals needed!
      const statementVM = StatementVM.create(stmt, this.origin);
      result.push(...statementVM.getStatements()); // 多态调用！
    }
  }

  /**
   * Extract all participants involved in this block
   * Uses polymorphic extractDirectParticipants() for consistent behavior
   */
  getParticipants(): string[] {
    return this.extractDirectParticipants(); // 多态调用！
  }

  /**
   * Extract participants from this block's direct statements (polymorphic)
   * Handles block-specific participant extraction without conditional logic
   */
  extractDirectParticipants(): string[] {
    const participants = new Set<string>();
    
    // Process each statement in the block using polymorphism
    for (const stmt of this.block.statements) {
      const statementVM = StatementVM.create(stmt, this.origin);
      const stmtParticipants = statementVM.extractDirectParticipants(); // 多态调用！
      stmtParticipants.forEach(p => participants.add(p));
    }
    
    return Array.from(participants);
  }
  /**
   * Compute the border for this block
   * Uses shared NodeUtils implementation for consistent behavior
   */
  computeBorder(): { left: number; right: number } {
    // TODO: There is an old bug here. We did not consider mutliple root frames.
    const frame = frameBuilder.buildFrameFromIRBlock(this.block);
    return NodeUtils.computeBorderFromFrame(frame?.children?.[0]);
  }


  /**
   * Calculate the total height of this block including all statements and spacing
   * Uses polymorphism to let each statement calculate its own height
   */
  getHeight(): number {
    if (!this.block.statements || this.block.statements.length === 0) {
      return 0;
    }

    let totalHeight = 0;

    this.block.statements.forEach((stmt, index) => {
      // Each statement knows how to calculate its own height (polymorphism!)
      const statementVM = StatementVM.create(stmt, this.origin);
      totalHeight += statementVM.getHeight();

      // Add spacing between statements
      if (index < this.block.statements.length - 1) {
        const nextStmt = this.block.statements[index + 1];
        totalHeight += NodeUtils.getSpacingBetween(stmt, nextStmt);
      }
    });

    return totalHeight;
  }

  /**
   * BlockVM specific fallback for left participant
   */
  protected getLeftParticipantFallback(): string | undefined {
    return _STARTER_;
  }

  /**
   * BlockVM specific fallback for right participant
   */
  protected getRightParticipantFallback(): string | undefined {
    return _STARTER_;
  }

  /**
   * Build frame for this block using FrameBuilder
   */
  protected buildFrame(): any {
    return frameBuilder.buildFrameFromIRBlock(this.block);
  }
}
