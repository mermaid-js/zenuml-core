import antlr4 from "antlr4";
import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { OwnableMessageType } from "@/parser/OwnableMessage";
import { commentOf, labelRangeOfMessage, signatureOf } from "@/parser/helpers";

export interface IRMessage {
  from?: string;
  to?: string;
  signature: string;
  type: OwnableMessageType;
  labelRange?: [number, number] | null;
  comment?: string;
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
    this.messages.push({
      from: ctx?.From?.(),
      to: ctx?.Owner?.(),
      signature: signatureOf(ctx),
      type: typeMap[kind],
      labelRange: labelRangeOfMessage(labelCtx, kind),
      comment: commentOf(ctx),
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

