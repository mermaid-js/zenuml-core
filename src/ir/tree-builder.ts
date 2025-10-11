import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import {
  FragmentType,
  IRBlock,
  IRMessage,
  IRProg,
  IRStatement,
  IRTree,
  StatementKind,
  TreeBuilder as ITreeBuilder
} from "./tree-types";
import { IRParticipant } from "./participants";
import { buildGroupsModel } from "./groups";
import ToCollector from "@/parser/ToCollector";
import { blankParticipant } from "@/parser/Participants";
import { codeRangeOf, commentOf, labelRangeOfMessage, offsetRangeOf, signatureOf } from "@/parser/helpers";
import antlr4 from "antlr4";
import "@/parser/index";
import { _STARTER_ } from "@/constants.ts";

/**
 * Tree IR collector using visitor pattern that builds hierarchical structure
 */
class TreeIRCollector extends sequenceParserListener {
  private contextStack: (IRStatement | IRBlock)[] = [];
  // The first message statement is used to decide the diagram's origin
  private firstMessageStatement: IRStatement | undefined;

  constructor() {
    super();
    const virtualRoot: IRStatement = {
      kind: StatementKind.Root,
      signature: '',
      parent: undefined,
      statements: []
    };
    this.contextStack.push(virtualRoot);
  }

  /**
   * Helper method to pop the context stack - used by all exit methods
   */
  private contextStackPop = () => {
    this.contextStack.pop();
  };

  /**
   * Unified method to set parent relationship and add statement to current container
   * Follows the revolutionary design principle: direct container manipulation
   */
  private setParentAndAsChild(statement: IRStatement): void {
    const currentContext = this.contextStack.at(-1) as IRStatement;
    statement.parent = currentContext;
    
    currentContext.statements.push(statement);
  }

  /**
   * Creates message statements following consistent pattern
   */
  private createMessageStatement(ctx: any, messageType: StatementKind, to?: string, assignee?: string): void {
    const statement: IRStatement = {
      kind: messageType,
      range: offsetRangeOf(ctx) || undefined,
      codeRange: codeRangeOf(ctx) || undefined,
      comment: commentOf(ctx),
      statements: [],
      signature: signatureOf(ctx).trim() || '<empty>',
      labelRange: labelRangeOfMessage(ctx, messageType),
      from: ctx.From() ?? _STARTER_,
      to: to ?? _STARTER_,
      assignee: assignee
    };
    if(this.firstMessageStatement === undefined) {
      this.firstMessageStatement = statement;
    }
    this.setParentAndAsChild(statement);
    this.contextStack.push(statement);
  }

  /**
   * Creates fragment statements following the unified contextStack pattern
   */
  private createFragmentStatement(ctx: any, fragmentType: FragmentType, condition?: string): void {
    const statement: IRStatement = {
      kind: StatementKind.Fragment,
      signature: '',
      range: [ctx?.start?.start ?? -1, ctx?.stop?.stop ?? -1],
      parent: undefined,
      statements: [],
      comment: commentOf(ctx),
      fragmentType: fragmentType,
      condition: condition
    };

    this.setParentAndAsChild(statement);
    this.contextStack.push(statement);
  }

  enterMessage = (ctx: any) => {
    this.createMessageStatement(ctx, StatementKind.Message, ctx.Owner(), ctx.Assignment()?.getText());
  };

  exitMessage = this.contextStackPop;

  enterAsyncMessage = (ctx: any) => {
    const messageType = ctx.parentCtx.constructor?.name === 'RetContext' ? StatementKind.Return : StatementKind.Async;
    this.createMessageStatement(ctx, messageType, ctx.Owner());
  };

  exitAsyncMessage = this.contextStackPop;

  enterCreation = (ctx: any) => {
    this.createMessageStatement(ctx, StatementKind.Creation, ctx.Owner(), ctx.Assignment()?.getText());
  };

  exitCreation = this.contextStackPop;

