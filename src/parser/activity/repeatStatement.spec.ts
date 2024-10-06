import activityParser from "./index";

describe("Repeat Statement", () => {
  it("should parse correctly", () => {
    const code = `@startuml
start
repeat
  :read data;
  :generate diagrams;
repeat while (more data?) is (yes) not (no)
stop
@enduml
`;
    const result = activityParser.RootContext(code);
    // @ts-ignore
    const statements = result.statement();
    expect(statements).to.have.lengthOf(3); // start, if, stop
    const repeatStatement = statements[1].repeatStatement();
    const subStatements = repeatStatement.statement();
    const firstSubStatement = subStatements[0].activity();
    expect(firstSubStatement.getFormattedText()).toBe(":read data;");
    const secondSubStatement = subStatements[1].activity();
    expect(secondSubStatement.getFormattedText()).toBe(":generate diagrams;");
    const condition = repeatStatement.condition();
    expect(condition.conditionContent()[0].getFormattedText()).toBe(
      "more data?",
    );

    const isBranch = repeatStatement.isBranch();
    expect(isBranch.branchLabel().IDENTIFIER().getText()).toBe("yes");
    const notBranch = repeatStatement.notBranch();
    expect(notBranch.branchLabel().IDENTIFIER().getText()).toBe("no");
  });
});
