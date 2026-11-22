// Re-run the Nov 5 frame metrics (arms A and C) on one renderer bundle.
// Usage: node frames.mjs <bundle.js> <out.json>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '../../../..');
const [bundle, outFile] = process.argv.slice(2);

const src = fs.readFileSync(path.join(REPO, 'e2e/data/compare-cases.js'), 'utf8').replace('export const CASES', 'window.CASES');
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
await p.setContent('<!doctype html><html><body></body></html>');
await p.addScriptTag({ path: path.resolve(bundle) });
await p.addScriptTag({ content: src });
await p.addScriptTag({ path: path.join(HERE, '..', 'engine.js') });
const out = await p.evaluate(() => {
  const I = window.ZmlInk, R = window.zenuml.renderToSvg;
  const cache = new Map();
  const render = (c) => { if (cache.has(c)) return cache.get(c); const r = R(c); cache.set(c, r); if (cache.size > 400) cache.delete(cache.keys().next().value); return r; };
  const throwsLog = [];
  const row = (name, stream) => {
    const res = {};
    for (const arm of ['A', 'C']) {
      const f = I.framesFor(arm, stream, render);
      const m = I.measureFrames(f);
      throwsLog.push(...f.throws.map((x) => ({ name, arm, ...x })));
      const finalRaw = render(stream[stream.length - 1].code).innerSvg;
      res[arm] = {
        phantom: m.phantom, ephemeral: m.ephemeral, widthJumps: m.widthJumps,
        jumpsByLine: Object.values(m.jumpsByLine), ephemeralNames: m.ephemeralNames.slice(0, 6),
        finalSame: f[f.length - 1].r.innerSvg === finalRaw,
      };
    }
    return { name, ...res };
  };
  const corpus = [], costs = [];
  for (const [name, code] of Object.entries(window.CASES)) {
    if (!code.trim()) continue;
    const c0 = performance.now(); R(code); costs.push(performance.now() - c0);
    const stream = I.typeStream('', code + '\n', '', 80, 3);
    try {
      corpus.push({ ...row(name, stream), stmts: code.split('\n').filter((l) => l.trim()).length });
    } catch (e) { corpus.push({ name, error: String(e) }); }
  }
  costs.sort((a, b) => a - b);
  return { corpus, throwsLog, cost: { p50: costs[Math.floor(costs.length / 2)], p95: costs[Math.floor(costs.length * 0.95)], max: costs[costs.length - 1] } };
});
await b.close();
fs.writeFileSync(outFile, JSON.stringify(out));

const ok = out.corpus.filter((c) => !c.error);
const lines = ok.reduce((s, c) => s + c.stmts, 0);
console.log(path.basename(bundle), 'cases', ok.length, 'errors', out.corpus.length - ok.length, 'lines', lines, 'throws', out.throwsLog.length, 'cost', JSON.stringify(out.cost));
for (const a of ['A', 'C']) {
  const v = ok.flatMap((c) => c[a].jumpsByLine);
  const sum = (k) => ok.reduce((s, c) => s + c[a][k], 0);
  console.log(a, 'ephemeral', sum('ephemeral'), 'phantom', sum('phantom'), 'jumps', sum('widthJumps'), 'lines2+', v.filter((x) => x >= 2).length, 'maxPerLine', Math.max(0, ...v), 'finalSame', ok.filter((c) => c[a].finalSame).length);
}
