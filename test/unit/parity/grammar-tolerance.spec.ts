/**
 * Stage-2 grammar tolerance spec — the 25 grammar-encoded error-tolerance
 * points from docs/langium-migration/02-parser-rules.md §8, asserted as RAW
 * Langium-AST structural contracts (no facade).
 *
 * "Zero recovery artifacts" is asserted as lexerErrors === 0 AND
 * parserErrors === 0: every point below is tolerated BY THE GRAMMAR
 * (optional suffixes / bare-keyword alternatives), so Chevrotain recovery must
 * never be needed — the ANTLR equivalent of "toStringTree contains no
 * <missing …>".
 *
 * Point #9's corpus inputs (`A ~>`) use an arrow that the LEXER has never
 * defined (no `~` token): ANTLR's golden for tol-09a is pure error nodes. The
 * real RETURN_ARROW token is `-->`, so the grammar contract is asserted with
 * `A -->` / `A --> B`, and the `~>` garbage input is asserted to degrade the
 * same way ANTLR does (errors, no crash).
 */
import { describe, expect, it } from "bun:test";
import { parseZen } from "../../../src/parser-langium/services";

function parseClean(code: string): any {
  const result = parseZen(code);
  expect(result.lexerErrors).toHaveLength(0);
  expect(result.parserErrors).toHaveLength(0);
  expect(result.value).toBeTruthy();
  return result.value as any;
}

function firstStat(code: string): any {
  const value = parseClean(code);
  expect(value.block?.stats?.length).toBeGreaterThanOrEqual(1);
  return value.block.stats[0];
}

