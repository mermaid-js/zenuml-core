// The corpus the audit renders: the HTML visual E2E cases plus a few cases
// that exercise roles the corpus does not cover (ref fragment, markdown
// tables, HTTP verbs, while/else guards, groups and dividers together).

import { HTML_VISUAL_CASES, TEST_CASES } from "../../tests/test-cases.ts";

export const AUDIT_EXTRA_CASES = {
  "audit-markdown": `// \`GET /users\` \`POST /users\`
// \`DELETE /users/1\`
// | verb | path |
// |------|------|
// | GET | /users |
Alpha.list() {
  // *nested* \`code\`
  BetaService.query()
}`,
  "audit-ref-guards": `group Core { A B }
C
A.m() {
  ref(x) { B.step() }
  while(i < 3) { B.next() }
  if(ok) { B.yes() } else { B.no() }
  == Phase two ==
  C.done()
}`,
};

export function corpus(selection) {
  const all = {};
  for (const { name } of HTML_VISUAL_CASES) all[name] = TEST_CASES[name];
  Object.assign(all, AUDIT_EXTRA_CASES);
  if (!selection || selection === "all") return all;
  const out = {};
  for (const name of selection.split(",")) {
    if (!(name in all)) throw new Error(`unknown case: ${name}`);
    out[name] = all[name];
  }
  return out;
}
