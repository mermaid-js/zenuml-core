import activityParser from "./index";

describe("If Statement", () => {
  it("should parse correctly", () => {
    const code = `@startuml
|Swimlane1|
start
:foo1;
|#AntiqueWhite|Swimlane2|
:foo2;
:foo3;
|Swimlane1|
:foo4;
|Swimlane2|
:foo5;
stop
@enduml
`;
    const result = activityParser.RootContext(code);
    // @ts-ignore
    const statements = result.statement();
    expect(statements).to.have.lengthOf(11); // start, if, stop
    const swimlane1 = statements[0].swimlane();
    expect(swimlane1.swimlaneName().getFormattedText()).toBe("Swimlane1");
    const swimlane2 = statements[3].swimlane();
    expect(swimlane2.swimlaneName().getFormattedText()).toBe("Swimlane2");
    expect(swimlane2.swimlaneColor().color().getFormattedText()).toBe(
      "#AntiqueWhite",
    );
    const swimlane3 = statements[6].swimlane();
    expect(swimlane3.swimlaneName().getFormattedText()).toBe("Swimlane1");
    const swimlane4 = statements[8].swimlane();
    expect(swimlane4.swimlaneName().getFormattedText()).toBe("Swimlane2");
  });
});