describe("grammar tolerance — 02 §8 checklist (raw Langium AST)", () => {
  it("#1 empty file is a valid prog", () => {
    const value = parseClean("");
    expect(value.$type).toBe("Prog");
    expect(value.title).toBeUndefined();
    expect(value.block).toBeUndefined();
  });

  it("#2 `title` with no text", () => {
    const value = parseClean("title");
    expect(value.title.$type).toBe("Title");
    expect(value.title.content).toBeUndefined();
  });

  it("#3 group: bare / named / unclosed brace", () => {
    const bare = parseClean("group").headElements[0];
    expect(bare.$type).toBe("Group");
    expect(bare.name).toBeUndefined();

    const named = parseClean("group A").headElements[0];
    expect(named.name).toBe("A");

    const unclosed = parseClean("group A {").headElements[0];
    expect(unclosed.$type).toBe("Group");
    expect(unclosed.name).toBe("A");
    expect(unclosed.participants).toEqual([]);
  });

  it("#4 starter annotation: bare and with empty parens", () => {
    const bare = parseClean("@Starter");
    expect(bare.starterExp.$type).toBe("StarterExp");
    expect(bare.starterExp.starter).toBeUndefined();

    const parens = parseClean("@Starter()");
    expect(parens.starterExp.$type).toBe("StarterExp");
    expect(parens.starterExp.starter).toBeUndefined();

    const named = parseClean("@Starter(A)");
    expect(named.starterExp.starter).toBe("A");
  });

  it("#5 stereotype while typing: `<<`, `<<>>`, `<<name`", () => {
    const open = parseClean("<<").headElements[0];
    expect(open.$type).toBe("Participant");
    expect(open.stereotype.$type).toBe("Stereotype");
    expect(open.stereotype.name).toBeUndefined();

    const empty = parseClean("<<>>").headElements[0];
    expect(empty.stereotype.$type).toBe("Stereotype");
    expect(empty.stereotype.name).toBeUndefined();

    // ANTLR full-context behavior (golden tol-05c): the unclosed word binds
    // to the PARTICIPANT name, stereotype stays bare `<<`.
    const partial = parseClean("<<name").headElements[0];
    expect(partial.stereotype.$type).toBe("Stereotype");
    expect(partial.stereotype.name).toBeUndefined();
    expect(partial.name).toBe("name");
  });

  it("#6 `A as` with no alias", () => {
    const participant = parseClean("A as").headElements[0];
    expect(participant.name).toBe("A");
    expect(participant.label.$type).toBe("Label");
    expect(participant.label.name).toBeUndefined();
  });

  it("#7 bare `@Actor` / bare `<<x>>` as participant", () => {
    const typed = parseClean("@Actor").headElements[0];
    expect(typed.$type).toBe("Participant");
    expect(typed.participantType).toBe("@Actor");
    expect(typed.name).toBeUndefined();

    const stereotyped = parseClean("<<x>>").headElements[0];
    expect(stereotyped.$type).toBe("Participant");
    expect(stereotyped.stereotype.name).toBe("x");
    expect(stereotyped.name).toBeUndefined();
  });

  it("#8 `return` with no expression", () => {
    const ret = firstStat("return");
    expect(ret.$type).toBe("Ret");
    expect(ret.expr).toBeUndefined();
  });

  it("#9 half return-arrow: `A -->` / `A --> B` (real RETURN_ARROW token)", () => {
    const half = firstStat("A -->");
    expect(half.$type).toBe("Ret");
    expect(half.returnAsyncMessage.from.name).toBe("A");
    expect(half.returnAsyncMessage.to).toBeUndefined();

    const noColon = firstStat("A --> B");
    expect(noColon.returnAsyncMessage.to.name).toBe("B");
    expect(noColon.returnAsyncMessage.content).toBeUndefined();

    // The 02 §8 row-9 literal inputs use `~>`, which has NEVER been a lexer
    // token — ANTLR's golden is pure error nodes. Same degradation here:
    // non-null AST + parser errors, no throw.
    const garbage = parseZen("A ~>");
    expect(garbage.value).toBeTruthy();
    expect(garbage.parserErrors.length).toBeGreaterThan(0);
  });

  it("#10 bare fragment keywords: par / opt / critical / section", () => {
    expect(firstStat("par").$type).toBe("Par");
    expect(firstStat("par").braceBlock).toBeUndefined();
    expect(firstStat("opt").$type).toBe("Opt");
    expect(firstStat("opt").braceBlock).toBeUndefined();
    expect(firstStat("critical").$type).toBe("Critical");
    expect(firstStat("critical").braceBlock).toBeUndefined();
    expect(firstStat("section").$type).toBe("Section");
    expect(firstStat("section").braceBlock).toBeUndefined();
  });

  it("#11 anonymous section `{ A.m }` and orphan block after ref", () => {
    const anon = firstStat("{ A.m }");
    expect(anon.$type).toBe("Section");
    expect(anon.braceBlock.block.stats).toHaveLength(1);
    expect(anon.braceBlock.block.stats[0].$type).toBe("Message");

    const value = parseClean("ref(x) { m1 }");
    expect(value.block.stats.map((s: any) => s.$type)).toEqual([
      "Ref",
      "Section",
    ]);
    expect(value.block.stats[0].names).toEqual(["x"]);
  });

  it("#12 `new` and `a = new` (creationBody alt 2)", () => {
    const bare = firstStat("new");
    expect(bare.$type).toBe("Creation");
    expect(bare.body.$type).toBe("CreationBody");
    expect(bare.body.construct).toBeUndefined();
    expect(bare.body.assignment).toBeUndefined();

    const assigned = firstStat("a = new");
    expect(assigned.$type).toBe("Creation");
    expect(assigned.body.assignment.assignee.atom.value).toBe("a");
    expect(assigned.body.construct).toBeUndefined();
  });

  it("#13 dangling assignment `ret =`", () => {
    const msg = firstStat("ret =");
    expect(msg.$type).toBe("Message");
    expect(msg.body.assignment.$type).toBe("Assignment");
    expect(msg.body.assignment.assignee.atom.value).toBe("ret");
    expect(msg.body.fromTo).toBeUndefined();
    expect(msg.body.func).toBeUndefined();
  });

  it("#14 target + dot with no method: `A->B.` / `B.`", () => {
    const arrowed = firstStat("A->B.");
    expect(arrowed.$type).toBe("Message");
    expect(arrowed.body.fromTo.from.name).toBe("A");
    expect(arrowed.body.fromTo.to.name).toBe("B");
    expect(arrowed.body.func).toBeUndefined();

    const dotted = firstStat("B.");
    expect(dotted.body.fromTo.to.name).toBe("B");
    expect(dotted.body.fromTo.from).toBeUndefined();
    expect(dotted.body.func).toBeUndefined();
  });

  it("#15 method without parens: `A.method`", () => {
    const msg = firstStat("A.method");
    expect(msg.body.fromTo.to.name).toBe("A");
    const signature = msg.body.func.signatures[0];
    expect(signature.methodName.name).toBe("method");
    expect(signature.invocation).toBeUndefined();
  });

  it("#16 async message without payload: `A->B:`", () => {
    const async = firstStat("A->B:");
    expect(async.$type).toBe("AsyncMessage");
    expect(async.from.name).toBe("A");
    expect(async.to.name).toBe("B");
    expect(async.content).toBeUndefined();
  });

  it("#17 half-typed arrows: `A -` / `A ->` / `A - B`", () => {
    const minus = firstStat("A -");
    expect(minus.$type).toBe("AsyncMessage");
    expect(minus.from.name).toBe("A");
    expect(minus.to).toBeUndefined();

    const arrow = firstStat("A ->");
    expect(arrow.$type).toBe("AsyncMessage");
    expect(arrow.from.name).toBe("A");
    expect(arrow.to).toBeUndefined();

    const minusTarget = firstStat("A - B");
    expect(minusTarget.$type).toBe("AsyncMessage");
    expect(minusTarget.from.name).toBe("A");
    expect(minusTarget.to.name).toBe("B");
  });

  it("#18 trailing comma in parameters: `m(a,)`", () => {
    const msg = firstStat("m(a,)");
    const parameters =
      msg.body.func.signatures[0].invocation.parameters.parameters;
    expect(parameters).toHaveLength(1);
    expect(parameters[0].$type).toBe("AtomExpr");
  });

  it("#19 named parameter with dangling value: `m(a=)`", () => {
    const msg = firstStat("m(a=)");
    const parameter =
      msg.body.func.signatures[0].invocation.parameters.parameters[0];
    expect(parameter.$type).toBe("NamedParameter");
    expect(parameter.name).toBe("a");
    expect(parameter.value).toBeUndefined();
  });

  it("#20 empty condition: `if()`", () => {
    const alt = firstStat("if()");
    expect(alt.$type).toBe("Alt");
    expect(alt.ifBlock.parExpr.$type).toBe("ParExpr");
    expect(alt.ifBlock.parExpr.condition).toBeUndefined();
    expect(alt.ifBlock.braceBlock).toBeUndefined();
  });

  it("#21 unclosed paren: `if(x`", () => {
    const alt = firstStat("if(x");
    expect(alt.ifBlock.parExpr.condition.$type).toBe("AtomExpr");
    expect(alt.ifBlock.parExpr.condition.atom.value).toBe("x");
  });

  it("#22 if/else-if/else without body — following stats stay siblings (IfWithoutBody contract)", () => {
    // The exact IfWithoutBody.spec.ts input. Contract: outer message keeps its
    // braceBlock; the body has exactly 3 SIBLING stats; the if has a parExpr
    // with a null condition and no braceBlock; zero recovery artifacts.
    const value = parseClean(
      "BookLibService.Borrow(id) {\n  User = Session.GetUser()\n  if()\n  return receipt\n}",
    );
    const borrow = value.block.stats[0];
    expect(borrow.$type).toBe("Message");
    expect(borrow.braceBlock).toBeTruthy();

    const siblings = borrow.braceBlock.block.stats;
    expect(siblings).toHaveLength(3);
    expect(siblings.map((s: any) => s.$type)).toEqual([
      "Message",
      "Alt",
      "Ret",
    ]);

    const ifBlock = siblings[1].ifBlock;
    expect(ifBlock.parExpr.$type).toBe("ParExpr");
    expect(ifBlock.parExpr.condition).toBeUndefined();
    expect(ifBlock.braceBlock).toBeUndefined();

    // `return receipt` stays a sibling, not swallowed into the if.
    expect(siblings[2].expr.atom.value).toBe("receipt");

    // else-if / bare else without body.
    const elseIf = firstStat("if(x){} else if(y)");
    expect(elseIf.elseIfBlocks).toHaveLength(1);
    expect(elseIf.elseIfBlocks[0].braceBlock).toBeUndefined();

    const bareElse = firstStat("if(x){} else");
    expect(bareElse.elseBlock.$type).toBe("ElseBlock");
    expect(bareElse.elseBlock.braceBlock).toBeUndefined();
  });

  it("#23 loop: bare `while`, `while(x)` without body", () => {
    const bare = firstStat("while");
    expect(bare.$type).toBe("Loop");
    expect(bare.parExpr).toBeUndefined();
    expect(bare.braceBlock).toBeUndefined();

    const noBody = firstStat("while(x)");
    expect(noBody.parExpr.condition.atom.value).toBe("x");
    expect(noBody.braceBlock).toBeUndefined();
  });

  it("#24 empty braces `{}`", () => {
    const section = firstStat("{}");
    expect(section.$type).toBe("Section");
    expect(section.braceBlock.$type).toBe("BraceBlock");
    expect(section.braceBlock.block).toBeUndefined();
  });

  it("#25 free-text condition: `while(no more retries)`", () => {
    const loop = firstStat("while(no more retries)");
    expect(loop.$type).toBe("Loop");
    expect(loop.parExpr.condition.$type).toBe("TextExpr");
    expect(loop.parExpr.condition.words).toEqual(["no", "more", "retries"]);
  });
});
