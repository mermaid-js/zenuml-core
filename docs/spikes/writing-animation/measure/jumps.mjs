// Classify arm C lines with 2+ width jumps: reversal (shrink and grow back) vs growth only, and whether each jump births a participant.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '../../../..');
const [bundle] = process.argv.slice(2);
const src = fs.readFileSync(path.join(REPO, 'e2e/data/compare-cases.js'), 'utf8').replace('export const CASES', 'window.CASES');
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
await p.setContent('<!doctype html><html><body></body></html>');
await p.addScriptTag({ path: path.resolve(bundle) });
await p.addScriptTag({ content: src });
await p.addScriptTag({ path: path.join(HERE, '..', 'engine.js') });
const out = await p.evaluate(() => {
  const I = window.ZmlInk, R = window.zenuml.renderToSvg;
  const rows = [];
  for (const [name, code] of Object.entries(window.CASES)) {
    if (!code.trim()) continue;
    const f = I.framesFor('C', I.typeStream('', code + '\n', '', 80, 3), R);
    const by = {}; let pw = null, pe = null;
    for (const x of f) {
      const e = I.extract(I.parseSvg(x.r.svg), x.r.geometry);
      if (pw !== null && Math.abs(x.r.width - pw) >= I.WIDTH_JUMP_PX) {
        const rc = I.reconcile(pe, e);
        (by[x.eline] = by[x.eline] || []).push([x.code.split('\n')[x.eline], pw, x.r.width, rc.groups.participants.born.map((q) => q.key), rc.groups.participants.gone.map((q) => q.key)]);
      }
      pw = x.r.width; pe = e;
    }
    for (const [ln, ev] of Object.entries(by)) if (ev.length >= 2) rows.push({ name, line: code.split('\n')[ln], ev });
  }
  return rows;
});
await b.close();
const cls = { reversal: [], allBirth: [], other: [] };
for (const r of out) {
  const s = r.ev.map((e) => Math.sign(e[2] - e[1]));
  const rev = s.some((v, i) => i && v !== s[i - 1]);
  const c = rev ? 'reversal' : r.ev.every((e) => e[3].length) ? 'allBirth' : 'other';
  cls[c].push(r);
}
console.log(path.basename(bundle), 'lines', out.length, Object.fromEntries(Object.entries(cls).map(([k, v]) => [k, v.length])));
for (const [k, v] of Object.entries(cls)) for (const r of v.slice(0, 5)) console.log(k, '|', r.name, '|', JSON.stringify(r.line.trim()), '|', r.ev.map((e) => `${JSON.stringify(e[0].trim())} ${e[1]}>${e[2]} +${e[3]} -${e[4]}`).join(' ; '));
