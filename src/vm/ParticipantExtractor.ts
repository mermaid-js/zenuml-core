import { StatementKind } from "@/ir/tree-types";

export class ParticipantExtractor {

  public extractFromStatement(irStatement: any): string[] {
    const participants = new Set<string>();
    this.processStatement(irStatement, participants);
    return Array.from(participants);
  }

  public extractFromBlock(irBlock: any): string[] {
    const participants = new Set<string>();
    this.processStatements(irBlock.statements, participants);
    return Array.from(participants);
  }

  private processStatement(irStatement: any, participants: Set<string>): void {
    if (!irStatement) return;

    if ([StatementKind.Message, StatementKind.Async, StatementKind.Creation, StatementKind.Return].includes(irStatement.kind)) {
      this.processMessage(participants, irStatement);
    }

    if (irStatement.kind === StatementKind.Fragment) {
      this.processFragmentStructure(irStatement, participants);
    }

    if (irStatement.statements) {
      // Other statement types with direct statements (not fragments)
      this.processStatements(irStatement.statements, participants);
    }
  }

  private processMessage(participants: Set<string>, irMessage: any): void {
    if (irMessage.from && irMessage.from.trim() !== '') {
      participants.add(irMessage.from);
    }
    if (irMessage.to && irMessage.to.trim() !== '') {
      participants.add(irMessage.to);
    }
  }

  private processFragmentStructure(irFragment: any, participants: Set<string>): void {
    if (!irFragment) return;

    // Alt fragments: ifBlock, elseIfBlocks, elseBlock
    if (irFragment.ifBlock) {
      this.processStatements(irFragment.ifBlock.statements, participants);
    }
    if (irFragment.elseIfBlocks) {
      irFragment.elseIfBlocks.forEach((block: any) => {
        this.processStatements(block.statements, participants);
      });
    }
    if (irFragment.elseBlock) {
      this.processStatements(irFragment.elseBlock.statements, participants);
    }

    // TCF fragments: tryBlock, catchBlocks, finallyBlock
    if (irFragment.tryBlock) {
      this.processStatements(irFragment.tryBlock.statements, participants);
    }
    if (irFragment.catchBlocks) {
      irFragment.catchBlocks.forEach((block: any) => {
        this.processStatements(block.statements, participants);
      });
    }
    if (irFragment.finallyBlock) {
      this.processStatements(irFragment.finallyBlock.statements, participants);
    }
    if (irFragment.fragmentType === 'ref') {
      irFragment.participants?.forEach((participant: string) => {
        participants.add(participant);
      });
    }
    // Other fragment types: direct statements (flattened structure)
    if (irFragment.statements) {
      this.processStatements(irFragment.statements, participants);
    }
  }

  private processStatements(irStatements: any[], participants: Set<string>): void {
    irStatements.forEach(irStatement => {
      this.processStatement(irStatement, participants);
    });
  }
}