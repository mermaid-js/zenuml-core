import activityParser from "./index";

describe("If Statement", () => {
  it("should parse correctly", () => {
    const code = `@startuml
label ABCD
goto ABCD
@enduml
`;
    const result = activityParser.RootContext(code);
    // @ts-ignore
    const statements = result.statement();
    expect(statements).to.have.lengthOf(2); // start, if, stop
    const labelStatement = statements[0].labelStatement();
    expect(labelStatement.LABEL_STATEMENT().getText()).toBe("label ABCD");
    const gotoStatement = statements[1].gotoStatement();
    expect(gotoStatement.GOTO_STATEMENT().getText()).toBe("goto ABCD");
  });
});
