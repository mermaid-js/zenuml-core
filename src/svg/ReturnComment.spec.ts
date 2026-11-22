import { describe, expect, it } from "vitest";
import { COMMENT_LINE_HEIGHT } from "@/positioning/vertical/LayoutMetrics";
import { renderToSvg } from "./renderToSvg";

// #721: the HTML renderer draws a return's comment inside the return's own
// box, on its own row above the arrow, starting at the arrow's left end.

function layout(code: string) {
  const svg = renderToSvg(code).svg;
  const width = Number(svg.match(/<svg[^>]*\bwidth="([\d.]+)"/)?.[1]);
  const line = svg.match(
    /<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="[\d.-]+" class="return-line"/,
  );
  const label = svg.match(
    /<text x="[\d.-]+" y="([\d.-]+)"[^>]*class="return-label"/,
  );
  const comment = svg.match(
    /<text class="comment-text"[^>]*><tspan x="([\d.-]+)" y="([\d.-]+)"/,
  );
  if (!line || !label) throw new Error("no return in SVG");
  return {
    width,
    lineLeft: Math.min(Number(line[1]), Number(line[3])),
    lineRight: Math.max(Number(line[1]), Number(line[3])),
    lineY: Number(line[2]),
    labelY: Number(label[1]),
    commentX: comment ? Number(comment[1]) : undefined,
    commentY: comment ? Number(comment[2]) : undefined,
  };
}

const block = (...lines: string[]) =>
  `Client.login() {\n  Auth.check()\n${lines.map((l) => `  ${l}`).join("\n")}\n}`;

describe.each([
  [
    "return A->B: msg",
    ["// token expires in 1h", "return Auth->Client: token"],
  ],
  [
    "@return A->B: msg",
    ["// token expires in 1h", "@return Auth->Client: token"],
  ],
  [
    "comment between @return and its message",
    ["@return", "// token expires in 1h", "Auth->Client: token"],
  ],
])("comment above a right-to-left return (%s)", (_label, lines) => {
  const withComment = layout(block(...lines));
  const without = layout(block(...lines.filter((l) => !l.startsWith("//"))));

  it("starts at the left end of the arrow", () => {
    expect(withComment.commentX).toBeGreaterThanOrEqual(
      withComment.lineLeft - 10,
    );
    expect(withComment.commentX).toBeLessThanOrEqual(withComment.lineLeft + 10);
  });

  it("sits on its own row above the arrow", () => {
    expect(withComment.lineY - without.lineY).toBe(COMMENT_LINE_HEIGHT);
    expect(withComment.commentY!).toBeLessThan(
      withComment.labelY - COMMENT_LINE_HEIGHT / 2,
    );
  });
});
