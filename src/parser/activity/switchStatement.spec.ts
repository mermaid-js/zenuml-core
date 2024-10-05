import activityParser from "./index";

describe("Switch Statement", () => {
  it("should parse correctly", () => {
    const code = `@startuml
start
switch (test?)
case ( condition A )
  :Text 1;
case ( condition B )
  :Text 2;
endswitch
stop
@enduml
`;
    const result = activityParser.RootContext(code);
    // @ts-ignore
    const statements = result.statement();
    expect(statements).to.have.lengthOf(3); // start, if, stop
    const switchStatement = statements[1].switchStatement();
    const switchBlock = switchStatement.switchBlock();
    const condition = switchBlock.condition();
    expect(condition.conditionContent()[0].getFormattedText()).toBe("test?");

    const caseStatementA = switchStatement.caseStatement()[0];
    const caseConditionA = caseStatementA.condition();
    expect(caseConditionA.conditionContent()[0].getFormattedText()).toBe(
      "condition A",
    );
    const caseStatementsA = caseStatementA.statement();
    const firstCaseStatementA = caseStatementsA[0].activity();
    expect(firstCaseStatementA.getFormattedText()).toBe(":Text 1;");

    const caseStatementB = switchStatement.caseStatement()[1];
    const caseStatementsB = caseStatementB.statement();
    const firstCaseStatementB = caseStatementsB[0].activity();
    expect(firstCaseStatementB.getFormattedText()).toBe(":Text 2;");
  });
});
