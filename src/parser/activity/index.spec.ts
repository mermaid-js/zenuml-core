import { expect } from "chai";
import activityParser from "./index";

describe("Activity Parser", () => {
  it("should parse a simple activity diagram", () => {
    const code = `
      start
      :Action 1;
      :Action 2;
      stop
    `;
    const result = activityParser.RootContext(code);
    expect(result).to.be.an("object");
    // @ts-ignore
    expect(result.children).to.have.lengthOf(4); // start, 2 actions, stop
  });

  it("should handle empty input", () => {
    const code = "";
    const result = activityParser.RootContext(code);
    expect(result).to.be.an("object");
    // @ts-ignore
    expect(result.children).to.be.null;
  });
});
