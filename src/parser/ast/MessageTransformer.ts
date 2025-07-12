// ANTLR-to-MessageNode AST transformer
// High error tolerance, creates AST nodes from ANTLR contexts

import {
  MessageNode,
  ErrorNode,
  AssignmentInfo,
  StatementNode,
  DocumentAST,
  SourceRange,
  Position,
} from "./types";

// Import the enhanced prototypes to ensure they're available
import "../SignatureText";
import "../From";
import "../Owner";
import "../Messages/MessageContext";
import "../Origin";

const _STARTER_ = "_STARTER_";

let nodeIdCounter = 0;
function generateId(): string {
  return `ast-node-${++nodeIdCounter}`;
}

export interface TransformationResult {
  readonly ast: DocumentAST;
  readonly success: boolean;
  readonly errors: string[];
}

export class MessageTransformer {
  private errors: string[] = [];
  private nodeParentMap = new Map<string, MessageNode>();

  transform(antlrContext: any): TransformationResult {
    this.errors = [];
    this.nodeParentMap.clear();
    nodeIdCounter = 0;

    try {
      if (!antlrContext) {
        return {
          ast: this.createEmptyDocument(),
          success: false,
          errors: ["No ANTLR context provided"],
        };
      }

      // Handle different context types - ProgContext has block() which has stat()
      let statements: any[] = [];
      if (antlrContext.block) {
        // ProgContext - get statements from block
        const block = antlrContext.block();
        if (block?.stat) {
          statements = block.stat() || [];
        }
      } else if (antlrContext.stat) {
        // BlockContext with stat() method directly
        statements = antlrContext.stat() || [];
      } else if (Array.isArray(antlrContext)) {
        // Direct array of statements
        statements = antlrContext;
      } else {
        // Single statement
        statements = [antlrContext];
      }

      const transformedStatements = this.transformStatements(
        statements,
        undefined,
      );

      const ast: DocumentAST = {
        type: "document",
        id: generateId(),
        sourceRange:
          this.extractSourceRange(antlrContext) || this.createEmptyRange(),
        statements: transformedStatements,
      };

      return {
        ast,
        success: this.errors.length === 0,
        errors: [...this.errors],
      };
    } catch (error) {
      this.errors.push(`Fatal transformation error: ${error}`);
      return {
        ast: this.createEmptyDocument(),
        success: false,
        errors: [...this.errors],
      };
    }
  }

  private transformStatements(
    statContexts: any[],
    parent?: MessageNode,
  ): StatementNode[] {
    return statContexts
      .map((statContext) => {
        try {
          return this.transformStatement(statContext, parent);
        } catch (error) {
          this.errors.push(`Statement transformation error: ${error}`);
          return this.createErrorNode(statContext, error);
        }
      })
      .filter(Boolean) as StatementNode[];
  }

  private transformStatement(
    statContext: any,
    parent?: MessageNode,
  ): StatementNode {
    try {
      // Check what type of statement this is
      if (statContext.message?.()) {
        return this.transformMessage(
          statContext.message(),
          "sync-message",
          parent,
        );
      }
      if (statContext.asyncMessage?.()) {
        return this.transformAsyncMessage(statContext.asyncMessage(), parent);
      }
      if (statContext.creation?.()) {
        return this.transformCreation(statContext.creation(), parent);
      }
      if (statContext.ret?.()) {
        return this.transformReturn(statContext.ret(), parent);
      }

      // Unknown statement type - create error node
      this.errors.push(
        `Unknown statement type in context: ${statContext.constructor.name}`,
      );
      return this.createErrorNode(
        statContext,
        new Error("Unknown statement type"),
      );
    } catch (error) {
      this.errors.push(`Error transforming statement: ${error}`);
      return this.createErrorNode(statContext, error);
    }
  }

  private transformMessage(
    messageContext: any,
    messageType: "sync-message" | "async-message",
    parent?: MessageNode,
  ): MessageNode {
    const id = generateId();
    const sourceRange = this.extractSourceRange(messageContext);

    // Extract message data with error tolerance
    const from = this.extractFrom(messageContext);
    const to = this.extractTo(messageContext);
    const signature = this.extractSignature(messageContext);
    const assignment = this.extractAssignment(messageContext);
    const origin = this.extractOrigin(messageContext);

    const messageNode: MessageNode = {
      type: messageType,
      id,
      sourceRange: sourceRange || this.createEmptyRange(),
      parent,
      from: from || "UNKNOWN_FROM",
      to: to || "UNKNOWN_TO",
      signature: signature || "",
      assignment,
      statements: undefined, // Will be set after creating the node
      isSelfMessage: this.isSelfMessage(messageContext, from, to) || false,
      origin: origin || _STARTER_,
    };

    // Transform nested statements with the parent reference
    const statements = this.transformNestedStatements(
      messageContext,
      messageNode,
    );

    // Update the node with statements
    if (statements.length > 0) {
      (messageNode as any).statements = statements;
    }

    return messageNode;
  }

