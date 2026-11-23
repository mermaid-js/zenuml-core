// Regression check: a block head that already has `{` must not get a second one.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const file = new URL('../engine.js', import.meta.url).pathname;
const root = {};
new Function('window', 'self', 'globalThis', fs.readFileSync(file, 'utf8'))(root, root, root);
const Z = root.ZmlInk;
const ctx = { names: new Set(['A']), dwell: true };
const cases = [
  ['  if(ok) { }', '  if(ok) { }'],
  ['  if(ok) {   }', '  if(ok) {   }'],
  ['  while(x) { A.b() }', '  while(x) { A.b() }'],
  ['  if(ok) {', '  if(ok) {'],
  ['  if(ok', '  if(ok) {'],
  ['  if(ok)', '  if(ok) {'],
  ['  if(s == "{")', '  if(s == "{") {'],
];
let fail = 0;
for (const [input, want] of cases) {
  const got = Z.gateLine(input, ctx).text;
  const ok = got === want;
  if (!ok) fail++;
  console.log(ok ? 'PASS' : 'FAIL', JSON.stringify(input), '->', JSON.stringify(got), ok ? '' : 'want ' + JSON.stringify(want));
}
const code = 'A.m() {\n  if(ok) { }\n}';
const g = Z.gate(code, Z.locateEdit('A.m() {\n  if(ok) { \n  }\n}', code), ctx).code;
const okGate = g === code;
if (!okGate) fail++;
console.log(okGate ? 'PASS' : 'FAIL', 'gate after joining lines ->', JSON.stringify(g));
assert.equal(fail, 0, fail + ' failing');
