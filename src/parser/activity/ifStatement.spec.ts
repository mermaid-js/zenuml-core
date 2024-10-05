import activityParser from "./index";

describe("If Statement", () => {
  it("should parse correctly", () => {
    const code = `@startuml

start

if (Graphviz installed?) then (yes)
  :process all\\ndiagrams;
else (no)
  :process only
  __sequence__ and __activity__ diagrams;
endif

stop

@enduml
`;
    const result = activityParser.RootContext(code);
    // @ts-ignore
    const statements = result.statement();
    expect(statements).to.have.lengthOf(3); // start, if, stop
    const ifStatement = statements[1].ifStatement();
    const ifBlock = ifStatement.ifBlock();
    const condition = ifBlock.condition();
    expect(condition.conditionContent()[0].getFormattedText()).toBe(
      "Graphviz installed?",
    );
    const activityLabel = ifBlock.branchLabel().ACTIVITY_LABEL();
    expect(activityLabel.getText()).toBe("yes");

    // Additional test expectations
    const elseBlock = ifStatement.elseBlock();
    const branchLabel = elseBlock.branchLabel();
    const elseLabel = branchLabel.ACTIVITY_LABEL();
    expect(elseLabel.getText()).toBe("no");

    const elseStatements = elseBlock.statement();
    expect(elseStatements).to.have.lengthOf(1);

    const firstElseStatement = elseStatements[0].activity();
    expect(firstElseStatement.getFormattedText()).toBe(
      ":process only __sequence__ and __activity__ diagrams;",
    );
  });
});