  private transformAsyncMessage(
    asyncMessageContext: any,
    parent?: MessageNode,
  ): MessageNode {
    return this.transformMessage(asyncMessageContext, "async-message", parent);
  }

  private transformCreation(
    creationContext: any,
    parent?: MessageNode,
  ): MessageNode {
    const id = generateId();
    const sourceRange = this.extractSourceRange(creationContext);

    const from = this.extractCreationFrom(creationContext);
    const to = this.extractCreationTo(creationContext);
    const signature = this.extractCreationSignature(creationContext);
    const assignment = this.extractCreationAssignment(creationContext);
    const origin = this.extractOrigin(creationContext);

    const messageNode: MessageNode = {
      type: "creation",
      id,
      sourceRange: sourceRange || this.createEmptyRange(),
      parent,
      from: from || _STARTER_,
      to: to || "UNKNOWN_CONSTRUCTOR",
      signature: signature || "«create»",
      assignment,
      statements: undefined, // Will be set after creating the node
      isSelfMessage: false,
      origin: origin || _STARTER_,
    };

    // Transform nested statements with the parent reference
    const statements = this.transformNestedStatements(
      creationContext,
      messageNode,
    );

    // Update the node with statements
    if (statements.length > 0) {
      (messageNode as any).statements = statements;
    }

    return messageNode;
  }

  private transformReturn(retContext: any, parent?: MessageNode): MessageNode {
    const id = generateId();
    const sourceRange = this.extractSourceRange(retContext);

    const from = this.extractReturnFrom(retContext);
    const to = this.extractReturnTo(retContext);
    const signature = this.extractReturnSignature(retContext);

    return {
      type: "return",
      id,
      sourceRange: sourceRange || this.createEmptyRange(),
      parent,
      from: from || "UNKNOWN_FROM",
      to: to || "UNKNOWN_TO",
      signature: signature || "",
      isSelfMessage: from === to,
      origin: from || _STARTER_,
    };
  }

  private transformNestedStatements(
    context: any,
    parent?: MessageNode,
  ): StatementNode[] {
    try {
      const statements = context.Statements?.() || [];
      return this.transformStatements(statements, parent);
    } catch (error) {
      this.errors.push(`Error transforming nested statements: ${error}`);
      return [];
    }
  }

  // Self message detection - only when both from and to are explicit and the same
  private isSelfMessage(
    context: any,
    from: string | undefined,
    to: string | undefined,
  ): boolean {
    try {
      // Check if there's an explicit from in the message
      const messageBody = context.messageBody?.();
      const hasExplicitFrom =
        messageBody?.from?.() !== undefined &&
        messageBody?.from?.()?.getFormattedText?.();

      // Only consider it a self message if from is explicitly provided and equals to
      return (
        hasExplicitFrom && from === to && from !== _STARTER_ && to !== _STARTER_
      );
    } catch {
      return false;
    }
  }

  // Extraction methods with error tolerance
  private extractFrom(context: any): string | undefined {
    try {
      // Try enhanced methods first, then fallback to direct access
      if (context.From) {
        const from = context.From();
        if (from) {
          return from;
        }
      }

      // Fallback for direct message body access
      const messageBody = context.messageBody?.();
      if (messageBody?.from) {
        const from =
          messageBody.from()?.getFormattedText?.() ||
          messageBody.from()?.getText?.();
        if (from) {
          return from;
        }
      }

      // Default to starter for messages without explicit from
      return _STARTER_;
    } catch {
      this.errors.push(`Error extracting 'from'`);
      return _STARTER_;
    }
  }

