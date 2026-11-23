import { describe, expect, it } from "vitest";
import { armOrder, armSettings, Recorder, TASKS, typingMetrics } from "./trial";

// ADR 0009, G5 and G6: the trial page records each copy task as JSONL that
// scripts/writing-animation/g4.mjs reads back. This decoder follows the same
// format: a header, then `{ t, pos, del, ins }` per input event.
const streamFromRecording = (jsonl: string) => {
  const [head, ...events] = jsonl
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
  let code: string = head.start;
  const stream = [{ t: 0, code }];
  for (const e of events) {
    code = code.slice(0, e.pos) + e.ins + code.slice(e.pos + e.del);
    stream.push({ t: e.t, code });
  }
  return { meta: head, stream };
};

describe("armOrder", () => {
  it("rotates A, B and C as a 3 x 3 Latin square by participant number", () => {
    expect(armOrder(1)).toEqual(["A", "B", "C"]);
    expect(armOrder(2)).toEqual(["B", "C", "A"]);
    expect(armOrder(3)).toEqual(["C", "A", "B"]);
    expect(armOrder(4)).toEqual(["A", "B", "C"]);
  });
});

describe("armSettings", () => {
  it("maps each arm to the gate and the motion it gets", () => {
    expect(armSettings("A")).toEqual({ gate: false, motion: false });
    expect(armSettings("B")).toEqual({ gate: false, motion: "raw" });
    expect(armSettings("C")).toEqual({ gate: true, motion: "gated" });
  });
});

describe("TASKS", () => {
  it("has three copy tasks of about 15 lines each", () => {
    expect(TASKS).toHaveLength(3);
    for (const task of TASKS) {
      const lines = task.text.trimEnd().split("\n").length;
      expect(lines).toBeGreaterThanOrEqual(13);
      expect(lines).toBeLessThanOrEqual(17);
    }
  });
});

describe("Recorder", () => {
  it("writes the JSONL that the G4 harness reads back", () => {
    const rec = new Recorder(
      "",
      { task: "t1", arm: "C", participant: 2 },
      1000,
    );
    rec.input("A", 1100);
    rec.input("A.", 1250);
    rec.input("A", 1400);
    rec.input("Bb", 1600);
    const { meta, stream } = streamFromRecording(rec.toJsonl());
    expect(meta).toMatchObject({
      start: "",
      task: "t1",
      arm: "C",
      participant: 2,
      editor: "textarea",
    });
    expect(stream).toEqual([
      { t: 0, code: "" },
      { t: 100, code: "A" },
      { t: 250, code: "A." },
      { t: 400, code: "A" },
      { t: 600, code: "Bb" },
    ]);
  });
});

describe("typingMetrics", () => {
  it("reports WPM over the final text and the share of deletions", () => {
    const rec = new Recorder("", { task: "t1", arm: "A", participant: 1 }, 0);
    // 10 characters in 6 s = 2 words in 0.1 min = 20 WPM; 1 of 12 events deletes.
    const text = "A.m()\nB.n(";
    for (let i = 1; i <= text.length; i++) rec.input(text.slice(0, i), i * 500);
    rec.input(text.slice(0, -1), 5800);
    rec.input(text, 6000);
    expect(typingMetrics(rec.toJsonl())).toEqual({
      wpm: 20,
      deletionShare: 1 / 12,
      events: 12,
      seconds: 6,
    });
  });
});
