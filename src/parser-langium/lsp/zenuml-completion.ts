/**
 * Completion for ZenUML. Langium's default provider already offers the grammar
 * keywords valid at the cursor; this appends the participant names already used
 * in the document so the editor can complete message endpoints. Participant
 * names are plain string tokens (not cross-references), so they are added as
 * plain completion items rather than via reference scoping.
 */
import { DefaultCompletionProvider } from "langium/lsp";
import type { LangiumDocument } from "langium";
import {
  CompletionItemKind,
  type CompletionList,
  type CompletionParams,
} from "vscode-languageserver";
import type { CancellationToken } from "vscode-languageserver";
import { collectParticipantNames } from "./participants.js";

export class ZenUmlCompletionProvider extends DefaultCompletionProvider {
  override async getCompletion(
    document: LangiumDocument,
    params: CompletionParams,
    cancelToken?: CancellationToken,
  ): Promise<CompletionList | undefined> {
    const base = await super.getCompletion(document, params, cancelToken);
    const names = collectParticipantNames(document.parseResult?.value);
    const items = names.map((name) => ({
      label: name,
      kind: CompletionItemKind.Variable,
      detail: "participant",
      sortText: `0_${name}`, // surface known participants above keywords
    }));
    if (!base) {
      return { isIncomplete: false, items };
    }
    const existing = new Set(base.items.map((i) => i.label));
    for (const item of items) {
      if (!existing.has(item.label)) base.items.push(item);
    }
    return base;
  }
}
