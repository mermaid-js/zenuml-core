import { OwnableMessage, OwnableMessageType } from "./OwnableMessage";
import antlr4 from "antlr4";

import sequenceParserListener from "../generated-parser/sequenceParserListener";

export class MessageCollector extends sequenceParserListener {
  private isBlind = false;
  private ownableMessages: Array<OwnableMessage> = [];

  enterMessage = (ctx: any) =>
    this._addOwnedMessage(OwnableMessageType.SyncMessage)(ctx);
  enterAsyncMessage = (ctx: any) =>
    this._addOwnedMessage(OwnableMessageType.AsyncMessage)(ctx);
  enterCreation = (ctx: any) =>
    this._addOwnedMessage(OwnableMessageType.CreationMessage)(ctx);
  enterRet = (ctx: any) =>
    this._addOwnedMessage(OwnableMessageType.ReturnMessage)(ctx);

  private _addOwnedMessage = (type: OwnableMessageType) => (ctx: any) => {
    if (this.isBlind) {
      return;
    }
    const from = ctx.From();
    const owner = ctx?.Owner();
    const signature = ctx?.SignatureText();
    this.ownableMessages.push({
      from: from,
      signature: signature,
      type,
      to: owner,
    });
  };

  enterParameters() {
    this.isBlind = true;
  }

  exitParameters() {
    this.isBlind = false;
  }

  result() {
    return this.ownableMessages;
  }
}

// Returns all messages grouped by owner participant
export function AllMessages(ctx: any) {
  const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

  const listener = new MessageCollector();
  walker.walk(listener, ctx);
  return listener.result();
}
