import { OwnableMessage, OwnableMessageType } from "./OwnableMessage";
import antlr4 from "antlr4";

import sequenceParserListener from "../generated-parser/sequenceParserListener";

export class MessageContextListener extends sequenceParserListener {
  private isBlind = false;
  private ownableMessages: Array<OwnableMessage> = [];

  enterMessage = (ctx: any) =>
    this._addOwnedMessage(OwnableMessageType.SyncMessage)(ctx);
  enterAsyncMessage = (ctx: any) =>
    this._addOwnedMessage(OwnableMessageType.AsyncMessage)(ctx);
  enterCreation = (ctx: any) =>
    this._addOwnedMessage(OwnableMessageType.CreationMessage)(ctx);

  private _addOwnedMessage = (type: OwnableMessageType) => (ctx: any) => {
    if (this.isBlind) {
      return;
    }
    const owner = ctx?.Owner();
    this.ownableMessages.push({
      from: ctx.From(),
      signature: ctx?.SignatureText(),
      label: ctx?.Label(),
      type,
      to: owner || ctx.From(),
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

  const listener = new MessageContextListener();
  walker.walk(listener, ctx);
  return listener.result();
}
