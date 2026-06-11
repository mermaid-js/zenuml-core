/**
 * Render-performance benchmark (committed instrument).
 *
 * Lives OUTSIDE the `src` / `test/unit` globs so the normal unit suite
 * (`bun run test`) never runs it. Run explicitly with:
 *
 *     bun run bench
 *
 * It reports, for several representative diagrams:
 *   - t_parse:   wall time of one ANTLR parse (RootContext)
 *   - t_layout:  wall time of building Coordinates + querying every position
 *                from an ALREADY-parsed tree (parse excluded)
 *   - parse %:   t_parse / (t_parse + t_layout) — i.e. how much of a cold
 *                render is the parse vs the post-parse layout work
 *   - dedup:     a real render parses the same code multiple times
 *                (validation in core.parse(), the render atom, SVG export).
 *                This measures the cost of K identical parses, which a
 *                code-keyed parse cache collapses to one.
 *
 * Numbers are wall-clock and machine-dependent; read the RATIOS, not the
 * absolute milliseconds.
 */
import { describe, it } from "vitest";
import { RootContext } from "@/parser";
import { Coordinates } from "@/positioning/Coordinates";
import { WidthProviderOnCanvas } from "@/positioning/WidthProviderFunc";

function smallDiagram(): string {
  return `A.method() {\n  B.call()\n  C.reply()\n}`;
}

function mediumDiagram(): string {
  const lines: string[] = [];
  for (let i = 0; i < 8; i++) lines.push(`participant P${i}`);
  for (let i = 0; i < 8; i++) {
    lines.push(`P${i}.op${i}() {`);
    for (let j = 0; j < 8; j++) if (j !== i) lines.push(`  P${j}.sub${j}()`);
    lines.push(`}`);
  }
  return lines.join("\n");
}

function wideDiagram(): string {
  const lines: string[] = [];
  const N = 40;
  for (let i = 0; i < N; i++) lines.push(`participant P${i}`);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      if (i !== j) lines.push(`P${i} -> P${j}: msg ${i}_${j}`);
  return lines.join("\n");
}

function median(times: number[]): number {
  const s = [...times].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function timeIt(fn: () => void, iters: number): number {
  const times: number[] = [];
  for (let k = 0; k < iters; k++) {
    const t = performance.now();
    fn();
    times.push(performance.now() - t);
  }
  return median(times);
}

function bench(name: string, code: string, iters: number) {
  // Warm up JIT.
  for (let k = 0; k < 3; k++) {
    const c = RootContext(code);
    const coords = new Coordinates(c, WidthProviderOnCanvas);
    coords.orderedParticipantNames().forEach((n) => coords.getPosition(n));
  }

  const tParse = timeIt(() => {
    RootContext(code);
  }, iters);

  // Layout from a pre-parsed tree (parse excluded). Re-parse once per iter so
  // the per-context caches start cold, matching a fresh code state.
  const tLayout = timeIt(() => {
    const ctx = RootContext(code);
    const coords = new Coordinates(ctx, WidthProviderOnCanvas);
    const names = coords.orderedParticipantNames();
    for (const n of names) {
      coords.getPosition(n);
      coords.left(n);
      coords.right(n);
    }
    coords.getWidth();
  }, iters);
  // tLayout includes a parse; isolate the post-parse portion.
  const tLayoutOnly = Math.max(tLayout - tParse, 0);

  const parsePct = (tParse / (tParse + tLayoutOnly)) * 100;

  // A single real render parses the same code ~3x (validate + render + svg).
  const K = 3;
  const tKParses = timeIt(() => {
    for (let i = 0; i < K; i++) RootContext(code);
  }, iters);

  console.log(
    `\n[BENCH] ${name}\n` +
      `  parse        : ${tParse.toFixed(3)} ms\n` +
      `  layout-only  : ${tLayoutOnly.toFixed(3)} ms\n` +
      `  parse %      : ${parsePct.toFixed(1)}% of a cold render\n` +
      `  ${K}x parse     : ${tKParses.toFixed(3)} ms (a code-keyed cache collapses this to ~1x = ${tParse.toFixed(3)} ms)\n`,
  );
}

describe("render performance benchmark", () => {
  it("reports parse fraction and dedup opportunity", () => {
    bench("small (3 participants)", smallDiagram(), 30);
    bench("medium (8 participants, nested)", mediumDiagram(), 20);
    bench("wide (40 participants, 1560 messages)", wideDiagram(), 8);
  }, 120000);
});
