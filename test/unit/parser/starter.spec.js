import { RootContext } from "../../../src/parser/index";

describe("Starter", () => {
  test.each([
    // participant header
    ["A", undefined],
    ["A B", undefined],
    ["group {A B}", undefined],
    ["A group {B C}", undefined],

    // messages
    ["A B.m", undefined],
    ["A A->B.m", undefined],
    ["if(x) { A.m }", undefined],
    ["if(x) { A->B.m }", undefined],

    // with @starter
    ["@Starter(A)", "A"],
    ["@starter(A)", "A"],
    ['@Starter("A B")', "A B"],
    ['@Starter("A B")', "A B"],
    ["A1 @Starter(A)", "A"],
    ["@starter(A) B", "A"],
    ["@starter(A) A1->B.m", "A"],
    ["A1 @starter(A) A2->B.m", "A"],
  ])("For code: %s, starter is %s", (code, starter) => {
    let rootContext = RootContext(code);
    let actualStarter = rootContext.Starter();
    expect(actualStarter).toBe(starter);
  });
});
