import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ZenUml, { ParseResult } from "../src/core";

describe("ZenUml.parse", () => {
  // Mock DOM elements since we're running in a test environment
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  it("should return successful ParseResult for valid ZenUML code", async () => {
    const zenUml = new ZenUml(mockElement);
    const validCode = `A.method() {
      B.process()
    }`;
    const result: any = await zenUml.parse(validCode);
    console.log("parse result", result);
    expect(result.pass).toBe(true);
    expect(result.errorDetails.length).toBe(0);
  });

  it("should return failed ParseResult for invalid ZenUML code", async () => {
    const zenUml = new ZenUml(mockElement);
    const validCode = `A.method() {
      B.-process()
    }`;
    const result: any = await zenUml.parse(validCode);
    console.log("parse result", result);
    expect(result.pass).toBe(false);
    expect(result.errorDetails.length).toBeGreaterThan(0);
    expect(result.errorDetails[0].line).toBe(2);
    expect(result.errorDetails[0].column).toBe(8);
    expect(result.errorDetails[0].msg).toBeDefined();
  });
});
