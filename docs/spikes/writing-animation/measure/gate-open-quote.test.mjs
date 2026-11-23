// Regression check: an open quote after a complete prefix must not blank the line.
// Typing `"space in name"->"bg color"` blanked the line at the second `"`, so the
// participant `space in name` vanished and came back (a G1 width reversal).
import fs from 'node:fs';
import assert from 'node:assert/strict';
const file = new URL('../engine.js', import.meta.url).pathname;
const root = {};
new Function('window', 'self', 'globalThis', fs.readFileSync(file, 'utf8'))(root, root, root);
const Z = root.ZmlInk;
const cases = [
  ['"space in name"->"', '"space in name"->'],
  ['"space in name"->"bg col', '"space in name"->'],
  ['"spa', ''],
  ['A.b("x', 'A.b("x")'],
  // An open quote draws exactly what its complete prefix draws.
  ['  "A"->"B', (ctx) => Z.gateLine('  "A"->', ctx).text],
];
let fail = 0;
for (const dwell of [false, true]) {
  const ctx = { names: new Set(['A']), dwell };
  for (const [input, expected] of cases) {
    const want = typeof expected === 'function' ? expected(ctx) : expected;
    const got = Z.gateLine(input, ctx).text;
    const ok = got === want;
    if (!ok) fail++;
    console.log(ok ? 'PASS' : 'FAIL', `dwell=${dwell}`, JSON.stringify(input), '->', JSON.stringify(got), ok ? '' : 'want ' + JSON.stringify(want));
  }
}
assert.equal(fail, 0, fail + ' failing');
