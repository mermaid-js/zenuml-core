import antlr4 from "antlr4";
import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { OwnableMessageType } from "@/parser/OwnableMessage";
import { commentOf, labelRangeOfMessage, signatureOf, offsetRangeOf, codeRangeOf } from "@/parser/helpers";
import type { CodeRange } from "@/parser/CodeRange";

export interface IRMessage {
  from?: string;
  to?: string;
  signature: string;
  type: OwnableMessageType;
  labelRange?: [number, number] | null;
  comment?: string;
  range?: [number, number] | null;
  codeRange?: CodeRange | null;
  providedFrom?: string | null;
  assignee?: string | null;
  statementsCount: number;
}

class MessagesIRCollector extends sequenceParserListener {
  private isBlind = false;
  private messages: IRMessage[] = [];

  private push(kind: "sync" | "async" | "creation" | "return", ctx: any) {
    if (this.isBlind) return;
    if (!ctx) return;
    // Map kind to enum
    const typeMap: Record<string, OwnableMessageType> = {
      sync: OwnableMessageType.SyncMessage,
      async: OwnableMessageType.AsyncMessage,
      creation: OwnableMessageType.CreationMessage,
      return: OwnableMessageType.ReturnMessage,
    };
    // For return, label range should be computed from child context (expr or content)
    let labelCtx = ctx;
    if (kind === "return") {
      const expr = ctx?.expr?.();
      const content = ctx?.asyncMessage?.()?.content?.();
      labelCtx = content || expr || ctx;
    }
    const range = offsetRangeOf(ctx);
    const codeRange = codeRangeOf(ctx);
    const providedFrom = typeof ctx?.ProvidedFrom === "function" ? ctx.ProvidedFrom() : undefined;
    // Extract assignee based on message type
    let assignee;
    if (kind === "creation") {
      // For creation messages: get assignee and type separately, then format as "assignee:type"
      const assigneeText = ctx?.creationBody?.()?.assignment?.()?.assignee?.()?.getFormattedText?.();
      const typeText = ctx?.creationBody?.()?.construct?.()?.getFormattedText?.();
      if (assigneeText) {
        assignee = typeText ? `${assigneeText}:${typeText}` : assigneeText;
      }
    } else {
      // For other messages: use Assignment() method if available
      assignee = typeof ctx?.Assignment === "function" ? ctx.Assignment()?.getText() : undefined;
    }
    
    // Extract statements count for return message numbering
    const statements = ctx?.Statements?.() || [];
    const statementsCount = statements.length;
    
    this.messages.push({
      from: ctx?.From?.(),
      to: ctx?.Owner?.(),
      signature: signatureOf(ctx),
      type: typeMap[kind],
      labelRange: labelRangeOfMessage(labelCtx, kind),
      comment: commentOf(ctx),
      range,
      codeRange: codeRange ?? null,
      providedFrom: providedFrom ?? null,
      assignee: assignee ?? null,
      statementsCount,
    });
  }

  // Visitors
  enterMessage = (ctx: any) => this.push("sync", ctx);
  enterAsyncMessage = (ctx: any) => this.push("async", ctx);
  enterCreation = (ctx: any) => this.push("creation", ctx);
  enterRet = (ctx: any) => {
    // Ret with asyncMessage is handled by enterAsyncMessage
    if (ctx?.asyncMessage?.()) return;
    this.push("return", ctx);
  };

  // Blind scopes
  enterParameters() {
    this.isBlind = true;
  }
  exitParameters() {
    this.isBlind = false;
  }
  enterCondition() {
    this.isBlind = true;
  }
  exitCondition() {
    this.isBlind = false;
  }

  result() {
    return this.messages;
  }
}

export function buildMessagesModel(rootCtx: any): IRMessage[] {
  if (!rootCtx) return [];
  const walker = antlr4.tree.ParseTreeWalker.DEFAULT;
  const collector = new MessagesIRCollector();
  walker.walk(collector, rootCtx);
  return collector.result();
}