  enterRet = (ctx: any) => {
    if(ctx?.asyncMessage?.()) return;
    this.createMessageStatement(ctx, StatementKind.Return, ctx.ReturnTo() || _STARTER_);
  };

  exitRet = (ctx: any) => {
    if (ctx?.asyncMessage?.()) return;
    this.contextStack.pop();
  };

  private extractExceptionText(catchContext: any): string {
    const invocation = catchContext?.invocation()?.parameters()?.getFormattedText();
    return invocation || "";
  }

  enterAlt = (ctx: any) => {
    this.createFragmentStatement(ctx, 'alt');
  };

  exitAlt = this.contextStackPop;

  enterIfBlock = (ctx: any) => {
    const currentAltFragment = this.contextStack[this.contextStack.length - 1] as IRStatement;
    const parExpr = ctx.parExpr?.();
    const condition = parExpr?.condition?.()?.getFormattedText?.() || undefined;
    currentAltFragment.ifBlock = {
      parent: currentAltFragment,
      kind: StatementKind.If,
      condition,
      statements: []
    } as const;

    this.contextStack.push(currentAltFragment.ifBlock);
  };

  exitIfBlock = this.contextStackPop;

  enterElseIfBlock = (ctx: any) => {
    const currentAltFragment = this.contextStack[this.contextStack.length - 1] as IRStatement;
    const parExpr = ctx.parExpr?.();
    const condition = parExpr?.condition?.()?.getFormattedText?.() || undefined;
    const elseIfBlock = {
      parent: currentAltFragment,
      kind: StatementKind.ElseIf,
      condition,
      statements: [] as IRStatement[]
    } as const;
    currentAltFragment.elseIfBlocks = currentAltFragment.elseIfBlocks || [];
    currentAltFragment.elseIfBlocks.push(elseIfBlock);

    this.contextStack.push(elseIfBlock);
  };

  exitElseIfBlock = this.contextStackPop;

  enterElseBlock = () => {
    const currentAltFragment = this.contextStack[this.contextStack.length - 1] as IRStatement;
    currentAltFragment.elseBlock = {
      parent: currentAltFragment,
      kind: StatementKind.Else,
      statements: []
    } as const;

    this.contextStack.push(currentAltFragment.elseBlock);
  };

  exitElseBlock = this.contextStackPop;

  enterLoop = (ctx: any) => {
    const parExpr = ctx.parExpr?.();
    const condition = parExpr?.condition?.()?.getFormattedText?.() || undefined;
    this.createFragmentStatement(ctx, 'loop', condition);
  };

  exitLoop = this.contextStackPop;

  enterOpt = (ctx: any) => {
    this.createFragmentStatement(ctx, 'opt');
  };

  exitOpt = this.contextStackPop;

  enterPar = (ctx: any) => {
    this.createFragmentStatement(ctx, 'par');
  };

  exitPar = this.contextStackPop;

  enterCritical = (ctx: any) => {
    const atom = ctx.atom?.();
    const condition = atom?.getText?.() || undefined;
    this.createFragmentStatement(ctx, 'critical', condition);
  };

  exitCritical = this.contextStackPop;

  enterSection = (ctx: any) => {
    const atom = ctx.atom?.();
    const condition = atom?.getText?.() || undefined;
    this.createFragmentStatement(ctx, 'section', condition);
  };

  exitSection = this.contextStackPop;

  enterTcf = (ctx: any) => {
    this.createFragmentStatement(ctx, 'tcf');
  };

  exitTcf = this.contextStackPop;

  enterTryBlock = () => {
    const currentTcfFragment = this.contextStack.at(-1) as IRStatement;
    currentTcfFragment.tryBlock = {
      kind: StatementKind.Try,
      parent: currentTcfFragment,
      statements: []
    } as const;

    this.contextStack.push(currentTcfFragment.tryBlock);
  };

  exitTryBlock = this.contextStackPop;

