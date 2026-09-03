import vm from "node:vm";
import { Fixture } from "./fixture/Fixture";

// src/parser/Origin.js installs a generic ParserRuleContext.prototype.Origin
// that walks from `this.parentCtx` up to the nearest StatContext/ProgContext
// ancestor:
//
//   let ctx = this.parentCtx;
//   while (ctx && !(ctx instanceof StatContext || ctx instanceof ProgContext)) {
//     ctx = this.parentCtx;   // BUG: re-reads `this.parentCtx`, not `ctx.parentCtx`
//   }
//   return ctx.Origin();
//
// `ctx` never advances once the loop body runs, so it only terminates today
// because every real caller happens to invoke .Origin() on a node whose
// *immediate* parentCtx already is a StatContext or ProgContext (e.g.
// MessageContext, CreationContext, LoopContext, AltContext, ... — every one
// of these is a direct child of a StatContext per the `stat` grammar rule:
// `stat: alt | par | opt | critical | section | ref | loop | creation |
// message | asyncMessage EVENT_END? | ret | divider | tcf`). The loop
// condition is then false on the very first check and the body never runs.
//
// A MessageBodyContext is one level deeper than that: `message: messageBody
// (SCOL | braceBlock)?`, so `messageContext.messageBody().parentCtx` is the
// MessageContext itself, not a StatContext/ProgContext. Calling .Origin() on
// it enters the loop body and spins forever.
//
// Guarding against the hang: a synchronous, non-yielding `while` loop cannot
// be interrupted by bun:test's own per-test timeout (bunfig.toml's
// `[test] timeout = 5000`) — that mechanism relies on the event loop's timer
// queue, which never gets a turn while a busy loop holds the single JS
// thread, so it would never actually fire here. Verified separately
// (scratch repro, not checked in) that node:vm's `timeout` option, by
// contrast, DOES interrupt a synchronous `while (true) {}` — it uses V8's
// isolate-level execution watchdog rather than a macrotask timer. So this
// test bounds the call to the real, unmodified `.Origin()` method with
// `vm.runInContext(..., { timeout })` instead of relying on bun:test's
// timeout or reimplementing the loop with a hand-rolled iteration cap.
describe("Origin ancestor walk on a non-Stat/Prog node", () => {
  test("Origin() terminates and matches the enclosing statement's Origin, instead of hanging", () => {
    // A.m1 { B.m2 } — stat2 ("B.m2") is known-good per origin.spec.js's
    // "Embedded" test: stat2.Origin() === "A".
    const stat1 = Fixture.firstStatement("A.m1 { B.m2 }");
    const m1 = stat1.message();
    const stat2 = m1.Statements()[0];
    const m2 = stat2.message();
    const messageBody2 = m2.messageBody();

    // Sanity check: the node under test is genuinely not a StatContext or
    // ProgContext, and neither is its immediate parentCtx (which is `m2`,
    // the MessageContext) — this is exactly the shape the bug needs.
    expect(messageBody2.constructor.name).toBe("MessageBodyContext");
    expect(messageBody2.parentCtx).toBe(m2);
    expect(m2.constructor.name).toBe("MessageContext");

    const sandbox: { messageBody2: unknown; result: unknown } = {
      messageBody2,
      result: undefined,
    };
    vm.createContext(sandbox);

    let timedOut = false;
    try {
      vm.runInContext("result = messageBody2.Origin();", sandbox, {
        timeout: 1000,
      });
    } catch (e) {
      timedOut = /timed out/i.test((e as Error).message);
      if (!timedOut) throw e;
    }

    expect(timedOut).toBe(false);
    expect(sandbox.result).toBe(stat2.Origin());
    expect(sandbox.result).toBe("A");
  });
});
