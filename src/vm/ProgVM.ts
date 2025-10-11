import type { IRTree } from "@/ir/tree-types";
import { Node, NodeUtils } from "@/vm/Node";
import { BlockVM } from "@/vm/BlockVM";
import type { Coordinates } from "@/positioning/Coordinates";

/**
 * ProgVM class for calculating program-level metrics
 * Considers all participants in the program, not just those in the root block
 * This ensures accurate total width calculation for diagrams with declared participants
 */
export class ProgVM extends Node {
  private readonly blockVM: BlockVM;
  
  constructor(
    private readonly tree: IRTree,
    private readonly origin: string
  ) {
    super();
    if (!tree) {
      throw new Error('Tree is required for ProgVM');
    }
    
    // Create BlockVM for the root block
    this.blockVM = new BlockVM(tree.root, origin);
  }

  /**
   * Get all statements from the root block
   */
  getStatements() {
    return this.blockVM.getStatements();
  }

  /**
   * Get all participants from the program
   * This includes both declared participants and those extracted from messages
   */
  getParticipants(): string[] {
    // Get participants from the tree (includes declared participants)
    const declaredParticipants = this.tree.participants?.map(p => p.name) || [];
    
    // Get participants from block statements
    const blockParticipants = this.blockVM.getParticipants();
    
    // Combine and deduplicate
    const allParticipants = new Set([...declaredParticipants, ...blockParticipants]);
    return Array.from(allParticipants);
  }

  /**
   * Extract direct participants from the program
   * Includes all declared participants plus those from root block
   */
  extractDirectParticipants(): string[] {
    return this.getParticipants();
  }

  /**
   * Get the leftmost participant considering all program participants
   */
  getLeftParticipant(coordinates: Coordinates): string | undefined {
    const participants = this.getParticipants();
    return NodeUtils.getLeftParticipant(participants, coordinates, this.getLeftParticipantFallback());
  }

  /**
   * Get the rightmost participant considering all program participants
   */
  getRightParticipant(coordinates: Coordinates): string | undefined {
    const participants = this.getParticipants();
    return NodeUtils.getRightParticipant(participants, coordinates, this.getRightParticipantFallback());
  }

  /**
   * Compute participant span considering all program participants
   * This ensures the total width accounts for all declared participants
   */
  computeParticipantSpan(coordinates: Coordinates): number {
    const leftParticipant = this.getLeftParticipant(coordinates);
    const rightParticipant = this.getRightParticipant(coordinates);
    return NodeUtils.computeParticipantSpan(leftParticipant, rightParticipant, coordinates);
  }

  /**
   * Compute border using the root block's frame
   */
  computeBorder(): { left: number; right: number } {
    return this.blockVM.computeBorder();
  }

  /**
   * Compute extra width due to self messages in the root block
   */
  computeExtraWidthDueToSelfMessages(coordinates: Coordinates): number {
    return this.blockVM.computeExtraWidthDueToSelfMessages(coordinates);
  }

  /**
   * Get fallback for left participant
   */
  protected getLeftParticipantFallback(): string {
    return this.origin;
  }

  /**
   * Get fallback for right participant
   */
  protected getRightParticipantFallback(): string {
    return this.origin;
  }
  /**
   * Get the root block VM for delegation
   */
  get rootBlockVM(): BlockVM {
    return this.blockVM;
  }
}