  enterCatchBlock = (ctx: any) => {
    const currentTcfFragment = this.contextStack[this.contextStack.length - 1] as IRStatement;
    const exceptionText = this.extractExceptionText(ctx);
    const catchBlock = {
      parent: currentTcfFragment,
      kind: StatementKind.Catch,
      exceptionText,
      statements: [] as IRStatement[]
    } as { kind: StatementKind.Catch; parent?: IRStatement; exceptionText: string; statements: IRStatement[]; };
    currentTcfFragment.catchBlocks = currentTcfFragment.catchBlocks || [];
    currentTcfFragment.catchBlocks.push(catchBlock);

    this.contextStack.push(catchBlock);
  };

  exitCatchBlock = this.contextStackPop;

  enterFinallyBlock = () => {
    const currentTcfFragment = this.contextStack[this.contextStack.length - 1] as IRStatement;
    currentTcfFragment.finallyBlock = {
      parent: currentTcfFragment,
      kind: StatementKind.Finally,
      statements: []
    } as const;

    this.contextStack.push(currentTcfFragment.finallyBlock);
  };

  exitFinallyBlock = this.contextStackPop;

  enterRef = (ctx: any) => {
    this.createFragmentStatement(ctx, 'ref');
    
    const statement = this.contextStack.at(-1) as IRStatement;
    
    const content = ctx.Content?.();
    if (content) {
      statement.labelText = content.getFormattedText?.() || '';
      statement.labelRange = [
        content.start?.start ?? -1,
        content.stop?.stop ?? -1
      ];
    }
    
    const participants = ctx.Participants?.();
    if (participants && Array.isArray(participants)) {
      statement.participants = participants.map(p => p.getText?.() || p.toString()).filter(Boolean);
    }
  };

  exitRef = this.contextStackPop;

  enterDivider = (ctx: any) => {
    const statement: IRStatement = {
      kind: StatementKind.Divider,
      range: offsetRangeOf(ctx) || undefined,
      codeRange: codeRangeOf(ctx) || undefined,
      comment: commentOf(ctx),
      statements: []
    };
    const label = ctx.Note();
    statement.label = label || undefined;
    this.setParentAndAsChild(statement);
  };
  result() {
    return {
      statements: this.contextStack[0].statements!,
      participants: [],
      firstMessageStatement: this.firstMessageStatement,
    };
  }
}

/**
 * Concrete implementation of TreeBuilder interface using visitor pattern
 */
export class TreeBuilder implements ITreeBuilder {
  /**
   * Build complete IRProg from parser context
   */
  buildProg(context: any): IRProg {
    const tree = this.buildTree(context);
    return {
      tree,
    };
  }

  /**
   * Build complete IRTree from parser context using visitor pattern
   */
  buildTree(context: any): IRTree {
    if (!context) {
      throw new Error('Parser context cannot be null');
    }

    if (typeof context !== 'object') {
      throw new Error('Parser context must be an object');
    }

    const title = this.extractTitle(context);

    const groups = this.extractGroups(context);

    let result: { statements: IRStatement[], participants: IRParticipant[] };

    const walker = antlr4.tree.ParseTreeWalker.DEFAULT;
    const collector = new TreeIRCollector();
    walker.walk(collector, context);

    const collectorResult = collector.result();

    const participants = this.extractParticipants(context, collectorResult.statements);

    const root: IRBlock = {
      statements: collectorResult.statements,
    };

    return {
      title,
      participants: participants,
      groups,
      root,
      firstMessageStatement: collectorResult.firstMessageStatement
    };
  }


  private extractTitle(context: any): string | undefined {
    if (context.title) {
      return context.title()?.content?.();
    }

    return undefined;
  }

  private extractGroups(context: any): any[] {
    return buildGroupsModel(context);
  }

