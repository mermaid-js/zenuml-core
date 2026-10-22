import { describe, expect, it } from "vitest";
import { createStatementKey, parseStatementKey } from "./StatementIdentifier";

describe("statement keys", () => {
  it("parseStatementKey inverts createStatementKey", () => {
    const key = createStatementKey({
      start: { start: 12 },
      stop: { stop: 34 },
    });
    expect(key).toBe("12-34");
    expect(parseStatementKey(key)).toEqual([12, 34]);
  });
});
