import { describe, expect, it } from "vitest";
import {
  parseArgs,
  streamFromRecording,
} from "../../../scripts/writing-animation/streams.mjs";

// ADR 0009, G5: recorded keystrokes replace the synthetic streams. The
// recorder on the prototype page writes JSONL: a header line, then one line
// per input event as {t, pos, del, ins}.

describe("streamFromRecording", () => {
  it("rebuilds the text after every input event", () => {
    const jsonl = [
      JSON.stringify({ start: "A.m()\n", build: "260ab6e6", task: "t1" }),
      JSON.stringify({ t: 120, pos: 6, del: 0, ins: "B" }),
      JSON.stringify({ t: 260, pos: 7, del: 0, ins: ".n(" }),
      // A backspace, then a selection replaced by a paste.
      JSON.stringify({ t: 400, pos: 9, del: 1, ins: "" }),
      JSON.stringify({ t: 900, pos: 6, del: 3, ins: "Cc.k()" }),
    ].join("\n");
    const { meta, stream } = streamFromRecording(jsonl);
    expect(meta).toEqual({ start: "A.m()\n", build: "260ab6e6", task: "t1" });
    expect(stream).toEqual([
      { t: 0, code: "A.m()\n" },
      { t: 120, code: "A.m()\nB" },
      { t: 260, code: "A.m()\nB.n(" },
      { t: 400, code: "A.m()\nB.n" },
      { t: 900, code: "A.m()\nCc.k()" },
    ]);
  });

  it("ignores blank lines and rejects a file without events", () => {
    const head = JSON.stringify({ start: "" });
    expect(
      streamFromRecording(
        `${head}\n\n${JSON.stringify({ t: 5, pos: 0, del: 0, ins: "A" })}\n`,
      ).stream,
    ).toEqual([
      { t: 0, code: "" },
      { t: 5, code: "A" },
    ]);
    expect(() => streamFromRecording(head)).toThrow(/no input events/);
  });

  it("rejects an event outside the text", () => {
    const jsonl = [
      JSON.stringify({ start: "ab" }),
      JSON.stringify({ t: 5, pos: 1, del: 4, ins: "" }),
    ].join("\n");
    expect(() => streamFromRecording(jsonl)).toThrow(/line 2/);
  });
});

describe("parseArgs", () => {
  it("defaults to the synthetic streams of ADR 0009", () => {
    expect(parseArgs([])).toMatchObject({
      bundle: "dist/zenuml.js",
      cases: "e2e/data/compare-cases.js",
      wpm: 80,
      seed: 3,
      off: false,
      recordings: null,
      filter: null,
    });
  });

  it("reads recordings, a filter and the option-off switch", () => {
    expect(
      parseArgs([
        "--recordings",
        "rec",
        "--filter",
        "a,b",
        "--off",
        "--out",
        "x.json",
      ]),
    ).toMatchObject({
      recordings: "rec",
      filter: "a,b",
      off: true,
      out: "x.json",
    });
  });
});
