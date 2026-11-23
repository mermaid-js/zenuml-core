// Keystroke streams for the ADR 0009 gates (G1–G5).
//
// A stream is `[{ t, code }]`: `t` in ms from the start, `code` the editor text
// after that input event; `stream[0]` is the starting text at t = 0.
//
// Recorded streams come from the recorder on the prototype page as JSONL: a
// header line `{ start, build?, task?, arm?, editor? }`, then one line per
// `input` event `{ t, pos, del, ins }` (delete `del` characters at `pos`, then
// insert `ins`). Typing, backspace, paste and a replaced selection are all one
// such event.

export function streamFromRecording(jsonl) {
  const rows = jsonl
    .split("\n")
    .map((line, i) => ({ line: i + 1, text: line.trim() }))
    .filter((r) => r.text);
  if (rows.length === 0) throw new Error("empty recording");
  const meta = JSON.parse(rows[0].text);
  if (typeof meta.start !== "string") {
    throw new Error("line 1: the header has no `start` text");
  }
  let code = meta.start;
  const stream = [{ t: 0, code }];
  for (const row of rows.slice(1)) {
    const e = JSON.parse(row.text);
    if (e.pos < 0 || e.del < 0 || e.pos + e.del > code.length) {
      throw new Error(`line ${row.line}: event outside the text`);
    }
    code = code.slice(0, e.pos) + e.ins + code.slice(e.pos + e.del);
    stream.push({ t: e.t, code });
  }
  if (stream.length < 2) throw new Error("the recording has no input events");
  return { meta, stream };
}

const DEFAULTS = {
  bundle: "dist/zenuml.js",
  cases: "e2e/data/compare-cases.js",
  engine: "scripts/writing-animation/engine.js",
  out: "writing-g4.json",
  wpm: 80,
  seed: 3,
  off: false,
  recordings: null,
  filter: null,
};

export function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--off") {
      args.off = true;
      continue;
    }
    const key = flag.replace(/^--/, "");
    if (!(key in DEFAULTS) || i + 1 >= argv.length) {
      throw new Error(`unknown or incomplete flag: ${flag}`);
    }
    const value = argv[++i];
    args[key] = typeof DEFAULTS[key] === "number" ? Number(value) : value;
  }
  return args;
}
