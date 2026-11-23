#!/usr/bin/env node
// ADR 0009, gates G1–G3 on the React path (G4), and on recorded keystrokes (G5).
//
// Drives `ZenUml.render()` of a built bundle in headless Chromium, in real time,
// with the real debounce and `enableWritingAnimation` on (or off with --off).
// Every committed frame is recorded; the measurement rules are the spike's
// `measureFrames` (engine.js, vendored unchanged from spike commit 7de6c3be).
//
//   bun run build
//   node scripts/writing-animation/g4.mjs --out /tmp/g4.json
//   node scripts/writing-animation/g4.mjs --recordings <dir of *.jsonl> --out /tmp/g5.json
//
// Without --recordings, each compare-case is typed by the spike's synthetic
// stream (--wpm 80, --seed 3). With --recordings, each JSONL file from the
// prototype page's recorder is one case. A summary is written next to --out.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { parseArgs, streamFromRecording } from "./streams.mjs";

const args = parseArgs(process.argv.slice(2));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2400, height: 1600 } });
await page.setContent("<!doctype html><html><body></body></html>");
await page.addScriptTag({ path: args.bundle });
await page.addScriptTag({ path: args.engine });

/** [{ name, stream? }]: a recorded stream, or a compare-case typed in the page. */
let jobs;
if (args.recordings) {
  jobs = fs
    .readdirSync(args.recordings)
    .filter((f) => f.endsWith(".jsonl"))
    .sort()
    .map((f) => ({
      name: f.replace(/\.jsonl$/, ""),
      stream: streamFromRecording(
        fs.readFileSync(path.join(args.recordings, f), "utf8"),
      ).stream,
    }));
} else {
  const src = fs
    .readFileSync(args.cases, "utf8")
    .replace("export const CASES", "window.CASES");
  await page.addScriptTag({ content: src });
  jobs = (await page.evaluate(() => Object.entries(window.CASES)))
    .filter(([, code]) => code.trim())
    .map(([name]) => ({ name }));
}
if (args.filter) {
  const names = args.filter.split(",");
  jobs = jobs.filter((j) => names.includes(j.name));
}

