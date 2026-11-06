import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { renderToSvg } from "../svg/renderToSvg";

// A message without a target (`new` with no type, a call on an empty name,
// a self-call with no owner) has no participant to look up. The layout used to
// log "Participant X or undefined not found" for each of them, on every
// keystroke of a half-typed line and for valid input such as `selfSync() {}`.
let warn: ReturnType<typeof spyOn>;
beforeEach(() => {
  warn = spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe("layout does not warn about messages that have no target", () => {
  it.each([
    "new",
    "r = new",
    "@return x\nA.c()",
    'A.a()\n"".m()',
    'A.a()\nB->"": x',
    "selfSync() {\n  A.method {\n    B.method\n  }\n}",
    "A.a()\nB->",
    'A.a()\nB->""',
  ])("%p", (code) => {
    renderToSvg(code);
    expect(warn).not.toHaveBeenCalled();
  });

  it("renders valid diagrams without a warning", () => {
    renderToSvg("A->B: x\nnew C\nB.m() {\n  return r\n}");
    expect(warn).not.toHaveBeenCalled();
  });
});
