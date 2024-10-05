import activityParser from "./index";

describe("If Statement", () => {
  it("should parse correctly", () => {
    const code = `@startuml
start
if (Graphviz installed?) then (yes1)
  :process all\\ndiagrams;
(inbound label2) elseif (yes2)
  :other action;
(inbound label3) else (no3)
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

    const activityLabel = ifBlock.branchLabel();
    expect(activityLabel.ACTIVITY_LABEL().getText()).toBe("yes1");
    const elseIfBlock = ifStatement.elseIfBlock()[0];
    const elseIfCondition = elseIfBlock.condition();
    expect(elseIfCondition.conditionContent()[0].getFormattedText()).toBe(
      "yes2",
    );
    const elseIfInboundLabel = elseIfBlock.inboundBranchLabel();
    expect(elseIfInboundLabel.ACTIVITY_LABEL().getText()).toBe(
      "inbound label2",
    );

    const elseBlock = ifStatement.elseBlock();
    const branchLabel = elseBlock.branchLabel();
    const elseLabel = branchLabel.ACTIVITY_LABEL();
    expect(elseLabel.getText()).toBe("no3");
    const elseInboundLabel = elseBlock.inboundBranchLabel();
    expect(elseInboundLabel.ACTIVITY_LABEL().getText()).toBe("inbound label3");
    const elseStatements = elseBlock.statement();

    const firstElseStatement = elseStatements[0].activity();
    expect(firstElseStatement.getFormattedText()).toBe(
      ":process only __sequence__ and __activity__ diagrams;",
    );
  });
});