const results = [];
const t0 = Date.now();
for (const [i, job] of jobs.entries()) {
  const r = await page.evaluate(
    async ({ name, given, on, wpm, seed }) => {
      const I = window.ZmlInk;
      const Z = window.zenuml.default;
      const stream =
        given ?? I.typeStream("", window.CASES[name] + "\n", "", wpm, seed);
      document.body.innerHTML = "";
      const el = document.createElement("div");
      document.body.appendChild(el);
      const zen = new Z(el);
      const frames = [];
      let eline = 0;
      let start = 0;
      const proto = Object.getPrototypeOf(zen).doRender;
      zen.doRender = async function (config, revision, text) {
        await proto.call(this, config, revision, text);
        if (revision !== this.revision) return;
        const frame = el.querySelector(".frame");
        frames.push({
          t: performance.now() - start,
          text,
          eline,
          domWidth: frame ? frame.getBoundingClientRect().width : 0,
        });
      };
      await zen.render(stream[0].code, { enableWritingAnimation: on });
      start = performance.now();
      let prev = stream[0].code;
      await new Promise((done) => {
        stream.slice(1).forEach((ev, k, arr) => {
          setTimeout(() => {
            eline = I.locateEdit(prev, ev.code).line;
            prev = ev.code;
            const last = zen.render(ev.code, {});
            if (k === arr.length - 1) last.then(done);
          }, ev.t);
        });
      });
      const finalCode = stream[stream.length - 1].code;

      // G3: the last committed frame is the raw text, and the DOM equals a
      // fresh render. Attribute order and the order of declarations inside
      // `style` are ignored: incremental updates add them in another order.
      const fresh = document.createElement("div");
      document.body.appendChild(fresh);
      await new Z(fresh).render(finalCode, { enableWritingAnimation: on });
      const strip = (rootEl) => {
        const out = [];
        const walk = (n) => {
          if (n.nodeType === 3) {
            out.push(n.data);
            return;
          }
          if (n.nodeType !== 1) return;
          const attrs = [...n.attributes]
            .filter((a) => !/^(id|data-identity|aria-)/.test(a.name))
            .map(
              (a) =>
                a.name +
                "=" +
                (a.name === "style"
                  ? a.value
                      .split(";")
                      .map((d) => d.trim())
                      .filter(Boolean)
                      .sort()
                      .join(";")
                  : a.value),
            )
            .sort();
          out.push("<" + n.tagName + " " + attrs.join(" ") + ">");
          n.childNodes.forEach(walk);
          out.push("</" + n.tagName + ">");
        };
        rootEl.childNodes.forEach(walk);
        return out.join("");
      };
      const g3Text =
        frames.length > 0 && frames[frames.length - 1].text === finalCode;
      // Icons load asynchronously in both instances: wait until the DOMs agree, up to 3 s.
      let a = strip(el);
      let b = strip(fresh);
      for (let w = 0; a !== b && w < 60; w++) {
        await new Promise((res) => setTimeout(res, 50));
        a = strip(el);
        b = strip(fresh);
      }
      let at = 0;
      while (at < a.length && a[at] === b[at]) at++;
      const g3Diff =
        a === b
          ? null
          : [
              a.slice(Math.max(0, at - 120), at + 120),
              b.slice(Math.max(0, at - 120), at + 120),
            ];

      // G2 identity and the SVG width, from renderToSvg of each committed text.
      const R = window.zenuml.renderToSvg;
      const mf = frames.map((f) => ({
        t: f.t,
        key: "",
        code: f.text,
        eline: f.eline,
        r: R(f.text),
      }));
      const m = I.measureFrames(mf);

      // G1: per edited line, the signs of width changes of 20 px or more.
      const byLine = (w) => {
        const out = {};
        for (let k = 1; k < frames.length; k++) {
          const d = w(k) - w(k - 1);
          if (Math.abs(d) >= I.WIDTH_JUMP_PX) {
            (out[frames[k].eline] = out[frames[k].eline] || []).push([
              Math.sign(d),
              w(k - 1),
              w(k),
              frames[k].text.split("\n")[frames[k].eline] ?? "",
            ]);
          }
        }
        return out;
      };
      const lines = finalCode.split("\n");
      const reversals = (jl) =>
        Object.entries(jl)
          .filter(([, ev]) => ev.some((e, j) => j && e[0] !== ev[j - 1][0]))
          .map(([ln, ev]) => ({ line: lines[ln] ?? "", ev }));
      return {
        name,
        keys: stream.length,
        frames: frames.length,
        g2: m.ephemeral,
        g2Names: m.ephemeralNames,
        g3: g3Text && g3Diff === null,
        g3Text,
        g3Diff,
        dom: reversals(byLine((k) => frames[k].domWidth)),
        svg: reversals(byLine((k) => mf[k].r.width)),
      };
    },
    {
      name: job.name,
      given: job.stream ?? null,
      on: !args.off,
      wpm: args.wpm,
      seed: args.seed,
    },
  );
  results.push(r);
  process.stdout.write(
    `${i + 1}/${jobs.length} ${r.name} frames=${r.frames} g2=${r.g2} g3=${r.g3} ` +
      `revDom=${r.dom.length} revSvg=${r.svg.length} ${Math.round((Date.now() - t0) / 1000)}s\n`,
  );
  fs.writeFileSync(args.out, JSON.stringify(results, null, 1));
}
await browser.close();

// G1 exempts creation-label lines (`new X(`), as the ADR's rule says.
const creation = /\bnew\s+[\w$]+\s*\(/;
const split = (key) => {
  const all = results.flatMap((r) =>
    r[key].map((x) => ({ name: r.name, ...x })),
  );
  return {
    counted: all.filter((x) => !creation.test(x.line)),
    exempt: all.filter((x) => creation.test(x.line)),
  };
};
const dom = split("dom");
const svg = split("svg");
const summary = {
  cases: results.length,
  source: args.recordings
    ? `recordings: ${args.recordings}`
    : `synthetic: ${args.wpm} WPM, seed ${args.seed}`,
  option: args.off ? "off" : "on",
  keys: results.reduce((s, r) => s + r.keys, 0),
  frames: results.reduce((s, r) => s + r.frames, 0),
  G1_dom: {
    counted: dom.counted.length,
    exempt: dom.exempt.length,
    lines: dom.counted.map((x) => `${x.name} | ${x.line.trim()}`),
  },
  G1_svg: {
    counted: svg.counted.length,
    exempt: svg.exempt.length,
    lines: svg.counted.map((x) => `${x.name} | ${x.line.trim()}`),
  },
  G2: results.reduce((s, r) => s + r.g2, 0),
  G2_names: results
    .filter((r) => r.g2)
    .map((r) => `${r.name}: ${r.g2Names.join(", ")}`),
  G3: `${results.filter((r) => r.g3).length}/${results.length}`,
  G3_fail: results.filter((r) => !r.g3).map((r) => r.name),
  minutes: ((Date.now() - t0) / 60000).toFixed(1),
};
fs.writeFileSync(
  args.out.replace(/\.json$/, ".summary.json"),
  JSON.stringify(summary, null, 1),
);
console.log(JSON.stringify(summary, null, 1));
