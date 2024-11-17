import { SwimLaneDiagram } from "./Diagram";

describe("SwimLaneDiagram", () => {
  test("should parse empty diagram", () => {
    const code = `
    A.method() {
      B.method()
      B.method2() {
        C.method()
      }
    }
    `;

    const diagram = new SwimLaneDiagram();
    diagram.parse(code);
    const swimLanes = diagram.getSwimLanes();
    expect(swimLanes.size).toBe(3);
    const swimlaneA = swimLanes.get("A");
    const swimlaneB = swimLanes.get("B");
    const swimlaneC = swimLanes.get("C");
    expect(swimlaneA?.nodes.length).toBe(1);
    expect(swimlaneB?.nodes.length).toBe(2);
    expect(swimlaneC?.nodes.length).toBe(1);

    console.log(JSON.stringify(diagram.toJson(), null, 2));
  });
});
