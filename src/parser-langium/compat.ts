/**
 * Langium-backed equivalents of the `@/parser` public surface (Stage 3+4).
 *
 * Mirrors src/parser/index.js exactly:
 *  - RootContext(code) -> facade ProgContext (a partial tree is ALWAYS
 *    returned, mirroring the ANTLR `_syntaxErrors`-before-prog() quirk —
 *    error recovery keeps half-typed DSL renderable);
 *  - Errors / ErrorDetails are LIVE module-level arrays that accumulate one
 *    entry per syntax error across parses and are cleared by core.tsx via
 *    `.length = 0` (07 §R12/G5 — the live-reference import shape is contract
 *    until Stage 6);
 *  - Participants / Depth / class exports keep today's signatures;
 *  - sub-rule fixture entries are rebuilt on parseZen(code, { rule }).
 */
import type { ParseResult } from "langium";
import { parseZen } from "./services";
import {
  buildRootFacade,
  buildSubRuleFacade,
  GroupContext,
  ParticipantContext,
  ProgContext,
} from "./facade/nodes";
import { LangiumFrameBuilder, LangiumToCollector, langiumAllMessages, langiumDepth } from "./facade/visitors";

export interface ErrorDetail {
  line: number;
  column: number;
  msg: string;
}

export const Errors: string[] = [];
export const ErrorDetails: ErrorDetail[] = [];

function recordErrors(result: ParseResult<any>): void {
  for (const e of result.lexerErrors ?? []) {
    const line = Number.isFinite(e.line) ? (e.line as number) : 1;
    const column = Number.isFinite(e.column) ? (e.column as number) - 1 : 0;
    Errors.push(`${e.message} line ${line}, col ${column}: ${e.message}`);
    ErrorDetails.push({ line, column, msg: e.message });
  }
  for (const e of result.parserErrors ?? []) {
    const token: any = e.token;
    const line = Number.isFinite(token?.startLine) ? token.startLine : 1;
    const column = Number.isFinite(token?.startColumn) ? token.startColumn - 1 : 0;
    Errors.push(`${token?.image ?? "<EOF>"} line ${line}, col ${column}: ${e.message}`);
    ErrorDetails.push({ line, column, msg: e.message });
  }
}

export function RootContext(code: unknown): ProgContext {
  const text = typeof code === "string" ? code : String(code ?? "");
  const result = parseZen(text);
  recordErrors(result);
  return buildRootFacade(result.value, text);
}

export function Participants(ctx: unknown) {
  return LangiumToCollector.getParticipants(ctx);
}

export function Depth(ctx: unknown): number {
  return langiumDepth(ctx);
}

export { ProgContext, GroupContext, ParticipantContext, LangiumFrameBuilder, LangiumToCollector, langiumAllMessages };

/* ------------------------------------------------------------------ */
/* Sub-rule fixtures (ContextsFixture port — 07 §P10/G9)                */
/* ------------------------------------------------------------------ */

function fixture(rule: string, opts?: { statWrapper?: boolean }) {
  return (code: string) => {
    const result = parseZen(code, { rule });
    return buildSubRuleFacade(result.value, code, opts);
  };
}

export const ProgContextFixture = (code: string) => {
  const result = parseZen(code, { rule: "Prog" });
  return buildRootFacade(result.value, code);
};
export const TitleContextFixture = fixture("Title");
export const StatContextFixture = fixture("Stat", { statWrapper: true });
export const AsyncMessageContextFixture = fixture("AsyncMessage");
export const SyncMessageContextFixture = fixture("Message");
export const DividerContextFixture = fixture("Divider");
export const CreationContextFixture = fixture("Creation");
export const RetContextFixture = fixture("Ret");

const compatDefault = {
  RootContext,
  ProgContext,
  GroupContext,
  ParticipantContext,
  Participants,
  Errors,
  ErrorDetails,
  Depth,
};

export default compatDefault;