  /**
   * Extract participants
   */
  private extractParticipants(context: any, statements: IRStatement[]): IRParticipant[] {
    if (!context) return [];
    
    // @ts-expect-error runtime value from JS listener
    const participants = ToCollector.getParticipants(context);
    const participantEntries: [string, any][] = Array.from(participants.participants.entries());
    
    const allMessages = this.flattenStatementsToMessages(statements);
    const someMessagesMissFrom = allMessages.some((m) => !m.from);
    const needDefaultStarter = someMessagesMissFrom && allMessages.length > 0;
    
    if (needDefaultStarter) {
      participantEntries.unshift([
        _STARTER_,
        { ...blankParticipant, name: _STARTER_, isStarter: true },
      ]);
    }
    
    return participantEntries.map(([name, p]: [string, any]) => {
      const positions = Array.from((p?.positions as Set<[number, number]>) || []);
      const assigneePositions = Array.from(
        (p?.assigneePositions as Set<[number, number]>) || [],
      );
      return {
        name: p?.name ?? name,
        label: p?.label,
        type: p?.type,
        explicit: p?.explicit,
        isStarter: p?.isStarter,
        color: p?.color,
        stereotype: p?.stereotype,
        groupId: p?.groupId,
        assignee: p?.assignee,
        positions,
        assigneePositions,
      } as IRParticipant;
    });
  }

  // Context type checking helpers

  /**
   * Extract messages from existing IRStatement tree structure
   * This eliminates the need for separate message collection
   */
  flattenMessages(tree: IRTree): IRMessage[] {
    return this.flattenStatements(tree.root.statements)
      .filter(stmt => this.isMessageStatement(stmt))
      .map(stmt => this.statementToMessage(stmt));
  }
  
  /**
   * Recursively flatten all statements from the tree structure
   * Traverses all block types implemented in the unified contextStack architecture
   */
  private flattenStatements(statements: IRStatement[]): IRStatement[] {
    const result: IRStatement[] = [];
    
    for (const stmt of statements) {
      result.push(stmt);
      
      // Handle nested statements (for messages with bodies)
      if (stmt.statements) {
        result.push(...this.flattenStatements(stmt.statements));
      }
      
      // Handle fragment blocks
      if (stmt.ifBlock?.statements) {
        result.push(...this.flattenStatements(stmt.ifBlock.statements));
      }
      if (stmt.elseIfBlocks) {
        for (const elseIfBlock of stmt.elseIfBlocks) {
          result.push(...this.flattenStatements(elseIfBlock.statements));
        }
      }
      if (stmt.elseBlock?.statements) {
        result.push(...this.flattenStatements(stmt.elseBlock.statements));
      }
      
      // Handle TCF fragment blocks
      if (stmt.tryBlock?.statements) {
        result.push(...this.flattenStatements(stmt.tryBlock.statements));
      }
      if (stmt.catchBlocks) {
        for (const catchBlock of stmt.catchBlocks) {
          result.push(...this.flattenStatements(catchBlock.statements));
        }
      }
      if (stmt.finallyBlock?.statements) {
        result.push(...this.flattenStatements(stmt.finallyBlock.statements));
      }
    }
    
    return result;
  }

  private flattenStatementsToMessages(statements: IRStatement[]): IRMessage[] {
    return this.flattenStatements(statements)
      .filter(stmt => this.isMessageStatement(stmt))
      .map(stmt => this.statementToMessage(stmt));
  }

  /**
   * Check if a statement represents a message
   */
  private isMessageStatement(stmt: IRStatement): boolean {
    return [StatementKind.Message, StatementKind.Async, StatementKind.Creation, StatementKind.Return].includes(stmt.kind);
  }
  
  /**
   * Convert IRStatement to IRMessage format
   * Bridge the gaps between TreeIRCollector's IRStatement and MessagesIRCollector's IRMessage
   */
  private statementToMessage(stmt: IRStatement): IRMessage {
    return {
      from: stmt.from === '_STARTER_' ? undefined : stmt.from,
      to: stmt.to === '_STARTER_' ? undefined : stmt.to,
      signature: stmt.signature || '',
      type: stmt.kind,
    };
  }

}

/**
 * Factory function to create TreeBuilder instance
 */
export function createTreeBuilder(): ITreeBuilder {
  return new TreeBuilder();
}