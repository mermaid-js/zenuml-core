import activityParser from "./index";

describe("Repeat Statement", () => {
  it("should parse correctly", () => {
    const code = `@startuml
start
while (data available?)
  :read data;
  :generate diagrams;
endwhile
stop
@enduml
`;
    const result = activityParser.RootContext(code);
    // @ts-ignore
    const statements = result.statement();
    expect(statements).to.have.lengthOf(3); // start, if, stop
    const whileStatement = statements[1].whileStatement();
    const subStatements = whileStatement.statement();
    const firstSubStatement = subStatements[0].activity();
    expect(firstSubStatement.getFormattedText()).toBe(":read data;");
    const secondSubStatement = subStatements[1].activity();
    expect(secondSubStatement.getFormattedText()).toBe(":generate diagrams;");
    const condition = whileStatement.condition();
    expect(condition.conditionContent()[0].getFormattedText()).toBe(
      "data available?",
    );
  });
});
