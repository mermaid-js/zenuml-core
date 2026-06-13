/**
 * Hover content for ZenUML nodes. `getAstNodeHoverContent` returns a markdown
 * string (Langium wraps it into an LSP Hover with the node's range).
 */
import { AstNodeHoverProvider } from "langium/lsp";
import type { AstNode, MaybePromise } from "langium";
import {
  isCreation,
  isFrom,
  isMessage,
  isParticipant,
  isTitle,
  isTo,
} from "../generated/ast.js";

export class ZenUmlHoverProvider extends AstNodeHoverProvider {
  protected override getAstNodeHoverContent(
    node: AstNode,
  ): MaybePromise<string | undefined> {
    if (isParticipant(node)) {
      const type = node.participantType ? ` \`${node.participantType}\`` : "";
      const stereotype = node.stereotype?.name
        ? ` «${node.stereotype.name}»`
        : "";
      return `**Participant**${type} \`${node.name ?? "?"}\`${stereotype}`;
    }
    if (isFrom(node) || isTo(node)) {
      return `**Participant** \`${node.name ?? "?"}\``;
    }
    if (isMessage(node)) {
      const to = node.body?.fromTo?.to?.name;
      const method = node.body?.func?.signatures?.[0]?.methodName?.name;
      const target = [to, method].filter(Boolean).join(".");
      return `**Message** → \`${target || "?"}\``;
    }
    if (isCreation(node)) {
      const ctor = node.body?.construct;
      return `**Creation** \`new ${ctor ?? "?"}\``;
    }
    if (isTitle(node)) {
      return `**Title** — ${node.content ?? ""}`;
    }
    return undefined;
  }
}
