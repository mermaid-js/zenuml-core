import { _STARTER_ } from "@/constants";
import type { Frame } from "@/positioning/FrameBorder";
import { ParticipantExtractor } from "./ParticipantExtractor";
import type { IRBlock, IRFragment, IRStatement } from "@/ir/tree-types";
import { StatementKind } from "@/ir/tree-types";


export class FrameBuilder {
  private participantExtractor = new ParticipantExtractor();

  /**
   * Build frame from IRBlock structure
   * Traverses all statements in the block and uses buildFrameFromIRFragment for fragments
   * Returns a Frame compatible with the geometry system
   */
  buildFrameFromIRBlock(block: IRBlock | null | undefined): Frame | null {
    if (!block || !block.statements?.length) {
      return null;
    }
    const children: Frame[] = [];
    
    // Traverse all statements in the block
    this.traverseBlockStatements(block.statements, children);

    const participants = this.participantExtractor.extractFromBlock(block);
    if (participants.length === 0) {
      return null;
    }
    
    // Build frame structure for the block
    const left = participants[0] || _STARTER_;
    const right = participants[participants.length - 1] || _STARTER_;
    
    return {
      type: 'block',
      left,
      right,
      children,
    };
  }

  /**
   * Build frame from IRFragment structure (used by geometry/fragment.ts)
   * Returns a Frame compatible with the geometry system
   */
  buildFrameFromIRFragment(fragment: IRFragment | null | undefined): Frame | null {
    if (!fragment) {
      return null;
    }
    const extractedParticipants = this.participantExtractor.extractFromStatement(fragment);

    // Client handles origin - add origin to participants and sort
    const participants = [_STARTER_, ...extractedParticipants].filter((p, i, arr) => arr.indexOf(p) === i);

    if (participants.length === 0) {
      return null;
    }

    // Build frame structure
    const right = participants[participants.length - 1];
    // Build children from nested fragments
    const children: Frame[] = [];
    const childFragments = this.extractChildFragmentsFromIR(fragment);

    for (const childFragment of childFragments) {
      const childFrame = this.buildFrameFromIRFragment(childFragment);
      if (childFrame) {
        children.push(childFrame);
      }
    }

    return {
      type: fragment.fragmentType || (fragment as any).type,
      left: _STARTER_,
      right,
      children,
    };
  }

  /**
   * Extract child fragments from IRFragment structure
   */
  private extractChildFragmentsFromIR(fragment: IRFragment): IRFragment[] {
    const childFragments: IRFragment[] = [];

    const collectFragmentsFromStatements = (statements?: any[]): IRFragment[] => {
      if (!statements?.length) {
        return [];
      }

      const fragments: IRFragment[] = [];

      for (const statement of statements) {
        if (statement?.kind === StatementKind.Fragment) {
          fragments.push(statement as IRFragment);
        }

        // Recursively collect from nested statements
        if (statement?.statements) {
          fragments.push(...collectFragmentsFromStatements(statement.statements));
        }
      }

      return fragments;
    };

    // Handle different fragment structures
    const fragmentAny = fragment as any;

    // Alt fragments: ifBlock, elseIfBlocks, elseBlock
    if (fragmentAny.ifBlock) {
      childFragments.push(...collectFragmentsFromStatements(fragmentAny.ifBlock.statements));
    }
    if (fragmentAny.elseIfBlocks) {
      for (const block of fragmentAny.elseIfBlocks) {
        childFragments.push(...collectFragmentsFromStatements(block.statements));
      }
    }
    if (fragmentAny.elseBlock) {
      childFragments.push(...collectFragmentsFromStatements(fragmentAny.elseBlock.statements));
    }

    // TCF fragments: tryBlock, catchBlocks, finallyBlock
    if (fragmentAny.tryBlock) {
      childFragments.push(...collectFragmentsFromStatements(fragmentAny.tryBlock.statements));
    }
    if (fragmentAny.catchBlocks) {
      for (const catchBlock of fragmentAny.catchBlocks) {
        childFragments.push(...collectFragmentsFromStatements(catchBlock.statements));
      }
    }
    if (fragmentAny.finallyBlock) {
      childFragments.push(...collectFragmentsFromStatements(fragmentAny.finallyBlock.statements));
    }

    // Other fragment types: direct statements (exclude Alt and TCF which have structured blocks)
    if (fragmentAny.statements && !fragmentAny.ifBlock && !fragmentAny.tryBlock) {
      childFragments.push(...collectFragmentsFromStatements(fragmentAny.statements));
    }

    // Generic blocks array (for par fragments etc.)
    if (fragmentAny.blocks) {
      for (const block of fragmentAny.blocks) {
        childFragments.push(...collectFragmentsFromStatements(block.statements));
      }
    }

    return childFragments;
  }

  /**
   * Traverse statements in a block to extract participants and build frames for fragments
   */
  private traverseBlockStatements(
    statements: IRStatement[],
    children: Frame[]
  ): void {
    for (const statement of statements) {
      if (!statement) continue;

      // Handle fragments specifically using buildFrameFromIRFragment
      if (statement.kind === StatementKind.Fragment) {
        const fragmentFrame = this.buildFrameFromIRFragment(statement as IRFragment);
        if (fragmentFrame) {
          children.push(fragmentFrame);
        }
      }

      // Recursively traverse nested statements (for messages with nested blocks)
      if (statement.statements && statement.statements.length > 0) {
        this.traverseBlockStatements(statement.statements, children);
      }
    }
  }
}