import type { IRStatement } from "@/ir/tree-types";
import { StatementKind } from "@/ir/tree-types";
import { FragmentFactory } from "@/vm/fragments/FragmentFactory";
import { Node, NodeUtils } from "@/vm/Node";

// Shared instances for consistent behavior

/**
 * Abstract base class for statement-level view models in sequence diagrams
 * Extends Node to provide consistent polymorphic behavior
 * Eliminates the need for type checking and conditional logic
 */
export abstract class StatementVM extends Node {
  constructor(
    protected readonly ir: IRStatement,
    protected readonly origin: string
  ) {
    super();
  }

  /**
   * Each statement type knows how to collect its own nested statements
   * This eliminates the need for type checking and conditional logic
   */
  abstract getStatements(): IRStatement[];

  /**
   * Extract participants from this statement using polymorphic extractDirectParticipants()
   */
  getParticipants(): string[] {
    return this.extractDirectParticipants(); // 多态调用！
  }

  /**
   * Build frame for this statement - default implementation returns null
   * Subclasses can override if they need specific frame building
   */
  protected buildFrame(): any {
    return null;
  }

  /**
   * Extract participants from this statement's direct content (polymorphic)
   * Each subclass implements this to handle its specific structure
   * This replaces the conditional logic in ParticipantExtractor
   */
  abstract extractDirectParticipants(): string[];

  /**
   * Factory method to create appropriate StatementVM based on statement kind
   */
  static create(stmt: IRStatement, origin: string): StatementVM {
    switch (stmt.kind) {
      case StatementKind.Fragment:
        return new FragmentStatementVM(stmt, origin);
      case StatementKind.Message:
      case StatementKind.Async:
      case StatementKind.Creation:
      case StatementKind.Return:
        return new MessageStatementVM(stmt, origin);
      default:
        return new DefaultStatementVM(stmt, origin);
    }
  }
}

/**
 * Fragment statement VM - delegates to Fragment classes
 */
class FragmentStatementVM extends StatementVM {
  getStatements(): IRStatement[] {
    const fragment = FragmentFactory.create(this.ir, this.origin);
    return fragment ? fragment.getStatements() : [];
  }

  /**
   * Fragment statements use their Fragment instance for participant extraction
   */
  getParticipants(): string[] {
    const fragment = FragmentFactory.create(this.ir, this.origin);
    return fragment ? fragment.getParticipants() : [];
  }

  /**
   * Fragment statements delegate to their Fragment instance for direct participant extraction
   */
  extractDirectParticipants(): string[] {
    const fragment = FragmentFactory.create(this.ir, this.origin);
    return fragment ? fragment.extractDirectParticipants() : [];
  }

  /**
   * Fragment statements delegate height calculation to their Fragment instance
   */
  getHeight(): number {
    const fragment = FragmentFactory.create(this.ir, this.origin);
    return fragment ? fragment.getHeight() : 38; // Default fragment height
  }

  /**
   * Fragment statements use their Fragment instance for frame building
   */
  protected buildFrame(): any {
    const fragment = FragmentFactory.create(this.ir, this.origin);
    if (fragment) {
      // Access the protected buildFrame method through computeBorder which uses it
      // This is a workaround since buildFrame is protected
      return (fragment as any).buildFrame();
    }
    return null;
  }
}

/**
 * Message statement VM - handles nested statements in messages
 */
class MessageStatementVM extends StatementVM {
  getStatements(): IRStatement[] {
    const statements: IRStatement[] = [this.ir];

    // Handle nested statements in messages
    if (this.ir.statements) {
      for (const nestedStmt of this.ir.statements) {
        const nestedVM = StatementVM.create(nestedStmt, this.origin);
        statements.push(...nestedVM.getStatements());
      }
    }

    return statements;
  }

  /**
   * Extract participants from message statements (polymorphic)
   * Handles message-specific participant extraction
   */
  extractDirectParticipants(): string[] {
    const participants = new Set<string>();

    // Extract from/to participants from this message
    if ([StatementKind.Message, StatementKind.Async, StatementKind.Creation, StatementKind.Return].includes(this.ir.kind)) {
      if (this.ir.from && this.ir.from.trim() !== '') {
        participants.add(this.ir.from);
      }
      if (this.ir.to && this.ir.to.trim() !== '') {
        participants.add(this.ir.to);
      }
    }

    // Handle nested statements recursively using polymorphism
    if (this.ir.statements) {
      for (const nestedStmt of this.ir.statements) {
        const nestedVM = StatementVM.create(nestedStmt, this.origin);
        const nestedParticipants = nestedVM.extractDirectParticipants(); // 多态调用！
        nestedParticipants.forEach(p => participants.add(p));
      }
    }

    return Array.from(participants);
  }

  /**
   * Calculate height for message statements
   * - Async messages: 16px (no occurrence box)
   * - Sync/Creation messages: 38px (includes occurrence box) + nested content height
   */
  getHeight(): number {
    // Base height depends on message type
    let baseHeight = 38; // Default: sync/creation messages (have occurrence box)

    if (this.ir.kind === StatementKind.Async) {
      baseHeight = 16; // Async messages have no occurrence box
    }
    // Creation messages are like sync messages - they have an occurrence box
    // So StatementKind.Creation uses the default baseHeight of 38

    // If no nested statements, return base height
    if (!this.ir.statements || this.ir.statements.length === 0) {
      return baseHeight;
    }

    // Calculate total height of nested statements
    let nestedHeight = 0;
    this.ir.statements.forEach((nested, index) => {
      const nestedVM = StatementVM.create(nested, this.origin);
      nestedHeight += nestedVM.getHeight(); // Polymorphic call!

      // Add spacing between nested statements
      if (index < this.ir.statements!.length - 1) {
        const nextNested = this.ir.statements![index + 1];
        nestedHeight += NodeUtils.getSpacingBetween(nested, nextNested);
      }
    });

    // Return base height + nested content height
    return baseHeight + nestedHeight;
  }
}

/**
 * Default statement VM - for simple statements without nesting
 */
class DefaultStatementVM extends StatementVM {
  getStatements(): IRStatement[] {
    return [this.ir];
  }

  /**
   * Extract participants from simple statements (polymorphic)
   * Handles default statement types like dividers, etc.
   */
  extractDirectParticipants(): string[] {
    const participants = new Set<string>();

    // Most default statements don't have participants, but handle messages just in case
    if ([StatementKind.Message, StatementKind.Async, StatementKind.Creation, StatementKind.Return].includes(this.ir.kind)) {
      if (this.ir.from && this.ir.from.trim() !== '') {
        participants.add(this.ir.from);
      }
      if (this.ir.to && this.ir.to.trim() !== '') {
        participants.add(this.ir.to);
      }
    }

    return Array.from(participants);
  }

  /**
   * Default height for simple statements (dividers, etc.)
   */
  getHeight(): number {
    // Default statements like dividers have minimal height
    return 38;
  }
}
