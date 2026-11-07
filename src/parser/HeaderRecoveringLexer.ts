import { default as sequenceLexer } from "../generated-parser/sequenceLexer";
import { isEmptyPlan, planHeaderRecovery } from "./headerRecovery";

// Applies the plan from ./headerRecovery to the ANTLR token list: see that file
// for the reason. The parser and its grammar stay as they are.

// ANTLR tokens and the generated lexer have no useful TypeScript types here;
// src/parser/index.ts treats them the same way.
type Token = any;

const lexerClass = sequenceLexer as any;
const EOF = -1;

class RecoveringLexer extends lexerClass {
  /** True when recovery reported a syntax error, so the tree is not error-free. */
  reportedHeaderError = false;
  private recovered: Token[] | null = null;
  private nextIndex = 0;

  nextToken(): Token {
    if (!this.recovered) this.recovered = this.lexAndRecover();
    const last = this.recovered.length - 1;
    return this.recovered[Math.min(this.nextIndex++, last)];
  }

  private lexAndRecover(): Token[] {
    const tokens: Token[] = [];
    let token: Token;
    do {
      token = super.nextToken();
      tokens.push(token);
    } while (token.type !== EOF);

    // Position in `tokens` (all channels) of each token the parser sees.
    const positions: number[] = [];
    tokens.forEach((t, position) => {
      if (t.channel === 0) positions.push(position);
    });
    const visible = positions.map((position) => tokens[position]);
    const plan = planHeaderRecovery(
      visible.map((t) => ({
        kind: t.type === EOF ? "EOF" : lexerClass.symbolicNames[t.type],
        line: t.line,
      })),
    );

    for (const { at, expected } of plan.errors) {
      this.reportedHeaderError = true;
      const offending = visible[at];
      this.getErrorListenerDispatch().syntaxError(
        this,
        null,
        offending.line,
        offending.column,
        `missing ${expected} at '${offending.text}'`,
        null,
      );
    }
    if (isEmptyPlan(plan)) return tokens;

    const merges = new Map(
      plan.merges.map(({ first, last }) => [
        positions[first],
        { token: this.mergedToken(visible[first], visible[last]), last },
      ]),
    );
    const insertions = new Map(
      [...plan.insertions].map(([index, kinds]) => [
        positions[index],
        kinds.map((kind) => this.emptyTokenAfter(kind, visible[index])),
      ]),
    );

    const recovered: Token[] = [];
    for (let position = 0; position < tokens.length; position++) {
      const merge = merges.get(position);
      recovered.push(merge ? merge.token : tokens[position]);
      if (merge) position = positions[merge.last];
      recovered.push(...(insertions.get(position) ?? []));
    }
    return recovered;
  }

  private mergedToken(first: Token, last: Token): Token {
    return this._factory.create(
      first.source,
      lexerClass.ID,
      this._input.getText(first.start, last.stop),
      0,
      first.start,
      last.stop,
      first.line,
      first.column,
    );
  }

  // No width: it starts right after the token it follows, so source ranges and
  // text stay those of the real tokens.
  private emptyTokenAfter(kind: string, before: Token): Token {
    return this._factory.create(
      before.source,
      lexerClass[kind],
      "",
      0,
      before.stop + 1,
      before.stop,
      before.line,
      before.column + (before.stop - before.start) + 1,
    );
  }
}

export const HeaderRecoveringLexer =
  RecoveringLexer as unknown as typeof sequenceLexer;
