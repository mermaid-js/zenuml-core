import { SwimLaneDiagram } from "./Diagram";

describe("SwimLaneDiagram", () => {
  // test("should parse empty diagram", () => {
  //   const code = `
  //   A.method() {
  //     B.method()
  //     B.method2() {
  //       C.method()
  //     }
  //   }
  //   `;

  //   const diagram = new SwimLaneDiagram();
  //   diagram.parse(code);
  //   const swimLanes = diagram.getSwimLanes();
  //   expect(swimLanes.size).toBe(3);
  //   const swimlaneA = swimLanes.get("A");
  //   const swimlaneB = swimLanes.get("B");
  //   const swimlaneC = swimLanes.get("C");
  //   expect(swimlaneA?.nodes.length).toBe(1);
  //   expect(swimlaneB?.nodes.length).toBe(2);
  //   expect(swimlaneC?.nodes.length).toBe(1);

  //   console.log(JSON.stringify(diagram.toJson(), null, 2));
  // });

  test("should parse message", () => {
    const code = `
    A.method() {
      B.method()
      B.method2() {
        C.method()
      }
    }
    `;

    const diagram = new SwimLaneDiagram(code);
    const res = diagram.create();
    expect(res?.nodes).toHaveLength(4);
    expect(res?.edges).toHaveLength(3);
    expect(res).toMatchSnapshot();
  });

  test("should parse async message", () => {
    const code = `
      A -> B: message
    `;

    const diagram = new SwimLaneDiagram(code);
    const res = diagram.create();
    expect(res?.nodes).toHaveLength(2);
    expect(res?.edges).toHaveLength(1);
    expect(res).toMatchSnapshot();
  });

  test("should parse alt statement", () => {
    const code = `
      A.method() {
        if (x) {
          B.method()
        } else {
          C.method()
        }
      }
    `;

    const diagram = new SwimLaneDiagram(code);
    const res = diagram.create();
    expect(res?.nodes).toHaveLength(6);
    expect(res?.edges).toHaveLength(7);
    expect(res).toMatchSnapshot();
  });

  test("should parse top level alt statement", () => {
    const code = `
    if (x) {
      A.method()
    } else {
      B.method()
    }
    `;

    const diagram = new SwimLaneDiagram(code);
    const res = diagram.create();
    expect(res?.nodes).toHaveLength(5);
    expect(res?.edges).toHaveLength(5);
    expect(res).toMatchSnapshot();
  });

  test(`should parse loop statement`, () => {
    const code = `
        while (x) {
          A.method()
        }
      }
    `;

    const diagram = new SwimLaneDiagram(code);
    const res = diagram.create();
    expect(res?.nodes).toHaveLength(2);
    expect(res?.edges).toHaveLength(2);
    expect(res).toMatchSnapshot();
  });
});
