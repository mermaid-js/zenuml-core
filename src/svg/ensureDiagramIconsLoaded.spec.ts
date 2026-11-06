import { describe, it, expect } from "bun:test";
import { renderToSvg } from "./renderToSvg";
import { ensureDiagramIconsLoaded, getIcon } from "./icons";

const iconCount = (svg: string) =>
  (svg.match(/class="participant-icon"/g) ?? []).length;

describe("ensureDiagramIconsLoaded", () => {
  it("draws cloud icons outside the built-in set once preloaded", async () => {
    const code = "@VPC svc\n@RDS rep";
    await ensureDiagramIconsLoaded(code);
    expect(iconCount(renderToSvg(code).svg)).toBe(2);
  });

  it("matches participant types case-insensitively", async () => {
    await ensureDiagramIconsLoaded("@DynamoDB table");
    expect(getIcon("DynamoDB")).toBeDefined();
    expect(getIcon("dynamodb")).toBeDefined();
  });

  it("ignores annotations that are not icons", async () => {
    await ensureDiagramIconsLoaded(
      "@Starter(A)\n@NotAnIcon x\nA->B.m() {\n  @return B->A: r\n}",
    );
    expect(getIcon("NotAnIcon")).toBeUndefined();
    expect(getIcon("return")).toBeUndefined();
    expect(getIcon("Starter")).toBeUndefined();
  });

  it("keeps the built-in icons available without a preload", () => {
    expect(iconCount(renderToSvg("@EC2 a").svg)).toBe(1);
  });
});