  private extractTo(context: any): string | undefined {
    try {
      // Try enhanced methods first
      if (context.Owner) {
        return context.Owner();
      }
      if (context.To) {
        return context.To();
      }
      // Fallback for direct message body access
      const messageBody = context.messageBody?.();
      if (messageBody?.to) {
        return (
          messageBody.to()?.getFormattedText?.() ||
          messageBody.to()?.getText?.()
        );
      }
      return undefined;
    } catch {
      this.errors.push(`Error extracting 'to'`);
      return undefined;
    }
  }

  private extractSignature(context: any): string | undefined {
    try {
      // Try enhanced method first
      if (context.SignatureText) {
        return context.SignatureText();
      }
      // Fallback to formatted text
      if (context.getFormattedText) {
        return context.getFormattedText();
      }
      if (context.getText) {
        return context.getText();
      }
      return undefined;
    } catch {
      this.errors.push(`Error extracting signature`);
      return undefined;
    }
  }

  private extractAssignment(context: any): AssignmentInfo | undefined {
    try {
      if (context.Assignment) {
        const assignment = context.Assignment();
        if (assignment) {
          return {
            assignee: assignment.assignee || "",
            dataType: assignment.type || undefined,
          };
        }
      }
      return undefined;
    } catch {
      this.errors.push(`Error extracting assignment`);
      return undefined;
    }
  }

  private extractOrigin(context: any): string | undefined {
    try {
      if (context.Origin) {
        return context.Origin();
      }
      return _STARTER_;
    } catch {
      this.errors.push(`Error extracting origin`);
      return _STARTER_;
    }
  }

  // Creation-specific extraction methods
  private extractCreationFrom(context: any): string | undefined {
    try {
      return context.From?.() || undefined;
    } catch {
      return undefined;
    }
  }

  private extractCreationTo(context: any): string | undefined {
    try {
      return context.Constructor?.() || context.To?.() || undefined;
    } catch {
      return undefined;
    }
  }

  private extractCreationSignature(context: any): string | undefined {
    try {
      const signatureText = context.SignatureText?.();
      if (signatureText) {
        // If it contains parameters, keep as is, otherwise use create
        if (signatureText.includes("(") || signatureText === "«create»") {
          return signatureText;
        }
        // For simple parameter text, wrap in create format
        return `«create»`;
      }
      return "«create»";
    } catch {
      return "«create»";
    }
  }

  private extractCreationAssignment(context: any): AssignmentInfo | undefined {
    try {
      const assignee = context.Assignee?.();
      const constructor = context.Constructor?.();
      if (assignee) {
        return {
          assignee,
          dataType: constructor || undefined,
        };
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  // Return-specific extraction methods
  private extractReturnFrom(context: any): string | undefined {
    try {
      return context.From?.() || undefined;
    } catch {
      return undefined;
    }
  }

  private extractReturnTo(context: any): string | undefined {
    try {
      return context.To?.() || context.ReturnTo?.() || undefined;
    } catch {
      return undefined;
    }
  }

  private extractReturnSignature(context: any): string | undefined {
    try {
      return context.SignatureText?.() || undefined;
    } catch {
      return undefined;
    }
  }

  private extractSourceRange(context: any): SourceRange | undefined {
    try {
      if (!context?.start || !context?.stop) {
        return undefined;
      }

      const start: Position = {
        line: context.start.line || 0,
        column: context.start.column || 0,
        offset: context.start.start || 0,
      };

      const end: Position = {
        line: context.stop.line || 0,
        column: context.stop.column || 0,
        offset: context.stop.stop || 0,
      };

      const text = context.getFormattedText?.() || "";

      return { start, end, text };
    } catch {
      this.errors.push(`Error extracting source range`);
      return undefined;
    }
  }

  private createErrorNode(context: any, error: any): ErrorNode {
    return {
      type: "error",
      id: generateId(),
      sourceRange: this.extractSourceRange(context) || this.createEmptyRange(),
      message: `Transformation error: ${error}`,
      originalError: error,
      partialData: {
        rawText: this.extractRawText(context),
      },
    };
  }

  private extractRawText(context: any): string {
    try {
      return context?.getFormattedText?.() || context?.getText?.() || "";
    } catch {
      return "";
    }
  }

  private createEmptyRange(): SourceRange {
    const pos: Position = { line: 0, column: 0, offset: 0 };
    return { start: pos, end: pos, text: "" };
  }

  private createEmptyDocument(): DocumentAST {
    return {
      type: "document",
      id: generateId(),
      sourceRange: this.createEmptyRange(),
      statements: [],
    };
  }
}

// Export singleton instance
export const messageTransformer = new MessageTransformer();
